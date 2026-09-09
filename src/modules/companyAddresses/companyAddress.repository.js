import { getDatabasePool } from '../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

/**
 * Find paginated list of company addresses with optional filters
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  search,
  companyId,
  addressType,
  isPrimary,
  isActive,
  sortBy = 'created_at',
  sortOrder = 'DESC',
} = {}) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (companyId !== undefined && companyId !== null) {
    conditions.push(`ca.company_id = $${paramIndex++}`);
    values.push(companyId);
  }

  if (addressType) {
    conditions.push(`ca.address_type = $${paramIndex++}`);
    values.push(addressType);
  }

  if (isPrimary !== undefined && isPrimary !== null) {
    conditions.push(`ca.is_primary = $${paramIndex++}`);
    values.push(isPrimary);
  }

  if (isActive !== undefined && isActive !== null) {
    conditions.push(`ca.is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (search) {
    conditions.push(
      `(ca.address_line_1 ILIKE $${paramIndex} OR ca.city ILIKE $${paramIndex} OR ca.state ILIKE $${paramIndex} OR ca.postal_code ILIKE $${paramIndex} OR c.company_name ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'ca.id',
    company_id: 'ca.company_id',
    address_type: 'ca.address_type',
    city: 'ca.city',
    state: 'ca.state',
    postal_code: 'ca.postal_code',
    is_primary: 'ca.is_primary',
    is_active: 'ca.is_active',
    created_at: 'ca.created_at',
  };
  const orderColumn = allowedSortColumns[sortBy] || 'ca.created_at';
  const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const countQuery = `
    SELECT COUNT(*) AS total 
    FROM company_addresses ca 
    JOIN companies c ON c.id = ca.company_id 
    ${whereClause}
  `;

  const dataQuery = `
    SELECT ca.*, c.company_name, c.company_code 
    FROM company_addresses ca 
    JOIN companies c ON c.id = ca.company_id 
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
 * Find address by ID (with company details)
 */
export const findById = async (id) => {
  const pool = getPool();
  const query = `
    SELECT ca.*, c.company_name, c.company_code 
    FROM company_addresses ca 
    JOIN companies c ON c.id = ca.company_id 
    WHERE ca.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find all addresses belonging to a company
 */
export const findByCompanyId = async (companyId) => {
  const pool = getPool();
  const query = `
    SELECT ca.*, c.company_name, c.company_code 
    FROM company_addresses ca 
    JOIN companies c ON c.id = ca.company_id 
    WHERE ca.company_id = $1 
    ORDER BY ca.is_primary DESC, ca.created_at DESC
  `;
  const result = await pool.query(query, [companyId]);
  return result.rows;
};

/**
 * Find primary address for a company
 */
export const findPrimaryByCompanyId = async (companyId) => {
  const pool = getPool();
  const query = `
    SELECT ca.*, c.company_name, c.company_code 
    FROM company_addresses ca 
    JOIN companies c ON c.id = ca.company_id 
    WHERE ca.company_id = $1 AND ca.is_primary = TRUE 
    LIMIT 1
  `;
  const result = await pool.query(query, [companyId]);
  return result.rows[0] || null;
};

/**
 * Reset is_primary = FALSE for all addresses of a company (optionally excluding one address ID)
 */
export const resetPrimaryForCompany = async (companyId, excludeId = null) => {
  const pool = getPool();
  let query = `
    UPDATE company_addresses 
    SET is_primary = FALSE, updated_at = CURRENT_TIMESTAMP 
    WHERE company_id = $1 AND is_primary = TRUE
  `;
  const params = [companyId];

  if (excludeId) {
    query += ' AND id != $2';
    params.push(excludeId);
  }

  await pool.query(query, params);
};

/**
 * Insert new company address
 */
export const create = async (data) => {
  const pool = getPool();
  const columns = [
    'company_id',
    'address_type',
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
    data.company_id,
    data.address_type,
    data.address_line_1,
    data.address_line_2 || null,
    data.city || null,
    data.district || null,
    data.state || null,
    data.postal_code || null,
    data.country || 'India',
    data.landmark || null,
    data.is_primary !== undefined ? Boolean(data.is_primary) : false,
    data.is_active !== undefined ? Boolean(data.is_active) : true,
  ];

  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  const query = `
    INSERT INTO company_addresses (${columns.join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Update existing company address by ID
 */
export const update = async (id, data) => {
  const pool = getPool();
  const allowedFields = [
    'company_id',
    'address_type',
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
    UPDATE company_addresses
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

/**
 * Update active status of an address
 */
export const updateStatus = async (id, isActive) => {
  const pool = getPool();
  const query = `
    UPDATE company_addresses
    SET is_active = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [isActive, id]);
  return result.rows[0] || null;
};

/**
 * Set an address as primary
 */
export const setPrimary = async (id) => {
  const pool = getPool();
  const query = `
    UPDATE company_addresses
    SET is_primary = TRUE, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Delete company address by ID
 */
export const deleteAddress = async (id) => {
  const pool = getPool();
  const query = 'DELETE FROM company_addresses WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export default {
  findAll,
  findById,
  findByCompanyId,
  findPrimaryByCompanyId,
  resetPrimaryForCompany,
  create,
  update,
  updateStatus,
  setPrimary,
  deleteAddress,
  delete: deleteAddress,
};
