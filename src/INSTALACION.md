# 🚀 Guía de Instalación - Calendario de Gastos y Quinielas

## 📋 Prerrequisitos

```bash
# Verificar versiones requeridas
node --version  # >= 18.0.0
npm --version   # >= 8.0.0
mysql --version # >= 8.0.0
```

## 🔧 Pasos de Instalación

### 1. **Clonar y preparar el proyecto**
```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd calendario-gastos-quinielas

# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd backend
npm install
cd ..
```

### 2. **Configurar MySQL**
```bash
# Conectar a MySQL como root
mysql -u root -p

# Crear base de datos
CREATE DATABASE calendario_gastos;

# Crear usuario específico (opcional pero recomendado)
CREATE USER 'calendario_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON calendario_gastos.* TO 'calendario_user'@'localhost';
FLUSH PRIVILEGES;
exit
```

### 3. **Configurar variables de entorno**
```bash
# Crear archivo .env en la carpeta backend
cd backend
cat > .env << EOF
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=calendario_gastos
JWT_SECRET=mi_secreto_jwt_super_seguro_2024
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
EOF
cd ..
```

### 4. **Crear estructura de base de datos**
```bash
cd backend
node reset-database.js
cd ..
```

**Salida esperada:**
```
🔄 Iniciando reset completo de la base de datos...
✅ Tablas eliminadas correctamente
✅ Tablas creadas correctamente
✅ Usuario demo creado: admin / demo123
🎉 Base de datos lista para usar
```

### 5. **Ejecutar la aplicación**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Salida esperada:**
```
🔧 Servidor iniciado en modo desarrollo
🌐 Backend corriendo en: http://localhost:3001
🔌 Base de datos conectada correctamente
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Salida esperada:**
```
VITE v5.x.x ready in Xxxms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 6. **Verificar instalación**

1. **Abrir navegador:** `http://localhost:5173`
2. **Probar login demo:**
   - Usuario: `admin`
   - Contraseña: `demo123`
3. **Verificar funcionalidad:** Hacer click en un día del calendario

### 7. **Acceso administrativo (crear usuarios)**

1. **URL:** `http://localhost:5173/#admin`
2. **Clave secreta:** `Duki9796`
3. **Crear nuevos usuarios** con email, nombre de quiniela y contraseña

## 🔧 Scripts Disponibles

### Frontend
```bash
npm run dev      # Desarrollo con hot reload
npm run build    # Compilar para producción
npm run preview  # Vista previa del build
```

### Backend
```bash
cd backend
npm run dev      # Desarrollo con nodemon
npm run fixed-es # Desarrollo con ESM forzado (alternativa)
npm start        # Producción
```

### Base de Datos
```bash
cd backend
node reset-database.js  # ⚠️ RESETEA TODA LA BD (elimina datos)
```

## 🚨 Solución de Problemas

### Error: "ER_ACCESS_DENIED_ERROR"
```bash
# Verificar credenciales en backend/.env
# Asegurar que MySQL esté corriendo
sudo systemctl start mysql  # Linux
brew services start mysql   # macOS
```

### Error: "ECONNREFUSED ::1:3306"
```bash
# Cambiar DB_HOST en .env de localhost a 127.0.0.1
echo "DB_HOST=127.0.0.1" >> backend/.env
```

### Error: "Port 3001 already in use"
```bash
# Cambiar puerto en backend/.env
echo "PORT=3002" >> backend/.env
```

### Frontend no conecta con backend
```bash
# Verificar que backend esté corriendo en puerto 3001
curl http://localhost:3001/health

# Verificar CORS_ORIGIN en backend/.env
echo "CORS_ORIGIN=http://localhost:5173" >> backend/.env
```

### Reinstalar dependencias
```bash
# Frontend
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

## ✅ Checklist de Instalación Exitosa

- [ ] Node.js >= 18 instalado
- [ ] MySQL 8.0+ corriendo
- [ ] Dependencias frontend instaladas
- [ ] Dependencias backend instaladas
- [ ] Base de datos `calendario_gastos` creada
- [ ] Archivo `backend/.env` configurado
- [ ] Script `reset-database.js` ejecutado exitosamente
- [ ] Backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 5173
- [ ] Login con usuario demo funcional
- [ ] Calendario navegable y funcional

## 🎯 URLs de la Aplicación

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Admin Panel:** http://localhost:5173/#admin
- **Health Check:** http://localhost:3001/health

## 📱 Uso Básico

1. **Login:** Usar credenciales demo o crear usuario en panel admin
2. **Navegación:** Click en días del calendario
3. **Caja Interna:** Registrar gastos en categorías
4. **Quinielas:** Gestionar diferentes tipos de juegos
5. **Finalizar Día:** Solo disponible en día actual

---

**💡 Tip:** Mantén ambos terminales (frontend y backend) abiertos durante el desarrollo.