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

// Función para eliminar todas las tablas
async function dropAllTables() {
  const tables = [
    'password_reset_tokens',
    'configuracion_horarios', 
    'dias_finalizados',
    'saldos_diarios',
    'transacciones_quiniela',
    'gastos',
    'sesiones_usuario',
    'usuarios'
  ];

  console.log('🗑️  Eliminando tablas existentes...');

  // Deshabilitar foreign key checks temporalmente
  await executeQuery('SET FOREIGN_KEY_CHECKS = 0');

  for (const table of tables) {
    try {
      await executeQuery(`DROP TABLE IF EXISTS ${table}`);
      console.log(`   ✅ Tabla ${table} eliminada`);
    } catch (error) {
      console.log(`   ⚠️  Tabla ${table} no existía`);
    }
  }

  // Rehabilitar foreign key checks
  await executeQuery('SET FOREIGN_KEY_CHECKS = 1');
  console.log('✅ Todas las tablas eliminadas correctamente');
}

// Migraciones
const migrations = [
  {
    name: 'create_usuarios_table',
    query: `
      CREATE TABLE usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        numero_quiniela VARCHAR(10) UNIQUE NOT NULL,
        nombre_quiniela VARCHAR(50) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        ultimo_acceso DATETIME NULL,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        activo BOOLEAN DEFAULT TRUE,
        email_verificado BOOLEAN DEFAULT FALSE,
        
        INDEX idx_username (username),
        INDEX idx_username_activo (username, activo),
        INDEX idx_email (email),
        INDEX idx_numero_quiniela (numero_quiniela),
        INDEX idx_activo (activo)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `
  },
  {
    name: 'create_sesiones_table',
    query: `
      CREATE TABLE sesiones_usuario (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        remember_token VARCHAR(255) NULL,
        ip_address VARCHAR(45) NULL,
        user_agent TEXT NULL,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_expiracion DATETIME NOT NULL,
        activo BOOLEAN DEFAULT TRUE,
        
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        INDEX idx_session_token (session_token),
        INDEX idx_usuario_activo (usuario_id, activo),
        INDEX idx_usuario_id (usuario_id),
        INDEX idx_activo (activo),
        INDEX idx_fecha_expiracion (fecha_expiracion)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `
  },
  {
    name: 'create_gastos_table',
    query: `
      CREATE TABLE gastos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        monto DECIMAL(10,2) NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        subcategoria VARCHAR(50) NULL,
        descripcion TEXT NULL,
        fecha DATE NOT NULL,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        activo BOOLEAN DEFAULT TRUE,
        
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        INDEX idx_usuario_fecha (usuario_id, fecha),
        INDEX idx_categoria (categoria),
        INDEX idx_fecha (fecha),
        INDEX idx_activo (activo)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `
  },
  {
    name: 'create_transacciones_quiniela_table',
    query: `
      CREATE TABLE transacciones_quiniela (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        tipo ENUM('ingreso', 'egreso') NOT NULL,
        categoria VARCHAR(50) NOT NULL,
        monto DECIMAL(10,2) NOT NULL,
        descripcion TEXT NULL,
        fecha DATE NOT NULL,
        fuente VARCHAR(50) NOT NULL,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        activo BOOLEAN DEFAULT TRUE,
        
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        INDEX idx_usuario_fecha (usuario_id, fecha),
        INDEX idx_tipo (tipo),
        INDEX idx_categoria (categoria),
        INDEX idx_fecha (fecha),
        INDEX idx_activo (activo)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `
  },
  {
    name: 'create_saldos_diarios_table',
    query: `
      CREATE TABLE saldos_diarios (
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
      CREATE TABLE dias_finalizados (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        fecha DATE NOT NULL,
        fecha_finalizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        UNIQUE KEY unique_usuario_fecha (usuario_id, fecha),
        INDEX idx_fecha (fecha)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `
  },
  {
    name: 'create_configuracion_horarios_table',
    query: `
      CREATE TABLE configuracion_horarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        modalidad_id INT NOT NULL,
        nombre_modalidad VARCHAR(100) NOT NULL,
        horario_inicio TIME NOT NULL,
        horario_fin TIME NOT NULL,
        activo BOOLEAN DEFAULT TRUE,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        UNIQUE KEY unique_usuario_modalidad (usuario_id, modalidad_id),
        INDEX idx_usuario_id (usuario_id),
        INDEX idx_modalidad_id (modalidad_id),
        INDEX idx_activo (activo)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `
  },
  {
    name: 'create_password_reset_tokens_table',
    query: `
      CREATE TABLE password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        reset_token VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_expiracion TIMESTAMP NOT NULL,
        usado BOOLEAN DEFAULT FALSE,
        ip_address VARCHAR(45) NULL,
        user_agent TEXT NULL,
        
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        INDEX idx_reset_token (reset_token),
        INDEX idx_email_token (email, reset_token),
        INDEX idx_expiracion (fecha_expiracion, usado),
        INDEX idx_usuario_id (usuario_id)
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
    
    await executeQuery(`
      INSERT INTO usuarios (
        username, numero_quiniela, nombre_quiniela, email, password_hash, activo
      ) VALUES (?, ?, ?, ?, ?, 1)
    `, [
      'admin',
      '12345',
      'Usuario Demo',
      'admin@demo.com',
      passwordHash
    ]);
    
    console.log('👤 Usuario demo creado exitosamente');
    console.log('   👤 Usuario: admin');
    console.log('   🔑 Contraseña: demo123');
    
  } catch (error) {
    console.error('Error creando usuario demo:', error);
  }
}

// Función principal
async function resetDatabase() {
  try {
    console.log('🔄 REINICIANDO BASE DE DATOS COMPLETA...');
    console.log('⚠️  ATENCIÓN: Esto eliminará TODOS los datos existentes');
    
    // Verificar conexión a la base de datos
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }
    
    // Eliminar todas las tablas
    await dropAllTables();
    
    // Crear todas las tablas nuevamente
    console.log('🚀 Creando tablas nuevas...');
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
      console.log('🎉 ¡Base de datos reiniciada exitosamente!');
      
      // Crear usuario demo
      await createDemoUser();
      
      console.log('');
      console.log('🎯 REINICIO COMPLETO:');
      console.log('   ✅ Todas las tablas eliminadas');
      console.log('   ✅ Todas las tablas recreadas');
      console.log('   ✅ Usuario demo configurado');
      console.log('   ✅ Esquema actualizado correctamente');
      
    } else {
      console.error('⚠️  Algunas migraciones fallaron. Revisa los logs para más detalles.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Error crítico durante el reinicio:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔌 Pool de conexiones cerrado');
  }
}

// Ejecutar reinicio
resetDatabase();