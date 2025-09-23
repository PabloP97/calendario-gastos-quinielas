#!/bin/bash

# Script para configurar y ejecutar el backend real con TypeScript
echo "🔧 Configurando Backend Real (TypeScript + MySQL)..."
echo ""

# Verificar que estamos en el directorio backend
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde el directorio /backend/"
    exit 1
fi

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    echo ""
fi

# Verificar archivo .env
if [ ! -f ".env" ]; then
    echo "⚠️ Archivo .env no encontrado. Creando configuración básica..."
    cat > .env << EOF
# Configuración de Base de Datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=gastos_quinielas_db

# Configuración del Servidor
PORT=4000
NODE_ENV=development
API_VERSION=v1

# Configuración JWT
JWT_SECRET=mi_secreto_jwt_super_seguro_cambiar_en_produccion_123456789
JWT_EXPIRES_IN=7d

# Configuración de CORS
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logs
LOG_LEVEL=info

# Features
ENABLE_SWAGGER=false
EOF
    echo "✅ Archivo .env creado con configuración por defecto"
    echo ""
fi

echo "🔧 Opciones disponibles:"
echo "1. Compilar TypeScript y ejecutar (Producción)"
echo "2. Modo desarrollo con ts-node (Desarrollo)"
echo "3. Modo desarrollo con nodemon (Desarrollo + Auto-reload)"
echo "4. Solo compilar TypeScript"
echo ""

read -p "Selecciona una opción (1-4): " choice

case $choice in
    1)
        echo "🏗️ Compilando TypeScript..."
        npm run build
        echo "🚀 Ejecutando servidor compilado..."
        npm start
        ;;
    2)
        echo "🚀 Ejecutando en modo desarrollo con ts-node..."
        npm run dev:ts
        ;;
    3)
        echo "🚀 Ejecutando en modo desarrollo con nodemon (auto-reload)..."
        npm run dev
        ;;
    4)
        echo "🏗️ Solo compilando TypeScript..."
        npm run build
        echo "✅ Compilación completa. Los archivos están en /dist/"
        ;;
    *)
        echo "❌ Opción inválida. Usando modo desarrollo por defecto..."
        npm run dev:ts
        ;;
esac