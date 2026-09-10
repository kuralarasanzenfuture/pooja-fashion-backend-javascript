import { getDatabasePool } from '../../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

/**
 * Find paginated list of branch addresses with filtering and search
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  search,
  branchId,
  city,
  state,
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
    conditions.push(`ba.branch_id = $${paramIndex++}`);
    values.push(branchId);
  }

  if (city) {
    conditions.push(`ba.city ILIKE $${paramIndex++}`);
    values.push(`%${city}%`);
  }

  if (state) {
    conditions.push(`ba.state ILIKE $${paramIndex++}`);
    values.push(`%${state}%`);
  }

  if (isPrimary !== undefined && isPrimary !== null) {
    conditions.push(`ba.is_primary = $${paramIndex++}`);
    values.push(isPrimary);
  }

  if (isActive !== undefined && isActive !== null) {
    conditions.push(`ba.is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (search) {
    conditions.push(
      `(ba.address_line_1 ILIKE $${paramIndex} OR ba.address_line_2 ILIKE $${paramIndex} OR ba.city ILIKE $${paramIndex} OR ba.state ILIKE $${paramIndex} OR ba.postal_code ILIKE $${paramIndex} OR ba.landmark ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'ba.id',
    city: 'ba.city',
    state: 'ba.state',
    postal_code: 'ba.postal_code',
    is_primary: 'ba.is_primary',
    is_active: 'ba.is_active',
    created_at: 'ba.created_at',
  };
  const orderColumn = allowedSortColumns[sortBy] || 'ba.id';
  const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const countQuery = `
    SELECT COUNT(*) AS total 
    FROM branch_addresses ba 
    ${whereClause}
  `;

  const dataQuery = `
    SELECT ba.*, b.branch_code, b.branch_name
    FROM branch_addresses ba
    LEFT JOIN branches b ON ba.branch_id = b.id
    ${whereClause}
    ORDER BY ${orderColumn} ${direction}, ba.id ASC
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
 * Find branch address by ID
 */
export const findById = async (id) => {
  const pool = getPool();
  const query = `
    SELECT ba.*, b.branch_code, b.branch_name
    FROM branch_addresses ba
    LEFT JOIN branches b ON ba.branch_id = b.id
    WHERE ba.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find all addresses for a branch
 */
export const findByBranchId = async (branchId) => {
  const pool = getPool();
  const query = `
    SELECT ba.*, b.branch_code, b.branch_name
    FROM branch_addresses ba
    LEFT JOIN branches b ON ba.branch_id = b.id
    WHERE ba.branch_id = $1
    ORDER BY ba.is_primary DESC, ba.id ASC
  `;
  const result = await pool.query(query, [branchId]);
  return result.rows;
};

/**
 * Reset primary address flag for a branch
 */
export const resetPrimary = async (branchId, excludeAddressId = null) => {
  const pool = getPool();
  let query =
    'UPDATE branch_addresses SET is_primary = FALSE, updated_at = CURRENT_TIMESTAMP WHERE branch_id = $1 AND is_primary = TRUE';
  const params = [branchId];

  if (excludeAddressId) {
    query += ' AND id != $2';
    params.push(excludeAddressId);
  }

  return pool.query(query, params);
};

/**
 * Create a new branch address
 */
export const create = async (data) => {
  const pool = getPool();
  const columns = [
    'branch_id',
    'address_line_1',
    'address_line_2',
    'city',
    'district',
    'state',
    'postal_code',
    'country',
    'landmark',
    'is_primary',
    'is_active',
  ];

  const values = [
    data.branch_id,
    data.address_line_1,
    data.address_line_2 || null,
    data.city || null,
    data.district || null,
    data.state || null,
    data.postal_code || null,
    data.country || 'India',
    data.landmark || null,
    data.is_primary !== undefined ? Boolean(data.is_primary) : true,
    data.is_active !== undefined ? Boolean(data.is_active) : true,
  ];

  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  const query = `
    INSERT INTO branch_addresses (${columns.join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Update an existing branch address
 */
export const update = async (id, data) => {
  const pool = getPool();
  const allowedFields = [
    'address_line_1',
    'address_line_2',
    'city',
    'district',
    'state',
    'postal_code',
    'country',
    'landmark',
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
    UPDATE branch_addresses
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
    UPDATE branch_addresses
    SET is_active = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [Boolean(isActive), id]);
  return result.rows[0];
};

/**
 * Delete branch address
 */
export const deleteAddress = async (id) => {
  const pool = getPool();
  const query = 'DELETE FROM branch_addresses WHERE id = $1 RETURNING *';
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
  deleteAddress,
};
