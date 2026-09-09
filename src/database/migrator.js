import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabasePool } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

/**
 * Ensure the migration tracking table exists
 * @param {object} client - pg pool client
 */
const ensureMigrationTable = async (client) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      batch INTEGER NOT NULL DEFAULT 1,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

/**
 * Get list of already applied migration file names
 * @param {object} client - pg pool client
 * @returns {Promise<Set<string>>}
 */
const getAppliedMigrations = async (client) => {
  const result = await client.query('SELECT name FROM schema_migrations ORDER BY id ASC');
  return new Set(result.rows.map((row) => row.name));
};

/**
 * Get all .sql files in the migrations directory in alphanumeric order
 * @returns {Promise<string[]>}
 */
const getMigrationFiles = async () => {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }

  const files = await fs.promises.readdir(MIGRATIONS_DIR);
  return files
    .filter((file) => file.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
};

/**
 * Run all pending database migrations in transactional batches
 * @returns {Promise<{ total: number, applied: number, executed: string[] }>}
 */
export const runMigrations = async () => {
  const pool = getDatabasePool();
  if (!pool) {
    console.warn('⚠️ [MIGRATIONS] Database pool is not initialized. Skipping migrations.');
    return { total: 0, applied: 0, executed: [] };
  }

  const client = await pool.connect();

  try {
    await ensureMigrationTable(client);

    const [allFiles, appliedSet] = await Promise.all([
      getMigrationFiles(),
      getAppliedMigrations(client),
    ]);

    const pendingFiles = allFiles.filter((file) => !appliedSet.has(file));

    if (pendingFiles.length === 0) {
      console.log(`✅ [MIGRATIONS] Database schema is up to date (${appliedSet.size} migrations applied).`);
      return { total: allFiles.length, applied: appliedSet.size, executed: [] };
    }

    // Determine the next batch number
    const batchResult = await client.query(
      'SELECT COALESCE(MAX(batch), 0) + 1 AS next_batch FROM schema_migrations'
    );
    const nextBatch = Number(batchResult.rows[0]?.next_batch || 1);

    console.log(
      `🚀 [MIGRATIONS] Found ${pendingFiles.length} pending migration(s) (Batch #${nextBatch}). Applying...`
    );

    const executed = [];

    for (const file of pendingFiles) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sqlContent = await fs.promises.readFile(filePath, 'utf8');

      console.log(`⏳ [MIGRATIONS] Running ${file}...`);

      try {
        await client.query('BEGIN');
        await client.query(sqlContent);
        await client.query('INSERT INTO schema_migrations (name, batch) VALUES ($1, $2)', [
          file,
          nextBatch,
        ]);
        await client.query('COMMIT');

        console.log(`✅ [MIGRATIONS] Applied: ${file}`);
        executed.push(file);
      } catch (migrationError) {
        await client.query('ROLLBACK');
        console.error(`❌ [MIGRATIONS] Error applying ${file}:`, migrationError.message);
        throw migrationError;
      }
    }

    console.log(
      `🎉 [MIGRATIONS] All ${executed.length} pending migration(s) executed successfully.`
    );

    return {
      total: allFiles.length,
      applied: appliedSet.size + executed.length,
      executed,
    };
  } finally {
    client.release();
  }
};

/**
 * Retrieve status of all migrations (applied and pending)
 */
export const getMigrationStatus = async () => {
  const pool = getDatabasePool();
  if (!pool) {
    return { error: 'Database pool not initialized' };
  }

  const client = await pool.connect();
  try {
    await ensureMigrationTable(client);

    const [allFiles, appliedResult] = await Promise.all([
      getMigrationFiles(),
      client.query('SELECT name, batch, executed_at FROM schema_migrations ORDER BY id ASC'),
    ]);

    const appliedMap = new Map(appliedResult.rows.map((row) => [row.name, row]));

    const status = allFiles.map((file) => {
      const applied = appliedMap.get(file);
      return {
        file,
        status: applied ? 'applied' : 'pending',
        batch: applied ? applied.batch : null,
        executedAt: applied ? applied.executed_at : null,
      };
    });

    return {
      total: allFiles.length,
      applied: appliedMap.size,
      pending: allFiles.length - appliedMap.size,
      migrations: status,
    };
  } finally {
    client.release();
  }
};

export default {
  runMigrations,
  getMigrationStatus,
};
