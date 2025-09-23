import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';
import { executeQuery } from '../config/database';
import { logger } from '../utils/logger';

// Extender Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
      return;
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Verificar que el usuario existe y está activo
    const userQuery = `
      SELECT id, nombre, email, numero_quiniela, activo 
      FROM usuarios 
      WHERE id = ? AND activo = 1
    `;
    
    const users = await executeQuery(userQuery, [decoded.userId]);
    
    if (users.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Token inválido o usuario no encontrado'
      });
      return;
    }

    // Verificar que existe una sesión activa para este token
    const sessionQuery = `
      SELECT id, fecha_expiracion 
      FROM sesiones 
      WHERE usuario_id = ? AND session_token = ? AND activo = 1
    `;
    
    const sessions = await executeQuery(sessionQuery, [decoded.userId, token]);
    
    if (sessions.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Sesión expirada o inválida'
      });
      return;
    }

    const session = sessions[0] as any;
    
    // Verificar que la sesión no haya expirado
    if (new Date() > new Date(session.fecha_expiracion)) {
      // Marcar sesión como inactiva
      await executeQuery(
        'UPDATE sesiones SET activo = 0 WHERE id = ?',
        [session.id]
      );
      
      res.status(401).json({
        success: false,
        message: 'Sesión expirada'
      });
      return;
    }

    // Actualizar último acceso del usuario
    await executeQuery(
      'UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?',
      [decoded.userId]
    );

    // Agregar información del usuario al request
    req.user = decoded;
    next();

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
      return;
    }

    logger.error('Error en middleware de autenticación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
    return;
  }
};

// Middleware opcional para rutas que pueden funcionar con o sin autenticación
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Si hay error en el token opcional, continuar sin usuario
    next();
  }
};