import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const originalSend = res.send;

  // Interceptar la respuesta
  res.send = function(body) {
    const duration = Date.now() - start;
    
    // Log de la request
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.userId || 'No autenticado',
      timestamp: new Date().toISOString()
    });

    // Llamar al método original
    return originalSend.call(this, body);
  };

  next();
};