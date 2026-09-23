import { getDatabasePool } from '../../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

/**
 * Find paginated list of size groups with filters
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  search,
  companyId,
  isActive,
  sortBy = 'size_group_name',
  sortOrder = 'ASC',
} = {}) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (companyId !== undefined && companyId !== null) {
    conditions.push(`sg.company_id = $${paramIndex++}`);
    values.push(companyId);
  }

  if (isActive !== undefined && isActive !== null) {
    conditions.push(`sg.is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (search) {
    conditions.push(
      `(sg.size_group_name ILIKE $${paramIndex} OR sg.size_group_code ILIKE $${paramIndex} OR sg.description ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'sg.id',
    size_group_code: 'sg.size_group_code',
    size_group_name: 'sg.size_group_name',
    created_at: 'sg.created_at',
    is_active: 'sg.is_active',
  };

  const orderColumn = allowedSortColumns[sortBy] || 'sg.size_group_name';
  const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM size_groups sg
    ${whereClause}
  `;

  const dataQuery = `
    SELECT 
      sg.*,
      c.company_name,
      c.company_code
    FROM size_groups sg
    JOIN companies c ON c.id = sg.company_id
    ${whereClause}
    ORDER BY ${orderColumn} ${direction}, sg.size_group_name ASC
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
 * Find single size group by ID
 */
export const findById = async (id) => {
  const pool = getPool();
  const query = `
    SELECT 
      sg.*,
      c.company_name,
      c.company_code
    FROM size_groups sg
    JOIN companies c ON c.id = sg.company_id
    WHERE sg.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find size group by company ID and code
 */
export const findByCode = async (companyId, sizeGroupCode) => {
  const pool = getPool();
  const query = `
    SELECT 
      sg.*,
      c.company_name,
      c.company_code
    FROM size_groups sg
    JOIN companies c ON c.id = sg.company_id
    WHERE sg.company_id = $1 AND LOWER(sg.size_group_code) = LOWER($2)
  `;
  const result = await pool.query(query, [companyId, sizeGroupCode]);
  return result.rows[0] || null;
};

/**
 * Find size group by company ID and name
 */
export const findByName = async (companyId, sizeGroupName) => {
  const pool = getPool();
  const query = `
    SELECT 
      sg.*,
      c.company_name,
      c.company_code
    FROM size_groups sg
    JOIN companies c ON c.id = sg.company_id
    WHERE sg.company_id = $1 AND LOWER(sg.size_group_name) = LOWER($2)
  `;
  const result = await pool.query(query, [companyId, sizeGroupName]);
  return result.rows[0] || null;
};

/**
 * Find all size groups for a given company
 */
export const findByCompanyId = async (companyId, { isActive = null } = {}) => {
  const pool = getPool();
  const conditions = ['sg.company_id = $1'];
  const values = [companyId];

  if (isActive !== null && isActive !== undefined) {
    conditions.push('sg.is_active = $2');
    values.push(isActive);
  }

  const query = `
    SELECT 
      sg.*,
      c.company_name,
      c.company_code
    FROM size_groups sg
    JOIN companies c ON c.id = sg.company_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY sg.size_group_name ASC
  `;
  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * Check if size group code already exists for company
 */
export const existsByCode = async (companyId, sizeGroupCode, excludeId = null) => {
  const pool = getPool();
  let query = `
    SELECT 1 FROM size_groups 
    WHERE company_id = $1 AND LOWER(size_group_code) = LOWER($2)
  `;
  const values = [companyId, sizeGroupCode];

  if (excludeId) {
    query += ' AND id <> $3';
    values.push(excludeId);
  }

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};

/**
 * Check if size group name already exists for company
 */
export const existsByName = async (companyId, sizeGroupName, excludeId = null) => {
  const pool = getPool();
  let query = `
    SELECT 1 FROM size_groups 
    WHERE company_id = $1 AND LOWER(size_group_name) = LOWER($2)
  `;
  const values = [companyId, sizeGroupName];

  if (excludeId) {
    query += ' AND id <> $3';
    values.push(excludeId);
  }

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};

/**
 * Count child sizes referencing size group
 */
export const countSizes = async (sizeGroupId) => {
  const pool = getPool();
  try {
    const query = 'SELECT COUNT(*) AS count FROM sizes WHERE size_group_id = $1';
    const result = await pool.query(query, [sizeGroupId]);
    return parseInt(result.rows[0]?.count || 0, 10);
  } catch (error) {
    if (error.code === '42P01') {
      return 0;
    }
    throw error;
  }
};

/**
 * Create a new size group
 */
export const create = async (data) => {
  const pool = getPool();
  const query = `
    INSERT INTO size_groups (
      company_id,
      size_group_code,
      size_group_name,
      description,
      is_active,
      created_by
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const values = [
    data.company_id,
    data.size_group_code,
    data.size_group_name,
    data.description || null,
    data.is_active !== undefined ? data.is_active : true,
    data.created_by || null,
  ];

  const result = await pool.query(query, values);
  return findById(result.rows[0].id);
};

/**
 * Update an existing size group
 */
export const update = async (id, data) => {
  const pool = getPool();
  const fields = [];
  const values = [];
  let paramIndex = 1;

  const updatableColumns = [
    'company_id',
    'size_group_code',
    'size_group_name',
    'description',
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
    UPDATE size_groups
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
 * Update size group active status
 */
export const updateStatus = async (id, isActive, updatedBy = null) => {
  const pool = getPool();
  const query = `
    UPDATE size_groups
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
 * Delete size group by ID
 */
export const deleteById = async (id) => {
  const pool = getPool();
  const query = 'DELETE FROM size_groups WHERE id = $1 RETURNING *';
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
  countSizes,
  create,
  update,
  updateStatus,
  deleteById,
};
