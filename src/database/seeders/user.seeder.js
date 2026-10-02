import { getDatabasePool } from '../connection.js';
import { hashPassword } from '../../modules/users/user.utils.js';

/**
 * Default System Employees
 *
 * Employees are seeded at company level without being pinned to a single branch (branch_id = null)
 * so that administrators have enterprise-wide / cross-branch scope.
 */
const DEFAULT_EMPLOYEES = [
  {
    employeeCode: 'EMP-0001',
    firstName: 'Super',
    lastName: 'Administrator',
    displayName: 'Super Admin',
    email: 'superadmin@poojafashion.com',
    phone: '+919999900001',
    designation: 'Chief Technology Officer / Super Admin',
    department: 'Executive Management',
    employmentType: 'full_time',
    employmentStatus: 'active',
    city: 'Hosur',
    state: 'Tamil Nadu',
    country: 'India',
  },
  {
    employeeCode: 'EMP-0002',
    firstName: 'System',
    lastName: 'Administrator',
    displayName: 'System Admin',
    email: 'admin@poojafashion.com',
    phone: '+919999900002',
    designation: 'General Manager / Administrator',
    department: 'Operations & Management',
    employmentType: 'full_time',
    employmentStatus: 'active',
    city: 'Hosur',
    state: 'Tamil Nadu',
    country: 'India',
  },
];

/**
 * Default Global System Users
 *
 * SuperAdmin and Admin are Global Platform Administrators:
 * - company_id = NULL -> Cross-company access (can see and manage all companies)
 * - branch_id  = NULL -> Cross-branch access (can see and manage all branches)
 *
 * Roles:
 * - SUPERADMIN
 * - ADMIN
 */
const DEFAULT_SYSTEM_USERS = [
  {
    username: 'superadmin',
    email: 'superadmin@poojafashion.com',
    phone: '+919999900001',
    rawPassword: 'SuperAdmin@123',
    roleCode: 'SUPERADMIN',
    employeeCode: 'EMP-0001',
  },
  {
    username: 'admin',
    email: 'admin@poojafashion.com',
    phone: '+919999900002',
    rawPassword: 'Admin@123',
    roleCode: 'ADMIN',
    employeeCode: 'EMP-0002',
  },
];

/**
 * Seed global system users and initial company employees idempotently.
 *
 * SuperAdmin and Admin users are created with:
 * - company_id = NULL (Unrestricted cross-company access)
 * - branch_id  = NULL (Unrestricted cross-branch access)
 *
 * @param {object} options
 * @param {string|number} [options.companyId]
 * @param {string|number} [options.branchId]
 * @returns {Promise<{ usersCreated: number, usersUpdated: number, users: Array, employees: Array }>}
 */
export const seedUsers = async ({ companyId = null, branchId = null } = {}) => {
  const pool = getDatabasePool();

  if (!pool) {
    throw new Error('Database pool not initialized');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Ensure company_id is nullable on users table for global system accounts
    await client.query('ALTER TABLE users ALTER COLUMN company_id DROP NOT NULL');
    await client.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS uq_users_global_username ON users (LOWER(username)) WHERE company_id IS NULL'
    );

    console.log('⏳ Starting Global System Users & Employees Seeding...');

    let targetCompanyId = companyId;

    if (!targetCompanyId) {
      const compRes = await client.query('SELECT id FROM companies ORDER BY id ASC LIMIT 1');
      if (compRes.rows.length > 0) {
        targetCompanyId = compRes.rows[0].id;
      }
    }

    let usersCreated = 0;
    let usersUpdated = 0;

    const seededUsers = [];
    const seededEmployees = [];

    /**
     * 1. Seed Company Employees if companyId exists
     * Set branch_id = NULL so employees have cross-branch / corporate scope
     */
    const employeeMap = new Map();

    if (targetCompanyId) {
      for (const empDef of DEFAULT_EMPLOYEES) {
        const existingEmpRes = await client.query(
          `SELECT id FROM employees WHERE company_id = $1 AND employee_code = $2 LIMIT 1`,
          [targetCompanyId, empDef.employeeCode]
        );

        let emp;
        if (existingEmpRes.rows.length === 0) {
          const insertEmpQuery = `
            INSERT INTO employees (
              company_id,
              branch_id,
              employee_code,
              first_name,
              last_name,
              display_name,
              email,
              phone,
              designation,
              department,
              employment_type,
              employment_status,
              city,
              state,
              country
            )
            VALUES (
              $1, NULL, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
            )
            RETURNING *;
          `;
          const empResult = await client.query(insertEmpQuery, [
            targetCompanyId,
            empDef.employeeCode,
            empDef.firstName,
            empDef.lastName,
            empDef.displayName,
            empDef.email,
            empDef.phone,
            empDef.designation,
            empDef.department,
            empDef.employmentType,
            empDef.employmentStatus,
            empDef.city,
            empDef.state,
            empDef.country,
          ]);
          emp = empResult.rows[0];
          console.log(`  + Seeded Employee: [${emp.employee_code}] ${emp.display_name} (All Branches)`);
        } else {
          const updateEmpQuery = `
            UPDATE employees SET
              branch_id = NULL,
              first_name = $2,
              last_name = $3,
              display_name = $4,
              email = $5,
              phone = $6,
              designation = $7,
              department = $8,
              employment_type = $9,
              employment_status = $10,
              city = $11,
              state = $12,
              country = $13,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *;
          `;
          const empResult = await client.query(updateEmpQuery, [
            existingEmpRes.rows[0].id,
            empDef.firstName,
            empDef.lastName,
            empDef.displayName,
            empDef.email,
            empDef.phone,
            empDef.designation,
            empDef.department,
            empDef.employmentType,
            empDef.employmentStatus,
            empDef.city,
            empDef.state,
            empDef.country,
          ]);
          emp = empResult.rows[0];
          console.log(`  • Updated Employee: [${emp.employee_code}] ${emp.display_name} (All Branches)`);
        }

        seededEmployees.push(emp);
        employeeMap.set(empDef.employeeCode, emp.id);
      }
    }

    /**
     * 2. Resolve system role IDs (Global roles have company_id IS NULL)
     */
    const roleResult = await client.query(`
      SELECT id, role_code
      FROM roles
      WHERE company_id IS NULL
        AND role_code IN ('SUPERADMIN', 'ADMIN')
        AND is_system_role = TRUE
        AND is_active = TRUE
    `);

    const roleMap = new Map(roleResult.rows.map((role) => [role.role_code.toUpperCase(), role.id]));

    /**
     * Make sure required system roles exist.
     */
    for (const userDef of DEFAULT_SYSTEM_USERS) {
      if (!roleMap.has(userDef.roleCode)) {
        throw new Error(
          `System role '${userDef.roleCode}' not found. Please run role seeder first.`
        );
      }
    }

    /**
     * 3. Seed users with company_id = NULL and branch_id = NULL (All Companies & All Branches)
     */
    for (const userDef of DEFAULT_SYSTEM_USERS) {
      const roleId = roleMap.get(userDef.roleCode);
      const passwordHash = await hashPassword(userDef.rawPassword);
      const employeeId = employeeMap.get(userDef.employeeCode) || null;

      const existingUserResult = await client.query(
        `
          SELECT id, company_id, branch_id
          FROM users
          WHERE LOWER(username) = LOWER($1)
          LIMIT 1
        `,
        [userDef.username]
      );

      const userExists = existingUserResult.rows.length > 0;
      let user;

      if (userExists) {
        const updateQuery = `
          UPDATE users SET
            company_id = NULL,
            branch_id = NULL,
            employee_id = COALESCE($2, employee_id),
            role_id = $3,
            email = $4,
            phone = $5,
            password_hash = $6,
            status = 'active',
            is_email_verified = TRUE,
            is_phone_verified = TRUE,
            must_change_password = FALSE,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING
            id,
            company_id,
            branch_id,
            employee_id,
            role_id,
            username,
            email,
            phone,
            status;
        `;
        const result = await client.query(updateQuery, [
          existingUserResult.rows[0].id,
          employeeId,
          roleId,
          userDef.email,
          userDef.phone,
          passwordHash,
        ]);
        user = result.rows[0];
        usersUpdated++;

        console.log(
          `  • Updated User: [${userDef.roleCode}] ` +
            `username='${userDef.username}', ` +
            `email='${userDef.email}' ` +
            `(ID: ${user.id}) [Scope: All Companies & All Branches]`
        );
      } else {
        const insertQuery = `
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
            token_version,
            updated_at
          )
          VALUES (
            NULL,
            NULL,
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            'active',
            TRUE,
            TRUE,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            FALSE,
            1,
            CURRENT_TIMESTAMP
          )
          RETURNING
            id,
            company_id,
            branch_id,
            employee_id,
            role_id,
            username,
            email,
            phone,
            status;
        `;
        const result = await client.query(insertQuery, [
          employeeId,
          roleId,
          userDef.username,
          userDef.email,
          userDef.phone,
          passwordHash,
        ]);
        user = result.rows[0];
        usersCreated++;

        console.log(
          `  + Seeded User: [${userDef.roleCode}] ` +
            `username='${userDef.username}', ` +
            `email='${userDef.email}' ` +
            `(ID: ${user.id}) [Scope: All Companies & All Branches]`
        );
      }

      seededUsers.push({
        ...user,
        role_code: userDef.roleCode,
      });
    }

    await client.query('COMMIT');

    console.log(
      `✅ Global System Users Seeding Completed! ` +
        `(Created: ${usersCreated}, Updated: ${usersUpdated}) [All Companies & Branches]`
    );

    return {
      usersCreated,
      usersUpdated,
      users: seededUsers,
      employees: seededEmployees,
    };
  } catch (error) {
    await client.query('ROLLBACK');

    console.error('❌ Error seeding system users:', error.message);

    throw error;
  } finally {
    client.release();
  }
};

export default {
  seedUsers,
};
