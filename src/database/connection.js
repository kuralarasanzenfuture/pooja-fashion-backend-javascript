import pkg from 'pg';
import databaseConfig from '../config/database.js';

const { Pool, Client } = pkg;

let pool = null;

export const ensureDatabaseExists = async (config = databaseConfig) => {
  if (!config?.host || !config?.user || !config?.database) {
    return;
  }

  const targetDb = config.database;
  const isPostgres = (config.dialect || 'postgres') === 'postgres';

  if (isPostgres) {
    const defaultDbs = ['postgres', 'template1'];
    let createdOrChecked = false;

    for (const maintenanceDb of defaultDbs) {
      const adminClient = new Client({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: maintenanceDb,
      });

      try {
        await adminClient.connect();

        const checkQuery = 'SELECT 1 FROM pg_database WHERE datname = $1';
        const checkRes = await adminClient.query(checkQuery, [targetDb]);

        if (checkRes.rowCount === 0) {
          console.log(`ℹ️ Database "${targetDb}" does not exist. Auto-creating...`);
          const safeDbName = targetDb.replace(/"/g, '""');
          await adminClient.query(`CREATE DATABASE "${safeDbName}"`);
          console.log(`✅ Database "${targetDb}" created successfully.`);
        } else {
          console.log(`✅ Database "${targetDb}" verified.`);
        }

        createdOrChecked = true;
        await adminClient.end();
        break;
      } catch (err) {
        try {
          await adminClient.end();
        } catch {
          // ignore disconnect errors
        }

        // If the maintenance database doesn't exist, try the next one
        if (err.code === '3D000') {
          continue;
        }

        console.warn(`⚠️ Could not auto-check/create PostgreSQL database "${targetDb}":`, err.message);
        break;
      }
    }

    if (!createdOrChecked) {
      console.warn(`⚠️ Unable to connect to default maintenance DB to verify "${targetDb}".`);
    }
  } else {
    // MySQL auto-create support
    try {
      const mysql = await import('mysql2/promise');
      const connection = await mysql.createConnection({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
      });

      const safeDbName = targetDb.replace(/`/g, '``');
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${safeDbName}\``);
      console.log(`✅ MySQL database "${targetDb}" verified/created.`);
      await connection.end();
    } catch (err) {
      console.warn(`⚠️ Could not auto-create MySQL database "${targetDb}":`, err.message);
    }
  }
};

export const connectDatabase = async () => {
  if (!databaseConfig?.host || !databaseConfig?.user || !databaseConfig?.database) {
    console.warn('Database configuration is incomplete. Skipping DB connection.');
    return null;
  }

  // Auto create database if it does not exist
  await ensureDatabaseExists(databaseConfig);

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
  ensureDatabaseExists,
  connectDatabase,
  getDatabasePool,
};
