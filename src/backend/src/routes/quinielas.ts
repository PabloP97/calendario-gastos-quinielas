import express from 'express';
import { executeQuery, executeInsert } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { 
  validateData, 
  createTransaccionQuinielaSchema, 
  updateTransaccionQuinielaSchema, 
  idParamSchema, 
  fechaParamSchema 
} from '../utils/validation';
import { logger } from '../utils/logger';
import { 
  TransaccionQuiniela, 
  CreateTransaccionQuinielaRequest, 
  UpdateTransaccionQuinielaRequest 
} from '../types';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// GET /api/v1/quinielas/transacciones/:fecha - Obtener transacciones de quiniela por fecha
router.get('/transacciones/:fecha', asyncHandler(async (req, res) => {
  const { fecha } = validateData(fechaParamSchema, req.params);
  const userId = req.user!.userId;
  
  const query = `
    SELECT id, tipo, categoria, monto, descripcion, fecha, fuente
    FROM transacciones_quiniela 
    WHERE usuario_id = ? AND fecha = ?
    ORDER BY id DESC
  `;
  
  const transacciones = await executeQuery<TransaccionQuiniela>(query, [userId, fecha]);
  
  res.json({
    success: true,
    message: 'Transacciones de quiniela obtenidas exitosamente',
    data: transacciones
  });
}));

// POST /api/v1/quinielas/transacciones - Crear nueva transacción de quiniela
router.post('/transacciones', asyncHandler(async (req, res) => {
  const transaccionData: CreateTransaccionQuinielaRequest = validateData(
    createTransaccionQuinielaSchema, 
    req.body
  );
  const userId = req.user!.userId;
  
  // Verificar que el día no esté finalizado
  const diaFinalizadoQuery = `
    SELECT id FROM dias_finalizados 
    WHERE usuario_id = ? AND fecha = ?
  `;
  
  const diasFinalizados = await executeQuery(diaFinalizadoQuery, [userId, transaccionData.fecha]);
  
  if (diasFinalizados.length > 0) {
    throw createError('No se puede agregar transacciones a un día finalizado', 400);
  }
  
  // Verificar que la fecha no sea futura
  const fechaTransaccion = new Date(transaccionData.fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  if (fechaTransaccion > hoy) {
    throw createError('No se pueden agregar transacciones a fechas futuras', 400);
  }
  
  // Crear la transacción
  const insertQuery = `
    INSERT INTO transacciones_quiniela (
      usuario_id, tipo, categoria, monto, descripcion, fecha, fuente
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  const transaccionId = await executeInsert(insertQuery, [
    userId,
    transaccionData.tipo,
    transaccionData.juego,
    transaccionData.monto,
    transaccionData.descripcion || '',
    transaccionData.fecha,
    transaccionData.juego
  ]);
  
  // Obtener la transacción creada
  const selectQuery = `
    SELECT id, tipo, categoria, monto, descripcion, fecha, fuente
    FROM transacciones_quiniela 
    WHERE id = ?
  `;
  
  const transaccionesCreadas = await executeQuery<TransaccionQuiniela>(selectQuery, [transaccionId]);
  const transaccionCreada = transaccionesCreadas[0];
  
  logger.info(`Transacción de quiniela creada`, { 
    userId, 
    transaccionId, 
    tipo: transaccionData.tipo,
    monto: transaccionData.monto, 
    juego: transaccionData.juego,
    fecha: transaccionData.fecha
  });
  
  res.status(201).json({
    success: true,
    message: 'Transacción de quiniela creada exitosamente',
    data: transaccionCreada
  });
}));

// PUT /api/v1/quinielas/transacciones/:id - Actualizar transacción de quiniela
router.put('/transacciones/:id', asyncHandler(async (req, res) => {
  const { id } = validateData(idParamSchema, req.params);
  const transaccionData: UpdateTransaccionQuinielaRequest = validateData(
    updateTransaccionQuinielaSchema, 
    req.body
  );
  const userId = req.user!.userId;
  
  // Verificar que la transacción existe y pertenece al usuario
  const existsQuery = `
    SELECT id, fecha FROM transacciones_quiniela 
    WHERE id = ? AND usuario_id = ?
  `;
  
  const transaccionesExistentes = await executeQuery(existsQuery, [id, userId]);
  
  if (transaccionesExistentes.length === 0) {
    throw createError('Transacción no encontrada', 404);
  }
  
  const transaccionExistente = transaccionesExistentes[0] as any;
  
  // Verificar que el día no esté finalizado (tanto el original como el nuevo)
  const diasFinalizadosQuery = `
    SELECT fecha FROM dias_finalizados 
    WHERE usuario_id = ? AND (fecha = ? OR fecha = ?)
  `;
  
  const diasFinalizados = await executeQuery(diasFinalizadosQuery, [
    userId, 
    transaccionExistente.fecha, 
    transaccionData.fecha
  ]);
  
  if (diasFinalizados.length > 0) {
    throw createError('No se puede editar transacciones de días finalizados', 400);
  }
  
  // Verificar que la nueva fecha no sea futura
  const fechaTransaccion = new Date(transaccionData.fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  if (fechaTransaccion > hoy) {
    throw createError('No se pueden mover transacciones a fechas futuras', 400);
  }
  
  // Actualizar la transacción
  const updateQuery = `
    UPDATE transacciones_quiniela 
    SET tipo = ?, categoria = ?, monto = ?, descripcion = ?, fecha = ?, fuente = ?
    WHERE id = ? AND usuario_id = ?
  `;
  
  await executeQuery(updateQuery, [
    transaccionData.tipo,
    transaccionData.juego,
    transaccionData.monto,
    transaccionData.descripcion || '',
    transaccionData.fecha,
    transaccionData.juego,
    id,
    userId
  ]);
  
  // Obtener la transacción actualizada
  const selectQuery = `
    SELECT id, tipo, categoria, monto, descripcion, fecha, fuente
    FROM transacciones_quiniela 
    WHERE id = ?
  `;
  
  const transaccionesActualizadas = await executeQuery<TransaccionQuiniela>(selectQuery, [id]);
  const transaccionActualizada = transaccionesActualizadas[0];
  
  logger.info(`Transacción de quiniela actualizada`, { 
    userId, 
    transaccionId: id, 
    tipo: transaccionData.tipo,
    monto: transaccionData.monto, 
    juego: transaccionData.juego,
    fecha: transaccionData.fecha
  });
  
  res.json({
    success: true,
    message: 'Transacción de quiniela actualizada exitosamente',
    data: transaccionActualizada
  });
}));

// DELETE /api/v1/quinielas/transacciones/:id - Eliminar transacción de quiniela
router.delete('/transacciones/:id', asyncHandler(async (req, res) => {
  const { id } = validateData(idParamSchema, req.params);
  const userId = req.user!.userId;
  
  // Verificar que la transacción existe y pertenece al usuario
  const existsQuery = `
    SELECT id, fecha FROM transacciones_quiniela 
    WHERE id = ? AND usuario_id = ?
  `;
  
  const transaccionesExistentes = await executeQuery(existsQuery, [id, userId]);
  
  if (transaccionesExistentes.length === 0) {
    throw createError('Transacción no encontrada', 404);
  }
  
  const transaccionExistente = transaccionesExistentes[0] as any;
  
  // Verificar que el día no esté finalizado
  const diaFinalizadoQuery = `
    SELECT id FROM dias_finalizados 
    WHERE usuario_id = ? AND fecha = ?
  `;
  
  const diasFinalizados = await executeQuery(diaFinalizadoQuery, [userId, transaccionExistente.fecha]);
  
  if (diasFinalizados.length > 0) {
    throw createError('No se puede eliminar transacciones de un día finalizado', 400);
  }
  
  // Eliminar la transacción
  const deleteQuery = 'DELETE FROM transacciones_quiniela WHERE id = ? AND usuario_id = ?';
  await executeQuery(deleteQuery, [id, userId]);
  
  logger.info(`Transacción de quiniela eliminada`, { 
    userId, 
    transaccionId: id, 
    fecha: transaccionExistente.fecha
  });
  
  res.json({
    success: true,
    message: 'Transacción de quiniela eliminada exitosamente'
  });
}));

export default router;