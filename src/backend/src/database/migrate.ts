import { executeQuery, testConnection, closePool } from '../config/database';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Script de migración para crear las tablas de la base de datos
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
async function runMigration(migration: { name: string; query: string }) {
  try {
    logger.info(`Ejecutando migración: ${migration.name}`);
    await executeQuery(migration.query);
    logger.info(`✅ Migración ${migration.name} completada exitosamente`);
    return true;
  } catch (error) {
    logger.error(`❌ Error en migración ${migration.name}:`, error);
    return false;
  }
}

// Función principal de migración
async function runMigrations() {
  try {
    logger.info('🚀 Iniciando migraciones de base de datos...');
    
    // Verificar conexión a la base de datos
    const connected = await testConnection();
    if (!connected) {
      logger.error('❌ No se pudo conectar a la base de datos');
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
    logger.info(`📊 Resumen de migraciones:`);
    logger.info(`   ✅ Exitosas: ${successCount}`);
    logger.info(`   ❌ Fallidas: ${errorCount}`);
    logger.info(`   📝 Total: ${migrations.length}`);
    
    if (errorCount === 0) {
      logger.info('🎉 ¡Todas las migraciones completadas exitosamente!');
      
      // Crear usuario demo si no existe
      await createDemoUser();
    } else {
      logger.error('⚠️  Algunas migraciones fallaron. Revisa los logs para más detalles.');
      process.exit(1);
    }
    
  } catch (error) {
    logger.error('💥 Error crítico durante las migraciones:', error);
    process.exit(1);
  } finally {
    await closePool();
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
      logger.info('👤 Usuario demo ya existe, saltando creación...');
      return;
    }
    
    // Crear usuario demo
    const passwordHash = await bcrypt.hash('demo123', 12);
    const respuestaHash = await bcrypt.hash('azul', 12);
    
    const userId = await executeQuery(`
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
    
    logger.info('👤 Usuario demo creado exitosamente');
    logger.info('   📧 Email: admin@demo.com');
    logger.info('   🔑 Password: demo123');
    logger.info('   🎲 Número Quiniela: 12345');
    
  } catch (error) {
    logger.error('Error creando usuario demo:', error);
  }
}

// Ejecutar migraciones si este archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export { runMigrations, createDemoUser };