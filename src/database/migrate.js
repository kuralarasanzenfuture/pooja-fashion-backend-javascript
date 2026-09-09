import dotenv from 'dotenv';
dotenv.config();

import { connectDatabase } from './connection.js';
import { runMigrations, getMigrationStatus } from './migrator.js';

const isStatusCheck = process.argv.includes('--status');

const main = async () => {
  try {
    console.log('🚀 Connecting to database for migration...');
    const pool = await connectDatabase();

    if (!pool) {
      console.error('❌ Could not establish database connection.');
      process.exit(1);
    }

    if (isStatusCheck) {
      const status = await getMigrationStatus();
      console.log('\n📊 Migration Status:');
      console.table(status.migrations);
      console.log(`Summary: ${status.applied} applied, ${status.pending} pending of ${status.total} total.`);
    } else {
      const result = await runMigrations();
      console.log(`\nMigration completed: ${result.executed.length} new migrations executed.`);
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration process encountered an error:', error.message);
    process.exit(1);
  }
};

main();
