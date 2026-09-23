import { getDatabasePool } from '../../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

/**
 * Find paginated list of units with filters
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  search,
  companyId,
  isActive,
  sortBy = 'unit_name',
  sortOrder = 'ASC',
} = {}) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (companyId !== undefined && companyId !== null) {
    conditions.push(`u.company_id = $${paramIndex++}`);
    values.push(companyId);
  }

  if (isActive !== undefined && isActive !== null) {
    conditions.push(`u.is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (search) {
    conditions.push(
      `(u.unit_name ILIKE $${paramIndex} OR u.unit_code ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'u.id',
    unit_code: 'u.unit_code',
    unit_name: 'u.unit_name',
    decimal_places: 'u.decimal_places',
    created_at: 'u.created_at',
    is_active: 'u.is_active',
  };

  const orderColumn = allowedSortColumns[sortBy] || 'u.unit_name';
  const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM units u
    ${whereClause}
  `;

  const dataQuery = `
    SELECT 
      u.*,
      c.company_name,
      c.company_code
    FROM units u
    JOIN companies c ON c.id = u.company_id
    ${whereClause}
    ORDER BY ${orderColumn} ${direction}, u.unit_name ASC
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
 * Find single unit by primary key ID
 */
export const findById = async (id) => {
  const pool = getPool();
  const query = `
    SELECT 
      u.*,
      c.company_name,
      c.company_code
    FROM units u
    JOIN companies c ON c.id = u.company_id
    WHERE u.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find unit by company ID and unit code
 */
export const findByCode = async (companyId, unitCode) => {
  const pool = getPool();
  const query = `
    SELECT 
      u.*,
      c.company_name,
      c.company_code
    FROM units u
    JOIN companies c ON c.id = u.company_id
    WHERE u.company_id = $1 AND LOWER(u.unit_code) = LOWER($2)
  `;
  const result = await pool.query(query, [companyId, unitCode]);
  return result.rows[0] || null;
};

/**
 * Find unit by company ID and unit name
 */
export const findByName = async (companyId, unitName) => {
  const pool = getPool();
  const query = `
    SELECT 
      u.*,
      c.company_name,
      c.company_code
    FROM units u
    JOIN companies c ON c.id = u.company_id
    WHERE u.company_id = $1 AND LOWER(u.unit_name) = LOWER($2)
  `;
  const result = await pool.query(query, [companyId, unitName]);
  return result.rows[0] || null;
};

/**
 * Find all units for a given company
 */
export const findByCompanyId = async (companyId, { isActive = null } = {}) => {
  const pool = getPool();
  const conditions = ['u.company_id = $1'];
  const values = [companyId];

  if (isActive !== null && isActive !== undefined) {
    conditions.push('u.is_active = $2');
    values.push(isActive);
  }

  const query = `
    SELECT 
      u.*,
      c.company_name,
      c.company_code
    FROM units u
    JOIN companies c ON c.id = u.company_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY u.unit_name ASC
  `;
  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * Check if unit code already exists for this company
 */
export const existsByCode = async (companyId, unitCode, excludeId = null) => {
  const pool = getPool();
  let query = `
    SELECT 1 FROM units 
    WHERE company_id = $1 AND LOWER(unit_code) = LOWER($2)
  `;
  const values = [companyId, unitCode];

  if (excludeId) {
    query += ' AND id <> $3';
    values.push(excludeId);
  }

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};

/**
 * Check if unit name already exists for this company
 */
export const existsByName = async (companyId, unitName, excludeId = null) => {
  const pool = getPool();
  let query = `
    SELECT 1 FROM units 
    WHERE company_id = $1 AND LOWER(unit_name) = LOWER($2)
  `;
  const values = [companyId, unitName];

  if (excludeId) {
    query += ' AND id <> $3';
    values.push(excludeId);
  }

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};

/**
 * Count products referencing unit as default unit
 */
export const countProducts = async (unitId) => {
  const pool = getPool();
  try {
    const query = 'SELECT COUNT(*) AS count FROM products WHERE default_unit_id = $1';
    const result = await pool.query(query, [unitId]);
    return parseInt(result.rows[0]?.count || 0, 10);
  } catch (error) {
    if (error.code === '42P01') {
      return 0;
    }
    throw error;
  }
};

/**
 * Count product variants referencing unit
 */
export const countVariants = async (unitId) => {
  const pool = getPool();
  try {
    const query = 'SELECT COUNT(*) AS count FROM product_variants WHERE unit_id = $1';
    const result = await pool.query(query, [unitId]);
    return parseInt(result.rows[0]?.count || 0, 10);
  } catch (error) {
    if (error.code === '42P01') {
      return 0;
    }
    throw error;
  }
};

/**
 * Create a new unit
 */
export const create = async (data) => {
  const pool = getPool();
  const query = `
    INSERT INTO units (
      company_id,
      unit_code,
      unit_name,
      decimal_places,
      is_active,
      created_by
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const values = [
    data.company_id,
    data.unit_code,
    data.unit_name,
    data.decimal_places ?? 0,
    data.is_active !== undefined ? data.is_active : true,
    data.created_by || null,
  ];

  const result = await pool.query(query, values);
  return findById(result.rows[0].id);
};

/**
 * Update an existing unit
 */
export const update = async (id, data) => {
  const pool = getPool();
  const fields = [];
  const values = [];
  let paramIndex = 1;

  const updatableColumns = [
    'company_id',
    'unit_code',
    'unit_name',
    'decimal_places',
    'is_active',
    'updated_by',
  ];

  for (const column of updatableColumns) {
    if (data[column] !== undefined) {
      fields.push(`${column} = $${paramIndex++}`);
      values.push(data[column]);
    }
  }

  if (fields.length === 0) {
    return findById(id);
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE units
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  if (result.rowCount === 0) {
    return null;
  }

  return findById(id);
};

/**
 * Update unit active status
 */
export const updateStatus = async (id, isActive, updatedBy = null) => {
  const pool = getPool();
  const query = `
    UPDATE units
    SET is_active = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *
  `;
  const result = await pool.query(query, [isActive, updatedBy, id]);
  if (result.rowCount === 0) {
    return null;
  }
  return findById(id);
};

/**
 * Delete unit by ID
 */
export const deleteById = async (id) => {
  const pool = getPool();
  const query = 'DELETE FROM units WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export default {
  findAll,
  findById,
  findByCode,
  findByName,
  findByCompanyId,
  existsByCode,
  existsByName,
  countProducts,
  countVariants,
  create,
  update,
  updateStatus,
  deleteById,
};
