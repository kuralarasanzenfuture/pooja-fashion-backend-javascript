import { getDatabasePool } from '../../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

/**
 * Find paginated list of colors with filters
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  search,
  companyId,
  isActive,
  sortBy = 'display_order',
  sortOrder = 'ASC',
} = {}) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (companyId !== undefined && companyId !== null) {
    conditions.push(`col.company_id = $${paramIndex++}`);
    values.push(companyId);
  }

  if (isActive !== undefined && isActive !== null) {
    conditions.push(`col.is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (search) {
    conditions.push(
      `(col.color_name ILIKE $${paramIndex} OR col.color_code ILIKE $${paramIndex} OR col.hex_code ILIKE $${paramIndex} OR col.description ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'col.id',
    color_code: 'col.color_code',
    color_name: 'col.color_name',
    display_order: 'col.display_order',
    created_at: 'col.created_at',
    is_active: 'col.is_active',
  };

  const orderColumn = allowedSortColumns[sortBy] || 'col.display_order';
  const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM colors col
    ${whereClause}
  `;

  const dataQuery = `
    SELECT 
      col.*,
      c.company_name,
      c.company_code
    FROM colors col
    JOIN companies c ON c.id = col.company_id
    ${whereClause}
    ORDER BY ${orderColumn} ${direction}, col.color_name ASC
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
 * Find single color by primary key ID
 */
export const findById = async (id) => {
  const pool = getPool();
  const query = `
    SELECT 
      col.*,
      c.company_name,
      c.company_code
    FROM colors col
    JOIN companies c ON c.id = col.company_id
    WHERE col.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find color by company ID and color code
 */
export const findByCode = async (companyId, colorCode) => {
  const pool = getPool();
  const query = `
    SELECT 
      col.*,
      c.company_name,
      c.company_code
    FROM colors col
    JOIN companies c ON c.id = col.company_id
    WHERE col.company_id = $1 AND LOWER(col.color_code) = LOWER($2)
  `;
  const result = await pool.query(query, [companyId, colorCode]);
  return result.rows[0] || null;
};

/**
 * Find color by company ID and color name
 */
export const findByName = async (companyId, colorName) => {
  const pool = getPool();
  const query = `
    SELECT 
      col.*,
      c.company_name,
      c.company_code
    FROM colors col
    JOIN companies c ON c.id = col.company_id
    WHERE col.company_id = $1 AND LOWER(col.color_name) = LOWER($2)
  `;
  const result = await pool.query(query, [companyId, colorName]);
  return result.rows[0] || null;
};

/**
 * Find all colors for a given company
 */
export const findByCompanyId = async (companyId, { isActive = null } = {}) => {
  const pool = getPool();
  const conditions = ['col.company_id = $1'];
  const values = [companyId];

  if (isActive !== null && isActive !== undefined) {
    conditions.push('col.is_active = $2');
    values.push(isActive);
  }

  const query = `
    SELECT 
      col.*,
      c.company_name,
      c.company_code
    FROM colors col
    JOIN companies c ON c.id = col.company_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY col.display_order ASC, col.color_name ASC
  `;
  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * Check if color code already exists for this company
 */
export const existsByCode = async (companyId, colorCode, excludeId = null) => {
  const pool = getPool();
  let query = `
    SELECT 1 FROM colors 
    WHERE company_id = $1 AND LOWER(color_code) = LOWER($2)
  `;
  const values = [companyId, colorCode];

  if (excludeId) {
    query += ' AND id <> $3';
    values.push(excludeId);
  }

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};

/**
 * Check if color name already exists for this company
 */
export const existsByName = async (companyId, colorName, excludeId = null) => {
  const pool = getPool();
  let query = `
    SELECT 1 FROM colors 
    WHERE company_id = $1 AND LOWER(color_name) = LOWER($2)
  `;
  const values = [companyId, colorName];

  if (excludeId) {
    query += ' AND id <> $3';
    values.push(excludeId);
  }

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};

/**
 * Count product variants referencing color
 */
export const countVariants = async (colorId) => {
  const pool = getPool();
  try {
    const query = 'SELECT COUNT(*) AS count FROM product_variants WHERE color_id = $1';
    const result = await pool.query(query, [colorId]);
    return parseInt(result.rows[0]?.count || 0, 10);
  } catch (error) {
    if (error.code === '42P01') {
      return 0;
    }
    throw error;
  }
};

/**
 * Create a new color
 */
export const create = async (data) => {
  const pool = getPool();
  const query = `
    INSERT INTO colors (
      company_id,
      color_code,
      color_name,
      hex_code,
      description,
      display_order,
      is_active,
      created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;

  const values = [
    data.company_id,
    data.color_code,
    data.color_name,
    data.hex_code || null,
    data.description || null,
    data.display_order ?? 0,
    data.is_active !== undefined ? data.is_active : true,
    data.created_by || null,
  ];

  const result = await pool.query(query, values);
  return findById(result.rows[0].id);
};

/**
 * Update an existing color
 */
export const update = async (id, data) => {
  const pool = getPool();
  const fields = [];
  const values = [];
  let paramIndex = 1;

  const updatableColumns = [
    'company_id',
    'color_code',
    'color_name',
    'hex_code',
    'description',
    'display_order',
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
    UPDATE colors
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
 * Update color active status
 */
export const updateStatus = async (id, isActive, updatedBy = null) => {
  const pool = getPool();
  const query = `
    UPDATE colors
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
 * Delete color by ID
 */
export const deleteById = async (id) => {
  const pool = getPool();
  const query = 'DELETE FROM colors WHERE id = $1 RETURNING *';
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
  countVariants,
  create,
  update,
  updateStatus,
  deleteById,
};
