import { getDatabasePool } from '../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

/**
 * Find paginated list of employees with multi-tenant filtering, branch/company joins, and search
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  search,
  companyId,
  branchId,
  department,
  employmentStatus,
  employmentType,
  sortBy = 'id',
  sortOrder = 'ASC',
} = {}) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (companyId !== null && companyId !== undefined) {
    conditions.push(`e.company_id = $${paramIndex++}`);
    values.push(companyId);
  }

  if (branchId !== null && branchId !== undefined) {
    conditions.push(`e.branch_id = $${paramIndex++}`);
    values.push(branchId);
  }

  if (department) {
    conditions.push(`e.department ILIKE $${paramIndex++}`);
    values.push(department);
  }

  if (employmentStatus) {
    conditions.push(`e.employment_status = $${paramIndex++}`);
    values.push(employmentStatus);
  }

  if (employmentType) {
    conditions.push(`e.employment_type = $${paramIndex++}`);
    values.push(employmentType);
  }

  if (search) {
    conditions.push(
      `(e.first_name ILIKE $${paramIndex} OR e.last_name ILIKE $${paramIndex} OR e.display_name ILIKE $${paramIndex} OR e.employee_code ILIKE $${paramIndex} OR e.email ILIKE $${paramIndex} OR e.phone ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'e.id',
    employee_code: 'e.employee_code',
    first_name: 'e.first_name',
    last_name: 'e.last_name',
    display_name: 'e.display_name',
    email: 'e.email',
    phone: 'e.phone',
    department: 'e.department',
    designation: 'e.designation',
    employment_status: 'e.employment_status',
    employment_type: 'e.employment_type',
    date_of_joining: 'e.date_of_joining',
    created_at: 'e.created_at',
  };

  const sortColumn = allowedSortColumns[sortBy] || 'e.id';
  const orderDirection = String(sortOrder).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM employees e
    ${whereClause}
  `;

  const dataQuery = `
    SELECT 
      e.*,
      c.company_name,
      c.company_code,
      b.branch_name,
      b.branch_code,
      u.id AS user_id,
      u.username
    FROM employees e
    LEFT JOIN companies c ON c.id = e.company_id
    LEFT JOIN branches b ON b.id = e.branch_id
    LEFT JOIN users u ON u.employee_id = e.id
    ${whereClause}
    ORDER BY ${sortColumn} ${orderDirection}
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;

  const [countResult, dataResult] = await Promise.all([
    pool.query(countQuery, values),
    pool.query(dataQuery, [...values, limit, offset]),
  ]);

  return {
    rows: dataResult.rows,
    total: countResult.rows[0]?.total || 0,
  };
};

/**
 * Find employee by ID with joined relations
 */
export const findById = async (id) => {
  const pool = getPool();
  const query = `
    SELECT 
      e.*,
      c.company_name,
      c.company_code,
      b.branch_name,
      b.branch_code,
      u.id AS user_id,
      u.username
    FROM employees e
    LEFT JOIN companies c ON c.id = e.company_id
    LEFT JOIN branches b ON b.id = e.branch_id
    LEFT JOIN users u ON u.employee_id = e.id
    WHERE e.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find employee by company ID and employee code
 */
export const findByCode = async (companyId, employeeCode) => {
  const pool = getPool();
  const query = `
    SELECT 
      e.*,
      c.company_name,
      c.company_code,
      b.branch_name,
      b.branch_code,
      u.id AS user_id,
      u.username
    FROM employees e
    LEFT JOIN companies c ON c.id = e.company_id
    LEFT JOIN branches b ON b.id = e.branch_id
    LEFT JOIN users u ON u.employee_id = e.id
    WHERE e.company_id = $1 AND LOWER(e.employee_code) = LOWER($2)
  `;
  const result = await pool.query(query, [companyId, employeeCode]);
  return result.rows[0] || null;
};

/**
 * Find employee by company ID and phone
 */
export const findByPhone = async (companyId, phone, excludeId = null) => {
  if (!phone) return null;
  const pool = getPool();
  const conditions = ['company_id = $1', 'phone = $2'];
  const values = [companyId, phone];

  if (excludeId) {
    conditions.push('id != $3');
    values.push(excludeId);
  }

  const query = `SELECT * FROM employees WHERE ${conditions.join(' AND ')}`;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

/**
 * Find employee by company ID and email
 */
export const findByEmail = async (companyId, email, excludeId = null) => {
  if (!email) return null;
  const pool = getPool();
  const conditions = ['company_id = $1', 'LOWER(email) = LOWER($2)'];
  const values = [companyId, email];

  if (excludeId) {
    conditions.push('id != $3');
    values.push(excludeId);
  }

  const query = `SELECT * FROM employees WHERE ${conditions.join(' AND ')}`;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

/**
 * Get all existing employee codes for a company
 */
export const findExistingCodes = async (companyId) => {
  const pool = getPool();
  const query = `SELECT employee_code FROM employees WHERE company_id = $1`;
  const result = await pool.query(query, [companyId]);
  return result.rows.map((row) => row.employee_code);
};

/**
 * Get company details by ID
 */
export const findCompanyById = async (companyId) => {
  const pool = getPool();
  const query = `SELECT id, company_name, company_code FROM companies WHERE id = $1`;
  const result = await pool.query(query, [companyId]);
  return result.rows[0] || null;
};

/**
 * Create a new employee
 */
export const create = async (data) => {
  const pool = getPool();
  const fields = [
    'company_id',
    'branch_id',
    'employee_code',
    'first_name',
    'last_name',
    'display_name',
    'phone',
    'alternate_phone',
    'email',
    'date_of_birth',
    'gender',
    'designation',
    'department',
    'date_of_joining',
    'employment_type',
    'employment_status',
    'salary_type',
    'salary_amount',
    'address',
    'city',
    'district',
    'state',
    'pincode',
    'country',
    'profile_photo_url',
    'emergency_contact_name',
    'emergency_contact_phone',
    'emergency_contact_relation',
    'notes',
    'created_by',
  ];

  const values = [];
  const placeholders = [];

  fields.forEach((field, index) => {
    values.push(data[field] !== undefined ? data[field] : null);
    placeholders.push(`$${index + 1}`);
  });

  const query = `
    INSERT INTO employees (${fields.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Update employee fields dynamically
 */
export const update = async (id, data, updatedBy = null) => {
  const pool = getPool();
  const fields = [];
  const values = [];
  let paramIndex = 1;

  const allowedFields = [
    'branch_id',
    'employee_code',
    'first_name',
    'last_name',
    'display_name',
    'phone',
    'alternate_phone',
    'email',
    'date_of_birth',
    'gender',
    'designation',
    'department',
    'date_of_joining',
    'employment_type',
    'employment_status',
    'salary_type',
    'salary_amount',
    'address',
    'city',
    'district',
    'state',
    'pincode',
    'country',
    'profile_photo_url',
    'emergency_contact_name',
    'emergency_contact_phone',
    'emergency_contact_relation',
    'notes',
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = $${paramIndex++}`);
      values.push(data[field]);
    }
  }

  if (updatedBy !== null && updatedBy !== undefined) {
    fields.push(`updated_by = $${paramIndex++}`);
    values.push(updatedBy);
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);

  if (fields.length === 1) {
    return findById(id);
  }

  values.push(id);
  const query = `
    UPDATE employees
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

/**
 * Update employee status
 */
export const updateStatus = async (id, status, updatedBy = null) => {
  const pool = getPool();
  const query = `
    UPDATE employees
    SET employment_status = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *
  `;
  const result = await pool.query(query, [status, updatedBy, id]);
  return result.rows[0] || null;
};

/**
 * Delete employee by ID
 */
export const deleteById = async (id) => {
  const pool = getPool();
  const query = `DELETE FROM employees WHERE id = $1 RETURNING *`;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export default {
  findAll,
  findById,
  findByCode,
  findByPhone,
  findByEmail,
  findExistingCodes,
  findCompanyById,
  create,
  update,
  updateStatus,
  deleteById,
};
