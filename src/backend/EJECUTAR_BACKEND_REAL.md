# 🚀 Ejecutar Backend Real (TypeScript + MySQL)

## ✅ Prerequisitos Verificados

- ✅ Archivo `.env` configurado
- ✅ Estructura de archivos TypeScript completa
- ✅ Configuración de ES modules corregida
- ✅ Scripts de ejecución actualizados

## 🎯 Opciones para Ejecutar el Backend Real

### **Opción 1: Desarrollo con ts-node (RECOMENDADA)**

```bash
# Desde el directorio /backend/
npm run dev:ts
```

**¿Qué hace?**
- Ejecuta TypeScript directamente sin compilar
- Modo desarrollo con ES modules
- Reinicio manual (Ctrl+C para parar)

### **Opción 2: Desarrollo con nodemon (Auto-reload)**

```bash
# Desde el directorio /backend/
npm run dev
```

**¿Qué hace?**
- Ejecuta TypeScript con recarga automática
- Detecta cambios en archivos y reinicia
- Ideal para desarrollo activo

### **Opción 3: Compilar y Ejecutar (Producción)**

```bash
# Desde el directorio /backend/
npm run build
npm start
```

**¿Qué hace?**
- Compila TypeScript a JavaScript (carpeta `/dist/`)
- Ejecuta el código compilado
- Modo producción optimizado

### **Opción 4: Compilar y Ejecutar (Un comando)**

```bash
# Desde el directorio /backend/
npm run compile
```

**¿Qué hace?**
- Compila y ejecuta en un solo comando
- Útil para testing rápido

### **Opción 5: Script Automático**

```bash
# Linux/Mac
./setup-real-backend.sh

# Windows
setup-real-backend.bat
```

**¿Qué hace?**
- Te presenta un menú interactivo
- Permite elegir el modo de ejecución
- Verifica configuración automáticamente

---

## 🔧 Configuración de Base de Datos

### **Opción A: MySQL Local (Recomendada para producción)**

1. **Instalar MySQL:**
   ```bash
   # Ubuntu/Debian
   sudo apt install mysql-server
   
   # macOS con Homebrew
   brew install mysql
   
   # Windows: Descargar de mysql.com
   ```

2. **Crear base de datos:**
   ```sql
   CREATE DATABASE gastos_quinielas_db;
   CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'tu_password_segura';
   GRANT ALL PRIVILEGES ON gastos_quinielas_db.* TO 'app_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Actualizar .env:**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=app_user
   DB_PASSWORD=tu_password_segura
   DB_NAME=gastos_quinielas_db
   ```

### **Opción B: Usar Backend Simple (Para desarrollo/testing)**

Si no tienes MySQL o solo quieres probar:

```bash
# Usar el backend simple en JavaScript (datos en memoria)
npm run simple

# O usar el backend simple en TypeScript
npm run simple-ts
```

---

## 📋 Estado de Conexión

### **✅ Backend Real TypeScript Incluye:**

- 🔐 **Autenticación JWT completa**
- 🗄️ **Conexión real a MySQL con pool de conexiones**
- 🛡️ **Middlewares de seguridad (helmet, cors, rate limiting)**
- 📝 **Logging detallado con winston**
- ⚡ **Validación de datos con esquemas**
- 🚨 **Manejo de errores robusto**
- 🔄 **Transacciones de base de datos**
- 📊 **Stored procedures preparados (comentados en código)**

### **🔄 Diferencias vs Backend Simple:**

| Característica | Backend Simple | Backend Real |
|----------------|---------------|-------------|
| **Persistencia** | ❌ Memoria (se pierde) | ✅ MySQL (permanente) |
| **Autenticación** | ❌ Mock tokens | ✅ JWT real + hash |
| **Seguridad** | ❌ Básica | ✅ Completa (helmet, rate limit) |
| **Logs** | ❌ console.log | ✅ Winston + archivos |
| **Validación** | ❌ Mínima | ✅ Esquemas completos |
| **Escalabilidad** | ❌ No escalable | ✅ Listo para producción |

---

## 🚀 Instrucciones de Inicio Rápido

### **Para Desarrollo Inmediato:**

```bash
# 1. Ir al directorio backend
cd backend

# 2. Instalar dependencias (si no está hecho)
npm install

# 3. Ejecutar backend real
npm run dev:ts

# 4. En otra terminal, ejecutar frontend
cd ..
npm run dev

# 5. Abrir http://localhost:3000
```

### **Verificar que Funciona:**

1. **Backend:** http://localhost:4000/api/v1/health
2. **Frontend:** http://localhost:3000
3. **Login:** admin@demo.com / demo123

---

## 🐛 Solución de Problemas

### **Error: "Cannot connect to MySQL"**

**Causa:** MySQL no está corriendo o configuración incorrecta

**Soluciones:**
1. **Verificar MySQL:**
   ```bash
   sudo systemctl status mysql    # Linux
   brew services list | grep mysql  # macOS
   ```

2. **Iniciar MySQL:**
   ```bash
   sudo systemctl start mysql     # Linux
   brew services start mysql      # macOS
   ```

3. **O usar backend simple:**
   ```bash
   npm run simple
   ```

### **Error: "Module not found"**

**Causa:** Dependencias faltantes

**Solución:**
```bash
rm -rf node_modules
npm install
```

### **Error: "Port 4000 already in use"**

**Causa:** Otro proceso usa el puerto

**Soluciones:**
1. **Encontrar proceso:**
   ```bash
   lsof -i :4000
   ```

2. **Terminar proceso:**
   ```bash
   kill -9 [PID]
   ```

3. **O cambiar puerto en .env:**
   ```env
   PORT=4001
   ```

### **Error: "JWT Secret not configured"**

**Causa:** Archivo .env faltante o incompleto

**Solución:**
```bash
# Verificar que existe /backend/.env
ls -la .env

# Si no existe, crearlo con:
cp .env.example .env  # Si existe ejemplo
# O usar el script setup-real-backend.sh
```

---

## 📊 Logs y Monitoreo

### **Ver Logs en Tiempo Real:**

```bash
# Durante desarrollo
npm run dev:ts
# Los logs aparecen en la consola

# En producción
tail -f logs/combined.log
tail -f logs/error.log
```

### **Niveles de Log:**

- `error`: Errores críticos
- `warn`: Advertencias
- `info`: Información general
- `debug`: Debugging detallado

---

## 🎯 Migración de Datos

### **Ejecutar Migraciones (Cuando estén listas):**

```bash
# Migración TypeScript (futuro)
npm run db:migrate

# Migración simple (actual)
npm run db:migrate-simple
```

---

¡El backend real TypeScript está listo para usarse! 🎉

**Siguiente paso recomendado:** `npm run dev:ts`