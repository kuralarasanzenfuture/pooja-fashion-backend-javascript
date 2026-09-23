import { getDatabasePool } from '../../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

/**
 * Find paginated list of materials with filters
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  search,
  companyId,
  isActive,
  sortBy = 'material_name',
  sortOrder = 'ASC',
} = {}) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (companyId !== undefined && companyId !== null) {
    conditions.push(`m.company_id = $${paramIndex++}`);
    values.push(companyId);
  }

  if (isActive !== undefined && isActive !== null) {
    conditions.push(`m.is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (search) {
    conditions.push(
      `(m.material_name ILIKE $${paramIndex} OR m.material_code ILIKE $${paramIndex} OR m.description ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'm.id',
    material_code: 'm.material_code',
    material_name: 'm.material_name',
    created_at: 'm.created_at',
    is_active: 'm.is_active',
  };

  const orderColumn = allowedSortColumns[sortBy] || 'm.material_name';
  const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM materials m
    ${whereClause}
  `;

  const dataQuery = `
    SELECT 
      m.*,
      c.company_name,
      c.company_code
    FROM materials m
    JOIN companies c ON c.id = m.company_id
    ${whereClause}
    ORDER BY ${orderColumn} ${direction}, m.material_name ASC
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
 * Find single material by primary key ID
 */
export const findById = async (id) => {
  const pool = getPool();
  const query = `
    SELECT 
      m.*,
      c.company_name,
      c.company_code
    FROM materials m
    JOIN companies c ON c.id = m.company_id
    WHERE m.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find material by company ID and material code
 */
export const findByCode = async (companyId, materialCode) => {
  const pool = getPool();
  const query = `
    SELECT 
      m.*,
      c.company_name,
      c.company_code
    FROM materials m
    JOIN companies c ON c.id = m.company_id
    WHERE m.company_id = $1 AND LOWER(m.material_code) = LOWER($2)
  `;
  const result = await pool.query(query, [companyId, materialCode]);
  return result.rows[0] || null;
};

/**
 * Find material by company ID and material name
 */
export const findByName = async (companyId, materialName) => {
  const pool = getPool();
  const query = `
    SELECT 
      m.*,
      c.company_name,
      c.company_code
    FROM materials m
    JOIN companies c ON c.id = m.company_id
    WHERE m.company_id = $1 AND LOWER(m.material_name) = LOWER($2)
  `;
  const result = await pool.query(query, [companyId, materialName]);
  return result.rows[0] || null;
};

/**
 * Find all materials for a given company
 */
export const findByCompanyId = async (companyId, { isActive = null } = {}) => {
  const pool = getPool();
  const conditions = ['m.company_id = $1'];
  const values = [companyId];

  if (isActive !== null && isActive !== undefined) {
    conditions.push('m.is_active = $2');
    values.push(isActive);
  }

  const query = `
    SELECT 
      m.*,
      c.company_name,
      c.company_code
    FROM materials m
    JOIN companies c ON c.id = m.company_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY m.material_name ASC
  `;
  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * Check if material code already exists for this company
 */
export const existsByCode = async (companyId, materialCode, excludeId = null) => {
  const pool = getPool();
  let query = `
    SELECT 1 FROM materials 
    WHERE company_id = $1 AND LOWER(material_code) = LOWER($2)
  `;
  const values = [companyId, materialCode];

  if (excludeId) {
    query += ' AND id <> $3';
    values.push(excludeId);
  }

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};

/**
 * Check if material name already exists for this company
 */
export const existsByName = async (companyId, materialName, excludeId = null) => {
  const pool = getPool();
  let query = `
    SELECT 1 FROM materials 
    WHERE company_id = $1 AND LOWER(material_name) = LOWER($2)
  `;
  const values = [companyId, materialName];

  if (excludeId) {
    query += ' AND id <> $3';
    values.push(excludeId);
  }

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};

/**
 * Count product variants referencing material
 */
export const countVariants = async (materialId) => {
  const pool = getPool();
  try {
    const query = 'SELECT COUNT(*) AS count FROM product_variants WHERE material_id = $1';
    const result = await pool.query(query, [materialId]);
    return parseInt(result.rows[0]?.count || 0, 10);
  } catch (error) {
    if (error.code === '42P01') {
      return 0;
    }
    throw error;
  }
};

/**
 * Create a new material
 */
export const create = async (data) => {
  const pool = getPool();
  const query = `
    INSERT INTO materials (
      company_id,
      material_code,
      material_name,
      description,
      is_active,
      created_by
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const values = [
    data.company_id,
    data.material_code,
    data.material_name,
    data.description || null,
    data.is_active !== undefined ? data.is_active : true,
    data.created_by || null,
  ];

  const result = await pool.query(query, values);
  return findById(result.rows[0].id);
};

/**
 * Update an existing material
 */
export const update = async (id, data) => {
  const pool = getPool();
  const fields = [];
  const values = [];
  let paramIndex = 1;

  const updatableColumns = [
    'company_id',
    'material_code',
    'material_name',
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
    UPDATE materials
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
 * Update material active status
 */
export const updateStatus = async (id, isActive, updatedBy = null) => {
  const pool = getPool();
  const query = `
    UPDATE materials
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
 * Delete material by ID
 */
export const deleteById = async (id) => {
  const pool = getPool();
  const query = 'DELETE FROM materials WHERE id = $1 RETURNING *';
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
