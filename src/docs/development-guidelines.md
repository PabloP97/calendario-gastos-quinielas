# 🎨 **Guías de Desarrollo**

Esta documentación establece los estándares, convenciones y mejores prácticas para el desarrollo del **Calendario de Gastos y Quinielas**.

## 📋 **Tabla de Contenidos**

- [⚛️ Frontend (React + TypeScript)](#️-frontend-react--typescript)
- [🔧 Backend (Node.js + TypeScript)](#-backend-nodejs--typescript)
- [🗄️ Base de Datos (MySQL)](#️-base-de-datos-mysql)
- [🎨 Estilos (Tailwind CSS)](#-estilos-tailwind-css)
- [🧪 Testing](#-testing)
- [📦 Dependencias](#-dependencias)
- [🚀 Performance](#-performance)
- [🔐 Seguridad](#-seguridad)

## ⚛️ **Frontend (React + TypeScript)**

### **Estructura de Componentes**

#### **Anatomía de un Componente**
```tsx
// components/ExampleComponent.tsx

import { useState, useEffect } from "react";
import { ComponentSpecificType } from "../types";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useCustomHook } from "../hooks/useCustomHook";
import { apiService } from "../services/apiService";

// 1. Definir props interface
interface ExampleComponentProps {
  // Required props
  title: string;
  data: ComponentSpecificType[];
  onSubmit: (data: ComponentSpecificType) => void;
  
  // Optional props con valores por defecto
  className?: string;
  isLoading?: boolean;
  maxItems?: number;
}

// 2. Componente principal con destructuring de props
export function ExampleComponent({
  title,
  data,
  onSubmit,
  className = "",
  isLoading = false,
  maxItems = 10
}: ExampleComponentProps) {
  // 3. State hooks (agrupar relacionados)
  const [localData, setLocalData] = useState<ComponentSpecificType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 4. Custom hooks
  const { customData, customLoading } = useCustomHook();
  
  // 5. Effect hooks (ordenar por dependencias)
  useEffect(() => {
    setLocalData(data.slice(0, maxItems));
  }, [data, maxItems]);
  
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  // 6. Handler functions (prefijo 'handle')
  const handleSubmit = async (item: ComponentSpecificType) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      await onSubmit(item);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // 7. Computed values
  const hasData = localData.length > 0;
  const showLoadingState = isLoading || customLoading || isProcessing;
  
  // 8. Early returns para estados especiales
  if (showLoadingState) {
    return (
      <Card className={className}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          <span className="ml-2">Cargando...</span>
        </div>
      </Card>
    );
  }
  
  // 9. Main render
  return (
    <Card className={`p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}
      
      {hasData ? (
        <div className="space-y-4">
          {localData.map((item) => (
            <div key={item.id} className="border rounded-lg p-4">
              {/* Item content */}
              <Button onClick={() => handleSubmit(item)}>
                Procesar
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay datos disponibles</p>
        </div>
      )}
    </Card>
  );
}
```

#### **Hooks Personalizados**
```tsx
// hooks/useApiData.ts

import { useState, useEffect } from "react";
import { apiService } from "../services/apiService";

interface UseApiDataOptions<T> {
  initialData?: T[];
  autoFetch?: boolean;
  onError?: (error: Error) => void;
}

export function useApiData<T>(
  endpoint: string,
  options: UseApiDataOptions<T> = {}
) {
  const { initialData = [], autoFetch = true, onError } = options;
  
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiService.get<T[]>(endpoint);
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [endpoint, autoFetch]);
  
  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    setData
  };
}
```

### **Convenciones de Nombres**

```tsx
// ✅ Componentes: PascalCase
export function CalendarView() {}
export function DayDetailsPanel() {}
export function QuinielaMenu() {}

// ✅ Hooks: camelCase con prefijo 'use'
export function useCalendarData() {}
export function useApiCall() {}
export function useLocalStorage() {}

// ✅ Variables y funciones: camelCase
const selectedDate = new Date();
const isDateValid = true;
const handleDateSelect = () => {};
const calculateTotalAmount = () => {};

// ✅ Constantes: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT = 5000;
const API_BASE_URL = "http://localhost:3001";

// ✅ Tipos e interfaces: PascalCase
interface UserData {
  id: number;
  name: string;
}

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

// ✅ Enums: PascalCase para el tipo, UPPER_SNAKE_CASE para valores
enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE"
}
```

### **Gestión de Estado**

#### **Estado Local vs Global**
```tsx
// ✅ Estado local para UI simple
function SimpleComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  
  return (
    // Component JSX
  );
}

// ✅ Context para estado compartido entre componentes relacionados
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Auth logic...
  
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

#### **Forms y Validación**
```tsx
// ✅ Usando react-hook-form para forms complejos
import { useForm } from "react-hook-form@7.55.0";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  monto: z.number().positive("El monto debe ser positivo"),
  categoria: z.string().min(1, "La categoría es requerida"),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido")
});

type FormData = z.infer<typeof formSchema>;

function ExpenseForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });
  
  const onSubmit = (data: FormData) => {
    // Handle form submission
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

## 🔧 **Backend (Node.js + TypeScript)**

### **Estructura de Archivos**

```
backend/src/
├── routes/              # Rutas de Express
│   ├── index.ts         # Router principal
│   ├── auth.ts          # Rutas de autenticación
│   ├── gastos.ts        # Rutas de gastos
│   └── quinielas.ts     # Rutas de quinielas
├── middleware/          # Middlewares de Express
│   ├── auth.ts          # Autenticación JWT
│   ├── validation.ts    # Validación de datos
│   ├── errorHandler.ts  # Manejo de errores
│   └── rateLimit.ts     # Rate limiting
├── services/            # Lógica de negocio
│   ├── authService.ts   # Lógica de autenticación
│   ├── gastosService.ts # Lógica de gastos
│   └── quinielasService.ts
├── controllers/         # Controladores (opcional)
├── models/             # Modelos de datos
│   ├── User.ts
│   ├── Gasto.ts
│   └── TransaccionQuiniela.ts
├── utils/              # Utilidades
│   ├── logger.ts       # Winston logger
│   ├── validation.ts   # Esquemas Joi
│   ├── database.ts     # Helpers de DB
│   └── crypto.ts       # Funciones de encriptación
├── config/             # Configuración
│   ├── database.ts     # Config de MySQL
│   ├── jwt.ts          # Config de JWT
│   └── environment.ts  # Variables de entorno
└── types/              # Tipos TypeScript
    ├── index.ts        # Tipos principales
    ├── api.ts          # Tipos de API
    └── database.ts     # Tipos de DB
```

### **Arquitectura de Endpoints**

```typescript
// routes/gastos.ts

import express from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { validateData, createGastoSchema } from '../utils/validation';
import { gastosService } from '../services/gastosService';
import { logger } from '../utils/logger';
import { CreateGastoRequest, Gasto } from '../types';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// GET /api/v1/gastos/:fecha - Obtener gastos por fecha
router.get('/:fecha', asyncHandler(async (req, res) => {
  const { fecha } = req.params;
  const userId = req.user!.userId;
  
  // Validar formato de fecha
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw createError('Formato de fecha inválido', 400);
  }
  
  try {
    const gastos = await gastosService.obtenerGastosPorFecha(userId, fecha);
    
    logger.info(`Gastos obtenidos para usuario ${userId} en fecha ${fecha}`, {
      userId,
      fecha,
      cantidad: gastos.length
    });
    
    res.json({
      success: true,
      message: 'Gastos obtenidos exitosamente',
      data: gastos
    });
  } catch (error) {
    logger.error('Error obteniendo gastos:', error);
    throw createError('Error interno del servidor', 500);
  }
}));

// POST /api/v1/gastos - Crear nuevo gasto
router.post('/', asyncHandler(async (req, res) => {
  const gastoData: CreateGastoRequest = validateData(createGastoSchema, req.body);
  const userId = req.user!.userId;
  
  // Validaciones de negocio
  if (new Date(gastoData.fecha) > new Date()) {
    throw createError('No se pueden crear gastos en fechas futuras', 400);
  }
  
  try {
    const nuevoGasto = await gastosService.crearGasto(userId, gastoData);
    
    logger.info(`Gasto creado para usuario ${userId}`, {
      userId,
      gastoId: nuevoGasto.id,
      monto: gastoData.monto,
      categoria: gastoData.categoria
    });
    
    res.status(201).json({
      success: true,
      message: 'Gasto creado exitosamente',
      data: nuevoGasto
    });
  } catch (error) {
    logger.error('Error creando gasto:', error);
    throw createError('Error interno del servidor', 500);
  }
}));

export default router;
```

### **Services (Lógica de Negocio)**

```typescript
// services/gastosService.ts

import { executeQuery, executeInsert } from '../config/database';
import { Gasto, CreateGastoRequest } from '../types';
import { logger } from '../utils/logger';

class GastosService {
  async obtenerGastosPorFecha(userId: number, fecha: string): Promise<Gasto[]> {
    const query = `
      SELECT id, monto, categoria, subcategoria, descripcion, fecha
      FROM gastos 
      WHERE usuario_id = ? AND fecha = ? AND activo = TRUE
      ORDER BY fecha_creacion DESC
    `;
    
    return executeQuery<Gasto>(query, [userId, fecha]);
  }
  
  async crearGasto(userId: number, gastoData: CreateGastoRequest): Promise<Gasto> {
    // Verificar que el día no esté finalizado
    const diaFinalizadoQuery = `
      SELECT id FROM dias_finalizados 
      WHERE usuario_id = ? AND fecha = ?
    `;
    
    const diasFinalizados = await executeQuery(diaFinalizadoQuery, [userId, gastoData.fecha]);
    
    if (diasFinalizados.length > 0) {
      throw new Error('No se pueden agregar gastos a un día finalizado');
    }
    
    // Insertar el gasto
    const insertQuery = `
      INSERT INTO gastos (usuario_id, monto, categoria, subcategoria, descripcion, fecha)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const gastoId = await executeInsert(insertQuery, [
      userId,
      gastoData.monto,
      gastoData.categoria,
      gastoData.subcategoria || null,
      gastoData.descripcion || null,
      gastoData.fecha
    ]);
    
    // Obtener el gasto recién creado
    const selectQuery = `
      SELECT id, monto, categoria, subcategoria, descripcion, fecha
      FROM gastos 
      WHERE id = ?
    `;
    
    const gastosCreados = await executeQuery<Gasto>(selectQuery, [gastoId]);
    return gastosCreados[0];
  }
  
  async actualizarGasto(userId: number, gastoId: number, gastoData: Partial<CreateGastoRequest>): Promise<void> {
    // Verificar que el gasto pertenece al usuario
    const verificarQuery = `
      SELECT id FROM gastos 
      WHERE id = ? AND usuario_id = ? AND activo = TRUE
    `;
    
    const gastos = await executeQuery(verificarQuery, [gastoId, userId]);
    
    if (gastos.length === 0) {
      throw new Error('Gasto no encontrado o no tienes permisos para editarlo');
    }
    
    // Construir query dinámico solo con campos proporcionados
    const campos: string[] = [];
    const valores: any[] = [];
    
    if (gastoData.monto !== undefined) {
      campos.push('monto = ?');
      valores.push(gastoData.monto);
    }
    
    if (gastoData.categoria !== undefined) {
      campos.push('categoria = ?');
      valores.push(gastoData.categoria);
    }
    
    if (gastoData.subcategoria !== undefined) {
      campos.push('subcategoria = ?');
      valores.push(gastoData.subcategoria);
    }
    
    if (gastoData.descripcion !== undefined) {
      campos.push('descripcion = ?');
      valores.push(gastoData.descripcion);
    }
    
    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }
    
    valores.push(gastoId, userId);
    
    const updateQuery = `
      UPDATE gastos 
      SET ${campos.join(', ')}, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = ? AND usuario_id = ?
    `;
    
    await executeQuery(updateQuery, valores);
  }
  
  async eliminarGasto(userId: number, gastoId: number): Promise<void> {
    const deleteQuery = `
      UPDATE gastos 
      SET activo = FALSE 
      WHERE id = ? AND usuario_id = ?
    `;
    
    const result = await executeQuery(deleteQuery, [gastoId, userId]);
    
    if (result.affectedRows === 0) {
      throw new Error('Gasto no encontrado o ya eliminado');
    }
  }
}

export const gastosService = new GastosService();
```

### **Validación con Joi**

```typescript
// utils/validation.ts

import Joi from 'joi';

// Esquemas reutilizables
const montoSchema = Joi.number()
  .positive()
  .max(999999.99)
  .precision(2)
  .required()
  .messages({
    'number.positive': 'El monto debe ser positivo',
    'number.max': 'El monto no puede exceder 999,999.99',
    'any.required': 'El monto es requerido'
  });

const fechaSchema = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .required()
  .messages({
    'string.pattern.base': 'La fecha debe tener formato YYYY-MM-DD',
    'any.required': 'La fecha es requerida'
  });

// Esquemas específicos
export const createGastoSchema = Joi.object({
  monto: montoSchema,
  categoria: Joi.string().min(1).max(50).required(),
  subcategoria: Joi.string().max(50).optional(),
  descripcion: Joi.string().max(255).optional(),
  fecha: fechaSchema
});

export const updateGastoSchema = Joi.object({
  monto: montoSchema.optional(),
  categoria: Joi.string().min(1).max(50).optional(),
  subcategoria: Joi.string().max(50).optional(),
  descripcion: Joi.string().max(255).optional()
});

// Función helper para validar
export function validateData<T>(schema: Joi.ObjectSchema, data: any): T {
  const { error, value } = schema.validate(data, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    const messages = error.details.map(detail => detail.message).join(', ');
    throw new Error(`Datos inválidos: ${messages}`);
  }
  
  return value;
}
```

## 🗄️ **Base de Datos (MySQL)**

### **Convenciones de Nombres**

```sql
-- ✅ Tablas: snake_case, plural
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre_quiniela VARCHAR(50) NOT NULL
);

CREATE TABLE transacciones_quiniela (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL
);

-- ✅ Columnas: snake_case
-- ✅ IDs: siempre 'id' para primary key, 'tabla_id' para foreign keys
-- ✅ Timestamps: 'fecha_creacion', 'fecha_actualizacion'
-- ✅ Boolean flags: 'activo', 'esta_verificado', 'es_administrador'

-- ✅ Índices: idx_tabla_columna
CREATE INDEX idx_gastos_usuario_fecha ON gastos(usuario_id, fecha);
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- ✅ Foreign Keys: fk_tabla_referencia
ALTER TABLE gastos 
ADD CONSTRAINT fk_gastos_usuario 
FOREIGN KEY (usuario_id) REFERENCES usuarios(id);

-- ✅ Unique constraints: uk_tabla_columna
ALTER TABLE usuarios 
ADD CONSTRAINT uk_usuarios_email UNIQUE (email);
```

### **Stored Procedures**

```sql
-- ✅ Naming: SP_VerbNoun
-- ✅ Parámetros: p_ prefix para inputs, OUT para outputs

DELIMITER //
CREATE PROCEDURE SP_CreateGasto(
    IN p_usuario_id INT,
    IN p_monto DECIMAL(10,2),
    IN p_categoria VARCHAR(50),
    IN p_subcategoria VARCHAR(50),
    IN p_descripcion TEXT,
    IN p_fecha DATE,
    OUT p_gasto_id INT,
    OUT p_success BOOLEAN,
    OUT p_error_message VARCHAR(255)
)
BEGIN
    DECLARE dia_finalizado INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_success = FALSE;
        SET p_error_message = 'Error interno del servidor';
        SET p_gasto_id = NULL;
    END;
    
    START TRANSACTION;
    
    -- Verificar que el día no esté finalizado
    SELECT COUNT(*) INTO dia_finalizado
    FROM dias_finalizados 
    WHERE usuario_id = p_usuario_id AND fecha = p_fecha;
    
    IF dia_finalizado > 0 THEN
        SET p_success = FALSE;
        SET p_error_message = 'No se pueden agregar gastos a un día finalizado';
        SET p_gasto_id = NULL;
        ROLLBACK;
    ELSE
        INSERT INTO gastos (
            usuario_id, monto, categoria, subcategoria, descripcion, fecha
        ) VALUES (
            p_usuario_id, p_monto, p_categoria, p_subcategoria, p_descripcion, p_fecha
        );
        
        SET p_gasto_id = LAST_INSERT_ID();
        SET p_success = TRUE;
        SET p_error_message = NULL;
        
        COMMIT;
    END IF;
END //
DELIMITER ;
```

## 🎨 **Estilos (Tailwind CSS)**

### **Organización de Clases**

```tsx
// ✅ Orden recomendado de clases:
// 1. Layout (flex, grid, position)
// 2. Sizing (w-, h-, max-, min-)
// 3. Spacing (p-, m-, gap-)
// 4. Typography (text-, font-, leading-)
// 5. Colors (bg-, text-, border-)
// 6. Borders (border-, rounded-)
// 7. Effects (shadow-, opacity-, transform-)
// 8. States (hover:, focus:, active:)

<div className="
  flex items-center justify-between
  w-full max-w-4xl
  px-6 py-4 gap-4
  text-lg font-medium
  bg-card text-foreground border-border
  border rounded-lg
  shadow-sm hover:shadow-md transition-shadow
  hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary
">
  Content
</div>

// ✅ Para clases muy largas, usar función cn()
import { cn } from "../lib/utils";

<div className={cn(
  // Layout
  "flex items-center justify-between",
  "w-full max-w-4xl",
  
  // Spacing
  "px-6 py-4 gap-4",
  
  // Typography
  "text-lg font-medium",
  
  // Colors & Borders
  "bg-card text-foreground border-border",
  "border rounded-lg shadow-sm",
  
  // Interactive States
  "hover:shadow-md hover:bg-accent transition-shadow",
  "focus:outline-none focus:ring-2 focus:ring-primary",
  
  // Conditional classes
  isActive && "ring-2 ring-primary bg-primary/5",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
```

### **Variables CSS Custom**

```css
/* styles/globals.css */

:root {
  /* ✅ Usar variables CSS para valores reutilizables */
  --font-size-base: 16px;
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 400ms ease;
  
  /* ✅ Spacing personalizado */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}

/* ✅ Utilities personalizadas */
@layer utilities {
  .transition-fast {
    transition-duration: var(--transition-fast);
  }
  
  .transition-normal {
    transition-duration: var(--transition-normal);
  }
  
  .transition-slow {
    transition-duration: var(--transition-slow);
  }
  
  .text-balance {
    text-wrap: balance;
  }
}

/* ✅ Componentes reutilizables */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary;
  }
  
  .input-field {
    @apply w-full px-3 py-2 bg-input-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary;
  }
}
```

### **Responsive Design**

```tsx
// ✅ Mobile-first approach
<div className="
  // Mobile (default)
  flex flex-col gap-2 p-4
  text-sm
  
  // Tablet (sm: 640px+)
  sm:flex-row sm:gap-4 sm:px-6
  sm:text-base
  
  // Desktop (lg: 1024px+)
  lg:gap-6 lg:px-8
  lg:text-lg
  
  // Large Desktop (xl: 1280px+)
  xl:max-w-6xl xl:mx-auto
">
  Content
</div>

// ✅ Breakpoints personalizados para casos específicos
<div className="
  grid grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
  xl:grid-cols-4
  gap-4
">
```

## 🧪 **Testing**

### **Estructura de Tests**

```
src/
├── __tests__/              # Tests globales
├── components/
│   ├── Component.tsx
│   ├── Component.test.tsx   # Test del componente
│   └── __tests__/          # Tests específicos del componente
├── hooks/
│   ├── useHook.ts
│   └── useHook.test.ts     # Test del hook
├── services/
│   ├── apiService.ts
│   └── apiService.test.ts  # Test del servicio
└── utils/
    ├── helpers.ts
    └── helpers.test.ts     # Test de utilidades
```

### **Testing de Componentes**

```tsx
// components/Button.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('is disabled when loading', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
  
  it('applies custom className', () => {
    render(<Button className="custom-class">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});
```

### **Testing de Hooks**

```tsx
// hooks/useCounter.test.ts

import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter Hook', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });
  
  it('should initialize with custom value', () => {
    const { result } = renderHook(() => useCounter(5));
    expect(result.current.count).toBe(5);
  });
  
  it('should increment count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
  
  it('should reset count', () => {
    const { result } = renderHook(() => useCounter(10));
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.count).toBe(0);
  });
});
```

### **Testing de API Services**

```typescript
// services/apiService.test.ts

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { apiService } from './apiService';

// Mock fetch globalmente
global.fetch = vi.fn();

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should fetch gastos successfully', async () => {
    const mockGastos = [
      { id: 1, monto: 100, categoria: 'Comida' },
      { id: 2, monto: 50, categoria: 'Transporte' }
    ];
    
    (fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: mockGastos
      })
    });
    
    const result = await apiService.obtenerGastos('2024-01-15');
    
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/gastos/2024-01-15',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': expect.stringContaining('Bearer ')
        })
      })
    );
    
    expect(result).toEqual(mockGastos);
  });
  
  it('should handle API errors', async () => {
    (fetch as vi.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        message: 'Internal server error'
      })
    });
    
    await expect(apiService.obtenerGastos('2024-01-15'))
      .rejects
      .toThrow('Internal server error');
  });
});
```

## 📦 **Dependencias**

### **Gestión de Dependencias**

```json
// package.json - Versiones específicas para dependencias críticas

{
  "dependencies": {
    // ✅ Versiones fijas para librerías críticas
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "typescript": "5.0.4",
    
    // ✅ Rangos seguros para librerías estables
    "tailwindcss": "^4.0.0",
    "lucide-react": "^0.300.0",
    
    // ✅ Versiones específicas para librerías con breaking changes frecuentes
    "react-hook-form": "7.55.0"
  },
  "devDependencies": {
    // ✅ Herramientas de desarrollo pueden usar rangos más amplios
    "@types/react": "^18.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "vitest": "^1.0.0"
  }
}
```

### **Imports Organizados**

```tsx
// ✅ Orden de imports:
// 1. React y librerías principales
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 2. Librerías de terceros
import { toast } from "sonner";
import { motion } from "motion/react";

// 3. Componentes UI (shadcn/ui)
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";

// 4. Componentes propios (ordenados alfabéticamente)
import { CalendarView } from "./components/CalendarView";
import { DayDetailsPanel } from "./components/DayDetailsPanel";

// 5. Hooks y utilidades
import { useAuth } from "./hooks/useAuth";
import { cn } from "./lib/utils";

// 6. Services y APIs
import apiService from "./services/apiService";

// 7. Tipos y interfaces
import { User, Transaction } from "./types";

// 8. Archivos de configuración y constantes
import { API_CONFIG } from "./config";
```

## 🚀 **Performance**

### **Optimización de Componentes**

```tsx
// ✅ Memoización de componentes pesados
import { memo, useMemo, useCallback } from "react";

interface ExpensiveComponentProps {
  data: Transaction[];
  onUpdate: (id: number, data: Partial<Transaction>) => void;
}

export const ExpensiveComponent = memo(function ExpensiveComponent({
  data,
  onUpdate
}: ExpensiveComponentProps) {
  // ✅ Memoizar cálculos pesados
  const totalAmount = useMemo(() => {
    return data.reduce((sum, transaction) => sum + transaction.monto, 0);
  }, [data]);
  
  // ✅ Memoizar callbacks que se pasan a children
  const handleUpdate = useCallback((id: number, updates: Partial<Transaction>) => {
    onUpdate(id, updates);
  }, [onUpdate]);
  
  // ✅ Memoizar objetos que se pasan como props
  const chartConfig = useMemo(() => ({
    type: 'line',
    data: data,
    options: { responsive: true }
  }), [data]);
  
  return (
    <div>
      <h3>Total: ${totalAmount}</h3>
      {data.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          onUpdate={handleUpdate}
        />
      ))}
      <Chart config={chartConfig} />
    </div>
  );
});

// ✅ Memoización con condiciones personalizadas
export const TransactionItem = memo(function TransactionItem({
  transaction,
  onUpdate
}: {
  transaction: Transaction;
  onUpdate: (id: number, data: Partial<Transaction>) => void;
}) {
  return (
    // Component implementation
  );
}, (prevProps, nextProps) => {
  // Solo re-renderizar si la transacción cambió
  return prevProps.transaction.id === nextProps.transaction.id &&
         prevProps.transaction.monto === nextProps.transaction.monto &&
         prevProps.transaction.categoria === nextProps.transaction.categoria;
});
```

### **Lazy Loading**

```tsx
// ✅ Lazy loading de rutas
import { lazy, Suspense } from "react";

const CalendarView = lazy(() => import("./components/CalendarView"));
const QuinielaMenu = lazy(() => import("./components/QuinielaMenu"));

function App() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Routes>
        <Route path="/" element={<CalendarView />} />
        <Route path="/quinielas" element={<QuinielaMenu />} />
      </Routes>
    </Suspense>
  );
}

// ✅ Lazy loading de componentes pesados
const HeavyChart = lazy(() => import("./components/HeavyChart"));

function Dashboard() {
  const [showChart, setShowChart] = useState(false);
  
  return (
    <div>
      <Button onClick={() => setShowChart(true)}>
        Mostrar Gráfico
      </Button>
      
      {showChart && (
        <Suspense fallback={<ChartSkeleton />}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  );
}
```

### **Optimización de Imágenes**

```tsx
// ✅ Componente de imagen optimizada
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false
}: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      // ✅ Responsive images
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}
```

## 🔐 **Seguridad**

### **Validación y Sanitización**

```typescript
// ✅ Validación en frontend Y backend
// Frontend - validación de UX
const validateAmount = (amount: string): string | null => {
  const numericAmount = parseFloat(amount);
  
  if (isNaN(numericAmount)) {
    return "El monto debe ser un número válido";
  }
  
  if (numericAmount <= 0) {
    return "El monto debe ser mayor a cero";
  }
  
  if (numericAmount > 999999.99) {
    return "El monto no puede exceder $999,999.99";
  }
  
  return null;
};

// Backend - validación de seguridad
import Joi from 'joi';
import DOMPurify from 'dompurify';

const secureStringSchema = Joi.string()
  .trim()
  .min(1)
  .max(255)
  .pattern(/^[a-zA-Z0-9\s\-_.]+$/) // Solo caracteres seguros
  .custom((value, helpers) => {
    // Sanitizar HTML
    const cleaned = DOMPurify.sanitize(value);
    if (cleaned !== value) {
      return helpers.error('string.unsafe');
    }
    return cleaned;
  });
```

### **Manejo Seguro de Tokens**

```typescript
// services/authService.ts

class AuthService {
  private tokenKey = 'auth_token';
  private refreshTokenKey = 'refresh_token';
  
  // ✅ Almacenar tokens de forma segura
  setTokens(token: string, refreshToken: string) {
    // Usar httpOnly cookies en producción
    if (process.env.NODE_ENV === 'production') {
      // Los tokens se manejan automáticamente por cookies httpOnly
      return;
    }
    
    // localStorage solo en desarrollo
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }
  
  // ✅ Obtener token con validación
  getToken(): string | null {
    try {
      const token = localStorage.getItem(this.tokenKey);
      
      if (!token) return null;
      
      // Verificar que no esté expirado
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      
      if (payload.exp < now) {
        this.clearTokens();
        return null;
      }
      
      return token;
    } catch {
      this.clearTokens();
      return null;
    }
  }
  
  // ✅ Limpiar tokens de forma segura
  clearTokens() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    
    // Limpiar cookies si existen
    document.cookie = `${this.tokenKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}
```

### **Protección CSRF**

```typescript
// middleware/csrf.ts

import csrf from 'csurf';

// ✅ Configurar protección CSRF
export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// ✅ Endpoint para obtener token CSRF
router.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

---

<div align="center">

**📖 Esta documentación evoluciona con el proyecto**

Mantén estas guías actualizadas conforme el proyecto crece y cambia.

**[⬆️ Volver arriba](#-guías-de-desarrollo)**

</div>