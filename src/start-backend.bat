@echo off
REM Script para iniciar el backend en Windows
REM Asegurar que las dependencias estén instaladas y ejecutar el backend

echo 🔧 Iniciando Backend de Calendario de Gastos y Quinielas...
echo.

REM Ir al directorio backend
cd backend

REM Verificar si node_modules existe
if not exist "node_modules" (
    echo 📦 Instalando dependencias del backend...
    npm install
    echo.
)

REM Verificar si .env existe
if not exist ".env" (
    echo ⚠️ Archivo .env no encontrado. Creando uno básico...
    echo # Configuración Backend > .env
    echo PORT=4000 >> .env
    echo NODE_ENV=development >> .env
    echo CORS_ORIGIN=http://localhost:3000 >> .env
    echo.
)

echo 🚀 Iniciando backend simple en puerto 4000...
echo 📋 Credenciales demo: admin@demo.com / demo123
echo.

REM Ejecutar el backend simple
npm run simple