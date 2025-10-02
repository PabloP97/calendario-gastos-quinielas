# 🤝 **Guía de Contribución**

¡Gracias por tu interés en contribuir al proyecto **Calendario de Gastos y Quinielas**! 🎉

Esta guía te ayudará a comenzar y asegurar que tus contribuciones sean valiosas y estén alineadas con los objetivos del proyecto.

## 📋 **Tabla de Contenidos**

- [🚀 Inicio Rápido](#-inicio-rápido)
- [🌿 Tipos de Contribución](#-tipos-de-contribución)
- [🔧 Configuración del Entorno](#-configuración-del-entorno)
- [📝 Estándares de Código](#-estándares-de-código)
- [🐛 Reportar Bugs](#-reportar-bugs)
- [💡 Sugerir Funcionalidades](#-sugerir-funcionalidades)
- [🔀 Pull Request Process](#-pull-request-process)
- [🏆 Reconocimientos](#-reconocimientos)

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

### **2. Configurar Entorno de Desarrollo**
```bash
# Instalar dependencias del frontend
npm install

# Configurar backend
cd backend
cp .env.example .env
# Editar .env con tus credenciales de MySQL
npm install

# Crear base de datos de desarrollo
mysql -u root -p
CREATE DATABASE calendario_gastos_dev;
exit

# Ejecutar migraciones
node reset-database.js

# Iniciar backend
npm run dev
```

```bash
# En otra terminal, iniciar frontend
cd ..
npm run dev
```

### **3. Crear Branch de Feature**
```bash
# Crear branch descriptivo
git checkout -b feature/nombre-descriptivo

# Ejemplos de nombres válidos:
git checkout -b feature/add-expense-categories
git checkout -b fix/calendar-display-bug
git checkout -b docs/update-installation-guide
git checkout -b refactor/auth-middleware
```

## 🌿 **Tipos de Contribución**

### **🐛 Bug Fixes**
- Corrección de errores de funcionamiento
- Mejoras de rendimiento
- Fixes de compatibilidad entre navegadores
- Correcciones de seguridad

**Ejemplos:**
- Calendario no muestra días correctamente
- Error al guardar transacciones
- Problemas de autenticación
- Vulnerabilidades de seguridad

### **✨ Nuevas Funcionalidades**
- Nuevas categorías de gastos
- Mejoras de UI/UX
- Nuevos tipos de quinielas
- Funcionalidades de exportación

**Ejemplos:**
- Exportar datos a Excel/PDF
- Dashboard con gráficos
- Notificaciones automáticas
- Tema oscuro/claro

### **📚 Documentación**
- Mejoras en documentación existente
- Documentación de APIs
- Guías de usuario
- Tutoriales y ejemplos

**Ejemplos:**
- Completar documentación de endpoints
- Crear guía de deployment
- Documentar componentes React
- Agregar ejemplos de uso

### **🧪 Testing**
- Pruebas unitarias para componentes
- Pruebas de integración de APIs
- Pruebas end-to-end
- Cobertura de código

**Ejemplos:**
- Tests para componentes React
- Tests para endpoints de API
- Tests de flujos de usuario
- Configuración de CI/CD

### **🎨 Mejoras de Diseño**
- Mejoras visuales y UX
- Responsive design
- Accesibilidad (a11y)
- Optimización de performance

**Ejemplos:**
- Mejorar diseño de calendario
- Optimizar carga de componentes
- Agregar indicadores de estado
- Mejorar contraste y legibilidad

## 🔧 **Configuración del Entorno**

### **Prerrequisitos**
```bash
# Verificar versiones mínimas
node --version    # >= 18.0.0
npm --version     # >= 8.0.0
mysql --version   # >= 8.0.0
git --version     # >= 2.30.0
```

### **Variables de Entorno de Desarrollo**
```bash
# backend/.env (desarrollo)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=calendario_gastos_dev
JWT_SECRET=desarrollo_secreto_super_largo_y_seguro
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Variables adicionales para desarrollo
LOG_LEVEL=debug
ENABLE_QUERY_LOGGING=true
```

### **Base de Datos de Desarrollo**
```sql
-- Crear DB separada para desarrollo
CREATE DATABASE calendario_gastos_dev;

-- Opcional: usuario específico para desarrollo
CREATE USER 'dev_user'@'localhost' IDENTIFIED BY 'dev_password';
GRANT ALL PRIVILEGES ON calendario_gastos_dev.* TO 'dev_user'@'localhost';
FLUSH PRIVILEGES;
```

### **Configuración de IDEs**

<details>
<summary>VS Code (Recomendado)</summary>

**Extensiones recomendadas:**
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "ms-vscode.vscode-json"
  ]
}
```

**Configuración workspace (.vscode/settings.json):**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

</details>

<details>
<summary>WebStorm/IntelliJ</summary>

**Configuraciones recomendadas:**
- Habilitar TypeScript service
- Configurar Prettier como formateador
- Instalar plugin de Tailwind CSS
- Habilitar ESLint

</details>

## 📝 **Estándares de Código**

### **Frontend (React + TypeScript)**

#### **Estructura de Componentes**
```tsx
// ✅ Estructura recomendada
import { useState, useEffect } from "react";
import { ComponentProps } from "../types";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface MyComponentProps {
  title: string;
  count: number;
  onAction: (id: string) => void;
  isLoading?: boolean;
}

export function MyComponent({ 
  title, 
  count, 
  onAction, 
  isLoading = false 
}: MyComponentProps) {
  // 1. State hooks
  const [localState, setLocalState] = useState<string>("");
  
  // 2. Effect hooks
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 3. Handler functions
  const handleClick = () => {
    onAction("example-id");
  };
  
  // 4. Early returns
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // 5. Main render
  return (
    <Card className="p-4">
      <h2>{title}</h2>
      <p>Count: {count}</p>
      <Button onClick={handleClick}>
        Action
      </Button>
    </Card>
  );
}
```

#### **Convenciones de Nombres**
```tsx
// ✅ Componentes: PascalCase
export function CalendarView() {}
export function DayDetailsPanel() {}

// ✅ Hooks: camelCase con prefijo 'use'
export function useCalendarData() {}
export function useApiCall() {}

// ✅ Variables y funciones: camelCase
const selectedDate = new Date();
const handleDateSelect = () => {};

// ✅ Constantes: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT = 5000;

// ✅ Tipos e interfaces: PascalCase
interface UserData {}
type ApiResponse<T> = {};
```

#### **Estilos con Tailwind CSS**
```tsx
// ✅ Bueno - Clases organizadas y legibles
<div className="
  flex items-center justify-between 
  p-4 
  bg-card border border-border rounded-lg 
  hover:bg-accent transition-colors
">

// ✅ Para clases muy largas, usar función cn()
import { cn } from "../lib/utils";

<div className={cn(
  "flex items-center justify-between",
  "p-4 bg-card border border-border rounded-lg",
  "hover:bg-accent transition-colors",
  isActive && "ring-2 ring-primary",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>

// ❌ Evitar - Clases desordenadas
<div className="p-4 flex border bg-card rounded-lg border-border items-center justify-between">
```

### **Backend (Node.js + TypeScript)**

#### **Estructura de Archivos**
```
backend/src/
├── routes/           # Rutas de la API
│   ├── auth.ts       # Autenticación
│   ├── gastos.ts     # Gestión de gastos
│   └── quinielas.ts  # Gestión de quinielas
├── middleware/       # Middlewares de Express
│   ├── auth.ts       # Middleware de autenticación
│   └── validation.ts # Middleware de validación
├── services/         # Lógica de negocio
│   ├── authService.ts
│   └── gastosService.ts
├── models/           # Modelos de datos
├── utils/            # Utilidades
│   ├── logger.ts
│   └── validation.ts
└── types/            # Tipos TypeScript
    └── index.ts
```

#### **Manejo de Errores**
```typescript
// ✅ Estructura recomendada para endpoints
import { asyncHandler } from '../middleware/errorHandler';

router.get('/endpoint', asyncHandler(async (req, res) => {
  try {
    const result = await someAsyncOperation();
    
    res.json({
      success: true,
      message: 'Operation successful',
      data: result
    });
  } catch (error) {
    logger.error('Error in endpoint:', error);
    throw createError('Custom error message', 400);
  }
}));
```

#### **Validación de Datos**
```typescript
// ✅ Usar Joi para validación
import Joi from 'joi';

const createGastoSchema = Joi.object({
  monto: Joi.number().positive().max(999999.99).required(),
  categoria: Joi.string().min(1).max(50).required(),
  subcategoria: Joi.string().max(50).optional(),
  descripcion: Joi.string().max(255).optional(),
  fecha: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required()
});

// Usar en endpoints
const validatedData = validateData(createGastoSchema, req.body);
```

### **Git y Control de Versiones**

#### **Commit Messages**
```bash
# ✅ Formato: tipo(scope): descripción breve
feat(calendar): add month navigation functionality
fix(api): resolve 404 error in quinielas endpoint
docs(readme): update installation instructions
style(ui): improve button hover states
test(auth): add login validation tests
refactor(components): extract calendar logic to custom hook

# Tipos permitidos:
# feat: nueva funcionalidad
# fix: corrección de bug
# docs: cambios en documentación
# style: cambios de formato/estilo (no afectan lógica)
# refactor: refactoring de código (no cambia funcionalidad)
# test: agregar o modificar tests
# chore: tareas de mantenimiento, configuración, etc.

# ✅ Para cambios grandes, agregar descripción
feat(quinielas): add configurable schedules

- Add modal for configuring quinela schedules
- Store custom schedules in database
- Update status calculation to use custom schedules
- Add validation for schedule conflicts

Closes #123
```

#### **Branch Naming**
```bash
# ✅ Formato: tipo/descripción-breve-en-kebab-case
feature/expense-categories
feature/export-to-excel
fix/calendar-display-bug
fix/auth-token-expiration
docs/update-readme
docs/api-documentation
hotfix/critical-security-issue
refactor/auth-middleware
test/add-component-tests
```

## 🐛 **Reportar Bugs**

### **Antes de Reportar**
1. ✅ **Buscar issues existentes** - Evita duplicados
2. ✅ **Verificar versión** - Asegúrate de usar la última versión
3. ✅ **Reproducir el bug** - Confirma que es consistente
4. ✅ **Probar en modo incógnito** - Elimina extensiones como causa
5. ✅ **Revisar logs** - Backend y navegador

### **Template de Bug Report**
```markdown
---
name: Bug Report
about: Reportar un error o comportamiento inesperado
title: '[BUG] Descripción breve del problema'
labels: bug
assignees: ''
---

## 🐛 **Descripción del Bug**
[Descripción clara y concisa del problema]

## 🔄 **Pasos para Reproducir**
1. Ir a [página específica]
2. Hacer click en [elemento específico]
3. Llenar formulario con [datos específicos]
4. Ver error

## ✅ **Comportamiento Esperado**
[Descripción de lo que debería pasar]

## ❌ **Comportamiento Actual**
[Descripción de lo que está pasando realmente]

## 📸 **Screenshots**
[Si aplica, agregar capturas de pantalla]

## 🖥️ **Entorno**
- **OS:** [Windows 11 / macOS Ventura / Ubuntu 22.04]
- **Browser:** [Chrome 119 / Firefox 118 / Safari 16]
- **Node.js:** [18.17.0]
- **MySQL:** [8.0.33]
- **Frontend URL:** [http://localhost:5173]
- **Backend URL:** [http://localhost:3001]

## 📋 **Logs Relevantes**

### Frontend (Console)
\`\`\`
[Pegar errores de la consola del navegador]
\`\`\`

### Backend (Terminal)
\`\`\`
[Pegar errores del backend]
\`\`\`

## 🔍 **Información Adicional**
- ¿Ocurre solo en días específicos? [Sí/No]
- ¿Funciona con usuario demo? [Sí/No]
- ¿Es problema intermitente? [Sí/No]
```

## 💡 **Sugerir Funcionalidades**

### **Template de Feature Request**
```markdown
---
name: Feature Request
about: Sugerir una nueva funcionalidad o mejora
title: '[FEATURE] Descripción breve de la funcionalidad'
labels: enhancement
assignees: ''
---

## 💡 **Descripción de la Funcionalidad**
[Descripción clara y detallada de la funcionalidad propuesta]

## 🎯 **Problema que Resuelve**
[Qué problema o necesidad específica resuelve esta funcionalidad]

## 🛠️ **Solución Propuesta**
[Descripción detallada de cómo implementarías la funcionalidad]

### Mockups/Wireframes
[Si tienes diseños visuales, inclúyelos aquí]

### Casos de Uso
1. **Como** usuario administrador **quiero** [funcionalidad] **para** [beneficio]
2. **Como** usuario final **quiero** [funcionalidad] **para** [beneficio]

## 🔄 **Alternativas Consideradas**
[Otras alternativas que consideraste y por qué las descartaste]

## 📋 **Información Adicional**
- **Prioridad:** [Alta/Media/Baja]
- **Complejidad estimada:** [Baja/Media/Alta]
- **¿Rompe compatibilidad?** [Sí/No]

## ✅ **Definición de Terminado**
- [ ] Funcionalidad implementada y probada
- [ ] Tests unitarios agregados
- [ ] Documentación actualizada
- [ ] No rompe funcionalidad existente
```

## 🔀 **Pull Request Process**

### **Pre-PR Checklist**
```bash
# ✅ 1. Actualizar con main
git checkout main
git pull upstream main
git checkout feature/mi-branch
git merge main

# ✅ 2. Tests pasando
npm run test
cd backend && npm run test

# ✅ 3. Linting limpio
npm run lint
npm run format

# ✅ 4. Build exitoso
npm run build
cd backend && npm run build

# ✅ 5. Tipos TypeScript correctos
npm run type-check
cd backend && npm run type-check

# ✅ 6. Verificar funcionalidad localmente
# - Probar cambios en navegador
# - Verificar que no rompe funcionalidad existente
# - Probar edge cases
```

### **Template de Pull Request**
```markdown
## 📋 **Resumen**
[Descripción clara y concisa de los cambios realizados]

### Cambios Principales
- [Cambio 1]
- [Cambio 2]
- [Cambio 3]

## 🔄 **Tipo de Cambio**
- [ ] 🐛 Bug fix (non-breaking change que arregla un issue)
- [ ] ✨ Nueva funcionalidad (non-breaking change que agrega funcionalidad)
- [ ] 💔 Breaking change (fix o feature que causaría que funcionalidad existente no funcione como se espera)
- [ ] 📚 Documentación (cambios solo en documentación)
- [ ] 🧪 Tests (agregar tests faltantes o corregir tests existentes)
- [ ] 🔧 Chore (cambios de configuración, dependencias, etc.)

## 🔗 **Issues Relacionados**
Closes #[número]
Fixes #[número]
Related to #[número]

## 🧪 **Testing**
- [ ] Tests unitarios agregados/actualizados
- [ ] Tests de integración agregados/actualizados
- [ ] Probado manualmente en navegador
- [ ] Probado con diferentes usuarios
- [ ] Probado edge cases

### Escenarios de Prueba
1. **Escenario 1:** [Descripción del test]
   - Resultado esperado: [resultado]
   - ✅ Funciona correctamente

2. **Escenario 2:** [Descripción del test]
   - Resultado esperado: [resultado]
   - ✅ Funciona correctamente

## 📸 **Screenshots/Videos** (si aplica)

### Antes
[Screenshot del estado anterior]

### Después
[Screenshot del estado nuevo]

## 🔍 **Información Técnica**

### Archivos Modificados
- `components/ComponenteName.tsx` - [Descripción de cambios]
- `backend/src/routes/endpoint.ts` - [Descripción de cambios]

### Dependencias
- [ ] Se agregaron nuevas dependencias
- [ ] Se actualizaron dependencias existentes
- [ ] No hay cambios en dependencias

### Base de Datos
- [ ] Se requieren migraciones
- [ ] No hay cambios en BD
- [ ] Solo cambios compatibles

## 📋 **Checklist del Developer**
- [ ] Mi código sigue las convenciones del proyecto
- [ ] He realizado una auto-revisión de mi código
- [ ] He añadido comentarios explicativos donde es necesario
- [ ] He actualizado la documentación correspondiente
- [ ] Mis cambios no generan warnings nuevos
- [ ] He añadido tests que prueban mi funcionalidad
- [ ] Tests nuevos y existentes pasan localmente
- [ ] He verificado que mis cambios funcionan en diferentes navegadores

## 📋 **Checklist del Reviewer**
- [ ] El código es legible y mantenible
- [ ] Los tests cubren los casos principales
- [ ] La funcionalidad funciona como se describe
- [ ] No hay vulnerabilidades de seguridad obvias
- [ ] La documentación es clara y precisa
```

### **Review Process**
1. **👥 Code Review**: Al menos 1 aprobación requerida
2. **🧪 CI/CD**: Todos los tests automáticos deben pasar
3. **📝 Documentation**: Documentación actualizada si es necesario
4. **🔧 Manual Testing**: Reviewer debe probar los cambios
5. **🔀 Merge Strategy**: Squash and merge preferido para features

## 🎯 **Prioridades Actuales del Proyecto**

### **🔥 Alta Prioridad**
- [ ] **Performance**: Optimización de carga del calendario
- [ ] **Testing**: Cobertura de tests automatizados
- [ ] **Documentation**: Documentación completa de APIs
- [ ] **Security**: Auditoría de seguridad y vulnerabilidades
- [ ] **Accessibility**: Cumplimiento WCAG 2.1

### **⭐ Media Prioridad**
- [ ] **Features**: Nuevas categorías de gastos personalizables
- [ ] **Export**: Funcionalidad de exportar a Excel/PDF
- [ ] **Dashboard**: Gráficos y reportes visuales
- [ ] **Mobile**: Mejoras de responsive design
- [ ] **Notifications**: Sistema de notificaciones

### **💡 Baja Prioridad**
- [ ] **Theming**: Sistema de temas personalizables
- [ ] **PWA**: Convertir a Progressive Web App
- [ ] **Mobile App**: Aplicación móvil nativa
- [ ] **Integrations**: APIs de terceros (bancos, etc.)
- [ ] **Advanced Analytics**: Machine learning para predicciones

## 🏆 **Reconocimientos**

Los contribuidores serán reconocidos de las siguientes maneras:

### **📝 Documentación**
- **README.md**: Sección de colaboradores principales
- **CONTRIBUTORS.md**: Lista completa de contribuidores
- **Changelog**: Menciones en releases

### **🎉 Releases**
- **Release Notes**: Créditos por contribuciones importantes
- **GitHub Releases**: Menciones específicas
- **Social Media**: Reconocimiento en redes sociales del proyecto

### **💬 Comunidad**
- **Discord/Slack**: Anuncios de contribuciones importantes
- **Newsletter**: Destacar contribuidores del mes
- **Blog Posts**: Artículos sobre contribuciones significativas

### **🏅 Badges y Niveles**
- **First Contribution**: Badge para primera contribución
- **Regular Contributor**: 5+ PRs merged
- **Core Contributor**: 20+ PRs merged + reviews
- **Maintainer**: Acceso de escritura al repositorio

## 📞 **Contacto y Comunidad**

### **Canales de Comunicación**
- **💬 GitHub Discussions**: Para preguntas generales y discusiones
- **🐛 GitHub Issues**: Para bugs y feature requests específicos
- **📧 Email**: [maintainer@ejemplo.com] para temas privados
- **💬 Discord**: [Link al servidor] para chat en tiempo real

### **Horarios de Respuesta**
- **Issues**: 1-3 días laborales
- **Pull Requests**: 2-5 días laborales
- **Preguntas Generales**: 1-7 días

### **Meetups y Eventos**
- **Monthly Contributors Call**: Primer viernes de cada mes
- **Code Review Sessions**: Sábados según demanda
- **Release Planning**: Antes de cada release mayor

---

<div align="center">

**¡Gracias por contribuir al proyecto! 🙏✨**

Tu ayuda hace que este proyecto sea mejor para todos. 🚀

**[⬆️ Volver arriba](#-guía-de-contribución)**

</div>