import { getDatabasePool } from '../../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

/**
 * Find paginated list of product types with filters
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  search,
  companyId,
  isStockItem,
  isSaleable,
  isPurchasable,
  isActive,
  sortBy = 'type_name',
  sortOrder = 'ASC',
} = {}) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (companyId !== undefined && companyId !== null) {
    conditions.push(`pt.company_id = $${paramIndex++}`);
    values.push(companyId);
  }

  if (isStockItem !== undefined && isStockItem !== null) {
    conditions.push(`pt.is_stock_item = $${paramIndex++}`);
    values.push(isStockItem);
  }

  if (isSaleable !== undefined && isSaleable !== null) {
    conditions.push(`pt.is_saleable = $${paramIndex++}`);
    values.push(isSaleable);
  }

  if (isPurchasable !== undefined && isPurchasable !== null) {
    conditions.push(`pt.is_purchasable = $${paramIndex++}`);
    values.push(isPurchasable);
  }

  if (isActive !== undefined && isActive !== null) {
    conditions.push(`pt.is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (search) {
    conditions.push(
      `(pt.type_name ILIKE $${paramIndex} OR pt.type_code ILIKE $${paramIndex} OR pt.description ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'pt.id',
    type_code: 'pt.type_code',
    type_name: 'pt.type_name',
    created_at: 'pt.created_at',
    is_active: 'pt.is_active',
  };

  const orderColumn = allowedSortColumns[sortBy] || 'pt.type_name';
  const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM product_types pt
    ${whereClause}
  `;

  const dataQuery = `
    SELECT 
      pt.*,
      c.company_name,
      c.company_code
    FROM product_types pt
    JOIN companies c ON c.id = pt.company_id
    ${whereClause}
    ORDER BY ${orderColumn} ${direction}, pt.type_name ASC
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
 * Find single product type by primary key ID
 */
export const findById = async (id) => {
  const pool = getPool();
  const query = `
    SELECT 
      pt.*,
      c.company_name,
      c.company_code
    FROM product_types pt
    JOIN companies c ON c.id = pt.company_id
    WHERE pt.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find product type by company ID and type code
 */
export const findByCode = async (companyId, typeCode) => {
  const pool = getPool();
  const query = `
    SELECT 
      pt.*,
      c.company_name,
      c.company_code
    FROM product_types pt
    JOIN companies c ON c.id = pt.company_id
    WHERE pt.company_id = $1 AND LOWER(pt.type_code) = LOWER($2)
  `;
  const result = await pool.query(query, [companyId, typeCode]);
  return result.rows[0] || null;
};

/**
 * Find product type by company ID and type name
 */
export const findByName = async (companyId, typeName) => {
  const pool = getPool();
  const query = `
    SELECT 
      pt.*,
      c.company_name,
      c.company_code
    FROM product_types pt
    JOIN companies c ON c.id = pt.company_id
    WHERE pt.company_id = $1 AND LOWER(pt.type_name) = LOWER($2)
  `;
  const result = await pool.query(query, [companyId, typeName]);
  return result.rows[0] || null;
};

/**
 * Find all product types for a given company
 */
export const findByCompanyId = async (companyId, { isActive = null } = {}) => {
  const pool = getPool();
  const conditions = ['pt.company_id = $1'];
  const values = [companyId];

  if (isActive !== null && isActive !== undefined) {
    conditions.push('pt.is_active = $2');
    values.push(isActive);
  }

  const query = `
    SELECT 
      pt.*,
      c.company_name,
      c.company_code
    FROM product_types pt
    JOIN companies c ON c.id = pt.company_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY pt.type_name ASC
  `;
  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * Check if type code already exists for this company
 */
export const existsByCode = async (companyId, typeCode, excludeId = null) => {
  const pool = getPool();
  let query = `
    SELECT 1 FROM product_types 
    WHERE company_id = $1 AND LOWER(type_code) = LOWER($2)
  `;
  const values = [companyId, typeCode];

  if (excludeId) {
    query += ' AND id <> $3';
    values.push(excludeId);
  }

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};

/**
 * Check if type name already exists for this company
 */
export const existsByName = async (companyId, typeName, excludeId = null) => {
  const pool = getPool();
  let query = `
    SELECT 1 FROM product_types 
    WHERE company_id = $1 AND LOWER(type_name) = LOWER($2)
  `;
  const values = [companyId, typeName];

  if (excludeId) {
    query += ' AND id <> $3';
    values.push(excludeId);
  }

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};

/**
 * Count products referencing product type
 */
export const countProducts = async (productTypeId) => {
  const pool = getPool();
  try {
    const query = 'SELECT COUNT(*) AS count FROM products WHERE product_type_id = $1';
    const result = await pool.query(query, [productTypeId]);
    return parseInt(result.rows[0]?.count || 0, 10);
  } catch (error) {
    if (error.code === '42P01') {
      return 0;
    }
    throw error;
  }
};

/**
 * Create a new product type
 */
export const create = async (data) => {
  const pool = getPool();
  const query = `
    INSERT INTO product_types (
      company_id,
      type_code,
      type_name,
      description,
      is_stock_item,
      is_saleable,
      is_purchasable,
      is_active,
      created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;

  const values = [
    data.company_id,
    data.type_code,
    data.type_name,
    data.description || null,
    data.is_stock_item !== undefined ? data.is_stock_item : true,
    data.is_saleable !== undefined ? data.is_saleable : true,
    data.is_purchasable !== undefined ? data.is_purchasable : true,
    data.is_active !== undefined ? data.is_active : true,
    data.created_by || null,
  ];

  const result = await pool.query(query, values);
  return findById(result.rows[0].id);
};

/**
 * Update an existing product type
 */
export const update = async (id, data) => {
  const pool = getPool();
  const fields = [];
  const values = [];
  let paramIndex = 1;

  const updatableColumns = [
    'company_id',
    'type_code',
    'type_name',
    'description',
    'is_stock_item',
    'is_saleable',
    'is_purchasable',
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
    UPDATE product_types
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
 * Update product type active status
 */
export const updateStatus = async (id, isActive, updatedBy = null) => {
  const pool = getPool();
  const query = `
    UPDATE product_types
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
 * Delete product type by ID
 */
export const deleteById = async (id) => {
  const pool = getPool();
  const query = 'DELETE FROM product_types WHERE id = $1 RETURNING *';
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
  create,
  update,
  updateStatus,
  deleteById,
};
