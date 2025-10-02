import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
  acquireTimeout: number;
  timeout: number;
  reconnect: boolean;
}

const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'calendario_gastos',
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
};

// Crear pool de conexiones
export const pool = mysql.createPool({
  ...dbConfig,
  namedPlaceholders: true,
  timezone: 'Z', // UTC
  dateStrings: false,
  supportBigNumbers: true,
  bigNumberStrings: false,
});

// Función para ejecutar queries con manejo de errores
export async function executeQuery<T = any>(
  query: string, 
  params: any[] | Record<string, any> = []
): Promise<T[]> {
  try {
    const [rows] = await pool.execute(query, params);
    return rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
}

// Función para ejecutar queries de inserción que retornan el ID
export async function executeInsert(
  query: string, 
  params: any[] | Record<string, any> = []
): Promise<number> {
  try {
    const [result] = await pool.execute(query, params);
    const insertResult = result as mysql.ResultSetHeader;
    return insertResult.insertId;
  } catch (error) {
    console.error('Database insert error:', error);
    console.error('Query:', query);
    console.error('Params:', params);
    throw error;
  }
}

// Función para verificar la conexión
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    return false;
  }
}

// Función para cerrar el pool de conexiones
export async function closePool(): Promise<void> {
  try {
    await pool.end();
    console.log('🔌 Pool de conexiones cerrado');
  } catch (error) {
    console.error('Error cerrando pool de conexiones:', error);
  }
}