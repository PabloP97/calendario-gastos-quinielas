import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { executeQuery, executeInsert } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { validateData, loginSchema, passwordRecoverySchema } from '../utils/validation';
import { logger } from '../utils/logger';
import {
  User,
  LoginCredentials,
  PasswordRecoveryData,
  JwtPayload,
  DbUser
} from '../types';

const router = express.Router();

// POST /api/v1/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const credentials: LoginCredentials = validateData(loginSchema, req.body);

  // Buscar usuario por username
  const userQuery = `
    SELECT id, username, nombre_quiniela, email, numero_quiniela, password_hash, activo
    FROM usuarios
    WHERE username = ? AND activo = 1
  `;

  const users = await executeQuery<DbUser>(userQuery, [credentials.username]);

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
    username: user.username,
    email: user.email,
    nombre: user.nombre_quiniela
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
    INSERT INTO sesiones_usuario (
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
    username: user.username,
    nombre: user.nombre_quiniela,
    email: user.email,
    numeroQuiniela: user.numero_quiniela || undefined,
    ultimo_acceso: new Date().toISOString()
  };

  logger.info(`Usuario ${user.username} (${user.numero_quiniela || 'sin número'}) ha iniciado sesión`, { userId: user.id });

  res.json({
    success: true,
    message: 'Login exitoso',
    data: {
      user: userResponse,
      token
    }
  });
}));

// POST /api/v1/auth/admin/create-user - Crear usuario desde panel de administración
router.post('/admin/create-user', asyncHandler(async (req, res) => {
  const { username, email, nombre, nombreQuiniela, numeroQuiniela, password } = req.body;

  // TODO: SP_INSERT - Crear usuario desde panel de administración
  // EXEC SP_AdminCreateUser @username = ?, @email = ?, @nombre = ?, @nombre_quiniela = ?, @password_hash = ?

  // Validación básica
  if (!username || !email || !nombre || !nombreQuiniela || !numeroQuiniela || !password) {
    throw createError('Todos los campos son requeridos', 400);
  }

  if (username.length > 50 || email.length > 100 || nombre.length > 50 || nombreQuiniela.length > 100) {
    throw createError('Uno o más campos exceden la longitud máxima', 400);
  }

  // Validar username
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    throw createError('El nombre de usuario solo puede contener letras, números, guiones y guiones bajos', 400);
  }

  if (username.length < 3 || username.length > 50) {
    throw createError('El nombre de usuario debe tener entre 3 y 50 caracteres', 400);
  }

  // Validar número de quiniela
  if (!/^\d+$/.test(numeroQuiniela)) {
    throw createError('El número de quiniela solo puede contener dígitos', 400);
  }

  if (numeroQuiniela.length < 4 || numeroQuiniela.length > 15) {
    throw createError('El número de quiniela debe tener entre 4 y 15 dígitos', 400);
  }

  if (password.length < 6) {
    throw createError('La contraseña debe tener al menos 6 caracteres', 400);
  }

  // Verificar si ya existe usuario con ese username
  const existingUserByUsernameQuery = `
    SELECT id FROM usuarios WHERE username = ?
  `;

  const existingUsersByUsername = await executeQuery(existingUserByUsernameQuery, [username]);

  if (existingUsersByUsername.length > 0) {
    throw createError('Ya existe un usuario con este nombre de usuario', 409);
  }

  // Verificar si ya existe usuario con ese email
  const existingUserByEmailQuery = `
    SELECT id FROM usuarios WHERE email = ?
  `;

  const existingUsersByEmail = await executeQuery(existingUserByEmailQuery, [email]);

  if (existingUsersByEmail.length > 0) {
    throw createError('Ya existe un usuario con este email', 409);
  }

  // Verificar si ya existe usuario con ese número de quiniela
  const existingUserByNumeroQuery = `
    SELECT id FROM usuarios WHERE numero_quiniela = ?
  `;

  const existingUsersByNumero = await executeQuery(existingUserByNumeroQuery, [numeroQuiniela]);

  if (existingUsersByNumero.length > 0) {
    throw createError('Ya existe un usuario con este número de quiniela', 409);
  }

  // Hash de la contraseña
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Crear usuario con el username y número de quiniela proporcionado por el administrador
  const createUserQuery = `
    INSERT INTO usuarios (
      username, numero_quiniela, nombre_quiniela, email, password_hash, activo
    ) VALUES (?, ?, ?, ?, ?, 1)
  `;

  const userId = await executeInsert(createUserQuery, [
    username,
    numeroQuiniela,
    nombreQuiniela,
    email,
    passwordHash
  ]);

  // Preparar respuesta del usuario creado
  const userResponse = {
    id: userId,
    username: username,
    nombre: nombre,
    email: email,
    nombreQuiniela: nombreQuiniela,
    numeroQuiniela: numeroQuiniela,
    fecha_creacion: new Date().toISOString()
  };

  logger.info(`Nuevo usuario creado por administrador: ${username} (${email})`, { userId });

  res.status(201).json({
    success: true,
    message: 'Usuario creado exitosamente',
    data: {
      user: userResponse
    }
  });
}));

// POST /api/v1/auth/recover-password
router.post('/recover-password', asyncHandler(async (req, res) => {
  const recoveryData: PasswordRecoveryData = validateData(passwordRecoverySchema, req.body);

  // TODO: SP_SELECT - Verificar si existe el email
  // EXEC SP_GetUserByEmail @email = ?

  // Verificar si existe el email
  const userQuery = 'SELECT id, nombre_quiniela FROM usuarios WHERE email = ? AND activo = 1';
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
      userName: user.nombre_quiniela
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
  // TODO: SP_SELECT - Validar sesión de usuario
  // EXEC SP_ValidateUserSession @user_id = ?

  // Si llegamos aquí, el token es válido (verificado por el middleware)
  const user = req.user!;

  res.json({
    success: true,
    message: 'Sesión válida',
    data: user
  });
}));

// POST /api/v1/auth/logout
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  // TODO: SP_UPDATE - Desactivar sesión de usuario
  // EXEC SP_DeactivateUserSession @user_id = ?

  const userId = req.user!.userId;
  const token = req.get('Authorization')?.replace('Bearer ', '');

  if (token) {
    // Desactivar la sesión en la base de datos
    await executeQuery(
      'UPDATE sesiones_usuario SET activo = 0 WHERE usuario_id = ? AND session_token = ?',
      [userId, token]
    );
  }

  logger.info(`Usuario ${userId} ha cerrado sesión`);

  res.json({
    success: true,
    message: 'Logout exitoso'
  });
}));

export default router;
