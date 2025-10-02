# 🚀 **Guía de Instalación**

Esta guía te llevará paso a paso por la instalación completa del **Calendario de Gastos y Quinielas**.

## 📋 **Prerrequisitos**

Antes de comenzar, asegúrate de tener instaladas las siguientes herramientas:

```bash
# Verificar versiones requeridas
node --version  # >= 18.0.0
npm --version   # >= 8.0.0
mysql --version # >= 8.0.0
git --version   # >= 2.30.0
```

### **Instalación de Prerrequisitos**

<details>
<summary>🖥️ Windows</summary>

```bash
# Node.js y npm (descargar desde nodejs.org)
# MySQL (descargar MySQL Installer desde mysql.com)
# Git (descargar desde git-scm.com)

# Verificar instalaciones
node --version
npm --version
mysql --version
git --version
```

</details>

<details>
<summary>🍎 macOS</summary>

```bash
# Usando Homebrew
brew install node
brew install mysql
brew install git

# Verificar instalaciones
node --version
npm --version
mysql --version
git --version
```

</details>

<details>
<summary>🐧 Linux (Ubuntu/Debian)</summary>

```bash
# Node.js y npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MySQL
sudo apt update
sudo apt install mysql-server

# Git
sudo apt install git

# Verificar instalaciones
node --version
npm --version
mysql --version
git --version
```

</details>

## 🔧 **Instalación del Proyecto**

### **1. Clonar y preparar el proyecto**

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

### **2. Configurar MySQL**

#### **Iniciar MySQL**
```bash
# Linux/macOS
sudo systemctl start mysql
# o
sudo service mysql start

# Windows (desde Services o MySQL Workbench)
# Iniciar el servicio MySQL desde el panel de servicios
```

#### **Crear Base de Datos**
```bash
# Conectar a MySQL como root
mysql -u root -p

# Ejecutar comandos SQL
CREATE DATABASE calendario_gastos;

# Crear usuario específico (opcional pero recomendado)
CREATE USER 'calendario_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON calendario_gastos.* TO 'calendario_user'@'localhost';
FLUSH PRIVILEGES;
exit
```

### **3. Configurar variables de entorno**

#### **Crear archivo .env**
```bash
# Crear archivo .env en la carpeta backend
cd backend

# Crear archivo de configuración
cat > .env << EOF
# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=calendario_gastos

# Configuración de Seguridad
JWT_SECRET=mi_secreto_jwt_super_seguro_2024_calendario_gastos
PORT=3001
NODE_ENV=development

# Configuración de CORS
CORS_ORIGIN=http://localhost:5173
EOF

cd ..
```

#### **Ejemplo de .env completo**
```bash
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=calendario_gastos

# Seguridad
JWT_SECRET=mi_secreto_jwt_super_seguro_2024_calendario_gastos
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# Configuración adicional (opcional)
LOG_LEVEL=info
SESSION_TIMEOUT=24h
MAX_LOGIN_ATTEMPTS=5
```

### **4. Crear estructura de base de datos**

```bash
# Ejecutar reset de base de datos para crear tablas
cd backend
node reset-database.js
cd ..
```

**Salida esperada:**
```
🔄 Iniciando reset completo de la base de datos...
✅ Conexión a MySQL establecida
✅ Base de datos 'calendario_gastos' seleccionada
✅ Tablas eliminadas correctamente
✅ Tablas creadas correctamente
✅ Usuario demo creado exitosamente
   👤 Username: admin
   🔐 Password: demo123
🎉 Base de datos lista para usar
```

### **5. Ejecutar la aplicación**

#### **Terminal 1 - Backend**
```bash
cd backend
npm run dev
```

**Salida esperada:**
```
🔧 Servidor iniciado en modo desarrollo
🌐 Backend corriendo en: http://localhost:3001
🔌 Base de datos conectada correctamente
📊 Middlewares cargados: auth, errorHandler, requestLogger
🛣️ Rutas cargadas: /api/v1/auth, /api/v1/gastos, /api/v1/quinielas, /api/v1/saldos
✅ Servidor listo para recibir peticiones
```

#### **Terminal 2 - Frontend**
```bash
# En la raíz del proyecto
npm run dev
```

**Salida esperada:**
```
VITE v5.x.x ready in Xxxms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

### **6. Verificar instalación**

#### **1. Verificar Backend**
```bash
# Probar conexión al backend
curl http://localhost:3001/health

# Respuesta esperada:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

#### **2. Verificar Frontend**
1. **Abrir navegador:** `http://localhost:5173`
2. **Verificar que carga la página de login**
3. **Probar login demo:**
   - Username: `admin`
   - Password: `demo123`
4. **Verificar navegación:** Hacer click en un día del calendario

#### **3. Verificar Funcionalidades**
- ✅ **Login exitoso** con credenciales demo
- ✅ **Calendario navegable** con días clickeables
- ✅ **Panel de día actual** editable
- ✅ **Pestañas funcionando** (Caja Interna / Quiniela)
- ✅ **Agregar gastos** en Caja Interna
- ✅ **Visualizar modalidades** en Quiniela

### **7. Acceso administrativo (crear usuarios)**

#### **Acceder al Panel de Admin**
1. **URL:** `http://localhost:5173/#admin`
2. **Clave secreta:** `Duki9796`
3. **Funciones disponibles:**
   - ✨ Crear nuevos usuarios
   - 👥 Gestionar usuarios existentes
   - 🔐 Asignar usernames y contraseñas

#### **Crear Usuario de Prueba**
1. En el panel admin, click **"Crear Usuario"**
2. Llenar datos:
   - **Email:** `test@ejemplo.com`
   - **Nombre de la Quiniela:** `Usuario Test`
   - **Username:** `test_user`
   - **Contraseña:** `test123`
3. **Guardar** y luego hacer **logout**
4. **Login** con nuevas credenciales para verificar

## 🔧 **Scripts Disponibles**

### **Frontend**
```bash
# Desarrollo con hot reload
npm run dev

# Compilar para producción
npm run build

# Vista previa del build de producción
npm run preview

# Verificar errores de TypeScript
npm run type-check

# Ejecutar linter
npm run lint
```

### **Backend**
```bash
cd backend

# Desarrollo con nodemon (auto-reload)
npm run dev

# Desarrollo con ESM forzado (alternativa)
npm run fixed-es

# Compilar TypeScript
npm run build

# Ejecutar en producción
npm start

# Verificar tipos TypeScript
npm run type-check
```

### **Base de Datos**
```bash
cd backend

# ⚠️ RESETEA TODA LA BD (elimina todos los datos)
node reset-database.js

# Ejecutar solo migración (sin reset)
node src/database/migrate-simple.js
```

## 🚨 **Solución de Problemas**

### **Error: "ER_ACCESS_DENIED_ERROR"**
```bash
Error: ER_ACCESS_DENIED_ERROR: Access denied for user 'root'@'localhost'
```
**Soluciones:**
1. Verificar credenciales en `backend/.env`
2. Asegurar que MySQL esté corriendo:
   ```bash
   # Linux/macOS
   sudo systemctl start mysql
   sudo systemctl status mysql
   
   # Windows
   # Verificar en Services > MySQL
   ```
3. Resetear contraseña de MySQL si es necesario

### **Error: "ECONNREFUSED ::1:3306"**
```bash
Error: connect ECONNREFUSED ::1:3306
```
**Soluciones:**
1. Cambiar `DB_HOST` en `.env`:
   ```bash
   # En backend/.env
   DB_HOST=127.0.0.1
   # en lugar de
   DB_HOST=localhost
   ```
2. Verificar que MySQL esté en puerto 3306:
   ```bash
   netstat -an | grep 3306
   ```

### **Error: "Port 3001 already in use"**
```bash
Error: listen EADDRINUSE: address already in use :::3001
```
**Solución:**
```bash
# Cambiar puerto en backend/.env
PORT=3002

# O matar proceso que usa el puerto
# Linux/macOS
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### **Error: "Frontend no conecta con backend"**
```bash
TypeError: Failed to fetch
```
**Soluciones:**
1. Verificar que backend esté corriendo:
   ```bash
   curl http://localhost:3001/health
   ```
2. Verificar `CORS_ORIGIN` en `backend/.env`:
   ```bash
   CORS_ORIGIN=http://localhost:5173
   ```
3. Verificar puerto del frontend en Vite (normalmente 5173)

### **Error: "JWT malformed" o problemas de autenticación**
**Soluciones:**
1. Limpiar localStorage:
   ```javascript
   // En consola del navegador
   localStorage.clear();
   ```
2. Verificar `JWT_SECRET` en `backend/.env`
3. Hacer logout y login nuevamente

### **Error: "Cannot find module" o dependencias faltantes**
**Solución:**
```bash
# Reinstalar dependencias del frontend
rm -rf node_modules package-lock.json
npm install

# Reinstalar dependencias del backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

### **Error: Base de datos no se crea correctamente**
**Solución:**
```bash
# Conectar manualmente a MySQL y recrear
mysql -u root -p

DROP DATABASE IF EXISTS calendario_gastos;
CREATE DATABASE calendario_gastos;
exit

# Ejecutar reset nuevamente
cd backend
node reset-database.js
```

## ✅ **Checklist de Instalación Exitosa**

Marca cada elemento conforme lo completes:

### **Prerrequisitos**
- [ ] Node.js >= 18 instalado y funcionando
- [ ] MySQL 8.0+ instalado y corriendo
- [ ] Git instalado y configurado
- [ ] Acceso a terminal/línea de comandos

### **Configuración del Proyecto**
- [ ] Repositorio clonado correctamente
- [ ] Dependencias frontend instaladas (`npm install`)
- [ ] Dependencias backend instaladas (`cd backend && npm install`)
- [ ] Base de datos `calendario_gastos` creada en MySQL
- [ ] Archivo `backend/.env` configurado con credenciales correctas

### **Inicialización**
- [ ] Script `reset-database.js` ejecutado exitosamente
- [ ] Mensaje "Usuario demo creado: admin / demo123" mostrado
- [ ] Backend iniciado en puerto 3001 (`npm run dev`)
- [ ] Frontend iniciado en puerto 5173 (`npm run dev`)

### **Verificación Funcional**
- [ ] Health check del backend responde (`curl http://localhost:3001/health`)
- [ ] Página de login carga en `http://localhost:5173`
- [ ] Login exitoso con credenciales demo (admin / demo123)
- [ ] Calendario navegable y funcional
- [ ] Panel de día actual editable
- [ ] Pestañas Caja Interna/Quiniela funcionando
- [ ] Agregar/editar gastos funcional
- [ ] Modal de quinielas funcional

### **Funcionalidades Administrativas**
- [ ] Acceso a panel admin con `http://localhost:5173/#admin`
- [ ] Clave secreta `Duki9796` funciona
- [ ] Crear usuarios desde panel admin funcional
- [ ] Login con usuarios creados funcional

## 🎯 **URLs de la Aplicación**

Una vez completada la instalación, tendrás acceso a:

- **🏠 Frontend Principal:** http://localhost:5173
- **🔌 Backend API:** http://localhost:3001
- **💚 Health Check:** http://localhost:3001/health
- **👥 Panel Admin:** http://localhost:5173/#admin
- **📊 API Documentation:** http://localhost:3001/api/docs (si está configurada)

## 📱 **Uso Básico Post-Instalación**

### **Para Usuarios Finales**
1. **Login:** Usar credenciales asignadas por administrador
2. **Navegación:** Click en días del calendario para ver/editar
3. **Caja Interna:** Registrar gastos en categorías predefinidas
4. **Quinielas:** Gestionar diferentes tipos de juegos
5. **Finalizar Día:** Solo disponible en día actual

### **Para Administradores**
1. **Acceso Admin:** `/#admin` con clave secreta
2. **Crear Usuarios:** Email, nombre, username y contraseña
3. **Gestionar:** Ver lista de usuarios y sus estados
4. **Mantenimiento:** Configurar horarios de quinielas

## 🔄 **Próximos Pasos**

Después de una instalación exitosa:

1. **📚 Leer Documentación:** Revisa [`database-schema.md`](database-schema.md) para entender la estructura
2. **🛠️ Desarrollo:** Si vas a contribuir, lee [`development-guidelines.md`](development-guidelines.md)
3. **🚀 Deployment:** Para producción, revisa configuraciones de seguridad
4. **🔧 Personalización:** Configura horarios de quinielas según necesidades

---

**💡 Tip:** Mantén ambos terminales (frontend y backend) abiertos durante el desarrollo y guarda las credenciales demo en un lugar seguro.

**🆘 ¿Problemas?** Si encuentras errores no listados aquí, revisa los logs en ambos terminales y consulta la documentación de contribución para reportar bugs.