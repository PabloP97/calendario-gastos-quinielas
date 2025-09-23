#!/usr/bin/env node

/**
 * Script corregido para ejecutar el backend TypeScript
 * Maneja correctamente las importaciones ES modules
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

console.log('🚀 Iniciando Backend Real TypeScript (Versión Corregida)\n');

// Verificar que estamos en el directorio correcto
if (!existsSync('./src/server.ts')) {
  console.error('❌ No se encontró src/server.ts');
  console.error('💡 Ejecuta este script desde el directorio /backend/');
  process.exit(1);
}

console.log('📁 Directorio backend verificado ✅');
console.log('⚡ Ejecutando: ts-node --esm src/server.ts\n');

// Configurar variables de entorno para desarrollo
const env = {
  ...process.env,
  NODE_ENV: 'development',
  JWT_SECRET: 'your-secret-key-here-change-in-production',
  JWT_EXPIRES_IN: '24h',
  JWT_REFRESH_EXPIRES_IN: '7d',
  BCRYPT_ROUNDS: '10', // Reducir para desarrollo
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX_REQUESTS: '1000',
  CORS_ORIGIN: 'http://localhost:3000',
  CORS_CREDENTIALS: 'true',
  DB_HOST: 'localhost',
  DB_PORT: '3306',
  DB_USER: 'root',
  DB_PASSWORD: '',
  DB_NAME: 'calendario_gastos',
  MOCK_EMAIL: 'true',
  ENABLE_SWAGGER: 'false',
  PORT: '4000'
};

const serverProcess = spawn('npx', ['ts-node', '--esm', 'src/server.ts'], { 
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true,
  cwd: process.cwd(),
  env: env
});

let output = '';
let errorOutput = '';

serverProcess.stdout.on('data', (data) => {
  const text = data.toString();
  output += text;
  process.stdout.write(text);
});

serverProcess.stderr.on('data', (data) => {
  const text = data.toString();
  errorOutput += text;
  
  // Filtrar warnings conocidos de ts-node
  if (text.includes('ExperimentalWarning') || 
      text.includes('DeprecationWarning') ||
      text.includes('--experimental-specifier-resolution')) {
    return;
  }
  
  process.stderr.write(text);
});

serverProcess.on('close', (code) => {
  console.log('\n' + '='.repeat(60));
  
  if (code === 0) {
    console.log('✅ Servidor cerrado exitosamente');
  } else {
    console.log('❌ El servidor se cerró con errores');
    console.log('='.repeat(60));
    
    if (errorOutput.includes('Cannot find module')) {
      console.log('\n💡 SOLUCIÓN - Error de módulos:');
      console.log('   1. Verifica que todas las importaciones no tengan extensión .js');
      console.log('   2. Ejecuta: npm install');
      console.log('   3. Revisa que las rutas de importación sean correctas');
    }
    
    if (errorOutput.includes('database')) {
      console.log('\n💡 SOLUCIÓN - Error de base de datos:');
      console.log('   1. Instala MySQL/MariaDB localmente');
      console.log('   2. O usa el modo simple: npm run simple');
      console.log('   3. Verifica las credenciales en .env');
    }
    
    if (errorOutput.includes('EADDRINUSE')) {
      console.log('\n💡 SOLUCIÓN - Puerto ocupado:');
      console.log('   1. El puerto 4000 está en uso');
      console.log('   2. Cierra otros procesos de Node.js');
      console.log('   3. O cambia el puerto en las variables de entorno');
    }
    
    console.log('\n📝 Para más ayuda:');
    console.log('   - Revisa ERRORES_SOLUCIONADOS.md');
    console.log('   - Ejecuta: npm run simple (modo básico)');
    console.log('   - Consulta EJECUTAR_BACKEND_REAL.md');
  }
  
  console.log('\n' + '='.repeat(60));
});

serverProcess.on('error', (error) => {
  console.error('\n❌ Error ejecutando ts-node:');
  console.error(error.message);
  console.error('\n💡 SOLUCIONES:');
  console.error('   npm install ts-node typescript');
  console.error('   npx ts-node --version');
});

// Manejo de señales para cierre graceful
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor...');
  serverProcess.kill('SIGTERM');
});