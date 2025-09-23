# 🚀 **GUÍA COMPLETA: Subir Proyecto a GitHub**

> Guía paso a paso para subir tu **Calendario de Gastos y Quinielas** a GitHub de manera profesional.

## 📋 **Tabla de Contenidos**

1. [🔧 Preparación del Proyecto](#-preparación-del-proyecto)
2. [📱 Crear Repositorio en GitHub](#-crear-repositorio-en-github)
3. [💻 Comandos Git para Subir](#-comandos-git-para-subir)
4. [⚙️ Configurar Variables de Entorno](#-configurar-variables-de-entorno)
5. [🔒 Verificar Seguridad](#-verificar-seguridad)
6. [📝 Documentación Final](#-documentación-final)
7. [🚀 Deploy (Opcional)](#-deploy-opcional)

---

## 🔧 **1. Preparación del Proyecto**

### **✅ Verificar que .gitignore esté correctamente configurado**

Ya tienes el archivo `.gitignore` creado que excluye:
- ❌ `node_modules/`
- ❌ `.env` files con credenciales
- ❌ Archivos de build (`dist/`, `build/`)
- ❌ Logs y archivos temporales
- ✅ Mantiene `.env.example` y documentación

### **✅ Verificar que no hay archivos sensibles**

```bash
# Buscar archivos .env con credenciales reales
find . -name "*.env" -not -name "*.example" -type f

# Si encuentras archivos .env reales, asegúrate de que estén en .gitignore
echo "backend/.env" >> .gitignore
```

### **✅ Limpiar archivos temporales**

```bash
# Limpiar node_modules si es necesario
rm -rf node_modules
rm -rf backend/node_modules

# Limpiar builds
rm -rf dist
rm -rf backend/dist

# Limpiar logs
rm -rf backend/logs
rm -f *.log
```

---

## 📱 **2. Crear Repositorio en GitHub**

### **Opción A: Desde GitHub Web (Recomendado)**

1. **Ve a GitHub.com** e inicia sesión
2. **Click en "New repository"** (botón verde)
3. **Configurar repositorio:**
   ```
   Repository name: calendario-gastos-quinielas
   Description: Sistema completo para gestión de gastos diarios y administración de quinielas
   ✅ Public (recomendado para portfolio)
   ❌ Add a README file (ya lo tienes)
   ❌ Add .gitignore (ya lo tienes)
   ✅ Choose a license: MIT License
   ```
4. **Click "Create repository"**

### **Opción B: Desde GitHub CLI**

```bash
# Instalar GitHub CLI si no lo tienes
# Windows: winget install GitHub.cli
# Mac: brew install gh
# Linux: sudo apt install gh

# Autenticarse
gh auth login

# Crear repositorio
gh repo create calendario-gastos-quinielas --public --description "Sistema completo para gestión de gastos diarios y administración de quinielas"
```

---

## 💻 **3. Comandos Git para Subir**

### **Paso 1: Inicializar Git (si no está inicializado)**

```bash
# En la raíz de tu proyecto
git init
git branch -M main
```

### **Paso 2: Configurar usuario Git (si es primera vez)**

```bash
# Configurar tu información
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"

# Verificar configuración
git config --list
```

### **Paso 3: Agregar archivos al repositorio**

```bash
# Ver estado actual
git status

# Agregar todos los archivos (excepto los de .gitignore)
git add .

# Verificar qué se agregó
git status
```

### **Paso 4: Primer commit**

```bash
# Commit inicial con mensaje descriptivo
git commit -m "🎉 Initial commit: Complete expense and lottery management system

✨ Features:
- React + TypeScript frontend with Tailwind CSS
- Node.js + Express + MySQL backend
- Complete authentication system (login, register, password recovery)
- Expense management with categories
- Lottery/quiniela management system
- Intelligent calendar with day states
- Balance calculation with daily carryover
- Professional UI with shadcn/ui components

🛠️ Tech Stack:
- Frontend: React 18, TypeScript, Vite, Tailwind v4, shadcn/ui
- Backend: Node.js, Express, MySQL, JWT, Joi validation
- Database: Complete schema with stored procedures ready
- Security: bcrypt, rate limiting, CORS, Helmet"
```

### **Paso 5: Conectar con repositorio remoto**

```bash
# Reemplaza TU-USUARIO con tu username de GitHub
git remote add origin https://github.com/TU-USUARIO/calendario-gastos-quinielas.git

# Verificar conexión
git remote -v
```

### **Paso 6: Subir a GitHub**

```bash
# Primera subida
git push -u origin main

# ¡Listo! Tu código ya está en GitHub 🎉
```

---

## ⚙️ **4. Configurar Variables de Entorno**

### **📝 Crear archivo de ejemplo para otros desarrolladores**

Ya tienes el archivo `backend/.env.example` creado. Asegúrate de que contenga:

```bash
# Verificar que el ejemplo esté completo
cat backend/.env.example
```

### **🔧 Documentar configuración en README**

El README ya incluye una sección completa de configuración. Los usuarios deberán:

1. **Copiar el archivo ejemplo:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Editar con sus credenciales:**
   ```bash
   # Editar .env con credenciales reales
   nano .env  # o con tu editor preferido
   ```

---

## 🔒 **5. Verificar Seguridad**

### **✅ Checklist de Seguridad**

```bash
# 1. Verificar que .env no esté en el repo
git log --name-only | grep -i "\.env$"
# No debería mostrar archivos .env

# 2. Verificar que credenciales no estén hardcodeadas
grep -r "password\|secret\|key" --include="*.ts" --include="*.tsx" --include="*.js" .
# Revisar resultados para credenciales hardcodeadas

# 3. Verificar .gitignore
cat .gitignore | grep -E "\.env$|node_modules|\.log"
# Debe mostrar estas exclusiones
```

### **🛡️ Secrets de GitHub (para CI/CD futuro)**

Si planeas usar GitHub Actions:

1. **Ve a tu repositorio en GitHub**
2. **Settings → Secrets and variables → Actions**
3. **Agregar secrets:**
   ```
   DB_HOST: tu_host_de_produccion
   DB_USER: tu_usuario_de_produccion
   DB_PASSWORD: tu_password_de_produccion
   JWT_SECRET: tu_jwt_secret_super_seguro
   ```

---

## 📝 **6. Documentación Final**

### **✅ Verificar que todo esté documentado**

Tu proyecto ya incluye:

- ✅ **README.md** completo con badges y instrucciones
- ✅ **LICENSE.md** con licencia MIT
- ✅ **CONTRIBUIR.md** con guías de contribución
- ✅ **database-schema.md** con esquema completo
- ✅ **backend/.env.example** con configuración

### **📸 Agregar screenshots (opcional pero recomendado)**

```bash
# Crear directorio para screenshots
mkdir -p docs/screenshots

# Tomar capturas de pantalla y guardarlas como:
# docs/screenshots/calendario.png
# docs/screenshots/gastos.png
# docs/screenshots/quinielas.png
# docs/screenshots/login.png
```

---

## 🚀 **7. Deploy (Opcional)**

### **🌐 Frontend (Vercel - Recomendado)**

1. **Ve a [vercel.com](https://vercel.com)**
2. **Conecta tu cuenta de GitHub**
3. **Import project** → Selecciona tu repositorio
4. **Configure:**
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   ```
5. **Deploy** 🚀

### **🔧 Backend (Railway - Recomendado)**

1. **Ve a [railway.app](https://railway.app)**
2. **Connect GitHub** → Selecciona tu repositorio
3. **Configure service:**
   ```
   Start Command: cd backend && node start-simple.js
   Root Directory: backend
   ```
4. **Agregar variables de entorno:**
   ```
   DB_HOST=<railway-mysql-host>
   DB_USER=<railway-mysql-user>
   DB_PASSWORD=<railway-mysql-password>
   DB_NAME=railway
   JWT_SECRET=<generar-nuevo-secret>
   NODE_ENV=production
   ```

### **🗄️ Base de Datos (PlanetScale o Railway)**

**Opción 1: Railway MySQL**
```bash
# Railway provee MySQL automáticamente
# Usar las credenciales que aparecen en el dashboard
```

**Opción 2: PlanetScale (Gratuito)**
```bash
# 1. Crear cuenta en planetscale.com
# 2. Crear database
# 3. Obtener connection string
# 4. Ejecutar migraciones
```

---

## 🎯 **Comandos Git Útiles para el Futuro**

### **📝 Hacer cambios y subirlos**

```bash
# Agregar cambios
git add .
git commit -m "feat: add new expense category functionality"
git push

# Crear nueva feature
git checkout -b feature/nueva-funcionalidad
git add .
git commit -m "feat: implement nueva funcionalidad"
git push -u origin feature/nueva-funcionalidad
```

### **🔄 Mantener fork actualizado**

```bash
# Agregar upstream si contribuyes a otro repo
git remote add upstream https://github.com/ORIGINAL-OWNER/REPO.git
git fetch upstream
git checkout main
git merge upstream/main
git push
```

### **📊 Ver estadísticas**

```bash
# Ver commits
git log --oneline

# Ver contribuciones
git shortlog -sn

# Ver cambios
git diff
```

---

## ✅ **Checklist Final**

Antes de considerar tu proyecto "listo":

### **📋 Código**
- ✅ Código limpio y comentado
- ✅ No hay credenciales hardcodeadas
- ✅ .gitignore configurado correctamente
- ✅ .env.example completo

### **📝 Documentación**
- ✅ README.md completo y actualizado
- ✅ LICENSE.md presente
- ✅ CONTRIBUIR.md con guías claras
- ✅ Documentación de API/base de datos

### **🔒 Seguridad**
- ✅ Variables de entorno protegidas
- ✅ Archivos sensibles en .gitignore
- ✅ No hay secrets en el código

### **🌐 GitHub**
- ✅ Repositorio creado y configurado
- ✅ Código subido exitosamente
- ✅ Issues y PR templates (opcional)
- ✅ GitHub Pages o Wiki (opcional)

---

## 🎉 **¡Felicitaciones!**

Tu proyecto **Calendario de Gastos y Quinielas** ya está en GitHub de manera profesional:

### **🔗 URLs importantes:**
- **Repositorio**: `https://github.com/TU-USUARIO/calendario-gastos-quinielas`
- **Clone URL**: `git clone https://github.com/TU-USUARIO/calendario-gastos-quinielas.git`
- **Issues**: `https://github.com/TU-USUARIO/calendario-gastos-quinielas/issues`

### **📢 Próximos pasos recomendados:**
1. 🌟 **Agregar el repo a tu portfolio**
2. 📱 **Compartir en redes sociales**
3. 🔄 **Configurar CI/CD con GitHub Actions**
4. 📝 **Crear Wiki con documentación extendida**
5. 🎯 **Agregar badges de build status**
6. 🤝 **Invitar colaboradores**

---

**¡Tu proyecto está listo para que el mundo lo vea!** 🌍✨

**Happy coding!** 🚀👨‍💻👩‍💻