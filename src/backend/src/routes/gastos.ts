import express from 'express';
import { executeQuery, executeInsert } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { 
  validateData, 
  createGastoSchema, 
  updateGastoSchema, 
  idParamSchema, 
  fechaParamSchema 
} from '../utils/validation';
import { logger } from '../utils/logger';
import { Gasto, CreateGastoRequest, UpdateGastoRequest } from '../types';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// GET /api/v1/gastos/:fecha - Obtener gastos por fecha
router.get('/:fecha', asyncHandler(async (req, res) => {
  const { fecha } = validateData(fechaParamSchema, req.params);
  const userId = req.user!.userId;
  
  const query = `
    SELECT id, monto, categoria, subcategoria, descripcion, fecha
    FROM gastos 
    WHERE usuario_id = ? AND fecha = ? AND activo = TRUE
    ORDER BY id DESC
  `;
  
  const gastos = await executeQuery<Gasto>(query, [userId, fecha]);
  
  res.json({
    success: true,
    message: 'Gastos obtenidos exitosamente',
    data: gastos
  });
}));

// POST /api/v1/gastos - Crear nuevo gasto
router.post('/', asyncHandler(async (req, res) => {
  const gastoData: CreateGastoRequest = validateData(createGastoSchema, req.body);
  const userId = req.user!.userId;
  
  // Verificar que el día no esté finalizado
  const diaFinalizadoQuery = `
    SELECT id FROM dias_finalizados 
    WHERE usuario_id = ? AND fecha = ?
  `;
  
  const diasFinalizados = await executeQuery(diaFinalizadoQuery, [userId, gastoData.fecha]);
  
  if (diasFinalizados.length > 0) {
    throw createError('No se puede agregar gastos a un día finalizado', 400);
  }
  
  // Verificar que la fecha no sea futura
  const fechaGasto = new Date(gastoData.fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  if (fechaGasto > hoy) {
    throw createError('No se pueden agregar gastos a fechas futuras', 400);
  }
  
  // Crear el gasto
  const insertQuery = `
    INSERT INTO gastos (usuario_id, monto, categoria, subcategoria, descripcion, fecha)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  const gastoId = await executeInsert(insertQuery, [
    userId,
    gastoData.monto,
    gastoData.categoria,
    gastoData.subcategoria || null,
    gastoData.descripcion,
    gastoData.fecha
  ]);
  
  // Obtener el gasto creado
  const selectQuery = `
    SELECT id, monto, categoria, subcategoria, descripcion, fecha
    FROM gastos 
    WHERE id = ?
  `;
  
  const gastosCreados = await executeQuery<Gasto>(selectQuery, [gastoId]);
  const gastoCreado = gastosCreados[0];
  
  logger.info(`Gasto creado`, { 
    userId, 
    gastoId, 
    monto: gastoData.monto, 
    categoria: gastoData.categoria,
    fecha: gastoData.fecha
  });
  
  res.status(201).json({
    success: true,
    message: 'Gasto creado exitosamente',
    data: gastoCreado
  });
}));

// PUT /api/v1/gastos/:id - Actualizar gasto
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = validateData(idParamSchema, req.params);
  const gastoData: UpdateGastoRequest = validateData(updateGastoSchema, req.body);
  const userId = req.user!.userId;
  
  // Verificar que el gasto existe y pertenece al usuario
  const existsQuery = `
    SELECT id, fecha FROM gastos 
    WHERE id = ? AND usuario_id = ? AND activo = TRUE
  `;
  
  const gastosExistentes = await executeQuery(existsQuery, [id, userId]);
  
  if (gastosExistentes.length === 0) {
    throw createError('Gasto no encontrado', 404);
  }
  
  const gastoExistente = gastosExistentes[0] as any;
  
  // Verificar que el día no esté finalizado (tanto el original como el nuevo)
  const diasFinalizadosQuery = `
    SELECT fecha FROM dias_finalizados 
    WHERE usuario_id = ? AND (fecha = ? OR fecha = ?)
  `;
  
  const diasFinalizados = await executeQuery(diasFinalizadosQuery, [
    userId, 
    gastoExistente.fecha, 
    gastoData.fecha
  ]);
  
  if (diasFinalizados.length > 0) {
    throw createError('No se puede editar gastos de días finalizados', 400);
  }
  
  // Verificar que la nueva fecha no sea futura
  const fechaGasto = new Date(gastoData.fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  if (fechaGasto > hoy) {
    throw createError('No se pueden mover gastos a fechas futuras', 400);
  }
  
  // Actualizar el gasto
  const updateQuery = `
    UPDATE gastos 
    SET monto = ?, categoria = ?, subcategoria = ?, descripcion = ?, fecha = ?
    WHERE id = ? AND usuario_id = ?
  `;
  
  await executeQuery(updateQuery, [
    gastoData.monto,
    gastoData.categoria,
    gastoData.subcategoria || null,
    gastoData.descripcion,
    gastoData.fecha,
    id,
    userId
  ]);
  
  // Obtener el gasto actualizado
  const selectQuery = `
    SELECT id, monto, categoria, subcategoria, descripcion, fecha
    FROM gastos 
    WHERE id = ?
  `;
  
  const gastosActualizados = await executeQuery<Gasto>(selectQuery, [id]);
  const gastoActualizado = gastosActualizados[0];
  
  logger.info(`Gasto actualizado`, { 
    userId, 
    gastoId: id, 
    monto: gastoData.monto, 
    categoria: gastoData.categoria,
    fecha: gastoData.fecha
  });
  
  res.json({
    success: true,
    message: 'Gasto actualizado exitosamente',
    data: gastoActualizado
  });
}));

// DELETE /api/v1/gastos/:id - Eliminar gasto
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = validateData(idParamSchema, req.params);
  const userId = req.user!.userId;
  
  // Verificar que el gasto existe y pertenece al usuario
  const existsQuery = `
    SELECT id, fecha FROM gastos 
    WHERE id = ? AND usuario_id = ? AND activo = TRUE
  `;
  
  const gastosExistentes = await executeQuery(existsQuery, [id, userId]);
  
  if (gastosExistentes.length === 0) {
    throw createError('Gasto no encontrado', 404);
  }
  
  const gastoExistente = gastosExistentes[0] as any;
  
  // Verificar que el día no esté finalizado
  const diaFinalizadoQuery = `
    SELECT id FROM dias_finalizados 
    WHERE usuario_id = ? AND fecha = ?
  `;
  
  const diasFinalizados = await executeQuery(diaFinalizadoQuery, [userId, gastoExistente.fecha]);
  
  if (diasFinalizados.length > 0) {
    throw createError('No se puede eliminar gastos de un día finalizado', 400);
  }
  
  // Eliminar el gasto (soft delete)
  const deleteQuery = 'UPDATE gastos SET activo = FALSE WHERE id = ? AND usuario_id = ?';
  await executeQuery(deleteQuery, [id, userId]);
  
  logger.info(`Gasto eliminado`, { 
    userId, 
    gastoId: id, 
    fecha: gastoExistente.fecha
  });
  
  res.json({
    success: true,
    message: 'Gasto eliminado exitosamente'
  });
}));

export default router;