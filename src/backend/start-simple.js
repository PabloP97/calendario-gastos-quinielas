/**
 * Script simple para iniciar el backend sin TypeScript compilation
 * Usar mientras se configura el entorno completo
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares básicos
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mock auth endpoints para testing
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Verificación básica de formato
  if (email && password && email.includes('@') && password.length >= 6) {
    res.json({
      success: true,
      data: {
        user: {
          id: 1,
          nombre: 'Usuario Prueba',
          email: email,
          numeroQuiniela: '12345',
          ultimo_acceso: new Date().toISOString(),
          fecha_creacion: new Date().toISOString()
        },
        token: 'mock_token_' + Date.now()
      },
      message: 'Login exitoso'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    });
  }
});

app.post('/api/v1/auth/register', (req, res) => {
  const { nombreQuiniela, numeroQuiniela, password } = req.body;
  
  res.json({
    success: true,
    data: {
      user: {
        id: 2,
        nombre: nombreQuiniela,
        email: `${numeroQuiniela}@prueba.com`,
        numeroQuiniela: numeroQuiniela,
        ultimo_acceso: new Date().toISOString(),
        fecha_creacion: new Date().toISOString()
      },
      token: 'mock_token_' + Date.now()
    },
    message: 'Usuario registrado exitosamente'
  });
});

app.get('/api/v1/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    res.json({
      success: true,
      data: {
        id: 1,
        nombre: 'Usuario Prueba',
        email: 'usuario@prueba.com',
        numeroQuiniela: '12345',
        ultimo_acceso: new Date().toISOString(),
        fecha_creacion: new Date().toISOString()
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Token no válido'
    });
  }
});

app.post('/api/v1/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout exitoso'
  });
});

app.post('/api/v1/auth/forgot-password', (req, res) => {
  res.json({
    success: true,
    data: { sent: true },
    message: 'Email de recuperación enviado'
  });
});

// ============================================
// ENDPOINTS DE GASTOS
// ============================================

// Almacenar gastos en memoria para desarrollo
const gastos = [];
let gastoIdCounter = 1;

// GET /api/v1/gastos/:fecha - Obtener gastos por fecha
app.get('/api/v1/gastos/:fecha', (req, res) => {
  const { fecha } = req.params;
  const gastosFecha = gastos.filter(g => g.fecha === fecha);
  
  res.json({
    success: true,
    data: gastosFecha,
    message: 'Gastos obtenidos'
  });
});

// POST /api/v1/gastos - Crear nuevo gasto
app.post('/api/v1/gastos', (req, res) => {
  const { fecha, categoria, subcategoria, monto, descripcion } = req.body;
  
  if (!fecha || !categoria || !monto || !descripcion) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos requeridos: fecha, categoria, monto, descripcion'
    });
  }
  
  const nuevoGasto = {
    id: gastoIdCounter++,
    fecha,
    categoria,
    subcategoria: subcategoria || null,
    monto: parseFloat(monto),
    descripcion,
    fecha_creacion: new Date().toISOString()
  };
  
  gastos.push(nuevoGasto);
  
  res.json({
    success: true,
    data: nuevoGasto,
    message: 'Gasto registrado exitosamente'
  });
});

// PUT /api/v1/gastos/:id - Editar gasto
app.put('/api/v1/gastos/:id', (req, res) => {
  const { id } = req.params;
  const { categoria, subcategoria, monto, descripcion } = req.body;
  
  const gastoIndex = gastos.findIndex(g => g.id === parseInt(id));
  
  if (gastoIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Gasto no encontrado'
    });
  }
  
  // Actualizar gasto
  gastos[gastoIndex] = {
    ...gastos[gastoIndex],
    categoria: categoria || gastos[gastoIndex].categoria,
    subcategoria: subcategoria !== undefined ? subcategoria : gastos[gastoIndex].subcategoria,
    monto: monto ? parseFloat(monto) : gastos[gastoIndex].monto,
    descripcion: descripcion || gastos[gastoIndex].descripcion,
    fecha_actualizacion: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: gastos[gastoIndex],
    message: 'Gasto actualizado exitosamente'
  });
});

// DELETE /api/v1/gastos/:id - Eliminar gasto
app.delete('/api/v1/gastos/:id', (req, res) => {
  const { id } = req.params;
  const gastoIndex = gastos.findIndex(g => g.id === parseInt(id));
  
  if (gastoIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Gasto no encontrado'
    });
  }
  
  gastos.splice(gastoIndex, 1);
  
  res.json({
    success: true,
    message: 'Gasto eliminado exitosamente'
  });
});

// ============================================
// ENDPOINTS DE QUINIELAS
// ============================================

// Almacenar transacciones de quiniela en memoria para desarrollo
const transaccionesQuiniela = [];
let transaccionIdCounter = 1;

// GET /api/v1/quinielas/transacciones/:fecha - Obtener transacciones por fecha
app.get('/api/v1/quinielas/transacciones/:fecha', (req, res) => {
  const { fecha } = req.params;
  const transaccionesFecha = transaccionesQuiniela.filter(t => t.fecha === fecha);
  
  res.json({
    success: true,
    data: transaccionesFecha,
    message: 'Transacciones obtenidas'
  });
});

// POST /api/v1/quinielas/transacciones - Crear nueva transacción
app.post('/api/v1/quinielas/transacciones', (req, res) => {
  const { fecha, juego, monto, tipo, descripcion } = req.body;
  
  if (!fecha || !juego || !monto || !tipo) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos requeridos: fecha, juego, monto, tipo'
    });
  }
  
  const nuevaTransaccion = {
    id: transaccionIdCounter++,
    fecha,
    juego,
    monto: parseFloat(monto),
    tipo, // 'ingreso' o 'egreso'
    descripcion: descripcion || '',
    fecha_creacion: new Date().toISOString()
  };
  
  transaccionesQuiniela.push(nuevaTransaccion);
  
  res.json({
    success: true,
    data: nuevaTransaccion,
    message: 'Transacción registrada exitosamente'
  });
});

// PUT /api/v1/quinielas/transacciones/:id - Editar transacción
app.put('/api/v1/quinielas/transacciones/:id', (req, res) => {
  const { id } = req.params;
  const { juego, monto, tipo, descripcion } = req.body;
  
  const transaccionIndex = transaccionesQuiniela.findIndex(t => t.id === parseInt(id));
  
  if (transaccionIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Transacción no encontrada'
    });
  }
  
  // Actualizar transacción
  transaccionesQuiniela[transaccionIndex] = {
    ...transaccionesQuiniela[transaccionIndex],
    juego: juego || transaccionesQuiniela[transaccionIndex].juego,
    monto: monto ? parseFloat(monto) : transaccionesQuiniela[transaccionIndex].monto,
    tipo: tipo || transaccionesQuiniela[transaccionIndex].tipo,
    descripcion: descripcion !== undefined ? descripcion : transaccionesQuiniela[transaccionIndex].descripcion,
    fecha_actualizacion: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: transaccionesQuiniela[transaccionIndex],
    message: 'Transacción actualizada exitosamente'
  });
});

// DELETE /api/v1/quinielas/transacciones/:id - Eliminar transacción
app.delete('/api/v1/quinielas/transacciones/:id', (req, res) => {
  const { id } = req.params;
  const transaccionIndex = transaccionesQuiniela.findIndex(t => t.id === parseInt(id));
  
  if (transaccionIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Transacción no encontrada'
    });
  }
  
  transaccionesQuiniela.splice(transaccionIndex, 1);
  
  res.json({
    success: true,
    message: 'Transacción eliminada exitosamente'
  });
});

// ============================================
// ENDPOINTS DE SALDOS
// ============================================

// Almacenar días finalizados y saldos en memoria para desarrollo
const diasFinalizados = new Set();
const saldosFinales = new Map(); // fecha -> saldo

// GET /api/v1/saldos/anterior/:fecha - Obtener saldo del día anterior
app.get('/api/v1/saldos/anterior/:fecha', (req, res) => {
  const { fecha } = req.params;
  const fechaAnterior = new Date(fecha);
  fechaAnterior.setDate(fechaAnterior.getDate() - 1);
  const fechaAnteriorStr = fechaAnterior.toISOString().split('T')[0];
  
  const saldoAnterior = saldosFinales.get(fechaAnteriorStr) || 0;
  
  res.json({
    success: true,
    data: { saldo: saldoAnterior },
    message: 'Saldo anterior obtenido'
  });
});

// GET /api/v1/saldos/finalizados - Obtener días finalizados
app.get('/api/v1/saldos/finalizados', (req, res) => {
  res.json({
    success: true,
    data: Array.from(diasFinalizados),
    message: 'Días finalizados obtenidos'
  });
});

// POST /api/v1/saldos/finalizar - Finalizar día
app.post('/api/v1/saldos/finalizar', (req, res) => {
  const { fecha } = req.body;
  
  if (!fecha) {
    return res.status(400).json({
      success: false,
      message: 'Fecha es requerida'
    });
  }
  
  diasFinalizados.add(fecha);
  
  res.json({
    success: true,
    data: { finalizado: true },
    message: 'Día finalizado exitosamente'
  });
});

// POST /api/v1/saldos/guardar - Guardar saldo final del día
app.post('/api/v1/saldos/guardar', (req, res) => {
  const { fecha, saldoFinal } = req.body;
  
  if (!fecha || saldoFinal === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Fecha y saldoFinal son requeridos'
    });
  }
  
  saldosFinales.set(fecha, parseFloat(saldoFinal));
  
  res.json({
    success: true,
    message: 'Saldo final guardado exitosamente'
  });
});

// GET /api/v1/saldos/datos-dia/:fecha - Obtener todos los datos del día
app.get('/api/v1/saldos/datos-dia/:fecha', (req, res) => {
  const { fecha } = req.params;
  
  // Obtener gastos del día
  const gastosFecha = gastos.filter(g => g.fecha === fecha);
  
  // Obtener transacciones de quiniela del día
  const transaccionesFecha = transaccionesQuiniela.filter(t => t.fecha === fecha);
  
  // Obtener saldo anterior
  const fechaAnterior = new Date(fecha);
  fechaAnterior.setDate(fechaAnterior.getDate() - 1);
  const fechaAnteriorStr = fechaAnterior.toISOString().split('T')[0];
  const saldoAnterior = saldosFinales.get(fechaAnteriorStr) || 0;
  
  // Verificar si el día está finalizado
  const estaFinalizado = diasFinalizados.has(fecha);
  
  res.json({
    success: true,
    data: {
      gastos: gastosFecha,
      transaccionesQuiniela: transaccionesFecha,
      saldoAnterior: saldoAnterior,
      estaFinalizado: estaFinalizado
    },
    message: 'Datos del día obtenidos'
  });
});

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend funcionando en http://localhost:${PORT}`);
  console.log(`📡 API disponible en http://localhost:${PORT}/api/v1`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/v1/health`);
});

export default app;