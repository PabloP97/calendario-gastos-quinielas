import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gastos_quinielas_db',
  connectionLimit: 10,
};

// Crear pool de conexiones
const pool = mysql.createPool({
  ...dbConfig,
  namedPlaceholders: true,
  timezone: 'Z',
  dateStrings: false,
  supportBigNumbers: true,
  bigNumberStrings: false,
});

// Función para ejecutar queries
async function executeQuery(query, params = []) {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
}

// Función para verificar conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    return false;
  }
}

// Migraciones
const migrations = [
  {
    name: 'create_usuarios_table',
    query: `
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        numero_quiniela VARCHAR(20) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        pregunta_seguridad TEXT NOT NULL,
        respuesta_seguridad_hash VARCHAR(255) NOT NULL,
        ultimo_acceso TIMESTAMP NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        activo BOOLEAN DEFAULT TRUE,
        
        INDEX idx_email (email),
        INDEX idx_numero_quiniela (numero_quiniela),
        INDEX idx_activo (activo)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `
  },
  {
    name: 'create_sesiones_table',
    query: `
      CREATE TABLE IF NOT EXISTS sesiones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        session_token TEXT NOT NULL,
        remember_token TEXT NULL,
        ip_address VARCHAR(45) NULL,
        user_agent TEXT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_expiracion TIMESTAMP NOT NULL,
        activo BOOLEAN DEFAULT TRUE,
        
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        INDEX idx_usuario_id (usuario_id),
        INDEX idx_activo (activo),
        INDEX idx_fecha_expiracion (fecha_expiracion)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `
  },
  {
    name: 'create_gastos_table',
    query: `
      CREATE TABLE IF NOT EXISTS gastos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        monto DECIMAL(10,2) NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        subcategoria VARCHAR(50) NULL,
        descripcion TEXT NOT NULL,
        fecha DATE NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        INDEX idx_usuario_fecha (usuario_id, fecha),
        INDEX idx_categoria (categoria),
        INDEX idx_fecha (fecha)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `
  },
  {
    name: 'create_transacciones_quiniela_table',
    query: `
      CREATE TABLE IF NOT EXISTS transacciones_quiniela (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        tipo ENUM('ingreso', 'egreso') NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        monto DECIMAL(10,2) NOT NULL,
        descripcion TEXT NULL,
        fecha DATE NOT NULL,
        fuente VARCHAR(50) NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        INDEX idx_usuario_fecha (usuario_id, fecha),
        INDEX idx_tipo (tipo),
        INDEX idx_categoria (categoria),
        INDEX idx_fecha (fecha)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `
  },
  {
    name: 'create_saldos_diarios_table',
    query: `
      CREATE TABLE IF NOT EXISTS saldos_diarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        fecha DATE NOT NULL,
        saldo_inicial_dia DECIMAL(10,2) NOT NULL DEFAULT 0,
        total_ingresos DECIMAL(10,2) NOT NULL DEFAULT 0,
        total_egresos DECIMAL(10,2) NOT NULL DEFAULT 0,
        saldo_final_dia DECIMAL(10,2) NOT NULL DEFAULT 0,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        UNIQUE KEY unique_usuario_fecha (usuario_id, fecha),
        INDEX idx_fecha (fecha)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `
  },
  {
    name: 'create_dias_finalizados_table',
    query: `
      CREATE TABLE IF NOT EXISTS dias_finalizados (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        fecha DATE NOT NULL,
        fecha_finalizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        UNIQUE KEY unique_usuario_fecha (usuario_id, fecha),
        INDEX idx_fecha (fecha)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `
  }
];

// Función para ejecutar una migración
async function runMigration(migration) {
  try {
    console.log(`Ejecutando migración: ${migration.name}`);
    await executeQuery(migration.query);
    console.log(`✅ Migración ${migration.name} completada exitosamente`);
    return true;
  } catch (error) {
    console.error(`❌ Error en migración ${migration.name}:`, error);
    return false;
  }
}

// Función para crear usuario demo
async function createDemoUser() {
  try {
    // Verificar si ya existe el usuario demo
    const existingUser = await executeQuery(
      'SELECT id FROM usuarios WHERE email = ?',
      ['admin@demo.com']
    );
    
    if (existingUser.length > 0) {
      console.log('👤 Usuario demo ya existe, saltando creación...');
      return;
    }
    
    // Crear usuario demo
    const passwordHash = await bcrypt.hash('demo123', 12);
    const respuestaHash = await bcrypt.hash('azul', 12);
    
    await executeQuery(`
      INSERT INTO usuarios (
        nombre, email, numero_quiniela, password_hash, 
        pregunta_seguridad, respuesta_seguridad_hash, activo
      ) VALUES (?, ?, ?, ?, ?, ?, 1)
    `, [
      'Usuario Demo',
      'admin@demo.com',
      '12345',
      passwordHash,
      '¿Cuál es tu color favorito?',
      respuestaHash
    ]);
    
    console.log('👤 Usuario demo creado exitosamente');
    console.log('   📧 Email: admin@demo.com');
    console.log('   🔑 Password: demo123');
    console.log('   🎲 Número Quiniela: 12345');
    
  } catch (error) {
    console.error('Error creando usuario demo:', error);
  }
}

// Función principal de migración
async function runMigrations() {
  try {
    console.log('🚀 Iniciando migraciones de base de datos...');
    
    // Verificar conexión a la base de datos
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }
    
    // Ejecutar cada migración
    let successCount = 0;
    let errorCount = 0;
    
    for (const migration of migrations) {
      const success = await runMigration(migration);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    }
    
    // Resumen final
    console.log(`📊 Resumen de migraciones:`);
    console.log(`   ✅ Exitosas: ${successCount}`);
    console.log(`   ❌ Fallidas: ${errorCount}`);
    console.log(`   📝 Total: ${migrations.length}`);
    
    if (errorCount === 0) {
      console.log('🎉 ¡Todas las migraciones completadas exitosamente!');
      
      // Crear usuario demo si no existe
      await createDemoUser();
    } else {
      console.error('⚠️  Algunas migraciones fallaron. Revisa los logs para más detalles.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Error crítico durante las migraciones:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔌 Pool de conexiones cerrado');
  }
}

// Ejecutar migraciones
runMigrations();