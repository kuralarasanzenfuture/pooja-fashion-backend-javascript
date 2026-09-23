import { getDatabasePool } from '../../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

/**
 * Find paginated list of categories with optional company, status, and search filters
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
    conditions.push(`cat.company_id = $${paramIndex++}`);
    values.push(companyId);
  }

  if (isActive !== undefined && isActive !== null) {
    conditions.push(`cat.is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (search) {
    conditions.push(
      `(cat.category_name ILIKE $${paramIndex} OR cat.category_code ILIKE $${paramIndex} OR cat.description ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'cat.id',
    category_code: 'cat.category_code',
    category_name: 'cat.category_name',
    display_order: 'cat.display_order',
    created_at: 'cat.created_at',
    is_active: 'cat.is_active',
  };

  const orderColumn = allowedSortColumns[sortBy] || 'cat.display_order';
  const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM categories cat
    ${whereClause}
  `;

  const dataQuery = `
    SELECT 
      cat.*,
      c.company_name,
      c.company_code
    FROM categories cat
    JOIN companies c ON c.id = cat.company_id
    ${whereClause}
    ORDER BY ${orderColumn} ${direction}, cat.category_name ASC
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
 * Find single category by ID
 */
export const findById = async (id) => {
  const pool = getPool();
  const query = `
    SELECT 
      cat.*,
      c.company_name,
      c.company_code
    FROM categories cat
    JOIN companies c ON c.id = cat.company_id
    WHERE cat.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find category by company ID and category code
 */
export const findByCode = async (companyId, categoryCode) => {
  const pool = getPool();
  const query = `
    SELECT 
      cat.*,
      c.company_name,
      c.company_code
    FROM categories cat
    JOIN companies c ON c.id = cat.company_id
    WHERE cat.company_id = $1 AND LOWER(cat.category_code) = LOWER($2)
  `;
  const result = await pool.query(query, [companyId, categoryCode]);
  return result.rows[0] || null;
};

/**
 * Find category by company ID and category name
 */
export const findByName = async (companyId, categoryName) => {
  const pool = getPool();
  const query = `
    SELECT 
      cat.*,
      c.company_name,
      c.company_code
    FROM categories cat
    JOIN companies c ON c.id = cat.company_id
    WHERE cat.company_id = $1 AND LOWER(cat.category_name) = LOWER($2)
  `;
  const result = await pool.query(query, [companyId, categoryName]);
  return result.rows[0] || null;
};

/**
 * Find all categories for a given company
 */
export const findByCompanyId = async (companyId, { isActive = null } = {}) => {
  const pool = getPool();
  const conditions = ['cat.company_id = $1'];
  const values = [companyId];

  if (isActive !== null && isActive !== undefined) {
    conditions.push('cat.is_active = $2');
    values.push(isActive);
  }

  const query = `
    SELECT 
      cat.*,
      c.company_name,
      c.company_code
    FROM categories cat
    JOIN companies c ON c.id = cat.company_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY cat.display_order ASC, cat.category_name ASC
  `;
  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * Check if category code already exists for the company
 */
export const existsByCode = async (companyId, categoryCode, excludeId = null) => {
  const pool = getPool();
  let query = `
    SELECT 1 FROM categories 
    WHERE company_id = $1 AND LOWER(category_code) = LOWER($2)
  `;
  const values = [companyId, categoryCode];

  if (excludeId) {
    query += ' AND id <> $3';
    values.push(excludeId);
  }

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};

/**
 * Check if category name already exists for the company
 */
export const existsByName = async (companyId, categoryName, excludeId = null) => {
  const pool = getPool();
  let query = `
    SELECT 1 FROM categories 
    WHERE company_id = $1 AND LOWER(category_name) = LOWER($2)
  `;
  const values = [companyId, categoryName];

  if (excludeId) {
    query += ' AND id <> $3';
    values.push(excludeId);
  }

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};

/**
 * Count subcategories referencing category
 */
export const countSubcategories = async (categoryId) => {
  const pool = getPool();
  try {
    const query = 'SELECT COUNT(*) AS count FROM subcategories WHERE category_id = $1';
    const result = await pool.query(query, [categoryId]);
    return parseInt(result.rows[0]?.count || 0, 10);
  } catch (error) {
    // If subcategories table does not exist yet
    if (error.code === '42P01') {
      return 0;
    }
    throw error;
  }
};

/**
 * Count products referencing category
 */
export const countProducts = async (categoryId) => {
  const pool = getPool();
  try {
    const query = 'SELECT COUNT(*) AS count FROM products WHERE category_id = $1';
    const result = await pool.query(query, [categoryId]);
    return parseInt(result.rows[0]?.count || 0, 10);
  } catch (error) {
    // If products table does not exist yet
    if (error.code === '42P01') {
      return 0;
    }
    throw error;
  }
};

/**
 * Create a new category
 */
export const create = async (data) => {
  const pool = getPool();
  const query = `
    INSERT INTO categories (
      company_id,
      category_code,
      category_name,
      description,
      image_url,
      image_key,
      display_order,
      is_active,
      created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;

  const values = [
    data.company_id,
    data.category_code,
    data.category_name,
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
 * Update an existing category
 */
export const update = async (id, data) => {
  const pool = getPool();
  const fields = [];
  const values = [];
  let paramIndex = 1;

  const updatableColumns = [
    'company_id',
    'category_code',
    'category_name',
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
    UPDATE categories
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
 * Update category active status
 */
export const updateStatus = async (id, isActive, updatedBy = null) => {
  const pool = getPool();
  const query = `
    UPDATE categories
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
 * Delete category by ID
 */
export const deleteById = async (id) => {
  const pool = getPool();
  const query = 'DELETE FROM categories WHERE id = $1 RETURNING *';
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
  countSubcategories,
  countProducts,
  create,
  update,
  updateStatus,
  deleteById,
};
