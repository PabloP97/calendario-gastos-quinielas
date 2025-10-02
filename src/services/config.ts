/**
 * Configuración centralizada de la aplicación
 * Archivo para manejar todas las configuraciones del frontend
 */

// ============================================
// CONFIGURACIÓN DE LA API
// ============================================

// URL base del backend según el entorno
const getApiBaseUrl = (): string => {
  // En desarrollo, usar el backend local
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:4000/api/v1';
  }

  // En producción, usar la URL del backend desplegado
  return process.env.VITE_API_BASE_URL || 'https://calendario-gastos-quinielas.onrender.com/api/v1';
};

// ============================================
// CONFIGURACIÓN GENERAL
// ============================================

export const config = {
  // API Configuration
  api: {
    baseUrl: getApiBaseUrl(),
    timeout: 10000, // 10 segundos
    retries: 3,
  },

  // Configuración de autenticación
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    tokenExpiration: 24 * 60 * 60 * 1000, // 24 horas en millisegundos
  },

  // Configuración de la aplicación
  app: {
    name: 'Calendario de Gastos y Quinielas',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },

  // Configuración de notificaciones
  notifications: {
    defaultDuration: 3000,
    errorDuration: 4000,
    successDuration: 2000,
  },

  // Configuración de loading
  loading: {
    minDuration: 1000, // Duración mínima del loading (1 segundo)
    transactionDuration: 1000, // Loading para transacciones
  },

  // Configuración de localStorage
  storage: {
    prefix: 'calendario_gastos_',
    keys: {
      user: 'user_data',
      settings: 'app_settings',
      cache: 'api_cache',
    },
  },

  // Configuración de fechas
  dates: {
    format: 'DD/MM/YYYY',
    apiFormat: 'YYYY-MM-DD',
    locale: 'es-ES',
  },

  // Configuración de categorías de gastos
  gastos: {
    categorias: {
      SUELDO: 'Sueldo',
      SERVICIOS: 'Servicios',
      OTROS: 'Otros',
    },
    subCategorias: {
      LUZ: 'Luz',
      AGUA: 'Agua',
      INTERNET: 'Internet',
      ALQUILER: 'Alquiler',
    },
  },

  // Configuración de quinielas
  quinielas: {
    tipos: {
      NACIONAL: 'Quiniela Nacional',
      PROVINCIA: 'Quiniela de Provincia',
      CIUDAD: 'Quiniela de Ciudad',
      TOMBOLA: 'Tómbola',
    },
    modalidades: {
      DIRECTA: 'Directa',
      CENTENA: 'Centena',
      DECENA: 'Decena',
      CABEZA: 'Cabeza',
      PLENO: 'Pleno',
    },
  },
} as const;

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

/**
 * Verifica si estamos en modo desarrollo
 */
export const isDevelopment = (): boolean => {
  return config.app.environment === 'development';
};

/**
 * Verifica si estamos en modo producción
 */
export const isProduction = (): boolean => {
  return config.app.environment === 'production';
};

/**
 * Obtiene una configuración con fallback
 */
export const getConfig = (path: string, fallback: any): any => {
  try {
    const keys = path.split('.');
    let value: any = config;

    for (const key of keys) {
      value = value?.[key];
    }

    return value !== undefined ? value : fallback;
  } catch {
    return fallback;
  }
};

/**
 * Genera URLs de API con la base configurada
 */
export const apiUrl = (endpoint: string): string => {
  const baseUrl = config.api.baseUrl.replace(/\/$/, ''); // Quitar slash final
  const cleanEndpoint = endpoint.replace(/^\//, ''); // Quitar slash inicial
  return `${baseUrl}/${cleanEndpoint}`;
};

/**
 * Obtiene el token de autenticación
 */
export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(config.auth.tokenKey);
  } catch {
    return null;
  }
};

/**
 * Guarda el token de autenticación
 */
export const setAuthToken = (token: string): void => {
  try {
    localStorage.setItem(config.auth.tokenKey, token);
  } catch (error) {
    console.error('Error guardando token:', error);
  }
};

/**
 * Limpia el token de autenticación
 */
export const clearAuthToken = (): void => {
  try {
    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem(config.auth.refreshTokenKey);
  } catch (error) {
    console.error('Error limpiando tokens:', error);
  }
};

/**
 * Formatea una fecha según la configuración
 */
export const formatDate = (date: Date | string, format?: string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const targetFormat = format || config.dates.format;

    if (targetFormat === 'YYYY-MM-DD') {
      return dateObj.toISOString().split('T')[0];
    }

    // Formato DD/MM/YYYY por defecto
    return dateObj.toLocaleDateString(config.dates.locale);
  } catch {
    return 'Fecha inválida';
  }
};

// Exportar la configuración como default también
export default config;
