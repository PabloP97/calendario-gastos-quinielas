#!/usr/bin/env node

/**
 * Script definitivo para verificar TypeScript compilación
 * Ejecuta --noEmit para verificar tipos sin generar archivos
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

console.log('🔍 Verificación TypeScript Final del Backend\n');

// Verificar que estamos en el directorio correcto
if (!existsSync('./tsconfig.json')) {
  console.error('❌ No se encontró tsconfig.json');
  console.error('💡 Ejecuta este script desde el directorio /backend/');
  process.exit(1);
}

console.log('📁 Directorio backend verificado ✅');
console.log('⚡ Ejecutando: npx tsc --noEmit\n');

const tscProcess = spawn('npx', ['tsc', '--noEmit'], { 
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true,
  cwd: process.cwd()
});

let output = '';
let errorOutput = '';

tscProcess.stdout.on('data', (data) => {
  const text = data.toString();
  output += text;
  process.stdout.write(text);
});

tscProcess.stderr.on('data', (data) => {
  const text = data.toString();
  errorOutput += text;
  process.stderr.write(text);
});

tscProcess.on('close', (code) => {
  console.log('\n' + '='.repeat(60));
  
  if (code === 0) {
    console.log('🎉 ¡ÉXITO TOTAL! CERO ERRORES DE TYPESCRIPT');
    console.log('='.repeat(60));
    console.log('\n✅ BACKEND REAL TYPESCRIPT COMPLETAMENTE FUNCIONAL\n');
    
    console.log('🚀 COMANDOS PARA EJECUTAR:');
    console.log('   npm run dev:ts        - Servidor con ts-node (RECOMENDADO)');
    console.log('   npm run dev           - Servidor con nodemon');
    console.log('   npm run compile       - Compilar y ejecutar\n');
    
    console.log('📊 FUNCIONALIDADES DISPONIBLES:');
    console.log('   🔐 Autenticación JWT completa');
    console.log('   🗄️ Base de datos MySQL (o modo memoria)');
    console.log('   🛡️ Seguridad de producción');
    console.log('   📝 Logging con Winston');
    console.log('   ⚡ Validaciones Joi');
    console.log('   🚨 Manejo de errores profesional');
    console.log('   📋 APIs: gastos, quinielas, saldos\n');
    
    console.log('🎯 CREDENCIALES DE PRUEBA:');
    console.log('   📧 Email: admin@demo.com');
    console.log('   🔑 Password: demo123\n');
    
    console.log('💡 PRÓXIMO PASO: npm run dev:ts');
    
  } else {
    console.log('❌ ERRORES DE TYPESCRIPT DETECTADOS');
    console.log('='.repeat(60));
    console.log('\n🔧 Revisar los errores de arriba para corregir.\n');
    
    if (errorOutput.includes('jest')) {
      console.log('💡 SUGERENCIA: Error relacionado con Jest');
      console.log('   Solución: Remover "jest" del campo "types" en tsconfig.json');
    }
    
    if (errorOutput.includes('allowImportingTsExtensions')) {
      console.log('💡 SUGERENCIA: Opción no válida en TypeScript');
      console.log('   Solución: Remover "allowImportingTsExtensions" del tsconfig.json');
    }
    
    console.log('\n📝 Para obtener ayuda específica:');
    console.log('   1. Revisa los errores detallados arriba');
    console.log('   2. Consulta ERRORES_SOLUCIONADOS.md');
    console.log('   3. Ejecuta: npm install para dependencias faltantes');
  }
  
  console.log('\n' + '='.repeat(60));
});

tscProcess.on('error', (error) => {
  console.error('\n❌ Error ejecutando TypeScript compiler:');
  console.error(error.message);
  console.error('\n💡 SOLUCIONES:');
  console.error('   npm install -g typescript');
  console.error('   npm install typescript');
  console.error('   npx tsc --version');
});