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
    WHERE usuario_id = ? AND fecha = ? AND activo = TRUE
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
    WHERE id = ? AND usuario_id = ? AND activo = TRUE
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
    WHERE id = ? AND usuario_id = ? AND activo = TRUE
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

  // Eliminar la transacción (soft delete)
  const deleteQuery = 'UPDATE transacciones_quiniela SET activo = FALSE WHERE id = ? AND usuario_id = ?';
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

// GET /api/v1/quinielas/horarios - Obtener configuración de horarios de quiniela
router.get('/horarios', asyncHandler(async (req, res) => {
  const userId = req.user!.userId;

  const query = `
    SELECT modalidad_id, nombre_modalidad, horario_inicio, horario_fin
    FROM configuracion_horarios
    WHERE usuario_id = ? AND activo = TRUE
    ORDER BY modalidad_id
  `;

  const horarios = await executeQuery(query, [userId]);

  // Si no hay configuración personalizada, devolver horarios por defecto
  if (horarios.length === 0) {
    const horariosDefecto = [
      { modalidad_id: 1, nombre_modalidad: "La Primera", horario_inicio: "08:00:00", horario_fin: "11:30:00" },
      { modalidad_id: 2, nombre_modalidad: "Matutina", horario_inicio: "08:00:00", horario_fin: "14:00:00" },
      { modalidad_id: 3, nombre_modalidad: "Vespertina", horario_inicio: "08:00:00", horario_fin: "17:30:00" },
      { modalidad_id: 4, nombre_modalidad: "De La Tarde", horario_inicio: "08:00:00", horario_fin: "20:00:00" },
      { modalidad_id: 5, nombre_modalidad: "Nocturna", horario_inicio: "08:00:00", horario_fin: "21:30:00" },
    ];

    res.json({
      success: true,
      message: 'Horarios por defecto obtenidos',
      data: horariosDefecto
    });
  } else {
    res.json({
      success: true,
      message: 'Horarios personalizados obtenidos exitosamente',
      data: horarios
    });
  }
}));

// POST /api/v1/quinielas/horarios - Actualizar configuración de horarios
router.post('/horarios', asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  const { horarios } = req.body;

  if (!Array.isArray(horarios) || horarios.length === 0) {
    throw createError('Se requiere un array de horarios válido', 400);
  }

  // Validar formato de horarios
  for (const horario of horarios) {
    if (!horario.modalidad_id || !horario.nombre_modalidad || !horario.horario_inicio || !horario.horario_fin) {
      throw createError('Faltan campos requeridos en la configuración de horarios', 400);
    }
  }

  // Desactivar configuración anterior
  const deactivateQuery = `
    UPDATE configuracion_horarios
    SET activo = FALSE
    WHERE usuario_id = ?
  `;

  await executeQuery(deactivateQuery, [userId]);

  // Insertar nueva configuración
  const insertQuery = `
    INSERT INTO configuracion_horarios (
      usuario_id, modalidad_id, nombre_modalidad, horario_inicio, horario_fin
    ) VALUES (?, ?, ?, ?, ?)
  `;

  for (const horario of horarios) {
    await executeQuery(insertQuery, [
      userId,
      horario.modalidad_id,
      horario.nombre_modalidad,
      horario.horario_inicio,
      horario.horario_fin
    ]);
  }

  logger.info(`Horarios de quiniela actualizados`, {
    userId,
    cantidadHorarios: horarios.length
  });

  res.json({
    success: true,
    message: 'Horarios actualizados exitosamente',
    data: horarios
  });
}));

// GET /api/v1/quinielas/estado-modalidades - Obtener estado actual de modalidades (abiertas/cerradas)
router.get('/estado-modalidades', asyncHandler(async (req, res) => {
  const userId = req.user!.userId;

  // Obtener horarios configurados
  const horariosQuery = `
    SELECT modalidad_id, nombre_modalidad, horario_inicio, horario_fin
    FROM configuracion_horarios
    WHERE usuario_id = ? AND activo = TRUE
    ORDER BY modalidad_id
  `;

  let horarios = await executeQuery(horariosQuery, [userId]);

  // Si no hay configuración personalizada, usar horarios por defecto
  if (horarios.length === 0) {
    horarios = [
      { modalidad_id: 1, nombre_modalidad: "La Primera", horario_inicio: "08:00:00", horario_fin: "09:15:00" },
      { modalidad_id: 2, nombre_modalidad: "Matutina", horario_inicio: "08:00:00", horario_fin: "11:45:00" },
      { modalidad_id: 3, nombre_modalidad: "Vespertina", horario_inicio: "08:00:00", horario_fin: "13:15:00" },
      { modalidad_id: 4, nombre_modalidad: "De la Tarde", horario_inicio: "08:00:00", horario_fin: "18:45:00" },
      { modalidad_id: 5, nombre_modalidad: "Nocturna", horario_inicio: "08:00:00", horario_fin: "20:45:00" },
    ];
  }

  // Obtener hora actual
  const ahora = new Date();
  const horaActual = ahora.getHours().toString().padStart(2, '0') + ':' +
    ahora.getMinutes().toString().padStart(2, '0') + ':00';

  // Determinar estado de cada modalidad
  // 🎯 LÓGICA CORREGIDA: Las quinielas están disponibles TODO EL DÍA hasta su hora de cierre
  const modalidadesConEstado = horarios.map((horario: any) => {
    const finComparable = horario.horario_fin;

    // Convertir todas las horas a minutos desde medianoche
    const [horasActual, minutosActualNum] = horaActual.split(':').map(Number);
    const [horasCierre, minutosCierreNum] = finComparable.split(':').map(Number);

    const minutosActuales = horasActual * 60 + minutosActualNum;
    const minutosCierre = horasCierre * 60 + minutosCierreNum;

    // ✅ LÓGICA CORRECTA: Una modalidad está abierta si:
    // La hora actual es MENOR que la hora de cierre (disponible todo el día hasta el cierre)
    const estaAbierta = minutosActuales < minutosCierre;

    console.log(`🕒 Modalidad ${horario.nombre_modalidad}: ${horaActual} vs cierre ${finComparable} = ${estaAbierta ? 'ABIERTA' : 'CERRADA'} (${minutosActuales} < ${minutosCierre})`);

    return {
      ...horario,
      esta_abierta: estaAbierta,
      hora_actual: horaActual,
      minutos_restantes: estaAbierta ? (minutosCierre - minutosActuales) : 0
    };
  });

  // Helper para calcular minutos restantes hasta el cierre
  function calcularMinutosRestantes(horaActual: string, horaCierre: string): number {
    const [horasActual, minutosActual] = horaActual.split(':').map(Number);
    const [horasCierre, minutosCierre] = horaCierre.split(':').map(Number);

    const minutosActuales = horasActual * 60 + minutosActual;
    const minutosCierreTotal = horasCierre * 60 + minutosCierre;

    // Calcular minutos restantes hasta el cierre
    if (minutosActuales >= minutosCierreTotal) {
      return 0; // Ya cerrada
    }

    return Math.max(0, minutosCierreTotal - minutosActuales);
  }

  // 🔧 LOG DEBUG: Resumen final del estado
  const modalidadesAbiertas = modalidadesConEstado.filter(m => m.esta_abierta).length;
  const modalidadesTotales = modalidadesConEstado.length;
  console.log(`📊 RESUMEN: ${modalidadesAbiertas}/${modalidadesTotales} modalidades abiertas a las ${horaActual}`);

  res.json({
    success: true,
    message: 'Estado de modalidades obtenido exitosamente',
    data: modalidadesConEstado
  });
}));

export default router;
