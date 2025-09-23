import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { executeQuery, executeInsert } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { validateData, loginSchema, registerSchema, passwordRecoverySchema } from '../utils/validation';
import { logger } from '../utils/logger';
import { 
  User, 
  LoginCredentials, 
  RegisterData, 
  PasswordRecoveryData,
  JwtPayload,
  DbUser 
} from '../types';

const router = express.Router();

// POST /api/v1/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const credentials: LoginCredentials = validateData(loginSchema, req.body);
  
  // Buscar usuario por email o número de quiniela
  const userQuery = `
    SELECT id, nombre, email, numero_quiniela, password_hash, activo
    FROM usuarios 
    WHERE (email = ? OR numero_quiniela = ?) AND activo = 1
  `;
  
  const users = await executeQuery<DbUser>(userQuery, [credentials.email, credentials.email]);
  
  if (users.length === 0) {
    throw createError('Credenciales inválidas', 401);
  }
  
  const user = users[0];
  
  // Verificar contraseña
  const passwordValid = await bcrypt.compare(credentials.password, user.password_hash);
  if (!passwordValid) {
    throw createError('Credenciales inválidas', 401);
  }
  
  // Generar tokens JWT
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    nombre: user.nombre
  };
  
  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  } as jwt.SignOptions);
  
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  } as jwt.SignOptions);
  
  // Crear sesión en la base de datos
  const sessionId = uuidv4();
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + 24); // 24 horas
  
  const sessionQuery = `
    INSERT INTO sesiones (
      usuario_id, session_token, remember_token, ip_address, 
      user_agent, fecha_expiracion, activo
    ) VALUES (?, ?, ?, ?, ?, ?, 1)
  `;
  
  await executeInsert(sessionQuery, [
    user.id,
    token,
    credentials.rememberMe ? refreshToken : null,
    req.ip,
    req.get('User-Agent'),
    expirationDate
  ]);
  
  // Actualizar último acceso
  await executeQuery('UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?', [user.id]);
  
  // Preparar respuesta del usuario (sin password)
  const userResponse: User = {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    numeroQuiniela: user.numero_quiniela,
    ultimo_acceso: new Date().toISOString()
  };
  
  logger.info(`Usuario ${user.email} ha iniciado sesión`, { userId: user.id });
  
  res.json({
    success: true,
    message: 'Login exitoso',
    data: {
      user: userResponse,
      token
    }
  });
}));

// POST /api/v1/auth/register
router.post('/register', asyncHandler(async (req, res) => {
  const registerData: RegisterData = validateData(registerSchema, req.body);
  
  // Verificar si ya existe usuario con ese email o número de quiniela
  const existingUserQuery = `
    SELECT id FROM usuarios 
    WHERE email = ? OR numero_quiniela = ?
  `;
  
  const email = `${registerData.numeroQuiniela}@quiniela.com`;
  const existingUsers = await executeQuery(existingUserQuery, [email, registerData.numeroQuiniela]);
  
  if (existingUsers.length > 0) {
    throw createError('Ya existe un usuario con ese número de quiniela', 409);
  }
  
  // Hash de la contraseña
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  const passwordHash = await bcrypt.hash(registerData.password, saltRounds);
  const respuestaSecurityHash = await bcrypt.hash(registerData.respuestaSeguridad.toLowerCase(), saltRounds);
  
  // Crear usuario
  const createUserQuery = `
    INSERT INTO usuarios (
      nombre, email, numero_quiniela, password_hash, 
      pregunta_seguridad, respuesta_seguridad_hash, activo
    ) VALUES (?, ?, ?, ?, ?, ?, 1)
  `;
  
  const userId = await executeInsert(createUserQuery, [
    registerData.nombreQuiniela,
    email,
    registerData.numeroQuiniela,
    passwordHash,
    registerData.preguntaSeguridad,
    respuestaSecurityHash
  ]);
  
  // Generar token para el usuario recién creado
  const payload: JwtPayload = {
    userId,
    email,
    nombre: registerData.nombreQuiniela
  };
  
  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  } as jwt.SignOptions);
  
  // Crear sesión automática
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + 24);
  
  const sessionQuery = `
    INSERT INTO sesiones (
      usuario_id, session_token, ip_address, user_agent, fecha_expiracion, activo
    ) VALUES (?, ?, ?, ?, ?, 1)
  `;
  
  await executeInsert(sessionQuery, [
    userId,
    token,
    req.ip,
    req.get('User-Agent'),
    expirationDate
  ]);
  
  const userResponse: User = {
    id: userId,
    nombre: registerData.nombreQuiniela,
    email,
    numeroQuiniela: registerData.numeroQuiniela,
    fecha_creacion: new Date().toISOString()
  };
  
  logger.info(`Nuevo usuario registrado: ${email}`, { userId });
  
  res.status(201).json({
    success: true,
    message: 'Usuario registrado exitosamente',
    data: {
      user: userResponse,
      token
    }
  });
}));

// POST /api/v1/auth/recover-password
router.post('/recover-password', asyncHandler(async (req, res) => {
  const recoveryData: PasswordRecoveryData = validateData(passwordRecoverySchema, req.body);
  
  // Verificar si existe el email
  const userQuery = 'SELECT id, nombre FROM usuarios WHERE email = ? AND activo = 1';
  const users = await executeQuery(userQuery, [recoveryData.email]);
  
  if (users.length === 0) {
    // Por seguridad, siempre devolver éxito, pero sin hacer nada
    res.json({
      success: true,
      message: 'Si el email existe, se enviará un enlace de recuperación'
    });
    return;
  }
  
  const user = users[0] as any;
  
  // En un entorno real, aquí enviarías un email
  // Para desarrollo, solo loggeamos
  if (process.env.MOCK_EMAIL === 'true') {
    logger.info(`Mock: Email de recuperación enviado a ${recoveryData.email}`, {
      userId: user.id,
      userName: user.nombre
    });
  } else {
    // TODO: Implementar envío real de email
    logger.warn('Envío de email real no implementado aún');
  }
  
  res.json({
    success: true,
    message: 'Si el email existe, se enviará un enlace de recuperación'
  });
}));

// POST /api/v1/auth/validate-session
router.post('/validate-session', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  
  // Obtener información actualizada del usuario
  const userQuery = `
    SELECT id, nombre, email, numero_quiniela, ultimo_acceso, fecha_creacion
    FROM usuarios 
    WHERE id = ? AND activo = 1
  `;
  
  const users = await executeQuery<DbUser>(userQuery, [userId]);
  
  if (users.length === 0) {
    throw createError('Usuario no encontrado', 404);
  }
  
  const user = users[0];
  
  const userResponse: User = {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    numeroQuiniela: user.numero_quiniela,
    ultimo_acceso: user.ultimo_acceso ? user.ultimo_acceso.toISOString() : undefined,
    fecha_creacion: user.fecha_creacion ? user.fecha_creacion.toISOString() : undefined
  };
  
  res.json({
    success: true,
    message: 'Sesión válida',
    data: userResponse
  });
}));

// POST /api/v1/auth/logout
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    // Marcar sesión como inactiva
    await executeQuery(
      'UPDATE sesiones SET activo = 0 WHERE session_token = ?',
      [token]
    );
  }
  
  logger.info(`Usuario ${req.user!.email} ha cerrado sesión`, { 
    userId: req.user!.userId 
  });
  
  res.json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
}));

export default router;