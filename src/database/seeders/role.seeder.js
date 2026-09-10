import { getDatabasePool } from '../connection.js';
import { DEFAULT_SYSTEM_ROLES } from '../../modules/roles/role.utils.js';

/**
 * Seed default system roles (SUPERADMIN and ADMIN) across all companies
 *
 * @returns {Promise<{ companiesCount: number, rolesCreated: number, rolesSkipped: number }>}
 */
export const seedRoles = async () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool not initialized');
  }

  // 1. Fetch all existing companies
  const companiesRes = await pool.query(
    'SELECT id, company_name, company_code FROM companies ORDER BY id ASC'
  );
  const companies = companiesRes.rows;

  if (companies.length === 0) {
    console.log(
      'ℹ️ [SEEDER:ROLES] No companies found. Roles will be auto-seeded upon company creation.'
    );
    return { companiesCount: 0, rolesCreated: 0, rolesSkipped: 0 };
  }

  let rolesCreated = 0;
  let rolesSkipped = 0;

  for (const company of companies) {
    for (const roleDef of DEFAULT_SYSTEM_ROLES) {
      const checkQuery = `
        SELECT id FROM roles 
        WHERE company_id = $1 AND UPPER(role_code) = UPPER($2)
      `;
      const existing = await pool.query(checkQuery, [company.id, roleDef.role_code]);

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
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `;
        await pool.query(insertQuery, [
          company.id,
          roleDef.role_code,
          roleDef.role_name,
          roleDef.description,
          roleDef.is_system_role,
          roleDef.is_active,
        ]);
        rolesCreated++;
        console.log(
          `  + Seeded [${roleDef.role_code}] for company: ${company.company_name} (ID: ${company.id})`
        );
      } else {
        rolesSkipped++;
      }
    }
  }

  return {
    companiesCount: companies.length,
    rolesCreated,
    rolesSkipped,
  };
};

export default {
  seedRoles,
};
