# Backend - Calendario Gastos y Quinielas

Backend API REST desarrollado con Node.js, Express y TypeScript para la aplicación de gestión de gastos diarios y quinielas.

## 🚀 Características

- **API REST completa** con autenticación JWT
- **Base de datos MySQL** con migraciones automáticas
- **Validación robusta** con Joi
- **Logging estructurado** con Winston
- **Manejo de errores centralizado**
- **Rate limiting** y seguridad con Helmet
- **Documentación automática** (opcional con Swagger)
- **Configuración por variables de entorno**

## 📋 Requisitos Previos

- Node.js >= 18.0.0
- MySQL >= 8.0
- npm o yarn

## ⚙️ Instalación

1. **Clonar el repositorio e instalar dependencias:**
   ```bash
   cd backend
   npm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

3. **Configurar base de datos:**
   - Crear una base de datos MySQL llamada `calendario_gastos`
   - Actualizar las credenciales en el archivo `.env`

4. **Ejecutar migraciones:**
   ```bash
   npm run db:migrate
   ```

5. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

## 🗃️ Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuración de DB y servicios
│   ├── database/        # Migraciones y schemas
│   ├── middleware/      # Middlewares (auth, errors, etc.)
│   ├── routes/          # Definición de rutas API
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Utilidades (logger, validación)
│   └── server.ts        # Punto de entrada principal
├── logs/                # Archivos de log
├── dist/                # Código compilado
├── .env.example         # Variables de entorno ejemplo
├── package.json
└── tsconfig.json
```

## 🌐 Endpoints API

### Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/validate-session` - Validar sesión
- `POST /api/v1/auth/logout` - Cerrar sesión
- `POST /api/v1/auth/recover-password` - Recuperar contraseña

### Gastos
- `GET /api/v1/gastos/:fecha` - Obtener gastos por fecha
- `POST /api/v1/gastos` - Crear gasto
- `PUT /api/v1/gastos/:id` - Actualizar gasto
- `DELETE /api/v1/gastos/:id` - Eliminar gasto

### Quinielas
- `GET /api/v1/quinielas/:fecha` - Obtener transacciones por fecha
- `POST /api/v1/quinielas` - Crear transacción
- `PUT /api/v1/quinielas/:id` - Actualizar transacción
- `DELETE /api/v1/quinielas/:id` - Eliminar transacción

### Saldos
- `GET /api/v1/saldos/dias-finalizados` - Obtener días finalizados
- `GET /api/v1/saldos/datos-dia/:fecha` - Obtener datos completos del día
- `GET /api/v1/saldos/saldo-anterior/:fecha` - Obtener saldo anterior
- `POST /api/v1/saldos/finalizar-dia/:fecha` - Finalizar día

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación. Después del login exitoso, incluir el token en el header:

```
Authorization: Bearer <token>
```

## 📊 Base de Datos

### Tablas Principales

- **usuarios** - Información de usuarios
- **sesiones** - Gestión de sesiones activas
- **gastos** - Registro de gastos diarios
- **transacciones_quiniela** - Transacciones de quinielas
- **saldos_diarios** - Saldos calculados por día
- **dias_finalizados** - Control de días cerrados

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor con hot reload
npm run build        # Compilar TypeScript
npm run start        # Servidor en producción

# Base de datos
npm run db:migrate   # Ejecutar migraciones

# Calidad de código
npm run lint         # Linter ESLint
npm run test         # Ejecutar tests
```

## 🔧 Configuración de Entorno

Variables principales en `.env`:

```env
# Servidor
NODE_ENV=development
PORT=4000

# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=calendario_gastos
DB_USER=root
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_jwt_secret_muy_secreto
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 📝 Logging

Los logs se almacenan en:
- `logs/error.log` - Solo errores
- `logs/combined.log` - Todos los logs
- `logs/exceptions.log` - Excepciones no manejadas

## 🚦 Health Check

El servidor incluye un endpoint de health check:

```
GET /health
```

Respuesta:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "version": "v1"
}
```

## 🔄 Sincronización con Frontend

El backend está diseñado para ser un reemplazo directo del `apiService.ts` mock del frontend. Todas las funciones tienen la misma firma y comportamiento esperado.

## 👤 Usuario Demo

Después de ejecutar las migraciones, se crea automáticamente un usuario demo:

- **Email:** admin@demo.com
- **Password:** demo123
- **Número Quiniela:** 12345

## 🐛 Solución de Problemas

### Error de conexión a MySQL
```bash
# Verificar que MySQL esté ejecutándose
sudo systemctl status mysql

# Verificar credenciales en .env
# Verificar que la base de datos exista
```

### Error de permisos
```bash
# Asegurar permisos en directorio de logs
mkdir logs
chmod 755 logs
```

### Problemas de CORS
```bash
# Verificar CORS_ORIGIN en .env
# Debe coincidir con la URL del frontend
```

## 📚 Documentación API

Con `ENABLE_SWAGGER=true` en `.env`, la documentación estará disponible en:
```
http://localhost:4000/api/v1/docs
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.