import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Importar rutas
import authRoutes from './routes/auth';
import gastosRoutes from './routes/gastos';
import quinielasRoutes from './routes/quinielas';
import saldosRoutes from './routes/saldos';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const API_VERSION = process.env.API_VERSION || 'v1';

// Configuración de Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // límite de requests por IP
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, inténtalo de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Configuración de CORS
const corsOptions = {
  origin: 'https://calendario-gastos-quinielas.vercel.app',
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

// Middlewares globales
app.use(helmet()); // Seguridad HTTP headers
app.use(cors(corsOptions)); // CORS
app.use(compression()); // Compresión gzip
app.use(limiter); // Rate limiting
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger); // Logging de requests

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: API_VERSION
  });
});

// API Info endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Calendario Gastos API',
    version: API_VERSION,
    description: 'API REST para gestión de gastos diarios y quinielas',
    endpoints: {
      auth: `/api/${API_VERSION}/auth`,
      gastos: `/api/${API_VERSION}/gastos`,
      quinielas: `/api/${API_VERSION}/quinielas`,
      saldos: `/api/${API_VERSION}/saldos`
    },
    documentation: process.env.ENABLE_SWAGGER === 'true' ? `/api/${API_VERSION}/docs` : null
  });
});

// Rutas de la API
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/gastos`, gastosRoutes);
app.use(`/api/${API_VERSION}/quinielas`, quinielasRoutes);
app.use(`/api/${API_VERSION}/saldos`, saldosRoutes);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada`,
    availableEndpoints: [
      `/api/${API_VERSION}/auth`,
      `/api/${API_VERSION}/gastos`,
      `/api/${API_VERSION}/quinielas`,
      `/api/${API_VERSION}/saldos`,
      '/health'
    ]
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Función para inicializar el servidor
async function startServer() {
  try {
    // Verificar conexión a la base de datos
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('No se pudo conectar a la base de datos. Servidor no iniciado.');
      process.exit(1);
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
      logger.info(`📚 API disponible en http://localhost:${PORT}/api/${API_VERSION}`);
      logger.info(`🏥 Health check en http://localhost:${PORT}/health`);
      logger.info(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);

      if (process.env.ENABLE_SWAGGER === 'true') {
        logger.info(`📖 Documentación Swagger en http://localhost:${PORT}/api/${API_VERSION}/docs`);
      }
    });

  } catch (error) {
    logger.error('Error iniciando el servidor:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  logger.info('🛑 SIGTERM recibido. Cerrando servidor gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('🛑 SIGINT recibido. Cerrando servidor gracefully...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Iniciar servidor
startServer();

export default app;
