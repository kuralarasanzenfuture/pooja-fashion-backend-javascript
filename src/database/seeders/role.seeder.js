import { getDatabasePool } from '../connection.js';
import { DEFAULT_SYSTEM_ROLES } from '../../modules/roles/role.utils.js';

/**
 * Seed default system roles (SUPERADMIN and ADMIN) globally
 * In accordance with chk_roles_system_scope:
 * System roles are global (company_id IS NULL) and inherited by all tenant companies.
 *
 * @returns {Promise<{ rolesCreated: number, rolesSkipped: number, roles: Array }>}
 */
export const seedRoles = async () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool not initialized');
  }

  let rolesCreated = 0;
  let rolesSkipped = 0;
  const processedRoles = [];

  for (const roleDef of DEFAULT_SYSTEM_ROLES) {
    const checkQuery = `
      SELECT id, role_code, role_name FROM roles 
      WHERE company_id IS NULL AND LOWER(role_code) = LOWER($1)
    `;
    const existing = await pool.query(checkQuery, [roleDef.role_code]);

    if (existing.rowCount === 0) {
      const insertQuery = `
        INSERT INTO roles (
          company_id,
          role_code,
          role_name,
          description,
          is_system_role,
          is_active
        )
        VALUES (NULL, $1, $2, $3, TRUE, TRUE)
        RETURNING id, role_code, role_name
      `;
      const res = await pool.query(insertQuery, [
        roleDef.role_code,
        roleDef.role_name,
        roleDef.description,
      ]);
      rolesCreated++;
      processedRoles.push(res.rows[0]);
      console.log(`  + Seeded Global System Role: [${roleDef.role_code}] (${roleDef.role_name})`);
    } else {
      rolesSkipped++;
      processedRoles.push(existing.rows[0]);
      console.log(`  • Existing Global System Role: [${roleDef.role_code}] (Skipped)`);
    }
  }

  return {
    rolesCreated,
    rolesSkipped,
    roles: processedRoles,
  };
};

export default {
  seedRoles,
};
