import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  errors?: any[];
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';
  let errors = err.errors || [];

  // Log del error
  logger.error('Error capturado:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.userId || 'No autenticado'
  });

  // Manejo de errores específicos de MySQL
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        statusCode = 409;
        message = 'Ya existe un registro con esos datos';
        break;
      case 'ER_NO_REFERENCED_ROW_2':
        statusCode = 400;
        message = 'Referencia inválida en la base de datos';
        break;
      case 'ER_ROW_IS_REFERENCED_2':
        statusCode = 400;
        message = 'No se puede eliminar debido a referencias existentes';
        break;
      case 'ER_DATA_TOO_LONG':
        statusCode = 400;
        message = 'Datos demasiado largos para el campo';
        break;
      case 'ER_BAD_NULL_ERROR':
        statusCode = 400;
        message = 'Campo requerido no puede estar vacío';
        break;
      case 'ECONNREFUSED':
        statusCode = 503;
        message = 'Error de conexión a la base de datos';
        break;
      case 'PROTOCOL_CONNECTION_LOST':
        statusCode = 503;
        message = 'Conexión perdida con la base de datos';
        break;
    }
  }

  // Manejo de errores de validación Joi
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Datos de entrada inválidos';
    errors = err.errors || [];
  }

  // En desarrollo, incluir stack trace
  const response: any = {
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      originalError: err.message 
    })
  };

  res.status(statusCode).json(response);
};

// Función helper para crear errores personalizados
export const createError = (
  message: string, 
  statusCode: number = 500, 
  errors: any[] = []
): CustomError => {
  const error = new Error(message) as CustomError;
  error.statusCode = statusCode;
  error.errors = errors;
  return error;
};

// Wrapper para funciones async que maneja errores automáticamente
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};