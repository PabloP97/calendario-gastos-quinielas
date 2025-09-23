#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🚀 Iniciando Backend Real TypeScript (Versión ESM Corregida)\n');

// Verificar que estemos en el directorio correcto
const backendDir = process.cwd();
const expectedFiles = ['src', 'tsconfig.json', 'package.json'];

for (const file of expectedFiles) {
  if (!fs.existsSync(path.join(backendDir, file))) {
    console.error(`❌ Archivo/directorio no encontrado: ${file}`);
    console.error(`💡 Asegúrate de ejecutar este script desde el directorio backend/`);
    process.exit(1);
  }
}

console.log('📁 Directorio backend verificado ✅');

// Configurar variables de entorno para ts-node + ESM
const env = {
  ...process.env,
  NODE_OPTIONS: '--loader ts-node/esm --experimental-specifier-resolution=node',
  TS_NODE_PROJECT: './tsconfig.json',
  TS_NODE_ESM: 'true'
};

console.log('⚡ Ejecutando: node --loader ts-node/esm --experimental-specifier-resolution=node src/server.ts\n');

// Ejecutar el servidor con ts-node
const server = spawn('node', [
  '--loader', 'ts-node/esm',
  '--experimental-specifier-resolution=node',
  'src/server.ts'
], {
  stdio: 'inherit',
  env: env,
  cwd: backendDir
});

// Manejar cierre del proceso
server.on('close', (code) => {
  console.log('\n============================================================');
  if (code === 0) {
    console.log('✅ El servidor se cerró correctamente');
  } else {
    console.log('❌ El servidor se cerró con errores');
  }
  console.log('============================================================');
  
  if (code !== 0) {
    console.log('\n💡 SOLUCIÓN - Error de módulos:');
    console.log('   1. Verifica que todas las importaciones no tengan extensión .js');
    console.log('   2. Ejecuta: npm install');
    console.log('   3. Revisa que las rutas de importación sean correctas');
    
    console.log('\n💡 SOLUCIÓN - Error de base de datos:');
    console.log('   1. Instala MySQL/MariaDB localmente');
    console.log('   2. O usa el modo simple: npm run simple');
    console.log('   3. Verifica las credenciales en .env');
    
    console.log('\n📝 Para más ayuda:');
    console.log('   - Revisa ERRORES_SOLUCIONADOS.md');
    console.log('   - Ejecuta: npm run simple (modo básico)');
    console.log('   - Consulta EJECUTAR_BACKEND_REAL.md');
    console.log('\n============================================================');
  }
  
  process.exit(code);
});

// Manejar errores del proceso
server.on('error', (error) => {
  console.error('\n💥 Error ejecutando el servidor:', error.message);
  console.log('\n💡 Posibles soluciones:');
  console.log('   1. Verifica que Node.js esté instalado (versión >= 18)');
  console.log('   2. Ejecuta: npm install');
  console.log('   3. Ejecuta: npm run verify');
  process.exit(1);
});

// Manejar Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor...');
  server.kill('SIGTERM');
});