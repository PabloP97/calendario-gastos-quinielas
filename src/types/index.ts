import { LucideIcon } from "lucide-react";

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

export interface QuinielaGame {
  id: number;
  name: string;
  icon: LucideIcon;
  description: string;
}

export interface QuinielaModalidad {
  id: number;
  name: string;
  icon: LucideIcon;
  description: string;
  horario: string;
  horarioInicio: string;
  horarioFin: string;
}

export type ConfirmationActionType = 'add-gasto' | 'add-ingreso' | 'add-egreso' | 'edit' | 'delete';

export interface ConfirmationActionData {
  monto?: number;
  categoria?: string;
  descripcion?: string;
  fuente?: string;
  tipo?: 'ingreso' | 'egreso';
}

// Interfaces de Autenticación
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
  username: string; // Nombre de usuario asignado por el administrador
  password: string;
}

// 🗑️ ELIMINADO: RegisterData - Ya no se permite registro público de usuarios
// Los usuarios solo pueden ser creados por administradores desde el panel admin



export interface Session {
  id: number;
  usuario_id: number;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  fecha_creacion: string;
  fecha_expiracion: string;
  activo: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  isLoading: boolean;
}

// Interfaces para saldos diarios
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