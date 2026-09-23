import { getDatabasePool } from '../../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

/**
 * Find paginated list of subcategories with filters
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  search,
  companyId,
  categoryId,
  isActive,
  sortBy = 'display_order',
  sortOrder = 'ASC',
} = {}) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (companyId !== undefined && companyId !== null) {
    conditions.push(`sub.company_id = $${paramIndex++}`);
    values.push(companyId);
  }

  if (categoryId !== undefined && categoryId !== null) {
    conditions.push(`sub.category_id = $${paramIndex++}`);
    values.push(categoryId);
  }

  if (isActive !== undefined && isActive !== null) {
    conditions.push(`sub.is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (search) {
    conditions.push(
      `(sub.subcategory_name ILIKE $${paramIndex} OR sub.subcategory_code ILIKE $${paramIndex} OR sub.description ILIKE $${paramIndex} OR cat.category_name ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'sub.id',
    subcategory_code: 'sub.subcategory_code',
    subcategory_name: 'sub.subcategory_name',
    display_order: 'sub.display_order',
    created_at: 'sub.created_at',
    is_active: 'sub.is_active',
  };

  const orderColumn = allowedSortColumns[sortBy] || 'sub.display_order';
  const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM subcategories sub
    JOIN categories cat ON cat.id = sub.category_id
    ${whereClause}
  `;

  const dataQuery = `
    SELECT 
      sub.*,
      c.company_name,
      c.company_code,
      cat.category_name,
      cat.category_code
    FROM subcategories sub
    JOIN companies c ON c.id = sub.company_id
    JOIN categories cat ON cat.id = sub.category_id
    ${whereClause}
    ORDER BY ${orderColumn} ${direction}, sub.subcategory_name ASC
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
 * Find single subcategory by ID
 */
export const findById = async (id) => {
  const pool = getPool();
  const query = `
    SELECT 
      sub.*,
      c.company_name,
      c.company_code,
      cat.category_name,
      cat.category_code
    FROM subcategories sub
    JOIN companies c ON c.id = sub.company_id
    JOIN categories cat ON cat.id = sub.category_id
    WHERE sub.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find subcategory by company ID and subcategory code
 */
export const findByCode = async (companyId, subcategoryCode) => {
  const pool = getPool();
  const query = `
    SELECT 
      sub.*,
      c.company_name,
      c.company_code,
      cat.category_name,
      cat.category_code
    FROM subcategories sub
    JOIN companies c ON c.id = sub.company_id
    JOIN categories cat ON cat.id = sub.category_id
    WHERE sub.company_id = $1 AND LOWER(sub.subcategory_code) = LOWER($2)
  `;
  const result = await pool.query(query, [companyId, subcategoryCode]);
  return result.rows[0] || null;
};

/**
 * Find subcategory by category ID and subcategory name
 */
export const findByName = async (categoryId, subcategoryName) => {
  const pool = getPool();
  const query = `
    SELECT 
      sub.*,
      c.company_name,
      c.company_code,
      cat.category_name,
      cat.category_code
    FROM subcategories sub
    JOIN companies c ON c.id = sub.company_id
    JOIN categories cat ON cat.id = sub.category_id
    WHERE sub.category_id = $1 AND LOWER(sub.subcategory_name) = LOWER($2)
  `;
  const result = await pool.query(query, [categoryId, subcategoryName]);
  return result.rows[0] || null;
};

/**
 * Find all subcategories for a given category
 */
export const findByCategoryId = async (categoryId, { isActive = null } = {}) => {
  const pool = getPool();
  const conditions = ['sub.category_id = $1'];
  const values = [categoryId];

  if (isActive !== null && isActive !== undefined) {
    conditions.push('sub.is_active = $2');
    values.push(isActive);
  }

  const query = `
    SELECT 
      sub.*,
      c.company_name,
      c.company_code,
      cat.category_name,
      cat.category_code
    FROM subcategories sub
    JOIN companies c ON c.id = sub.company_id
    JOIN categories cat ON cat.id = sub.category_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY sub.display_order ASC, sub.subcategory_name ASC
  `;
  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * Find all subcategories for a given company
 */
export const findByCompanyId = async (companyId, { isActive = null } = {}) => {
  const pool = getPool();
  const conditions = ['sub.company_id = $1'];
  const values = [companyId];

  if (isActive !== null && isActive !== undefined) {
    conditions.push('sub.is_active = $2');
    values.push(isActive);
  }

  const query = `
    SELECT 
      sub.*,
      c.company_name,
      c.company_code,
      cat.category_name,
      cat.category_code
    FROM subcategories sub
    JOIN companies c ON c.id = sub.company_id
    JOIN categories cat ON cat.id = sub.category_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY sub.display_order ASC, sub.subcategory_name ASC
  `;
  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * Check if subcategory code exists for the company
 */
export const existsByCode = async (companyId, subcategoryCode, excludeId = null) => {
  const pool = getPool();
  let query = `
    SELECT 1 FROM subcategories 
    WHERE company_id = $1 AND LOWER(subcategory_code) = LOWER($2)
  `;
  const values = [companyId, subcategoryCode];

  if (excludeId) {
    query += ' AND id <> $3';
    values.push(excludeId);
  }

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};

/**
 * Check if subcategory name exists within the parent category
 */
export const existsByName = async (categoryId, subcategoryName, excludeId = null) => {
  const pool = getPool();
  let query = `
    SELECT 1 FROM subcategories 
    WHERE category_id = $1 AND LOWER(subcategory_name) = LOWER($2)
  `;
  const values = [categoryId, subcategoryName];

  if (excludeId) {
    query += ' AND id <> $3';
    values.push(excludeId);
  }

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};

/**
 * Count products referencing subcategory
 */
export const countProducts = async (subcategoryId) => {
  const pool = getPool();
  try {
    const query = 'SELECT COUNT(*) AS count FROM products WHERE subcategory_id = $1';
    const result = await pool.query(query, [subcategoryId]);
    return parseInt(result.rows[0]?.count || 0, 10);
  } catch (error) {
    if (error.code === '42P01') {
      return 0;
    }
    throw error;
  }
};

/**
 * Create new subcategory
 */
export const create = async (data) => {
  const pool = getPool();
  const query = `
    INSERT INTO subcategories (
      company_id,
      category_id,
      subcategory_code,
      subcategory_name,
      description,
      image_url,
      image_key,
      display_order,
      is_active,
      created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  const values = [
    data.company_id,
    data.category_id,
    data.subcategory_code,
    data.subcategory_name,
    data.description || null,
    data.image_url || null,
    data.image_key || null,
    data.display_order ?? 0,
    data.is_active !== undefined ? data.is_active : true,
    data.created_by || null,
  ];

  const result = await pool.query(query, values);
  return findById(result.rows[0].id);
};

/**
 * Update existing subcategory
 */
export const update = async (id, data) => {
  const pool = getPool();
  const fields = [];
  const values = [];
  let paramIndex = 1;

  const updatableColumns = [
    'company_id',
    'category_id',
    'subcategory_code',
    'subcategory_name',
    'description',
    'image_url',
    'image_key',
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
    UPDATE subcategories
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
 * Update subcategory active status
 */
export const updateStatus = async (id, isActive, updatedBy = null) => {
  const pool = getPool();
  const query = `
    UPDATE subcategories
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
 * Delete subcategory by ID
 */
export const deleteById = async (id) => {
  const pool = getPool();
  const query = 'DELETE FROM subcategories WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export default {
  findAll,
  findById,
  findByCode,
  findByName,
  findByCategoryId,
  findByCompanyId,
  existsByCode,
  existsByName,
  countProducts,
  create,
  update,
  updateStatus,
  deleteById,
};
