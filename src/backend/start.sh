#!/bin/bash

# Script de inicio rápido para el backend
# Asegúrate de que este archivo tenga permisos de ejecución: chmod +x start.sh

echo "🚀 Iniciando Backend - Calendario Gastos y Quinielas"
echo "=================================================="

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js >= 18"
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if ! npx semver -r ">=$REQUIRED_VERSION" "$NODE_VERSION" &> /dev/null; then
    echo "❌ Se requiere Node.js >= $REQUIRED_VERSION. Versión actual: $NODE_VERSION"
    exit 1
fi

echo "✅ Node.js $NODE_VERSION detectado"

# Verificar si MySQL está ejecutándose
if command -v mysql &> /dev/null; then
    if pgrep mysql > /dev/null; then
        echo "✅ MySQL está ejecutándose"
    else
        echo "⚠️  MySQL no está ejecutándose. Iniciando MySQL..."
        # Intentar iniciar MySQL (puede variar según el sistema)
        if command -v systemctl &> /dev/null; then
            sudo systemctl start mysql
        elif command -v brew &> /dev/null; then
            brew services start mysql
        else
            echo "❌ No se pudo iniciar MySQL automáticamente. Por favor inicia MySQL manualmente."
            exit 1
        fi
    fi
else
    echo "❌ MySQL no está instalado. Por favor instala MySQL"
    exit 1
fi

# Crear directorio de logs si no existe
if [ ! -d "logs" ]; then
    echo "📁 Creando directorio de logs..."
    mkdir logs
fi

# Verificar si existe el archivo .env
if [ ! -f ".env" ]; then
    echo "⚙️  Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "✏️  Por favor edita el archivo .env con tus configuraciones de base de datos"
    echo "📝 Especialmente actualiza DB_PASSWORD con tu contraseña de MySQL"
    read -p "Presiona Enter cuando hayas configurado el archivo .env..."
fi

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Compilar TypeScript
echo "🔨 Compilando TypeScript..."
npm run build

# Ejecutar migraciones
echo "🗃️  Ejecutando migraciones de base de datos..."
npm run db:migrate

if [ $? -eq 0 ]; then
    echo "✅ Migraciones completadas exitosamente"
else
    echo "❌ Error en las migraciones. Verifica tu configuración de base de datos"
    exit 1
fi

# Iniciar servidor
echo "🌐 Iniciando servidor en modo desarrollo..."
echo "📍 El servidor estará disponible en: http://localhost:4000"
echo "🏥 Health check: http://localhost:4000/health"
echo "📚 API endpoints: http://localhost:4000/api/v1"
echo ""
echo "👤 Usuario demo creado:"
echo "   📧 Email: admin@demo.com"
echo "   🔑 Password: demo123"
echo ""
echo "Para detener el servidor presiona Ctrl+C"
echo "=================================================="

npm run dev