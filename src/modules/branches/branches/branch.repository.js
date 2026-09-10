import { getDatabasePool } from '../../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

/**
 * Find paginated list of branches with filtering and search
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  search,
  companyId,
  branchType,
  status,
  isMainBranch,
  sortBy = 'id',
  sortOrder = 'ASC',
} = {}) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (companyId) {
    conditions.push(`b.company_id = $${paramIndex++}`);
    values.push(companyId);
  }

  if (branchType) {
    conditions.push(`b.branch_type = $${paramIndex++}`);
    values.push(branchType);
  }

  if (status) {
    conditions.push(`b.status = $${paramIndex++}`);
    values.push(status);
  }

  if (isMainBranch !== undefined && isMainBranch !== null) {
    conditions.push(`b.is_main_branch = $${paramIndex++}`);
    values.push(isMainBranch);
  }

  if (search) {
    conditions.push(
      `(b.branch_name ILIKE $${paramIndex} OR b.branch_code ILIKE $${paramIndex} OR b.manager_name ILIKE $${paramIndex} OR b.email ILIKE $${paramIndex} OR b.city ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'b.id',
    branch_code: 'b.branch_code',
    branch_name: 'b.branch_name',
    branch_type: 'b.branch_type',
    manager_name: 'b.manager_name',
    opening_date: 'b.opening_date',
    status: 'b.status',
    created_at: 'b.created_at',
  };
  const orderColumn = allowedSortColumns[sortBy] || 'b.id';
  const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const countQuery = `
    SELECT COUNT(*) AS total 
    FROM branches b 
    ${whereClause}
  `;

  const dataQuery = `
    SELECT b.*, c.company_code, c.company_name
    FROM branches b
    LEFT JOIN companies c ON b.company_id = c.id
    ${whereClause}
    ORDER BY ${orderColumn} ${direction}, b.id ASC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;

  const [countResult, dataResult] = await Promise.all([
    pool.query(countQuery, values),
    pool.query(dataQuery, [...values, limit, offset]),
  ]);

  const total = parseInt(countResult.rows[0]?.total || 0, 10);
  return { rows: dataResult.rows, total };
};

/**
 * Find single branch by ID with company details
 */
export const findById = async (id) => {
  const pool = getPool();
  const query = `
    SELECT b.*, c.company_code, c.company_name
    FROM branches b
    LEFT JOIN companies c ON b.company_id = c.id
    WHERE b.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find branch by company ID and branch code
 */
export const findByCode = async (companyId, branchCode) => {
  const pool = getPool();
  const query = `
    SELECT b.*, c.company_code, c.company_name
    FROM branches b
    LEFT JOIN companies c ON b.company_id = c.id
    WHERE b.company_id = $1 AND UPPER(b.branch_code) = UPPER($2)
  `;
  const result = await pool.query(query, [companyId, branchCode]);
  return result.rows[0] || null;
};

/**
 * Find all branches for a specific company
 */
export const findByCompanyId = async (companyId) => {
  const pool = getPool();
  const query = `
    SELECT b.*, c.company_code, c.company_name
    FROM branches b
    LEFT JOIN companies c ON b.company_id = c.id
    WHERE b.company_id = $1
    ORDER BY b.is_main_branch DESC, b.branch_name ASC
  `;
  const result = await pool.query(query, [companyId]);
  return result.rows;
};

/**
 * Get all existing branch codes for a company
 */
export const findExistingCodesByCompanyId = async (companyId) => {
  const pool = getPool();
  const query = `
    SELECT branch_code FROM branches WHERE company_id = $1
  `;
  const result = await pool.query(query, [companyId]);
  return result.rows.map((r) => r.branch_code);
};

/**
 * Check if branch code exists within a company
 */
export const existsByCode = async (companyId, branchCode, excludeId = null) => {
  const pool = getPool();
  let query = 'SELECT id FROM branches WHERE company_id = $1 AND UPPER(branch_code) = UPPER($2)';
  const params = [companyId, branchCode];

  if (excludeId) {
    query += ' AND id != $3';
    params.push(excludeId);
  }

  const result = await pool.query(query, params);
  return result.rowCount > 0;
};

/**
 * Find main branch for a company
 */
export const findMainBranchByCompanyId = async (companyId) => {
  const pool = getPool();
  const query = 'SELECT * FROM branches WHERE company_id = $1 AND is_main_branch = TRUE LIMIT 1';
  const result = await pool.query(query, [companyId]);
  return result.rows[0] || null;
};

/**
 * Reset main branch flag for all branches of a company
 */
export const resetMainBranch = async (companyId, excludeBranchId = null) => {
  const pool = getPool();
  let query =
    'UPDATE branches SET is_main_branch = FALSE, updated_at = CURRENT_TIMESTAMP WHERE company_id = $1 AND is_main_branch = TRUE';
  const params = [companyId];

  if (excludeBranchId) {
    query += ' AND id != $2';
    params.push(excludeBranchId);
  }

  return pool.query(query, params);
};

/**
 * Create a new branch
 */
export const create = async (data) => {
  const pool = getPool();
  const columns = [
    'company_id',
    'branch_code',
    'branch_name',
    'branch_type',
    'email',
    'phone',
    'mobile',
    'manager_name',
    'opening_date',
    'is_main_branch',
    'status',
  ];

  const values = [
    data.company_id,
    data.branch_code,
    data.branch_name,
    data.branch_type || 'store',
    data.email || null,
    data.phone || null,
    data.mobile || null,
    data.manager_name || null,
    data.opening_date || null,
    Boolean(data.is_main_branch),
    data.status || 'active',
  ];

  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  const query = `
    INSERT INTO branches (${columns.join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Update an existing branch by ID
 */
export const update = async (id, data) => {
  const pool = getPool();
  const allowedFields = [
    'branch_code',
    'branch_name',
    'branch_type',
    'email',
    'phone',
    'mobile',
    'manager_name',
    'opening_date',
    'is_main_branch',
    'status',
  ];

  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      setClauses.push(`${field} = $${paramIndex++}`);
      values.push(data[field]);
    }
  }

  if (setClauses.length === 0) {
    return findById(id);
  }

  setClauses.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const query = `
    UPDATE branches
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Update branch status
 */
export const updateStatus = async (id, status) => {
  const pool = getPool();
  const query = `
    UPDATE branches
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [status, id]);
  return result.rows[0];
};

/**
 * Delete branch by ID
 */
export const deleteBranch = async (id) => {
  const pool = getPool();
  const query = 'DELETE FROM branches WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export default {
  findAll,
  findById,
  findByCode,
  findByCompanyId,
  findExistingCodesByCompanyId,
  existsByCode,
  findMainBranchByCompanyId,
  resetMainBranch,
  create,
  update,
  updateStatus,
  deleteBranch,
};
