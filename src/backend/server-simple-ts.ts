/**
 * Servidor TypeScript simplificado para desarrollo
 * Usar cuando el servidor complejo tenga problemas de configuración
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    message: 'Backend TypeScript funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mock auth endpoints
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@demo.com' && password === 'demo123') {
    res.json({
      success: true,
      data: {
        user: {
          id: 1,
          nombre: 'Usuario Demo TS',
          email: 'admin@demo.com',
          numeroQuiniela: '12345',
          ultimo_acceso: new Date().toISOString(),
          fecha_creacion: '2024-01-01T00:00:00.000Z'
        },
        token: 'mock_token_ts_' + Date.now()
      },
      message: 'Login exitoso con TypeScript'
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
        email: `${numeroQuiniela}@demo.com`,
        numeroQuiniela: numeroQuiniela,
        ultimo_acceso: new Date().toISOString(),
        fecha_creacion: new Date().toISOString()
      },
      token: 'mock_token_ts_' + Date.now()
    },
    message: 'Usuario registrado exitosamente con TypeScript'
  });
});

app.get('/api/v1/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    res.json({
      success: true,
      data: {
        id: 1,
        nombre: 'Usuario Demo TS',
        email: 'admin@demo.com',
        numeroQuiniela: '12345',
        ultimo_acceso: new Date().toISOString(),
        fecha_creacion: '2024-01-01T00:00:00.000Z'
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

// Almacenar datos en memoria para el demo
const gastos: any[] = [];
const transaccionesQuiniela: any[] = [];
const diasFinalizados = new Set<string>();
const saldosFinales = new Map<string, number>();

let gastoIdCounter = 1;
let transaccionIdCounter = 1;

// Endpoints de gastos
app.get('/api/v1/gastos/:fecha', (req, res) => {
  const { fecha } = req.params;
  const gastosFecha = gastos.filter(g => g.fecha === fecha);
  
  res.json({
    success: true,
    data: gastosFecha,
    message: 'Gastos obtenidos (TypeScript)'
  });
});

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
    message: 'Gasto registrado exitosamente (TypeScript)'
  });
});

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

// Endpoints de quinielas
app.get('/api/v1/quinielas/transacciones/:fecha', (req, res) => {
  const { fecha } = req.params;
  const transaccionesFecha = transaccionesQuiniela.filter(t => t.fecha === fecha);
  
  res.json({
    success: true,
    data: transaccionesFecha,
    message: 'Transacciones obtenidas (TypeScript)'
  });
});

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
    tipo,
    descripcion: descripcion || '',
    fecha_creacion: new Date().toISOString()
  };
  
  transaccionesQuiniela.push(nuevaTransaccion);
  
  res.json({
    success: true,
    data: nuevaTransaccion,
    message: 'Transacción registrada exitosamente (TypeScript)'
  });
});

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

// Endpoints de saldos
app.get('/api/v1/saldos/anterior/:fecha', (req, res) => {
  const { fecha } = req.params;
  const fechaAnterior = new Date(fecha);
  fechaAnterior.setDate(fechaAnterior.getDate() - 1);
  const fechaAnteriorStr = fechaAnterior.toISOString().split('T')[0];
  
  const saldoAnterior = saldosFinales.get(fechaAnteriorStr) || 0;
  
  res.json({
    success: true,
    data: { saldo: saldoAnterior },
    message: 'Saldo anterior obtenido (TypeScript)'
  });
});

app.get('/api/v1/saldos/finalizados', (req, res) => {
  res.json({
    success: true,
    data: Array.from(diasFinalizados),
    message: 'Días finalizados obtenidos (TypeScript)'
  });
});

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
    message: 'Día finalizado exitosamente (TypeScript)'
  });
});

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
    message: 'Saldo final guardado exitosamente (TypeScript)'
  });
});

app.get('/api/v1/saldos/datos-dia/:fecha', (req, res) => {
  const { fecha } = req.params;
  
  const gastosFecha = gastos.filter(g => g.fecha === fecha);
  const transaccionesFecha = transaccionesQuiniela.filter(t => t.fecha === fecha);
  
  const fechaAnterior = new Date(fecha);
  fechaAnterior.setDate(fechaAnterior.getDate() - 1);
  const fechaAnteriorStr = fechaAnterior.toISOString().split('T')[0];
  const saldoAnterior = saldosFinales.get(fechaAnteriorStr) || 0;
  
  const estaFinalizado = diasFinalizados.has(fecha);
  
  res.json({
    success: true,
    data: {
      gastos: gastosFecha,
      transaccionesQuiniela: transaccionesFecha,
      saldoAnterior: saldoAnterior,
      estaFinalizado: estaFinalizado
    },
    message: 'Datos del día obtenidos (TypeScript)'
  });
});

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl} (Backend TypeScript)`
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend TypeScript funcionando en http://localhost:${PORT}`);
  console.log(`📡 API disponible en http://localhost:${PORT}/api/v1`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`\n📝 Credenciales demo:`);
  console.log(`   Email: admin@demo.com`);
  console.log(`   Password: demo123`);
  console.log(`\n✨ Ejecutándose con TypeScript (ES Modules)`);
});

export default app;