import { getDatabasePool } from '../../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

/**
 * Find paginated list of banks with optional filters
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  search,
  bankType,
  countryCode,
  isActive,
  isVerified,
  sortBy = 'display_order',
  sortOrder = 'ASC',
} = {}) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (bankType) {
    conditions.push(`bank_type = $${paramIndex++}`);
    values.push(bankType);
  }

  if (countryCode) {
    conditions.push(`country_code = $${paramIndex++}`);
    values.push(countryCode);
  }

  if (isActive !== undefined && isActive !== null) {
    conditions.push(`is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (isVerified !== undefined && isVerified !== null) {
    conditions.push(`is_verified = $${paramIndex++}`);
    values.push(isVerified);
  }

  if (search) {
    conditions.push(
      `(bank_name ILIKE $${paramIndex} OR bank_code ILIKE $${paramIndex} OR short_name ILIKE $${paramIndex} OR legal_name ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'id',
    bank_code: 'bank_code',
    bank_name: 'bank_name',
    short_name: 'short_name',
    bank_type: 'bank_type',
    display_order: 'display_order',
    created_at: 'created_at',
    is_active: 'is_active',
  };
  const orderColumn = allowedSortColumns[sortBy] || 'display_order';
  const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const countQuery = `SELECT COUNT(*) AS total FROM banks ${whereClause}`;
  const dataQuery = `
    SELECT * FROM banks 
    ${whereClause} 
    ORDER BY ${orderColumn} ${direction}, bank_name ASC 
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
 * Find bank by ID
 */
export const findById = async (id) => {
  const pool = getPool();
  const query = 'SELECT * FROM banks WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find bank by code
 */
export const findByCode = async (bankCode) => {
  const pool = getPool();
  const query = 'SELECT * FROM banks WHERE UPPER(bank_code) = UPPER($1)';
  const result = await pool.query(query, [bankCode]);
  return result.rows[0] || null;
};

/**
 * Check if bank code exists
 */
export const existsByCode = async (bankCode, excludeId = null) => {
  const pool = getPool();
  let query = 'SELECT id FROM banks WHERE UPPER(bank_code) = UPPER($1)';
  const params = [bankCode];

  if (excludeId) {
    query += ' AND id != $2';
    params.push(excludeId);
  }

  const result = await pool.query(query, params);
  return result.rowCount > 0;
};

/**
 * Create new bank record
 */
export const create = async (data) => {
  const pool = getPool();
  const columns = [
    'bank_code',
    'bank_name',
    'short_name',
    'legal_name',
    'bank_type',
    'logo_url',
    'logo_light_url',
    'logo_dark_url',
    'website_url',
    'country_code',
    'is_active',
    'is_verified',
    'display_order',
    'metadata',
  ];

  const values = [
    data.bank_code,
    data.bank_name,
    data.short_name || null,
    data.legal_name || null,
    data.bank_type || 'commercial',
    data.logo_url || null,
    data.logo_light_url || null,
    data.logo_dark_url || null,
    data.website_url || null,
    data.country_code || 'IN',
    data.is_active !== undefined ? Boolean(data.is_active) : true,
    data.is_verified !== undefined ? Boolean(data.is_verified) : false,
    data.display_order !== undefined ? Number(data.display_order) : 0,
    data.metadata ? JSON.stringify(data.metadata) : null,
  ];

  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  const query = `
    INSERT INTO banks (${columns.join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Update existing bank by ID
 */
export const update = async (id, data) => {
  const pool = getPool();
  const allowedFields = [
    'bank_code',
    'bank_name',
    'short_name',
    'legal_name',
    'bank_type',
    'logo_url',
    'logo_light_url',
    'logo_dark_url',
    'website_url',
    'country_code',
    'is_active',
    'is_verified',
    'display_order',
    'metadata',
  ];

  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      setClauses.push(`${field} = $${paramIndex++}`);
      values.push(field === 'metadata' && data[field] ? JSON.stringify(data[field]) : data[field]);
    }
  }

  if (setClauses.length === 0) {
    return findById(id);
  }

  setClauses.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const query = `
    UPDATE banks
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

/**
 * Update active status of a bank
 */
export const updateStatus = async (id, isActive) => {
  const pool = getPool();
  const query = `
    UPDATE banks
    SET is_active = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [isActive, id]);
  return result.rows[0] || null;
};

/**
 * Delete bank by ID
 */
export const deleteBank = async (id) => {
  const pool = getPool();
  const query = 'DELETE FROM banks WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export default {
  findAll,
  findById,
  findByCode,
  existsByCode,
  create,
  update,
  updateStatus,
  deleteBank,
  delete: deleteBank,
};
