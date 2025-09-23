# 🚀 Instrucciones Rápidas - Calendario de Gastos y Quinielas

## ⚡ Inicio Rápido

### **1. Instalar Dependencias (Solo la primera vez)**

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### **2. Iniciar la Aplicación**

**IMPORTANTE:** Necesitas **DOS terminales** abiertas:

#### **Terminal 1 - Backend (Elige una opción):**

**🔹 Opción A: Backend Simple (JavaScript)**
```bash
# Más fácil y confiable
cd backend
npm run simple
```

**🔹 Opción B: Backend TypeScript Simple**
```bash
# TypeScript sin dependencias complejas
cd backend
npm run simple-ts
```

**🔹 Opción C: Backend Real (TypeScript + MySQL)**
```bash
# Solo si tienes MySQL configurado
cd backend
./setup-real-backend.sh  # Linux/Mac
# o
setup-real-backend.bat   # Windows
```

**🔹 Opción D: Scripts Automáticos**
```bash
# Desde la raíz del proyecto
./start-backend.sh      # Linux/Mac
start-backend.bat       # Windows
```

#### **Terminal 2 - Frontend:**
```bash
# Desde el directorio raíz
npm run dev
```

### **3. Acceder a la Aplicación**

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:4000
- **Credenciales Demo:** 
  - Email: `admin@demo.com`
  - Contraseña: `demo123`

---

## 🔧 Solución de Problemas

### **❌ Error: "Cannot find module" (TypeScript)**

**Causa:** Problemas de configuración ES modules con TypeScript

**Solución:** Usar el backend simple:
```bash
cd backend
npm run simple     # JavaScript simple (MÁS CONFIABLE)
# o
npm run simple-ts  # TypeScript simple
```

### **❌ Error: "Backend no disponible"**

1. **Verifica que el backend esté ejecutándose:**
   ```bash
   curl http://localhost:4000/api/v1/health
   ```

2. **Si el backend no responde:**
   ```bash
   cd backend
   npm run simple
   ```

3. **Si aparecen errores de dependencias:**
   ```bash
   cd backend
   rm -rf node_modules
   npm install
   npm run simple
   ```

### **❌ Error: "Error de conexión"**

- **Frontend y Backend en puertos diferentes:**
  - Frontend debe estar en puerto **3000**
  - Backend debe estar en puerto **4000**

### **❌ Puertos Ocupados**

```bash
# Encontrar procesos usando los puertos
lsof -i :3000
lsof -i :4000

# Terminar procesos si es necesario
kill -9 [PID]
```

---

## 🎯 Opciones de Backend Disponibles

| Opción | Comando | Descripción | Recomendado |
|--------|---------|-------------|-------------|
| **Simple JS** | `npm run simple` | JavaScript puro, sin compilación | ✅ **EMPEZAR AQUÍ** |
| **Simple TS** | `npm run simple-ts` | TypeScript simple, ES modules | ⚡ Si quieres TypeScript |
| **Real Dev** | `npm run dev:ts` | TypeScript + MySQL (desarrollo) | 🔧 Si tienes MySQL |
| **Real Prod** | `npm run compile` | TypeScript compilado + MySQL | 🚀 Para producción |

---

## 📊 Estado de la Aplicación

### **✅ Funcionalidades Implementadas:**

- ✅ **Autenticación:** Login/Registro/Recuperación
- ✅ **Calendario:** Selección de días con reglas de negocio
- ✅ **Gastos:** CRUD completo con categorías y subcategorías
- ✅ **Quinielas:** Sistema de transacciones por juego
- ✅ **Saldos:** Arrastre automático entre días
- ✅ **Finalización:** Bloqueo de días finalizados
- ✅ **Backend Mock:** API funcional en memoria

### **🔄 Funcionalidades del Demo:**

- **Datos en memoria:** Se pierden al reiniciar el backend
- **Autenticación simplificada:** Tokens mock
- **CRUD completo:** Crear, leer, actualizar, eliminar
- **Validaciones:** Frontend y backend
- **Estados visuales:** Días editables vs solo lectura

---

## 🎯 Flujo de Usuario

### **1. Login**
- Usar credenciales demo o registrar nuevo usuario
- El sistema recordará la sesión

### **2. Navegación del Calendario**
- **Día actual:** Editable (borde verde)
- **Días pasados:** Solo lectura (borde gris)
- **Domingos:** Deshabilitados
- **Días futuros:** Deshabilitados

### **3. Gestión Diaria**
- **Pestaña Resumen:** Vista general del día
- **Pestaña Caja Interna:** Gestión de gastos
- **Pestaña Quiniela:** Gestión de juegos

### **4. Finalización**
- Botón "Finalizar Día" en el resumen (solo día actual)
- Una vez finalizado, el día se bloquea
- El saldo se arrastra al día siguiente

---

## 📁 Estructura de Archivos Backend

```
backend/
├── start-simple.js             # ✅ Backend simple (JavaScript)
├── server-simple-ts.ts         # ⚡ Backend simple (TypeScript)
├── src/server.ts              # 🔧 Backend completo (TypeScript + MySQL)
├── setup-real-backend.sh      # 🚀 Script configuración automática
├── .env                       # ⚙️ Variables de entorno
└── package.json              # 📦 Dependencias y scripts
```

---

## 🚨 Notas Importantes

- **Demo Mode:** Los datos se almacenan en memoria del backend
- **Reiniciar Backend:** Los datos se pierden al reiniciar
- **Producción:** Para uso real, conectar a base de datos MySQL
- **Puertos:** No cambiar los puertos sin actualizar configuración
- **ES Modules:** El TypeScript usa ES modules (`.js` en imports)

---

## 💡 Recomendación de Desarrollo

### **🎯 Para Desarrollo Rápido:**
```bash
cd backend && npm run simple
```

### **🎯 Para TypeScript sin complicaciones:**
```bash
cd backend && npm run simple-ts
```

### **🎯 Para Producción con MySQL:**
```bash
cd backend && ./setup-real-backend.sh
```

---

¿Problemas? Revisa la consola del navegador y la terminal del backend para más detalles.

**🆘 Si nada funciona:** Usa `npm run simple` - es la opción más confiable.