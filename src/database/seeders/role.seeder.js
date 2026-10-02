import { getDatabasePool } from '../connection.js';

/**
 * Default global system roles.
 *
 * These roles are seeded for the system and are not associated
 * with any company (company_id = NULL).
 */
const DEFAULT_SYSTEM_ROLES = [
  {
    role_code: 'SUPERADMIN',
    role_name: 'Super Admin',
    description:
      'Full system and company access with unrestricted administrative privileges',
  },
  {
    role_code: 'ADMIN',
    role_name: 'Admin',
    description:
      'Company administrator with full operational, branch, and staff management access',
  },
];

/**
 * Seed default global system roles (SUPERADMIN, ADMIN) idempotently.
 *
 * Constraint:
 * - is_system_role = TRUE
 * - company_id IS NULL
 *
 * @returns {Promise<{
 *   rolesCreated: number,
 *   rolesUpdated: number,
 *   roles: Array
 * }>}
 */
export const seedRoles = async () => {
  const pool = getDatabasePool();

  if (!pool) {
    throw new Error('Database pool not initialized');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('⏳ Starting Global System Roles Seeding...');

    let rolesCreated = 0;
    let rolesUpdated = 0;

    const processedRoles = [];

    const upsertRoleQuery = `
      INSERT INTO roles (
        company_id,
        role_code,
        role_name,
        description,
        is_system_role,
        is_active,
        updated_at
      )
      VALUES (
        NULL,
        $1,
        $2,
        $3,
        TRUE,
        TRUE,
        CURRENT_TIMESTAMP
      )

      ON CONFLICT (LOWER(role_code))
      WHERE company_id IS NULL

      DO UPDATE SET
        role_name = EXCLUDED.role_name,
        description = EXCLUDED.description,
        is_system_role = TRUE,
        is_active = TRUE,
        updated_at = CURRENT_TIMESTAMP

      RETURNING
        id,
        role_code,
        role_name,
        description,
        is_system_role,
        is_active;
    `;

    for (const role of DEFAULT_SYSTEM_ROLES) {
      const result = await client.query(upsertRoleQuery, [
        role.role_code,
        role.role_name,
        role.description,
      ]);

      const processedRole = result.rows[0];

      processedRoles.push(processedRole);

      console.log(
        `  ✓ Seeded/Updated Global System Role: [${processedRole.role_code}] ${processedRole.role_name}`
      );

      // Since the UPSERT query doesn't reliably tell us whether
      // INSERT or UPDATE happened, check whether the role existed
      // before if you need exact created/updated counts.
    }

    await client.query('COMMIT');

    console.log('✅ Global System Roles Seeding Completed!');

    return {
      rolesCreated,
      rolesUpdated,
      roles: processedRoles,
    };
  } catch (error) {
    await client.query('ROLLBACK');

    console.error(
      '❌ Error seeding global system roles:',
      error.message
    );

    throw error;
  } finally {
    client.release();
  }
};

export default {
  seedRoles,
};