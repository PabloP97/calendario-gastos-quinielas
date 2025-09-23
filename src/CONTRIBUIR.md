# 🤝 **Guía de Contribución**

¡Gracias por tu interés en contribuir al proyecto **Calendario de Gastos y Quinielas**! 🎉

## 📋 **Tabla de Contenidos**

- [🚀 Inicio Rápido](#-inicio-rápido)
- [🌿 Tipos de Contribución](#-tipos-de-contribución)
- [🔧 Configuración del Entorno](#-configuración-del-entorno)
- [📝 Estándares de Código](#-estándares-de-código)
- [🐛 Reportar Bugs](#-reportar-bugs)
- [💡 Sugerir Funcionalidades](#-sugerir-funcionalidades)
- [🔀 Pull Request Process](#-pull-request-process)

## 🚀 **Inicio Rápido**

### **1. Fork del Proyecto**
```bash
# 1. Haz fork desde GitHub UI
# 2. Clona tu fork
git clone https://github.com/TU-USUARIO/calendario-gastos-quinielas.git
cd calendario-gastos-quinielas

# 3. Configura el remoto upstream
git remote add upstream https://github.com/USUARIO-ORIGINAL/calendario-gastos-quinielas.git
```

### **2. Configurar Entorno**
```bash
# Instalar dependencias del frontend
npm install

# Configurar backend
cd backend
cp .env.example .env
npm install
# Editar .env con tus credenciales
node start-simple.js

# En otra terminal, frontend
cd ..
npm run dev
```

### **3. Crear Branch de Feature**
```bash
# Crear branch descriptivo
git checkout -b feature/nombre-descriptivo

# Ejemplos:
git checkout -b feature/add-expense-categories
git checkout -b fix/calendar-display-bug
git checkout -b docs/update-readme
```

## 🌿 **Tipos de Contribución**

### **🐛 Bug Fixes**
- Corrección de errores de funcionamiento
- Mejoras de rendimiento
- Fixes de compatibilidad

### **✨ Nuevas Funcionalidades**
- Nuevas categorías de gastos
- Mejoras de UI/UX
- Nuevos tipos de quinielas

### **📚 Documentación**
- Mejoras en README.md
- Documentación de APIs
- Guías de usuario

### **🧪 Testing**
- Pruebas unitarias
- Pruebas de integración
- Pruebas end-to-end

### **🎨 Mejoras de Diseño**
- Mejoras visuales
- Responsive design
- Accesibilidad

## 🔧 **Configuración del Entorno**

### **Prerrequisitos**
```bash
# Verificar versiones
node --version    # v18+
npm --version     # v8+
mysql --version   # 8.0+
git --version     # 2.30+
```

### **Variables de Entorno**
```bash
# backend/.env
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=calendario_gastos_dev
JWT_SECRET=desarrollo_secreto_super_largo
PORT=4000
NODE_ENV=development
```

### **Base de Datos de Desarrollo**
```sql
-- Crear DB separada para desarrollo
CREATE DATABASE calendario_gastos_dev;
```

## 📝 **Estándares de Código**

### **Frontend (React + TypeScript)**

#### **Estructura de Componentes**
```tsx
// ✅ Bueno
interface ComponentProps {
  prop1: string;
  prop2: number;
  onAction: () => void;
}

export function Component({ prop1, prop2, onAction }: ComponentProps) {
  // Lógica del componente
  return (
    <div className="space-y-4">
      {/* JSX */}
    </div>
  );
}
```

#### **Convenciones de Nombres**
```tsx
// ✅ Componentes: PascalCase
export function CalendarView() {}

// ✅ Hooks: camelCase con 'use'
export function useCalendarData() {}

// ✅ Variables: camelCase
const selectedDate = new Date();

// ✅ Constantes: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
```

#### **Estilos con Tailwind**
```tsx
// ✅ Bueno - Clases organizadas
<div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">

// ❌ Evitar - Clases desordenadas
<div className="p-4 flex border bg-card rounded-lg border-border items-center justify-between">
```

### **Backend (Node.js + TypeScript)**

#### **Estructura de Archivos**
```
backend/src/
├── routes/           # Rutas de la API
├── middleware/       # Middlewares de Express
├── controllers/      # Lógica de controladores
├── services/         # Lógica de negocio
├── models/           # Modelos de datos
├── utils/            # Utilidades
└── types/            # Tipos TypeScript
```

#### **Manejo de Errores**
```typescript
// ✅ Bueno
try {
  const result = await someAsyncOperation();
  res.json({ success: true, data: result });
} catch (error) {
  logger.error('Error in operation:', error);
  res.status(500).json({ success: false, message: 'Internal server error' });
}
```

#### **Validación de Datos**
```typescript
// ✅ Usar Joi para validación
const schema = Joi.object({
  monto: Joi.number().positive().required(),
  categoria: Joi.string().min(1).max(50).required(),
  fecha: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required()
});
```

### **Git Conventions**

#### **Commit Messages**
```bash
# ✅ Formato: tipo(scope): descripción
feat(calendar): add month navigation
fix(api): resolve 404 error in quinielas endpoint
docs(readme): update installation instructions
style(ui): improve button hover states
test(auth): add login validation tests

# Tipos:
# feat: nueva funcionalidad
# fix: corrección de bug
# docs: documentación
# style: cambios de estilo/formato
# refactor: refactoring de código
# test: agregar/modificar tests
# chore: tareas de mantenimiento
```

#### **Branch Naming**
```bash
# ✅ Formato: tipo/descripción-corta
feature/expense-categories
fix/calendar-display-bug
docs/update-readme
hotfix/critical-auth-issue
```

## 🐛 **Reportar Bugs**

### **Antes de Reportar**
1. ✅ Busca en issues existentes
2. ✅ Verifica que sea la última versión
3. ✅ Prueba en modo incógnito/privado
4. ✅ Revisa logs del backend

### **Información Requerida**
```markdown
## 🐛 Descripción del Bug
[Descripción clara y concisa]

## 🔄 Pasos para Reproducir
1. Paso 1
2. Paso 2
3. Paso 3

## ✅ Comportamiento Esperado
[Lo que debería pasar]

## ❌ Comportamiento Actual
[Lo que está pasando]

## 🖥️ Entorno
- OS: [Windows 11/macOS/Ubuntu]
- Browser: [Chrome 119/Firefox 118]
- Node: [18.17.0]
- MySQL: [8.0.33]

## 📋 Logs
[Logs relevantes del navegador/backend]
```

## 💡 **Sugerir Funcionalidades**

### **Template de Feature Request**
```markdown
## 💡 Descripción de la Funcionalidad
[Descripción clara de la funcionalidad]

## 🎯 Problema que Resuelve
[Qué problema o necesidad resuelve]

## 🛠️ Solución Propuesta
[Cómo implementarías la funcionalidad]

## 🔄 Alternativas Consideradas
[Otras alternativas que consideraste]

## 📋 Información Adicional
[Mockups, referencias, etc.]
```

## 🔀 **Pull Request Process**

### **Checklist Pre-PR**
```bash
# ✅ Código actualizado con main
git checkout main
git pull upstream main
git checkout feature/mi-branch
git merge main

# ✅ Tests pasando
npm run test
cd backend && npm run test

# ✅ Linting limpio
npm run lint
npm run format

# ✅ Build exitoso
npm run build
cd backend && npm run build

# ✅ Tipos TypeScript correctos
npm run type-check
```

### **Descripción del PR**
```markdown
## 📋 Resumen
[Descripción clara de los cambios]

## 🔄 Tipo de Cambio
- [ ] 🐛 Bug fix
- [ ] ✨ Nueva funcionalidad
- [ ] 💔 Breaking change
- [ ] 📚 Documentación
- [ ] 🧪 Tests

## 🧪 Testing
- [ ] Tests unitarios añadidos/actualizados
- [ ] Tests de integración añadidos/actualizados
- [ ] Probado manualmente

## 📸 Screenshots (si aplica)
[Capturas de pantalla de cambios visuales]

## 📋 Checklist
- [ ] Mi código sigue las convenciones del proyecto
- [ ] He realizado una auto-revisión de mi código
- [ ] He añadido comentarios explicativos donde es necesario
- [ ] He actualizado la documentación correspondiente
- [ ] Mis cambios no generan warnings nuevos
- [ ] He añadido tests que prueban mi funcionalidad
- [ ] Tests nuevos y existentes pasan localmente
```

### **Review Process**
1. 👥 **Code Review**: Al menos 1 aprobación requerida
2. 🧪 **CI/CD**: Todos los tests deben pasar
3. 📝 **Documentation**: Documentación actualizada si es necesario
4. 🔀 **Merge**: Squash and merge preferido

## 🎯 **Prioridades Actuales**

### **🔥 Alta Prioridad**
- [ ] Mejoras de rendimiento en el calendario
- [ ] Tests automatizados
- [ ] Documentación de APIs

### **⭐ Media Prioridad**
- [ ] Nuevas categorías de gastos
- [ ] Exportar datos a Excel
- [ ] Dashboard con gráficos

### **💡 Baja Prioridad**
- [ ] Tema personalizable
- [ ] Notificaciones push
- [ ] App móvil

## 🏆 **Reconocimientos**

Los contribuidores serán reconocidos en:
- 📝 **README.md** - Sección de colaboradores
- 🎉 **Releases** - Changelog con menciones
- 💬 **Discord/Slack** - Anuncios de contribuciones importantes

## 📞 **Contacto**

- 💬 **Discussions**: Para preguntas generales
- 🐛 **Issues**: Para bugs y feature requests
- 📧 **Email**: [tu-email@ejemplo.com] para temas privados

---

**¡Gracias por contribuir al proyecto!** 🙏✨

Tu ayuda hace que este proyecto sea mejor para todos. 🚀