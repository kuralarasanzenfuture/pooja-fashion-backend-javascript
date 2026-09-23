import { getDatabasePool } from '../../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

/**
 * Find paginated list of sizes with filters
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  search,
  companyId,
  sizeGroupId,
  isActive,
  sortBy = 'display_order',
  sortOrder = 'ASC',
} = {}) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (companyId !== undefined && companyId !== null) {
    conditions.push(`s.company_id = $${paramIndex++}`);
    values.push(companyId);
  }

  if (sizeGroupId !== undefined && sizeGroupId !== null) {
    conditions.push(`s.size_group_id = $${paramIndex++}`);
    values.push(sizeGroupId);
  }

  if (isActive !== undefined && isActive !== null) {
    conditions.push(`s.is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (search) {
    conditions.push(
      `(s.size_name ILIKE $${paramIndex} OR s.size_code ILIKE $${paramIndex} OR sg.size_group_name ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 's.id',
    size_code: 's.size_code',
    size_name: 's.size_name',
    display_order: 's.display_order',
    created_at: 's.created_at',
    is_active: 's.is_active',
  };

  const orderColumn = allowedSortColumns[sortBy] || 's.display_order';
  const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM sizes s
    JOIN size_groups sg ON sg.id = s.size_group_id
    ${whereClause}
  `;

  const dataQuery = `
    SELECT 
      s.*,
      c.company_name,
      c.company_code,
      sg.size_group_name,
      sg.size_group_code
    FROM sizes s
    JOIN companies c ON c.id = s.company_id
    JOIN size_groups sg ON sg.id = s.size_group_id
    ${whereClause}
    ORDER BY ${orderColumn} ${direction}, s.size_name ASC
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
 * Find single size by ID
 */
export const findById = async (id) => {
  const pool = getPool();
  const query = `
    SELECT 
      s.*,
      c.company_name,
      c.company_code,
      sg.size_group_name,
      sg.size_group_code
    FROM sizes s
    JOIN companies c ON c.id = s.company_id
    JOIN size_groups sg ON sg.id = s.size_group_id
    WHERE s.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find size by size group ID and size code
 */
export const findByCode = async (sizeGroupId, sizeCode) => {
  const pool = getPool();
  const query = `
    SELECT 
      s.*,
      c.company_name,
      c.company_code,
      sg.size_group_name,
      sg.size_group_code
    FROM sizes s
    JOIN companies c ON c.id = s.company_id
    JOIN size_groups sg ON sg.id = s.size_group_id
    WHERE s.size_group_id = $1 AND LOWER(s.size_code) = LOWER($2)
  `;
  const result = await pool.query(query, [sizeGroupId, sizeCode]);
  return result.rows[0] || null;
};

/**
 * Find size by size group ID and size name
 */
export const findByName = async (sizeGroupId, sizeName) => {
  const pool = getPool();
  const query = `
    SELECT 
      s.*,
      c.company_name,
      c.company_code,
      sg.size_group_name,
      sg.size_group_code
    FROM sizes s
    JOIN companies c ON c.id = s.company_id
    JOIN size_groups sg ON sg.id = s.size_group_id
    WHERE s.size_group_id = $1 AND LOWER(s.size_name) = LOWER($2)
  `;
  const result = await pool.query(query, [sizeGroupId, sizeName]);
  return result.rows[0] || null;
};

/**
 * Find all sizes for a given size group
 */
export const findBySizeGroupId = async (sizeGroupId, { isActive = null } = {}) => {
  const pool = getPool();
  const conditions = ['s.size_group_id = $1'];
  const values = [sizeGroupId];

  if (isActive !== null && isActive !== undefined) {
    conditions.push('s.is_active = $2');
    values.push(isActive);
  }

  const query = `
    SELECT 
      s.*,
      c.company_name,
      c.company_code,
      sg.size_group_name,
      sg.size_group_code
    FROM sizes s
    JOIN companies c ON c.id = s.company_id
    JOIN size_groups sg ON sg.id = s.size_group_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY s.display_order ASC, s.size_name ASC
  `;
  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * Find all sizes for a given company
 */
export const findByCompanyId = async (companyId, { isActive = null } = {}) => {
  const pool = getPool();
  const conditions = ['s.company_id = $1'];
  const values = [companyId];

  if (isActive !== null && isActive !== undefined) {
    conditions.push('s.is_active = $2');
    values.push(isActive);
  }

  const query = `
    SELECT 
      s.*,
      c.company_name,
      c.company_code,
      sg.size_group_name,
      sg.size_group_code
    FROM sizes s
    JOIN companies c ON c.id = s.company_id
    JOIN size_groups sg ON sg.id = s.size_group_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY sg.size_group_name ASC, s.display_order ASC, s.size_name ASC
  `;
  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * Check if size code already exists for size group
 */
export const existsByCode = async (sizeGroupId, sizeCode, excludeId = null) => {
  const pool = getPool();
  let query = `
    SELECT 1 FROM sizes 
    WHERE size_group_id = $1 AND LOWER(size_code) = LOWER($2)
  `;
  const values = [sizeGroupId, sizeCode];

  if (excludeId) {
    query += ' AND id <> $3';
    values.push(excludeId);
  }

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};

/**
 * Check if size name already exists for size group
 */
export const existsByName = async (sizeGroupId, sizeName, excludeId = null) => {
  const pool = getPool();
  let query = `
    SELECT 1 FROM sizes 
    WHERE size_group_id = $1 AND LOWER(size_name) = LOWER($2)
  `;
  const values = [sizeGroupId, sizeName];

  if (excludeId) {
    query += ' AND id <> $3';
    values.push(excludeId);
  }

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};

/**
 * Count product variants referencing size
 */
export const countVariants = async (sizeId) => {
  const pool = getPool();
  try {
    const query = 'SELECT COUNT(*) AS count FROM product_variants WHERE size_id = $1';
    const result = await pool.query(query, [sizeId]);
    return parseInt(result.rows[0]?.count || 0, 10);
  } catch (error) {
    if (error.code === '42P01') {
      return 0;
    }
    throw error;
  }
};

/**
 * Create a new size
 */
export const create = async (data) => {
  const pool = getPool();
  const query = `
    INSERT INTO sizes (
      company_id,
      size_group_id,
      size_code,
      size_name,
      display_order,
      is_active,
      created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const values = [
    data.company_id,
    data.size_group_id,
    data.size_code,
    data.size_name,
    data.display_order ?? 0,
    data.is_active !== undefined ? data.is_active : true,
    data.created_by || null,
  ];

  const result = await pool.query(query, values);
  return findById(result.rows[0].id);
};

/**
 * Update an existing size
 */
export const update = async (id, data) => {
  const pool = getPool();
  const fields = [];
  const values = [];
  let paramIndex = 1;

  const updatableColumns = [
    'company_id',
    'size_group_id',
    'size_code',
    'size_name',
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
    UPDATE sizes
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
 * Update size active status
 */
export const updateStatus = async (id, isActive, updatedBy = null) => {
  const pool = getPool();
  const query = `
    UPDATE sizes
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
 * Delete size by ID
 */
export const deleteById = async (id) => {
  const pool = getPool();
  const query = 'DELETE FROM sizes WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export default {
  findAll,
  findById,
  findByCode,
  findByName,
  findBySizeGroupId,
  findByCompanyId,
  existsByCode,
  existsByName,
  countVariants,
  create,
  update,
  updateStatus,
  deleteById,
};
