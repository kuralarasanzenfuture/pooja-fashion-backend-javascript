import pkg from 'pg';
import databaseConfig from '../config/database.js';

const { Pool } = pkg;

let pool = null;

export const connectDatabase = async () => {
  if (!databaseConfig?.host || !databaseConfig?.user || !databaseConfig?.database) {
    console.warn('Database configuration is incomplete. Skipping DB connection.');
    return null;
  }

  try {
    pool = new Pool({
      host: databaseConfig.host,
      port: databaseConfig.port,
      user: databaseConfig.user,
      password: databaseConfig.password,
      database: databaseConfig.database,
      max: databaseConfig.pool?.max || 10,
      idleTimeoutMillis: databaseConfig.pool?.idle || 10000,
      connectionTimeoutMillis: databaseConfig.pool?.acquire || 30000,
    });

    const result = await pool.query('SELECT 1 AS db_ok');
    console.log('Database connected successfully.', result.rows[0]);
    return pool;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  }
};

export const getDatabasePool = () => pool;

export default {
  connectDatabase,
  getDatabasePool,
};
