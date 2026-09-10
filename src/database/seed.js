import dotenv from 'dotenv';
dotenv.config();

import { connectDatabase } from './connection.js';
import { seedRoles } from './seeders/role.seeder.js';

const runSeeders = async () => {
  console.log('🌱 [SEEDER] Starting database seeding process...');
  const startTime = Date.now();

  let pool;
  try {
    pool = await connectDatabase();
    if (!pool) {
      console.error('❌ [SEEDER] Failed to initialize database connection.');
      process.exit(1);
    }

    console.log('\n--- Seeding System Roles (SUPERADMIN & ADMIN) ---');
    const roleStats = await seedRoles();
    console.log(
      `✅ [SEEDER:ROLES] Done. Companies evaluated: ${roleStats.companiesCount}, Created: ${roleStats.rolesCreated}, Existing/Skipped: ${roleStats.rolesSkipped}`
    );

    const elapsedMs = Date.now() - startTime;
    console.log(`\n🎉 [SEEDER] Seeding completed successfully in ${elapsedMs}ms.`);
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ [SEEDER] Seeding failed with error:', error.message);
    if (pool) {
      await pool.end().catch(() => {});
    }
    process.exit(1);
  }
};

runSeeders();
