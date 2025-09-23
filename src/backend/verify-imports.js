#!/usr/bin/env node

/**
 * Script para verificar que todas las importaciones son correctas
 * Busca importaciones con extensiones .js incorrectas
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verificando importaciones en archivos TypeScript\n');

// Función recursiva para encontrar archivos .ts
function findTypeScriptFiles(dir, files = []) {
  const entries = fs.readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && entry !== 'node_modules' && entry !== 'dist') {
      findTypeScriptFiles(fullPath, files);
    } else if (entry.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Encontrar todos los archivos TypeScript
const srcDir = path.join(__dirname, 'src');
const tsFiles = findTypeScriptFiles(srcDir);

console.log(`📁 Encontrados ${tsFiles.length} archivos TypeScript`);

let hasErrors = false;
const errors = [];

// Verificar cada archivo
for (const file of tsFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Buscar importaciones con .js
    if (line.includes('import') && line.includes('.js')) {
      hasErrors = true;
      errors.push({
        file: path.relative(__dirname, file),
        line: index + 1,
        content: line.trim(),
        issue: 'Importación con extensión .js'
      });
    }
    
    // Buscar require con .js
    if (line.includes('require') && line.includes('.js')) {
      hasErrors = true;
      errors.push({
        file: path.relative(__dirname, file),
        line: index + 1,
        content: line.trim(),
        issue: 'Require con extensión .js'
      });
    }
  });
}

console.log('\n' + '='.repeat(60));

if (hasErrors) {
  console.log('❌ ERRORES DE IMPORTACIÓN ENCONTRADOS');
  console.log('='.repeat(60));
  
  errors.forEach((error, index) => {
    console.log(`\n${index + 1}. ${error.file}:${error.line}`);
    console.log(`   📄 ${error.content}`);
    console.log(`   ⚠️  ${error.issue}`);
  });
  
  console.log('\n💡 CORRECCIONES NECESARIAS:');
  console.log('   1. Remover todas las extensiones .js de las importaciones');
  console.log('   2. TypeScript resolverá automáticamente las extensiones');
  console.log('   3. Ejemplo: import { test } from "./file.js" → import { test } from "./file"');
  
} else {
  console.log('✅ TODAS LAS IMPORTACIONES SON CORRECTAS');
  console.log('='.repeat(60));
  console.log('\n🎉 No se encontraron importaciones con extensiones .js');
  console.log('✅ Los archivos TypeScript están listos para compilar');
  console.log('\n🚀 COMANDOS PARA EJECUTAR:');
  console.log('   npm run dev:ts     - Servidor TypeScript directo');
  console.log('   npm run fixed      - Script con mejor manejo de errores');
  console.log('   npm run simple     - Modo JavaScript simple');
}

console.log('\n' + '='.repeat(60));

process.exit(hasErrors ? 1 : 0);