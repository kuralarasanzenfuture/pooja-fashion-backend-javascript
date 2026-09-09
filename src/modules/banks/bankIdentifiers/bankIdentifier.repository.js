import { getDatabasePool } from '../../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

/**
 * Find paginated list of bank identifiers with optional filters
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  search,
  bankId,
  identifierType,
  city,
  state,
  isActive,
  sortBy = 'created_at',
  sortOrder = 'DESC',
} = {}) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (bankId !== undefined && bankId !== null) {
    conditions.push(`bi.bank_id = $${paramIndex++}`);
    values.push(bankId);
  }

  if (identifierType) {
    conditions.push(`bi.identifier_type = $${paramIndex++}`);
    values.push(identifierType);
  }

  if (city) {
    conditions.push(`bi.city ILIKE $${paramIndex++}`);
    values.push(`%${city}%`);
  }

  if (state) {
    conditions.push(`bi.state ILIKE $${paramIndex++}`);
    values.push(`%${state}%`);
  }

  if (isActive !== undefined && isActive !== null) {
    conditions.push(`bi.is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (search) {
    conditions.push(
      `(bi.identifier_value ILIKE $${paramIndex} OR bi.branch_name ILIKE $${paramIndex} OR bi.city ILIKE $${paramIndex} OR bi.state ILIKE $${paramIndex} OR b.bank_name ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'bi.id',
    bank_id: 'bi.bank_id',
    identifier_type: 'bi.identifier_type',
    identifier_value: 'bi.identifier_value',
    branch_name: 'bi.branch_name',
    city: 'bi.city',
    state: 'bi.state',
    is_active: 'bi.is_active',
    created_at: 'bi.created_at',
  };
  const orderColumn = allowedSortColumns[sortBy] || 'bi.created_at';
  const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const countQuery = `
    SELECT COUNT(*) AS total 
    FROM bank_identifiers bi 
    JOIN banks b ON b.id = bi.bank_id 
    ${whereClause}
  `;

  const dataQuery = `
    SELECT bi.*, b.bank_name, b.bank_code 
    FROM bank_identifiers bi 
    JOIN banks b ON b.id = bi.bank_id 
    ${whereClause} 
    ORDER BY ${orderColumn} ${direction} 
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
 * Find identifier by ID
 */
export const findById = async (id) => {
  const pool = getPool();
  const query = `
    SELECT bi.*, b.bank_name, b.bank_code 
    FROM bank_identifiers bi 
    JOIN banks b ON b.id = bi.bank_id 
    WHERE bi.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find all identifiers for a bank
 */
export const findByBankId = async (bankId) => {
  const pool = getPool();
  const query = `
    SELECT bi.*, b.bank_name, b.bank_code 
    FROM bank_identifiers bi 
    JOIN banks b ON b.id = bi.bank_id 
    WHERE bi.bank_id = $1 
    ORDER BY bi.identifier_type ASC, bi.branch_name ASC
  `;
  const result = await pool.query(query, [bankId]);
  return result.rows;
};

/**
 * Find identifier by value (and optionally type)
 */
export const findByValue = async (identifierValue, identifierType = null) => {
  const pool = getPool();
  let query = `
    SELECT bi.*, b.bank_name, b.bank_code 
    FROM bank_identifiers bi 
    JOIN banks b ON b.id = bi.bank_id 
    WHERE UPPER(bi.identifier_value) = UPPER($1)
  `;
  const params = [identifierValue];

  if (identifierType) {
    query += ' AND bi.identifier_type = $2';
    params.push(identifierType);
  }

  const result = await pool.query(query, params);
  return result.rows[0] || null;
};

/**
 * Check if identifier exists (unique constraint on type + value)
 */
export const exists = async (identifierType, identifierValue, excludeId = null) => {
  const pool = getPool();
  let query = `
    SELECT id FROM bank_identifiers 
    WHERE identifier_type = $1 AND UPPER(identifier_value) = UPPER($2)
  `;
  const params = [identifierType, identifierValue];

  if (excludeId) {
    query += ' AND id != $3';
    params.push(excludeId);
  }

  const result = await pool.query(query, params);
  return result.rowCount > 0;
};

/**
 * Create new bank identifier
 */
export const create = async (data) => {
  const pool = getPool();
  const columns = [
    'bank_id',
    'identifier_type',
    'identifier_value',
    'branch_name',
    'city',
    'state',
    'is_active',
  ];

  const values = [
    data.bank_id,
    data.identifier_type,
    data.identifier_value,
    data.branch_name || null,
    data.city || null,
    data.state || null,
    data.is_active !== undefined ? Boolean(data.is_active) : true,
  ];

  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  const query = `
    INSERT INTO bank_identifiers (${columns.join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Update existing bank identifier by ID
 */
export const update = async (id, data) => {
  const pool = getPool();
  const allowedFields = [
    'bank_id',
    'identifier_type',
    'identifier_value',
    'branch_name',
    'city',
    'state',
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
    UPDATE bank_identifiers
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

/**
 * Update active status
 */
export const updateStatus = async (id, isActive) => {
  const pool = getPool();
  const query = `
    UPDATE bank_identifiers
    SET is_active = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [isActive, id]);
  return result.rows[0] || null;
};

/**
 * Delete bank identifier
 */
export const deleteIdentifier = async (id) => {
  const pool = getPool();
  const query = 'DELETE FROM bank_identifiers WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export default {
  findAll,
  findById,
  findByBankId,
  findByValue,
  exists,
  create,
  update,
  updateStatus,
  deleteIdentifier,
  delete: deleteIdentifier,
};
