import express from 'express';
import { executeQuery, executeInsert } from '../config/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { validateData, fechaParamSchema } from '../utils/validation';
import { logger } from '../utils/logger';
import { DatosDia, SaldoDiario } from '../types';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// GET /api/v1/saldos/dias-finalizados - Obtener lista de días finalizados
router.get('/dias-finalizados', asyncHandler(async (req, res) => {
  const userId = req.user!.userId;

  const query = `
    SELECT fecha FROM dias_finalizados
    WHERE usuario_id = ?
    ORDER BY fecha DESC
  `;

  const diasFinalizados = await executeQuery(query, [userId]);
  const fechas = diasFinalizados.map((dia: any) => dia.fecha);

  res.json({
    success: true,
    message: 'Días finalizados obtenidos exitosamente',
    data: fechas
  });
}));

// GET /api/v1/saldos/datos-dia/:fecha - Obtener todos los datos de un día específico
router.get('/datos-dia/:fecha', asyncHandler(async (req, res) => {
  const { fecha } = validateData(fechaParamSchema, req.params);
  const userId = req.user!.userId;

  // Obtener gastos del día
  const gastosQuery = `
    SELECT id, monto, categoria, subcategoria, descripcion, fecha
    FROM gastos
    WHERE usuario_id = ? AND fecha = ?
    ORDER BY id DESC
  `;

  const gastos = await executeQuery(gastosQuery, [userId, fecha]);

  // Obtener transacciones de quiniela del día
  const quinielasQuery = `
    SELECT id, tipo, categoria, monto, descripcion, fecha, fuente
    FROM transacciones_quiniela
    WHERE usuario_id = ? AND fecha = ?
    ORDER BY id DESC
  `;

  const transaccionesQuiniela = await executeQuery(quinielasQuery, [userId, fecha]);

  // Obtener saldo anterior
  const saldoAnterior = await obtenerSaldoAnterior(userId, fecha);

  // Verificar si el día está finalizado
  const finalizadoQuery = `
    SELECT id FROM dias_finalizados
    WHERE usuario_id = ? AND fecha = ?
  `;

  const diaFinalizado = await executeQuery(finalizadoQuery, [userId, fecha]);
  const estaFinalizado = diaFinalizado.length > 0;

  const datosDia: DatosDia = {
    gastos,
    transaccionesQuiniela,
    saldoAnterior,
    estaFinalizado
  };

  res.json({
    success: true,
    message: 'Datos del día obtenidos exitosamente',
    data: datosDia
  });
}));

// GET /api/v1/saldos/saldo-anterior/:fecha - Obtener saldo anterior a una fecha
router.get('/saldo-anterior/:fecha', asyncHandler(async (req, res) => {
  const { fecha } = validateData(fechaParamSchema, req.params);
  const userId = req.user!.userId;

  const saldoAnterior = await obtenerSaldoAnterior(userId, fecha);

  res.json({
    success: true,
    message: 'Saldo anterior obtenido exitosamente',
    data: { saldoAnterior }
  });
}));

// POST /api/v1/saldos/finalizar-dia/:fecha - Finalizar un día
router.post('/finalizar-dia/:fecha', asyncHandler(async (req, res) => {
  const { fecha } = validateData(fechaParamSchema, req.params);
  const userId = req.user!.userId;
  // Verificar que el día no esté ya finalizado
  const finalizadoQuery = `
    SELECT id FROM dias_finalizados
    WHERE usuario_id = ? AND fecha = ?
  `;

  const diaFinalizado = await executeQuery(finalizadoQuery, [userId, fecha]);

  if (diaFinalizado.length > 0) {
    throw createError('El día ya está finalizado', 400);
  }

  // Verificar que la fecha no sea futura
  const fechaDia = new Date(fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (fechaDia > hoy) {
    throw createError('No se pueden finalizar días futuros', 400);
  }

  // Calcular el saldo final del día
  const saldoAnterior = await obtenerSaldoAnterior(userId, fecha);

  // Obtener gastos del día
  const gastosQuery = `
    SELECT COALESCE(SUM(monto), 0) as total_gastos
    FROM gastos
    WHERE usuario_id = ? AND fecha = ?
  `;

  const gastosResult = await executeQuery(gastosQuery, [userId, fecha]);
  const totalGastos = gastosResult[0]?.total_gastos || 0;

  // Obtener ingresos y egresos de quiniela del día
  const ingresosQuery = `
    SELECT COALESCE(SUM(monto), 0) as total_ingresos
    FROM transacciones_quiniela
    WHERE usuario_id = ? AND fecha = ? AND tipo = 'ingreso'
  `;
  const egresosQuery = `
    SELECT COALESCE(SUM(monto), 0) as total_egresos
    FROM transacciones_quiniela
    WHERE usuario_id = ? AND fecha = ? AND tipo = 'egreso'
  `;
  const ingresosResult = await executeQuery(ingresosQuery, [userId, fecha]);
  const egresosResult = await executeQuery(egresosQuery, [userId, fecha]);
  const totalIngresos = ingresosResult[0]?.total_ingresos || 0;
  const totalEgresosQuiniela = egresosResult[0]?.total_egresos || 0;
  console.log(`typeof: ${typeof(totalEgresosQuiniela)}`)
  const totalEgresos = totalGastos + totalEgresosQuiniela;
  const saldoFinal = saldoAnterior + totalIngresos - totalEgresos;
  // Guardar el saldo final del día
  const saldoQuery = `
    INSERT INTO saldos_diarios (usuario_id, fecha, saldo_inicial_dia, total_ingresos, total_egresos, saldo_final_dia)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    saldo_inicial_dia = VALUES(saldo_inicial_dia),
    total_ingresos = VALUES(total_ingresos),
    total_egresos = VALUES(total_egresos),
    saldo_final_dia = VALUES(saldo_final_dia)
  `;
  await executeQuery(saldoQuery, [
    userId,
    fecha,
    saldoAnterior,
    totalIngresos,
    totalEgresos,
    saldoFinal
  ]);

  // Marcar el día como finalizado
  const finalizarQuery = `
    INSERT INTO dias_finalizados (usuario_id, fecha)
    VALUES (?, ?)
  `;

  await executeInsert(finalizarQuery, [userId, fecha]);

  logger.info(`Día finalizado`, {
    userId,
    fecha,
    saldoAnterior,
    totalIngresos,
    totalEgresos,
    saldoFinal
  });

  const saldoDiario: SaldoDiario = {
    fecha,
    saldoInicialDia: saldoAnterior,
    totalIngresos,
    totalEgresos,
    saldoFinalDia: saldoFinal,
    estaFinalizado: true
  };

  res.json({
    success: true,
    message: 'Día finalizado exitosamente',
    data: saldoDiario
  });
}));

// Función helper para obtener el saldo anterior a una fecha
async function obtenerSaldoAnterior(userId: number, fecha: string): Promise<number> {
  // Calcular la fecha del día anterior
  const fechaActual = new Date(fecha);
  const fechaAnterior = new Date(fechaActual);
  fechaAnterior.setDate(fechaAnterior.getDate() - 1);
  const fechaAnteriorStr = fechaAnterior.toISOString().split('T')[0];

  // Buscar el saldo guardado del día anterior
  const saldoQuery = `
    SELECT saldo_final_dia FROM saldos_diarios
    WHERE usuario_id = ? AND fecha = ?
  `;

  const saldoResult = await executeQuery(saldoQuery, [userId, fechaAnteriorStr]);

  if (saldoResult.length > 0) {
    return saldoResult[0].saldo_final_dia;
  }

  // Si no hay saldo guardado del día anterior, calcularlo desde el principio del mes
  return await calcularSaldoAcumulado(userId, fecha);
}

// Función helper para calcular saldo acumulado desde el inicio del mes
async function calcularSaldoAcumulado(userId: number, fechaHasta: string): Promise<number> {
  const fechaActual = new Date(fechaHasta);
  const primerDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
  const fechaAnterior = new Date(fechaActual);
  fechaAnterior.setDate(fechaAnterior.getDate() - 1);

  // Si la fecha anterior es antes del primer día del mes, devolver 0
  if (fechaAnterior < primerDiaMes) {
    return 0;
  }

  const primerDiaMesStr = primerDiaMes.toISOString().split('T')[0];
  const fechaAnteriorStr = fechaAnterior.toISOString().split('T')[0];

  // Obtener todos los gastos del período
  const gastosQuery = `
    SELECT COALESCE(SUM(monto), 0) as total_gastos
    FROM gastos
    WHERE usuario_id = ? AND fecha >= ? AND fecha <= ?
  `;

  // Obtener todos los ingresos del período
  const ingresosQuery = `
    SELECT COALESCE(SUM(monto), 0) as total_ingresos
    FROM transacciones_quiniela
    WHERE usuario_id = ? AND fecha >= ? AND fecha <= ? AND tipo = 'ingreso'
  `;

  // Obtener todos los egresos de quiniela del período
  const egresosQuery = `
    SELECT COALESCE(SUM(monto), 0) as total_egresos
    FROM transacciones_quiniela
    WHERE usuario_id = ? AND fecha >= ? AND fecha <= ? AND tipo = 'egreso'
  `;

  const [gastosResult, ingresosResult, egresosResult] = await Promise.all([
    executeQuery(gastosQuery, [userId, primerDiaMesStr, fechaAnteriorStr]),
    executeQuery(ingresosQuery, [userId, primerDiaMesStr, fechaAnteriorStr]),
    executeQuery(egresosQuery, [userId, primerDiaMesStr, fechaAnteriorStr])
  ]);

  const totalGastos = gastosResult[0]?.total_gastos || 0;
  const totalIngresos = ingresosResult[0]?.total_ingresos || 0;
  const totalEgresosQuiniela = egresosResult[0]?.total_egresos || 0;

  const saldoAcumulado = totalIngresos - (totalGastos + totalEgresosQuiniela);

  return saldoAcumulado;
}

export default router;
