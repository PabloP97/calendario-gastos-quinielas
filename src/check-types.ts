// Archivo temporal para verificar tipos
// Este archivo será eliminado después de la verificación

// Importar todos los tipos principales
import { User, LoginCredentials, RegisterData, PasswordRecoveryData, Gasto, TransaccionQuiniela, DatosDia, SaldoDiario } from './types';

// Verificar que los tipos se puedan usar correctamente
const testUser: User = {
  id: 1,
  nombre: 'Test',
  email: 'test@test.com'
};

const testCredentials: LoginCredentials = {
  email: 'test@test.com',
  password: 'test123',
  rememberMe: false
};

const testGasto: Gasto = {
  id: 1,
  monto: 100,
  categoria: 'Test',
  descripcion: 'Test gasto',
  fecha: '2024-01-01'
};

const testTransaccion: TransaccionQuiniela = {
  id: 1,
  tipo: 'ingreso',
  categoria: 'Test',
  monto: 100,
  descripcion: 'Test',
  fecha: '2024-01-01',
  fuente: 'Test'
};

const testDatosDia: DatosDia = {
  gastos: [testGasto],
  transaccionesQuiniela: [testTransaccion],
  saldoAnterior: 0,
  estaFinalizado: false
};

console.log('Types check passed');