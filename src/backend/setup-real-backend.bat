@echo off
REM Script para configurar y ejecutar el backend real con TypeScript
echo 🔧 Configurando Backend Real (TypeScript + MySQL)...
echo.

REM Verificar que estamos en el directorio backend
if not exist "package.json" (
    echo ❌ Error: Ejecuta este script desde el directorio /backend/
    pause
    exit /b 1
)

REM Instalar dependencias si es necesario
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    npm install
    echo.
)

REM Verificar archivo .env
if not exist ".env" (
    echo ⚠️ Archivo .env no encontrado. Creando configuración básica...
    (
    echo # Configuración de Base de Datos MySQL
    echo DB_HOST=localhost
    echo DB_PORT=3306
    echo DB_USER=root
    echo DB_PASSWORD=
    echo DB_NAME=gastos_quinielas_db
    echo.
    echo # Configuración del Servidor
    echo PORT=4000
    echo NODE_ENV=development
    echo API_VERSION=v1
    echo.
    echo # Configuración JWT
    echo JWT_SECRET=mi_secreto_jwt_super_seguro_cambiar_en_produccion_123456789
    echo JWT_EXPIRES_IN=7d
    echo.
    echo # Configuración de CORS
    echo CORS_ORIGIN=http://localhost:3000
    echo CORS_CREDENTIALS=true
    echo.
    echo # Rate Limiting
    echo RATE_LIMIT_WINDOW_MS=900000
    echo RATE_LIMIT_MAX_REQUESTS=100
    echo.
    echo # Logs
    echo LOG_LEVEL=info
    echo.
    echo # Features
    echo ENABLE_SWAGGER=false
    ) > .env
    echo ✅ Archivo .env creado con configuración por defecto
    echo.
)

echo 🔧 Opciones disponibles:
echo 1. Compilar TypeScript y ejecutar (Producción)
echo 2. Modo desarrollo con ts-node (Desarrollo)
echo 3. Modo desarrollo con nodemon (Desarrollo + Auto-reload)
echo 4. Solo compilar TypeScript
echo.

set /p choice=Selecciona una opción (1-4): 

if "%choice%"=="1" (
    echo 🏗️ Compilando TypeScript...
    npm run build
    echo 🚀 Ejecutando servidor compilado...
    npm start
) else if "%choice%"=="2" (
    echo 🚀 Ejecutando en modo desarrollo con ts-node...
    npm run dev:ts
) else if "%choice%"=="3" (
    echo 🚀 Ejecutando en modo desarrollo con nodemon (auto-reload)...
    npm run dev
) else if "%choice%"=="4" (
    echo 🏗️ Solo compilando TypeScript...
    npm run build
    echo ✅ Compilación completa. Los archivos están en /dist/
    pause
) else (
    echo ❌ Opción inválida. Usando modo desarrollo por defecto...
    npm run dev:ts
)