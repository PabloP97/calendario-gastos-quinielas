# 🚀 Configuración del Backend - Calendario de Gastos

## 📋 Requisitos Previos

- **Node.js** v16 o superior
- **MySQL** 8.0 o superior
- **npm** (incluido con Node.js)

## ⚙️ Configuración Inicial

### 1. **Instalar Dependencias**
```bash
cd backend
npm install
```

### 2. **Configurar Base de Datos MySQL**

#### A. Crear la Base de Datos
```sql
# Conectar a MySQL
mysql -u root -p

# Crear la base de datos
CREATE DATABASE calendario_gastos;

# Crear usuario específico (opcional pero recomendado)
CREATE USER 'calendario_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON calendario_gastos.* TO 'calendario_user'@'localhost';
FLUSH PRIVILEGES;

# Salir de MySQL
EXIT;
```

#### B. Configurar Variables de Entorno
Edita el archivo `/backend/.env` y actualiza:

```bash
# Base de Datos MySQL - ACTUALIZAR ESTOS VALORES
DB_HOST=localhost
DB_PORT=3306
DB_NAME=calendario_gastos
DB_USER=root                    # O 'calendario_user' si creaste usuario específico
DB_PASSWORD=TU_PASSWORD_AQUI    # ⚠️ IMPORTANTE: Agregar tu contraseña MySQL

# JWT Secret - CAMBIAR EN PRODUCCIÓN
JWT_SECRET=tu_jwt_secret_unico_muy_largo_y_seguro_aqui_cambiar_en_produccion
```

### 3. **Ejecutar Migraciones**
```bash
npm run db:migrate
```

### 4. **Iniciar el Servidor**
```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

## 📁 Ubicación del Archivo .env

El archivo `.env` está ubicado en:
```
/backend/.env
```

Si no lo ves, puede estar oculto porque los archivos que empiezan con punto (.) son archivos ocultos. Para verlo:

### En Windows (Explorador de Archivos):
1. Ve a `Ver` → `Mostrar` → Marca `Elementos ocultos`
2. O usa PowerShell: `Get-ChildItem -Force`

### En macOS (Finder):
1. Presiona `Cmd + Shift + .` para mostrar archivos ocultos
2. O usa Terminal: `ls -la`

### En Linux (Terminal):
```bash
ls -la /backend/
```

### En VS Code:
1. Ve a `Explorador` → `...` → `Configuración`
2. Busca "files.exclude"
3. Quita `**/.env` de la lista de exclusión

## 🔧 Scripts Disponibles

```bash
# Desarrollo con recarga automática
npm run dev

# Producción
npm start

# Ejecutar migraciones
npm run db:migrate

# Limpiar y reinstalar dependencias
npm run clean

# Ver logs del servidor
npm run logs
```

## 📡 Endpoints de la API

El servidor estará disponible en: `http://localhost:4000`

### Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/register` - Registrar usuario
- `GET /api/v1/auth/me` - Validar sesión
- `POST /api/v1/auth/logout` - Cerrar sesión
- `POST /api/v1/auth/forgot-password` - Recuperar contraseña

### Gastos
- `POST /api/v1/gastos` - Crear gasto
- `GET /api/v1/gastos/:fecha` - Obtener gastos por fecha
- `PUT /api/v1/gastos/:id` - Editar gasto
- `DELETE /api/v1/gastos/:id` - Eliminar gasto

### Quinielas
- `POST /api/v1/quinielas/transacciones` - Crear transacción
- `GET /api/v1/quinielas/transacciones/:fecha` - Obtener transacciones por fecha
- `PUT /api/v1/quinielas/transacciones/:id` - Editar transacción
- `DELETE /api/v1/quinielas/transacciones/:id` - Eliminar transacción

### Saldos
- `GET /api/v1/saldos/anterior/:fecha` - Obtener saldo anterior
- `GET /api/v1/saldos/finalizados` - Obtener días finalizados
- `POST /api/v1/saldos/finalizar` - Finalizar día
- `GET /api/v1/saldos/datos-dia/:fecha` - Obtener todos los datos del día

## 🐛 Resolución de Problemas

### Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error de Conexión a MySQL
1. Verifica que MySQL esté ejecutándose:
   ```bash
   # Windows
   net start mysql

   # macOS/Linux
   sudo service mysql start
   ```

2. Verifica las credenciales en `/backend/.env`
3. Verifica que la base de datos exista:
   ```sql
   SHOW DATABASES;
   ```

### Error: "Port 4000 already in use"
1. Cambia el puerto en `/backend/.env`:
   ```bash
   PORT=4001
   ```
2. O mata el proceso que usa el puerto:
   ```bash
   # Windows
   netstat -ano | findstr :4000
   taskkill /PID <PID_NUMBER> /F

   # macOS/Linux
   lsof -ti:4000 | xargs kill -9
   ```

### Error de CORS
Verifica que en `/backend/.env` esté configurado:
```bash
CORS_ORIGIN=http://localhost:3000
```

## 🔒 Seguridad

### Variables Críticas para Cambiar en Producción:
- `JWT_SECRET` - Usar un valor único y seguro
- `SESSION_SECRET` - Usar un valor único y seguro
- `DB_PASSWORD` - Usar una contraseña fuerte
- `NODE_ENV=production`

### Recomendaciones:
- No subir el archivo `.env` al control de versiones
- Usar HTTPS en producción
- Configurar un firewall adecuado
- Usar variables de entorno del sistema en producción

## 📝 Logs

Los logs se guardan en:
- Consola (modo desarrollo)
- Archivo: `/backend/logs/app.log`

## 🌐 Frontend Integration

El frontend ya está configurado para conectarse automáticamente al backend. Configuración en `/services/config.ts`:

```typescript
// Desarrollo
api.baseUrl: 'http://localhost:4000/api/v1'

// Producción (actualizar con tu URL real)
api.baseUrl: 'https://tu-backend-produccion.com/api/v1'
```

## ✅ Verificación de Funcionamiento

1. **Backend funcionando:**
   ```bash
   curl http://localhost:4000/api/v1/health
   ```

2. **Base de datos conectada:**
   - Verifica que no haya errores en los logs del servidor

3. **Frontend conectado:**
   - Inicia el frontend (`npm run dev` en la carpeta raíz)
   - Intenta hacer login o registro
   - Verifica que no haya errores de CORS en la consola del navegador

## 🚀 Inicio Rápido (Script Automatizado)

```bash
# Solo Linux/macOS
chmod +x start.sh
./start.sh

# Windows - ejecuta manualmente:
# npm install && npm run db:migrate && npm run dev
```

¡El backend debería estar funcionando y listo para recibir peticiones del frontend! 🎉