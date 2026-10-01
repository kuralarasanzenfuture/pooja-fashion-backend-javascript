import { getDatabasePool } from '../connection.js';
import { hashPassword } from '../../modules/users/user.utils.js';

/**
 * Seed default Admin and Superadmin users and their employee records idempotently.
 *
 * Accounts seeded:
 * 1. Super Admin:
 *    - Username: superadmin
 *    - Email: superadmin@poojafashion.com
 *    - Phone: +919999900001
 *    - Default Password: SuperAdmin@123
 *    - Role: SUPERADMIN (Global System Role)
 *
 * 2. Admin:
 *    - Username: admin
 *    - Email: admin@poojafashion.com
 *    - Phone: +919999900002
 *    - Default Password: Admin@123
 *    - Role: ADMIN (Global System Role)
 *
 * @param {Object} [options]
 * @param {number|string} [options.companyId]
 * @param {number|string} [options.branchId]
 * @returns {Promise<{ users: Array, employees: Array }>}
 */
export const seedUsers = async (options = {}) => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool not initialized');
  }

  // 1. Resolve Company
  let companyId = options.companyId;
  if (!companyId) {
    const compRes = await pool.query(
      `SELECT id FROM companies WHERE company_code = 'PFS001' ORDER BY id ASC LIMIT 1`
    );
    if (compRes.rowCount === 0) {
      throw new Error(
        'Company PFS001 not found. Please run company seeder before user seeder.'
      );
    }
    companyId = compRes.rows[0].id;
  }

  // 2. Resolve Head Office Branch
  let branchId = options.branchId;
  if (!branchId) {
    const branchRes = await pool.query(
      `SELECT id FROM branches WHERE company_id = $1 AND (branch_code = 'PFS-HO' OR is_main_branch = TRUE) LIMIT 1`,
      [companyId]
    );
    if (branchRes.rowCount > 0) {
      branchId = branchRes.rows[0].id;
    }
  }

  // 3. Resolve Roles (SUPERADMIN & ADMIN)
  const superAdminRoleRes = await pool.query(
    `SELECT id, role_code FROM roles WHERE role_code = 'SUPERADMIN' AND company_id IS NULL LIMIT 1`
  );
  const adminRoleRes = await pool.query(
    `SELECT id, role_code FROM roles WHERE role_code = 'ADMIN' AND company_id IS NULL LIMIT 1`
  );

  const superAdminRoleId = superAdminRoleRes.rows[0]?.id || null;
  const adminRoleId = adminRoleRes.rows[0]?.id || null;

  if (!superAdminRoleId || !adminRoleId) {
    throw new Error(
      'System roles (SUPERADMIN / ADMIN) not found. Please run role seeder first.'
    );
  }

  // 4. Seed Employees for Admin and Superadmin
  const employeeDefs = [
    {
      employee_code: 'EMP-0001',
      first_name: 'Super',
      last_name: 'Administrator',
      display_name: 'Super Admin',
      email: 'superadmin@poojafashion.com',
      phone: '+919999900001',
      designation: 'Chief Technology Officer / Super Admin',
      department: 'Executive Management',
    },
    {
      employee_code: 'EMP-0002',
      first_name: 'System',
      last_name: 'Administrator',
      display_name: 'System Admin',
      email: 'admin@poojafashion.com',
      phone: '+919999900002',
      designation: 'General Manager / Administrator',
      department: 'Operations & Management',
    },
  ];

  const seededEmployees = {};

  for (const empDef of employeeDefs) {
    const existingEmp = await pool.query(
      `SELECT * FROM employees WHERE company_id = $1 AND employee_code = $2 LIMIT 1`,
      [companyId, empDef.employee_code]
    );

    if (existingEmp.rowCount === 0) {
      const insertEmpQuery = `
        INSERT INTO employees (
          company_id, branch_id, employee_code, first_name, last_name,
          display_name, email, phone, designation, department,
          employment_type, employment_status, city, state, country
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          'full_time', 'active', 'Hosur', 'Tamil Nadu', 'India'
        )
        RETURNING *;
      `;
      const res = await pool.query(insertEmpQuery, [
        companyId,
        branchId,
        empDef.employee_code,
        empDef.first_name,
        empDef.last_name,
        empDef.display_name,
        empDef.email,
        empDef.phone,
        empDef.designation,
        empDef.department,
      ]);
      seededEmployees[empDef.employee_code] = res.rows[0];
      console.log(`  + Seeded Employee: [${empDef.employee_code}] ${empDef.display_name} (ID: ${res.rows[0].id})`);
    } else {
      seededEmployees[empDef.employee_code] = existingEmp.rows[0];
      console.log(`  • Existing Employee: [${empDef.employee_code}] ${empDef.display_name} (ID: ${existingEmp.rows[0].id}) (Skipped)`);
    }
  }

  // 5. Seed Users
  const userDefs = [
    {
      username: 'superadmin',
      email: 'superadmin@poojafashion.com',
      phone: '+919999900001',
      // rawPassword: 'SuperAdmin@123',
      rawPassword: '123456',
      role_id: superAdminRoleId,
      role_code: 'SUPERADMIN',
      employee_id: seededEmployees['EMP-0001']?.id || null,
      must_change_password: false,
    },
    {
      username: 'admin',
      email: 'admin@poojafashion.com',
      phone: '+919999900002',
      rawPassword: '123456',
      role_id: adminRoleId,
      role_code: 'ADMIN',
      employee_id: seededEmployees['EMP-0002']?.id || null,
      must_change_password: false,
    },
  ];

  const seededUsers = [];

  for (const uDef of userDefs) {
    const existingUser = await pool.query(
      `SELECT * FROM users WHERE company_id = $1 AND LOWER(username) = LOWER($2) LIMIT 1`,
      [companyId, uDef.username]
    );

    if (existingUser.rowCount === 0) {
      const passwordHash = await hashPassword(uDef.rawPassword);
      const insertUserQuery = `
        INSERT INTO users (
          company_id,
          branch_id,
          employee_id,
          role_id,
          username,
          email,
          phone,
          password_hash,
          status,
          is_email_verified,
          is_phone_verified,
          email_verified_at,
          phone_verified_at,
          must_change_password,
          token_version
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          'active', TRUE, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $9, 1
        )
        RETURNING id, company_id, branch_id, employee_id, role_id, username, email, phone, status;
      `;

      const res = await pool.query(insertUserQuery, [
        companyId,
        branchId,
        uDef.employee_id,
        uDef.role_id,
        uDef.username,
        uDef.email,
        uDef.phone,
        passwordHash,
        uDef.must_change_password,
      ]);

      const newUser = res.rows[0];
      seededUsers.push(newUser);
      console.log(
        `  + Seeded User: [${uDef.role_code}] username='${uDef.username}', email='${uDef.email}', default pass='${uDef.rawPassword}' (ID: ${newUser.id})`
      );
    } else {
      const existing = existingUser.rows[0];
      seededUsers.push(existing);
      console.log(
        `  • Existing User: [${uDef.role_code}] username='${uDef.username}' (ID: ${existing.id}) (Skipped)`
      );
    }
  }

  return {
    users: seededUsers,
    employees: Object.values(seededEmployees),
  };
};

export default {
  seedUsers,
};
