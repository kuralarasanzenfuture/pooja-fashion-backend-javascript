import { getDatabasePool } from '../../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

/**
 * Find paginated list of branch contacts with filtering and search
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  search,
  branchId,
  designation,
  isPrimary,
  isActive,
  sortBy = 'id',
  sortOrder = 'ASC',
} = {}) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (branchId) {
    conditions.push(`bc.branch_id = $${paramIndex++}`);
    values.push(branchId);
  }

  if (designation) {
    conditions.push(`bc.designation ILIKE $${paramIndex++}`);
    values.push(`%${designation}%`);
  }

  if (isPrimary !== undefined && isPrimary !== null) {
    conditions.push(`bc.is_primary = $${paramIndex++}`);
    values.push(isPrimary);
  }

  if (isActive !== undefined && isActive !== null) {
    conditions.push(`bc.is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (search) {
    conditions.push(
      `(bc.contact_name ILIKE $${paramIndex} OR bc.designation ILIKE $${paramIndex} OR bc.email ILIKE $${paramIndex} OR bc.phone ILIKE $${paramIndex} OR bc.mobile ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'bc.id',
    contact_name: 'bc.contact_name',
    designation: 'bc.designation',
    email: 'bc.email',
    phone: 'bc.phone',
    is_primary: 'bc.is_primary',
    is_active: 'bc.is_active',
    created_at: 'bc.created_at',
  };
  const orderColumn = allowedSortColumns[sortBy] || 'bc.id';
  const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const countQuery = `
    SELECT COUNT(*) AS total 
    FROM branch_contacts bc 
    ${whereClause}
  `;

  const dataQuery = `
    SELECT bc.*, b.branch_code, b.branch_name
    FROM branch_contacts bc
    LEFT JOIN branches b ON bc.branch_id = b.id
    ${whereClause}
    ORDER BY ${orderColumn} ${direction}, bc.id ASC
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
 * Find branch contact by ID
 */
export const findById = async (id) => {
  const pool = getPool();
  const query = `
    SELECT bc.*, b.branch_code, b.branch_name
    FROM branch_contacts bc
    LEFT JOIN branches b ON bc.branch_id = b.id
    WHERE bc.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find all contacts for a branch
 */
export const findByBranchId = async (branchId) => {
  const pool = getPool();
  const query = `
    SELECT bc.*, b.branch_code, b.branch_name
    FROM branch_contacts bc
    LEFT JOIN branches b ON bc.branch_id = b.id
    WHERE bc.branch_id = $1
    ORDER BY bc.is_primary DESC, bc.id ASC
  `;
  const result = await pool.query(query, [branchId]);
  return result.rows;
};

/**
 * Reset primary contact flag for a branch
 */
export const resetPrimary = async (branchId, excludeContactId = null) => {
  const pool = getPool();
  let query =
    'UPDATE branch_contacts SET is_primary = FALSE, updated_at = CURRENT_TIMESTAMP WHERE branch_id = $1 AND is_primary = TRUE';
  const params = [branchId];

  if (excludeContactId) {
    query += ' AND id != $2';
    params.push(excludeContactId);
  }

  return pool.query(query, params);
};

/**
 * Create a new branch contact
 */
export const create = async (data) => {
  const pool = getPool();
  const columns = [
    'branch_id',
    'contact_name',
    'designation',
    'email',
    'phone',
    'mobile',
    'is_primary',
    'is_active',
  ];

  const values = [
    data.branch_id,
    data.contact_name,
    data.designation || null,
    data.email || null,
    data.phone || null,
    data.mobile || null,
    Boolean(data.is_primary),
    data.is_active !== undefined ? Boolean(data.is_active) : true,
  ];

  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  const query = `
    INSERT INTO branch_contacts (${columns.join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Update an existing branch contact
 */
export const update = async (id, data) => {
  const pool = getPool();
  const allowedFields = [
    'contact_name',
    'designation',
    'email',
    'phone',
    'mobile',
    'is_primary',
    'is_active',
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
    UPDATE branch_contacts
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Update active status
 */
export const updateStatus = async (id, isActive) => {
  const pool = getPool();
  const query = `
    UPDATE branch_contacts
    SET is_active = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [Boolean(isActive), id]);
  return result.rows[0];
};

/**
 * Delete branch contact
 */
export const deleteContact = async (id) => {
  const pool = getPool();
  const query = 'DELETE FROM branch_contacts WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export default {
  findAll,
  findById,
  findByBranchId,
  resetPrimary,
  create,
  update,
  updateStatus,
  deleteContact,
};
