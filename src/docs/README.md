# 📅 **Calendario de Gastos y Quinielas**

> Una aplicación completa para gestionar gastos diarios y transacciones de quinielas, construida con **React + TypeScript** en el frontend y **Node.js + Express + MySQL** en el backend.

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?logo=mysql)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

## 🎯 **Características Principales**

### 🔐 **Sistema de Autenticación Administrativo**
- ✅ Login con **nombre de usuario** asignado por administrador
- ✅ **Panel de administración** para crear usuarios
- ✅ Acceso secreto al panel administrativo
- ✅ Validación JWT y sesiones seguras
- ✅ Sin registro público - solo administradores crean usuarios

### 📊 **Gestión de Gastos (Caja Interna)**
- 💰 **Categorías predefinidas**: Sueldo, Servicios (Luz, Agua, Internet, Alquiler), Otros
- 🔄 **CRUD completo**: Crear, leer, actualizar y eliminar gastos
- ✨ **Validación de datos** en tiempo real
- 🔍 **Filtrado por categorías** y fechas

### 🎲 **Sistema de Quinielas Completo**
- 🎯 **Múltiples juegos**: Quiniela Nacional, Quini 6, Brinco, Loto, Poceada, Telekino, Loto Plus, Quiniela Express
- 🎭 **Modal de cierre unificado**: Todos los juegos usan el mismo sistema de entrada de datos
- 📊 **Categorías específicas**: Diferentes tipos de ingresos/egresos según el juego
- ⏰ **Horarios configurables**: Cada modalidad tiene horarios personalizables

### 📅 **Sistema de Calendario Inteligente**
- 🗓️ **Navegación intuitiva** entre meses y años
- ⭐ **Día actual destacado** visualmente
- 🔒 **Sistema de permisos**: Solo editar día actual, visualizar días anteriores
- ✅ **Días finalizados** marcados con indicador visual
- 🚫 **Domingos deshabilitados** para transacciones
- 🔮 **Días futuros bloqueados** para edición

### 💰 **Sistema de Saldos con Arrastre**
- 🔄 **Saldo inicial** calculado automáticamente
- ➡️ **Arrastre de saldo**: El día actual hereda el saldo del día anterior
- 🧮 **Cálculo automático** hasta fin de mes
- 🔐 **Finalización de días** para evitar ediciones posteriores

## 🚀 **Inicio Rápido**

### **Prerrequisitos**
```bash
# Verificar versiones
node --version  # v18+
mysql --version # 8.0+
npm --version   # 8+
```

### **1. Clonar Repositorio**
```bash
git clone https://github.com/tu-usuario/calendario-gastos-quinielas.git
cd calendario-gastos-quinielas
```

### **2. Configurar Backend**
```bash
cd backend
cp .env.example .env
# Editar .env con tus credenciales de MySQL
npm install
node start-simple.js
```

### **3. Configurar Frontend**
```bash
# En la raíz del proyecto
npm install
npm run dev
```

### **4. Acceder a la Aplicación**
- 🌐 **Frontend**: `http://localhost:3000`
- 🔌 **Backend API**: `http://localhost:4000`
- 💚 **Health Check**: `http://localhost:4000/health`

## 📚 **Documentación**

| Documento | Descripción |
|-----------|-------------|
| 📋 [**Instalación**](installation.md) | Guía completa de instalación paso a paso |
| 🏗️ [**Base de Datos**](database-schema.md) | Esquema completo y stored procedures |
| 🤝 [**Contribución**](contributing.md) | Guía para contribuir al proyecto |
| 🎨 [**Desarrollo**](development-guidelines.md) | Estándares y convenciones de código |
| 📄 [**Licencia**](../LICENSE.md) | Términos de uso MIT |

## 🛠️ **Tecnologías Utilizadas**

<table>
<tr>
<td>

**Frontend**
- ⚛️ React 18 + TypeScript
- ⚡ Vite para bundling
- 🎨 Tailwind CSS v4
- 🧩 shadcn/ui componentes
- 🎭 Lucide React iconos
- 🔔 Sonner notificaciones

</td>
<td>

**Backend**
- 🟢 Node.js + Express.js
- 📘 TypeScript
- 🗄️ MySQL2 database
- 🔐 JWT autenticación
- ✅ Joi validación
- 📝 Winston logging

</td>
</tr>
</table>

## 📂 **Estructura del Proyecto**

```
📁 calendario-gastos-quinielas/
├── 📁 backend/                 # 🔌 API Node.js + Express
│   ├── 📁 src/
│   │   ├── 📁 routes/         # 🛣️ Rutas de la API
│   │   ├── 📁 middleware/     # 🔧 Middlewares
│   │   ├── 📁 config/         # ⚙️ Configuración DB
│   │   └── 📁 utils/          # 🔧 Utilidades
│   ├── 📄 .env.example        # 🔧 Configuración ejemplo
│   └── 📄 start-simple.js     # 🚀 Inicio rápido
├── 📁 components/              # ⚛️ Componentes React
│   ├── 📁 ui/                 # 🧩 shadcn/ui componentes
│   ├── 📄 CalendarView.tsx    # 📅 Vista del calendario
│   ├── 📄 DayDetailsPanel.tsx # 📊 Panel de detalles
│   └── 📄 QuinielaMenu.tsx    # 🎲 Menú quinielas
├── 📁 docs/                   # 📖 Documentación
├── 📁 services/               # 🔌 Servicios de API
├── 📁 types/                  # 📘 Tipos TypeScript
├── 📄 App.tsx                 # 🏠 Componente principal
└── 📄 package.json            # 📦 Dependencias
```

## 🔧 **Scripts Disponibles**

<table>
<tr>
<td>

**Frontend**
```bash
npm run dev      # 🔥 Desarrollo
npm run build    # 📦 Producción
npm run preview  # 👀 Preview
npm run lint     # 🔍 Linter
```

</td>
<td>

**Backend**
```bash
node start-simple.js  # 🚀 Inicio rápido
npm run dev          # 🔄 Auto-reload
npm run build        # 📦 Compilar TS
npm run start        # 🚀 Producción
```

</td>
</tr>
</table>

## 🔒 **Configuración de Seguridad**

### **Variables de Entorno (.env)**
```bash
# Base de datos
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=calendario_gastos

# Seguridad
JWT_SECRET=tu_jwt_secret_super_seguro
PORT=4000

# CORS
CORS_ORIGIN=http://localhost:3000
```

### **Características de Seguridad**
- 🔐 **Encriptación bcrypt** para contraseñas
- 🎫 **JWT tokens** con expiración
- 🚦 **Rate limiting** por IP
- ✅ **Validación robusta** en backend
- 🛡️ **Headers de seguridad** con Helmet
- 🌐 **CORS** configurado correctamente

## 🧪 **Testing**

```bash
# Verificar backend
cd backend && node test-backend-real.js

# Verificar tipos TypeScript
npm run check-types

# Verificar conectividad API
curl http://localhost:4000/health

# Test de quinielas (después de corrección)
node test-quinielas-fix.js
```

## 🐛 **Solución de Problemas**

<details>
<summary>❓ Errores comunes y soluciones</summary>

### **🔗 Error de conexión a MySQL**
```bash
Error: ER_ACCESS_DENIED_ERROR
```
**Solución:** Verificar credenciales en `.env`

### **🔌 Puerto 4000 ocupado**
```bash
Error: EADDRINUSE :::4000
```
**Solución:** Cambiar `PORT=4001` en `.env`

### **🌐 Errores de CORS**
```bash
Access to fetch blocked by CORS policy
```
**Solución:** Verificar `CORS_ORIGIN` en backend

### **🎫 Token JWT inválido**
```bash
Error: jwt malformed
```
**Solución:** Limpiar localStorage y hacer login nuevamente

</details>

## 🚀 **Deployment**

### **Frontend (Vercel/Netlify)**
```bash
npm run build
# Subir carpeta dist/
```

### **Backend (Railway/Heroku)**
```bash
# Configurar variables de entorno en la plataforma
# Subir código del directorio backend/
```

### **Base de Datos**
- 🌐 **Cloud**: PlanetScale, Railway, AWS RDS
- 🏠 **Self-hosted**: MySQL 8.0+

## 🤝 **Contribución**

1. 🍴 **Fork** del proyecto
2. 🌿 Crear rama feature: `git checkout -b feature/AmazingFeature`
3. 💾 **Commit** cambios: `git commit -m 'Add AmazingFeature'`
4. 📤 **Push** a la rama: `git push origin feature/AmazingFeature`
5. 🔀 Abrir **Pull Request**

### **Guías de Desarrollo**
- 📝 Seguir [**Guías de Desarrollo**](development-guidelines.md)
- 🎨 Usar **Prettier** para formato
- ✅ Agregar **tests** para nuevas funciones
- 📖 Documentar cambios importantes

## 📄 **Licencia**

Este proyecto está bajo la **Licencia MIT** - ver [LICENSE.md](../LICENSE.md) para detalles.

## 🙏 **Agradecimientos**

- 🎨 **shadcn/ui** por los componentes
- 🎭 **Lucide** por los iconos
- 🎨 **Tailwind CSS** por los estilos
- ⚛️ **React Team** por el framework
- 🔗 **Vite** por el bundling ultrarrápido

## 📊 **Estadísticas del Proyecto**

![GitHub repo size](https://img.shields.io/github/repo-size/tu-usuario/calendario-gastos-quinielas)
![GitHub last commit](https://img.shields.io/github/last-commit/tu-usuario/calendario-gastos-quinielas)
![GitHub issues](https://img.shields.io/github/issues/tu-usuario/calendario-gastos-quinielas)
![GitHub stars](https://img.shields.io/github/stars/tu-usuario/calendario-gastos-quinielas)

---

<div align="center">

**🎉 ¡Disfruta gestionando tus finanzas de manera inteligente!** 📊💰🎲

Made with ❤️ for efficient personal finance management

[⬆️ Volver arriba](#-calendario-de-gastos-y-quinielas)

</div>