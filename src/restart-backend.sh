#!/bin/bash

echo "======================================="
echo "    SOLUCIONANDO ERRORES DE QUINIELAS"
echo "======================================="
echo

echo "[1/3] Matando procesos del backend anteriores..."
pkill -f "node.*start-simple.js" 2>/dev/null || echo "No hay procesos del backend corriendo"

echo
echo "[2/3] Navegando al directorio backend..."
cd backend

echo
echo "[3/3] Iniciando backend con rutas corregidas..."
echo "Rutas de quinielas ahora disponibles en:"
echo "- POST /api/v1/quinielas/transacciones"
echo "- GET  /api/v1/quinielas/transacciones/:fecha"
echo "- PUT  /api/v1/quinielas/transacciones/:id"
echo "- DELETE /api/v1/quinielas/transacciones/:id"
echo

node start-simple.js