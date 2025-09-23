#!/bin/bash

# Script para iniciar el backend fácilmente
# Asegurar que las dependencias estén instaladas y ejecutar el backend

echo "🔧 Iniciando Backend de Calendario de Gastos y Quinielas..."
echo ""

# Ir al directorio backend
cd backend

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias del backend..."
    npm install
    echo ""
fi

# Verificar si .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Archivo .env no encontrado. Creando uno básico..."
    echo "# Configuración Backend" > .env
    echo "PORT=4000" >> .env
    echo "NODE_ENV=development" >> .env
    echo "CORS_ORIGIN=http://localhost:3000" >> .env
    echo ""
fi

echo "🚀 Iniciando backend simple en puerto 4000..."
echo "📋 Credenciales demo: admin@demo.com / demo123"
echo ""

# Ejecutar el backend simple
npm run simple