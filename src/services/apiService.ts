/**
 * Servicio API Real para producción
 * Conecta con el backend Node.js + Express + MySQL
 * Reemplaza el sistema mock anterior
 */

import { LoginCredentials, RegisterData, PasswordRecoveryData, User } from '../types';
import { config, apiUrl, getAuthToken, setAuthToken, clearAuthToken } from './config';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

class ApiService {
  private token: string | null;
  private currentUser: User | null = null;

  constructor() {
    this.token = getAuthToken();
  }

  // ==================== UTILIDADES HTTP ====================

  /**
   * Realizar petición HTTP con configuración estándar
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = apiUrl(endpoint);
    
    // Headers por defecto
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Agregar token de autenticación si existe
    if (this.token) {
      defaultHeaders.Authorization = `Bearer ${this.token}`;
    }

    // Combinar headers
    const headers = {
      ...defaultHeaders,
      ...(options.headers as Record<string, string>),
    };

    // Configuración de la petición
    const requestConfig: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Para cookies de sesión
    };

    try {
      // Realizar petición
      const response = await fetch(url, requestConfig);
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // Si no se puede parsear como JSON, usar el mensaje por defecto
        }
        
        // Si es 401, limpiar autenticación
        if (response.status === 401) {
          this.clearSession();
        }
        
        throw new Error(errorMessage);
      }

      // Parsear respuesta JSON
      const data = await response.json();
      return data;
    } catch (error) {
      // Manejar errores de red
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Error de conexión al servidor en ${url}. Verifica tu conexión a internet.`);
      }
      
      throw error;
    }
  }

  /**
   * Limpiar sesión local
   */
  private clearSession(): void {
    this.token = null;
    this.currentUser = null;
    clearAuthToken();
  }

  // ==================== AUTENTICACIÓN ====================

  /**
   * Iniciar sesión (conecta a POST /api/v1/auth/login)
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      const response: ApiResponse<{ user: User; token: string }> = await this.makeRequest('auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error en el login');
      }

      // Guardar token y usuario
      const { user, token } = response.data;
      this.token = token;
      this.currentUser = user;
      setAuthToken(token);

      // Guardar sesión recordada si se solicita
      if (credentials.rememberMe) {
        localStorage.setItem(config.auth.sessionKey, JSON.stringify({
          userId: user.id,
          nombre: user.nombre,
          email: user.email,
          timestamp: Date.now()
        }));
      }

      return { user, token };
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Registrar nuevo usuario (conecta a POST /api/v1/auth/register)
   */
  async register(registerData: RegisterData): Promise<{ user: User; token: string }> {
    try {
      const response: ApiResponse<{ user: User; token: string }> = await this.makeRequest('auth/register', {
        method: 'POST',
        body: JSON.stringify(registerData),
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error en el registro');
      }

      // Guardar token y usuario
      const { user, token } = response.data;
      this.token = token;
      this.currentUser = user;
      setAuthToken(token);

      return { user, token };
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  /**
   * Validar sesión existente (conecta a POST /api/v1/auth/validate-session)
   */
  async validateSession(): Promise<User | null> {
    if (!this.token) return null;

    try {
      const response: ApiResponse<User> = await this.makeRequest('auth/validate-session', {
        method: 'POST',
      });

      if (!response.success || !response.data) {
        this.clearSession();
        return null;
      }

      this.currentUser = response.data;
      return response.data;
    } catch (error) {
      console.error('Error validando sesión:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Recuperación de contraseña (conecta a POST /api/v1/auth/recover-password)
   */
  async sendPasswordRecovery(recoveryData: PasswordRecoveryData): Promise<boolean> {
    try {
      const response: ApiResponse<{ sent: boolean }> = await this.makeRequest('auth/recover-password', {
        method: 'POST',
        body: JSON.stringify(recoveryData),
      });

      return response.success;
    } catch (error) {
      console.error('Error en recuperación de contraseña:', error);
      throw error;
    }
  }

  /**
   * Cerrar sesión (conecta a POST /api/v1/auth/logout)
   */
  async logout(): Promise<void> {
    try {
      if (this.token) {
        await this.makeRequest('auth/logout', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Error durante logout:', error);
    } finally {
      this.clearSession();
    }
  }

  // ==================== GASTOS ====================

  /**
   * Registrar gasto (conecta a POST /api/v1/gastos)
   */
  async registrarGasto(gasto: {
    fecha: string;
    categoria: string;
    subcategoria?: string;
    monto: number;
    descripcion: string;
  }): Promise<any> {
    try {
      const response: ApiResponse = await this.makeRequest('gastos', {
        method: 'POST',
        body: JSON.stringify(gasto),
      });

      if (!response.success) {
        throw new Error(response.message || 'Error registrando gasto');
      }

      return response.data;
    } catch (error) {
      console.error('Error registrando gasto:', error);
      throw error;
    }
  }

  /**
   * Obtener gastos por fecha (conecta a GET /api/v1/gastos/:fecha)
   */
  async obtenerGastosPorFecha(fecha: string): Promise<any[]> {
    try {
      const response: ApiResponse<any[]> = await this.makeRequest(`gastos/${fecha}`, {
        method: 'GET',
      });

      if (!response.success) {
        throw new Error(response.message || 'Error obteniendo gastos');
      }

      return response.data || [];
    } catch (error) {
      console.error('Error obteniendo gastos:', error);
      throw error;
    }
  }

  /**
   * Eliminar gasto (conecta a DELETE /api/v1/gastos/:id)
   */
  async eliminarGasto(id: number, fecha: string): Promise<void> {
    try {
      const response: ApiResponse = await this.makeRequest(`gastos/${id}`, {
        method: 'DELETE',
      });

      if (!response.success) {
        throw new Error(response.message || 'Error eliminando gasto');
      }
    } catch (error) {
      console.error('Error eliminando gasto:', error);
      throw error;
    }
  }

  /**
   * Editar gasto (conecta a PUT /api/v1/gastos/:id)
   */
  async editarGasto(gastoEditado: any): Promise<any> {
    try {
      const response: ApiResponse = await this.makeRequest(`gastos/${gastoEditado.id}`, {
        method: 'PUT',
        body: JSON.stringify(gastoEditado),
      });

      if (!response.success) {
        throw new Error(response.message || 'Error editando gasto');
      }

      return response.data;
    } catch (error) {
      console.error('Error editando gasto:', error);
      throw error;
    }
  }

  // ==================== QUINIELAS ====================

  /**
   * Registrar transacción quiniela (conecta a POST /api/v1/quinielas/transacciones)
   */
  async registrarTransaccionQuiniela(transaccion: {
    fecha: string;
    juego: string;
    monto: number;
    tipo: 'ingreso' | 'egreso';
    descripcion?: string;
  }): Promise<any> {
    try {
      const response: ApiResponse = await this.makeRequest('quinielas/transacciones', {
        method: 'POST',
        body: JSON.stringify(transaccion),
      });

      if (!response.success) {
        throw new Error(response.message || 'Error registrando transacción');
      }

      return response.data;
    } catch (error) {
      console.error('Error registrando transacción quiniela:', error);
      throw error;
    }
  }

  /**
   * Obtener transacciones quiniela por fecha (conecta a GET /api/v1/quinielas/transacciones/:fecha)
   */
  async obtenerTransaccionesQuinielaPorFecha(fecha: string): Promise<any[]> {
    try {
      const response: ApiResponse<any[]> = await this.makeRequest(`quinielas/transacciones/${fecha}`, {
        method: 'GET',
      });

      if (!response.success) {
        throw new Error(response.message || 'Error obteniendo transacciones');
      }

      return response.data || [];
    } catch (error) {
      console.error('Error obteniendo transacciones quiniela:', error);
      throw error;
    }
  }

  /**
   * Eliminar transacción quiniela (conecta a DELETE /api/v1/quinielas/transacciones/:id)
   */
  async eliminarTransaccionQuiniela(id: number, fecha: string): Promise<void> {
    try {
      const response: ApiResponse = await this.makeRequest(`quinielas/transacciones/${id}`, {
        method: 'DELETE',
      });

      if (!response.success) {
        throw new Error(response.message || 'Error eliminando transacción');
      }
    } catch (error) {
      console.error('Error eliminando transacción quiniela:', error);
      throw error;
    }
  }

  /**
   * Editar transacción quiniela (conecta a PUT /api/v1/quinielas/transacciones/:id)
   */
  async editarTransaccionQuiniela(transaccionEditada: any): Promise<any> {
    try {
      const response: ApiResponse = await this.makeRequest(`quinielas/transacciones/${transaccionEditada.id}`, {
        method: 'PUT',
        body: JSON.stringify(transaccionEditada),
      });

      if (!response.success) {
        throw new Error(response.message || 'Error editando transacción');
      }

      return response.data;
    } catch (error) {
      console.error('Error editando transacción quiniela:', error);
      throw error;
    }
  }

  // ==================== SALDOS DIARIOS ====================

  /**
   * Obtener saldo anterior (conecta a GET /api/v1/saldos/saldo-anterior/:fecha)
   */
  async obtenerSaldoAnterior(fecha: string): Promise<number> {
    try {
      const response: ApiResponse<{ saldoAnterior: number }> = await this.makeRequest(`saldos/saldo-anterior/${fecha}`, {
        method: 'GET',
      });

      if (!response.success) {
        throw new Error(response.message || 'Error obteniendo saldo anterior');
      }

      return response.data?.saldoAnterior || 0;
    } catch (error) {
      console.error('Error obteniendo saldo anterior:', error);
      throw error;
    }
  }

  /**
   * Obtener días finalizados (conecta a GET /api/v1/saldos/dias-finalizados)
   */
  async obtenerDiasFinalizados(): Promise<string[]> {
    try {
      const response: ApiResponse<string[]> = await this.makeRequest('saldos/dias-finalizados', {
        method: 'GET',
      });

      if (!response.success) {
        throw new Error(response.message || 'Error obteniendo días finalizados');
      }

      return response.data || [];
    } catch (error) {
      console.error('Error obteniendo días finalizados:', error);
      throw error;
    }
  }

  /**
   * Finalizar día (conecta a POST /api/v1/saldos/finalizar-dia/:fecha)
   */
  async finalizarDia(fecha: string): Promise<boolean> {
    try {
      const response: ApiResponse<any> = await this.makeRequest(`saldos/finalizar-dia/${fecha}`, {
        method: 'POST',
      });

      if (!response.success) {
        throw new Error(response.message || 'Error finalizando día');
      }

      return true;
    } catch (error) {
      console.error('Error finalizando día:', error);
      throw error;
    }
  }

  /**
   * Guardar saldo final del día (conecta a POST /api/v1/saldos/guardar)
   */
  async guardarSaldoFinalDia(fecha: string, saldoFinal: number): Promise<void> {
    try {
      const response: ApiResponse = await this.makeRequest('saldos/guardar', {
        method: 'POST',
        body: JSON.stringify({ fecha, saldoFinal }),
      });

      if (!response.success) {
        throw new Error(response.message || 'Error guardando saldo final');
      }
    } catch (error) {
      console.error('Error guardando saldo final:', error);
      throw error;
    }
  }

  // ==================== DATOS GENERALES ====================

  /**
   * Obtener todos los datos del día (conecta a GET /api/v1/saldos/datos-dia/:fecha)
   */
  async obtenerDatosDia(fecha: string): Promise<{
    gastos: any[];
    transaccionesQuiniela: any[];
    saldoAnterior: number;
    estaFinalizado: boolean;
  }> {
    try {
      const response: ApiResponse<{
        gastos: any[];
        transaccionesQuiniela: any[];
        saldoAnterior: number;
        estaFinalizado: boolean;
      }> = await this.makeRequest(`saldos/datos-dia/${fecha}`, {
        method: 'GET',
      });

      if (!response.success) {
        throw new Error(response.message || 'Error obteniendo datos del día');
      }

      return response.data || {
        gastos: [],
        transaccionesQuiniela: [],
        saldoAnterior: 0,
        estaFinalizado: false,
      };
    } catch (error) {
      console.error('Error obteniendo datos del día:', error);
      throw error;
    }
  }
}

// Singleton instance
const apiService = new ApiService();
export default apiService;

/**
 * ApiService - Servicio para comunicación con el backend
 * 
 * Maneja toda la comunicación HTTP con el servidor backend:
 * - Autenticación JWT con Bearer tokens
 * - Manejo de errores HTTP y de red
 * - Configuración centralizada
 * - Gestión automática de tokens
 */