// Interfaces compartidas entre frontend y backend
export interface User {
  id: number;
  username: string;
  nombre: string;
  email: string;
  numeroQuiniela?: string;
  ultimo_acceso?: string;
  fecha_creacion?: string;
}

export interface LoginCredentials {
  username: string; // Cambiado de email a username (puede ser email o número de quiniela)
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  numeroQuiniela: string;
  nombreQuiniela: string;
  password: string;
  confirmPassword: string;
  preguntaSeguridad: string;
  respuestaSeguridad: string;
}

export interface PasswordRecoveryData {
  email: string;
}

export interface Gasto {
  id: number;
  monto: number;
  categoria: string;
  subcategoria?: string;
  descripcion: string;
  fecha: string;
}

export interface TransaccionQuiniela {
  id: number;
  tipo: 'ingreso' | 'egreso';
  categoria: string;
  monto: number;
  descripcion: string;
  fecha: string;
  fuente: string;
}

export interface SaldoDiario {
  fecha: string;
  saldoInicialDia: number;
  totalIngresos: number;
  totalEgresos: number;
  saldoFinalDia: number;
  estaFinalizado: boolean;
}

export interface DatosDia {
  gastos: Gasto[];
  transaccionesQuiniela: TransaccionQuiniela[];
  saldoAnterior: number;
  estaFinalizado: boolean;
}

// Interfaces específicas del backend
export interface DbUser {
  id: number;
  username: string; // Nombre de usuario para login
  nombre_quiniela: string; // Nombre de la quiniela (el nombre principal del usuario)
  email: string;
  numero_quiniela: string;
  password_hash: string;
  ultimo_acceso: Date;
  fecha_creacion: Date;
  activo: boolean;
}

export interface Session {
  id: number;
  usuario_id: number;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  fecha_creacion: Date;
  fecha_expiracion: Date;
  activo: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

export interface JwtPayload {
  userId: number;
  username: string;
  email: string;
  nombre: string;
  iat?: number;
  exp?: number;
}

// Request interfaces para endpoints específicos
export interface CreateGastoRequest {
  fecha: string;
  categoria: string;
  subcategoria?: string;
  monto: number;
  descripcion: string;
}

export interface CreateTransaccionQuinielaRequest {
  fecha: string;
  juego: string;
  monto: number;
  tipo: 'ingreso' | 'egreso';
  descripcion?: string;
}

export interface UpdateGastoRequest {
  id: number;
  fecha: string;
  categoria: string;
  subcategoria?: string;
  monto: number;
  descripcion: string;
}

export interface UpdateTransaccionQuinielaRequest {
  id: number;
  fecha: string;
  juego: string;
  monto: number;
  tipo: 'ingreso' | 'egreso';
  descripcion?: string;
}