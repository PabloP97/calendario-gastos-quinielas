#!/bin/bash

echo "========================================"
echo "   REINICIO COMPLETO DE BASE DE DATOS"
echo "========================================"
echo ""
echo "ATENCIÓN: Esto eliminará TODOS los datos"
echo "Presiona Enter para continuar o Ctrl+C para cancelar..."
read

echo ""
echo "Ejecutando reinicio..."

# Cambiar al directorio del script
cd "$(dirname "$0")"

# Ejecutar el script de reinicio
node reset-database.js

echo ""
echo "Reinicio completo."
echo "Presiona Enter para continuar..."
read