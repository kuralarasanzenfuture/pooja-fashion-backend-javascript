import { getDatabasePool } from '../../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

const BASE_PRODUCT_SELECT = `
  SELECT 
    p.*,
    c.company_name,
    c.company_code,
    cat.category_name,
    cat.category_code,
    sub.subcategory_name,
    sub.subcategory_code,
    b.brand_name,
    b.brand_code,
    pt.type_name,
    pt.type_code,
    u.unit_name,
    u.unit_code,
    u.symbol AS unit_symbol
  FROM products p
  JOIN companies c ON c.id = p.company_id
  JOIN categories cat ON cat.id = p.category_id
  LEFT JOIN subcategories sub ON sub.id = p.subcategory_id
  LEFT JOIN brands b ON b.id = p.brand_id
  LEFT JOIN product_types pt ON pt.id = p.product_type_id
  JOIN units u ON u.id = p.default_unit_id
`;

/**
 * Find paginated list of products with filters
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  search,
  companyId,
  categoryId,
  subcategoryId,
  brandId,
  productTypeId,
  defaultUnitId,
  isVariantProduct,
  trackStock,
  allowNegativeStock,
  isActive,
  sortBy = 'product_name',
  sortOrder = 'ASC',
} = {}) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (companyId !== undefined && companyId !== null) {
    conditions.push(`p.company_id = $${paramIndex++}`);
    values.push(companyId);
  }

  if (categoryId !== undefined && categoryId !== null) {
    conditions.push(`p.category_id = $${paramIndex++}`);
    values.push(categoryId);
  }

  if (subcategoryId !== undefined && subcategoryId !== null) {
    conditions.push(`p.subcategory_id = $${paramIndex++}`);
    values.push(subcategoryId);
  }

  if (brandId !== undefined && brandId !== null) {
    conditions.push(`p.brand_id = $${paramIndex++}`);
    values.push(brandId);
  }

  if (productTypeId !== undefined && productTypeId !== null) {
    conditions.push(`p.product_type_id = $${paramIndex++}`);
    values.push(productTypeId);
  }

  if (defaultUnitId !== undefined && defaultUnitId !== null) {
    conditions.push(`p.default_unit_id = $${paramIndex++}`);
    values.push(defaultUnitId);
  }

  if (isVariantProduct !== undefined && isVariantProduct !== null) {
    conditions.push(`p.is_variant_product = $${paramIndex++}`);
    values.push(isVariantProduct);
  }

  if (trackStock !== undefined && trackStock !== null) {
    conditions.push(`p.track_stock = $${paramIndex++}`);
    values.push(trackStock);
  }

  if (allowNegativeStock !== undefined && allowNegativeStock !== null) {
    conditions.push(`p.allow_negative_stock = $${paramIndex++}`);
    values.push(allowNegativeStock);
  }

  if (isActive !== undefined && isActive !== null) {
    conditions.push(`p.is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (search) {
    conditions.push(
      `(p.product_name ILIKE $${paramIndex} OR p.product_code ILIKE $${paramIndex} OR p.manufacturer_name ILIKE $${paramIndex} OR p.manufacturer_part_no ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'p.id',
    product_code: 'p.product_code',
    product_name: 'p.product_name',
    category_id: 'p.category_id',
    subcategory_id: 'p.subcategory_id',
    brand_id: 'p.brand_id',
    product_type_id: 'p.product_type_id',
    default_unit_id: 'p.default_unit_id',
    created_at: 'p.created_at',
    is_active: 'p.is_active',
  };

  const orderColumn = allowedSortColumns[sortBy] || 'p.product_name';
  const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM products p
    ${whereClause}
  `;

  const dataQuery = `
    ${BASE_PRODUCT_SELECT}
    ${whereClause}
    ORDER BY ${orderColumn} ${direction}, p.product_name ASC
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
 * Find single product by primary key ID
 */
export const findById = async (id) => {
  const pool = getPool();
  const query = `
    ${BASE_PRODUCT_SELECT}
    WHERE p.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find product by company ID and product code
 */
export const findByCode = async (companyId, productCode) => {
  const pool = getPool();
  const query = `
    ${BASE_PRODUCT_SELECT}
    WHERE p.company_id = $1 AND LOWER(p.product_code) = LOWER($2)
  `;
  const result = await pool.query(query, [companyId, productCode]);
  return result.rows[0] || null;
};

/**
 * Find product by company ID and product name
 */
export const findByName = async (companyId, productName) => {
  const pool = getPool();
  const query = `
    ${BASE_PRODUCT_SELECT}
    WHERE p.company_id = $1 AND LOWER(p.product_name) = LOWER($2)
  `;
  const result = await pool.query(query, [companyId, productName]);
  return result.rows[0] || null;
};

/**
 * Check if product code already exists for this company
 */
export const existsByCode = async (companyId, productCode, excludeId = null) => {
  const pool = getPool();
  let query = `
    SELECT 1 FROM products 
    WHERE company_id = $1 AND LOWER(product_code) = LOWER($2)
  `;
  const values = [companyId, productCode];

  if (excludeId) {
    query += ' AND id <> $3';
    values.push(excludeId);
  }

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};

/**
 * Check if product name already exists for this company
 */
export const existsByName = async (companyId, productName, excludeId = null) => {
  const pool = getPool();
  let query = `
    SELECT 1 FROM products 
    WHERE company_id = $1 AND LOWER(product_name) = LOWER($2)
  `;
  const values = [companyId, productName];

  if (excludeId) {
    query += ' AND id <> $3';
    values.push(excludeId);
  }

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};

/**
 * Count product variants referencing product
 */
export const countVariants = async (productId) => {
  const pool = getPool();
  try {
    const query = 'SELECT COUNT(*) AS count FROM product_variants WHERE product_id = $1';
    const result = await pool.query(query, [productId]);
    return parseInt(result.rows[0]?.count || 0, 10);
  } catch (error) {
    if (error.code === '42P01') {
      return 0;
    }
    throw error;
  }
};

/**
 * Create a new product
 */
export const create = async (data) => {
  const pool = getPool();
  const query = `
    INSERT INTO products (
      company_id,
      product_code,
      product_name,
      category_id,
      subcategory_id,
      brand_id,
      product_type_id,
      description,
      short_description,
      manufacturer_name,
      manufacturer_part_no,
      default_unit_id,
      is_variant_product,
      track_stock,
      allow_negative_stock,
      is_active,
      created_by
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
    )
    RETURNING id
  `;

  const values = [
    data.company_id,
    data.product_code,
    data.product_name,
    data.category_id,
    data.subcategory_id || null,
    data.brand_id || null,
    data.product_type_id || null,
    data.description || null,
    data.short_description || null,
    data.manufacturer_name || null,
    data.manufacturer_part_no || null,
    data.default_unit_id,
    data.is_variant_product !== undefined ? data.is_variant_product : true,
    data.track_stock !== undefined ? data.track_stock : true,
    data.allow_negative_stock !== undefined ? data.allow_negative_stock : false,
    data.is_active !== undefined ? data.is_active : true,
    data.created_by || null,
  ];

  const result = await pool.query(query, values);
  return findById(result.rows[0].id);
};

/**
 * Update an existing product
 */
export const update = async (id, data) => {
  const pool = getPool();
  const fields = [];
  const values = [];
  let paramIndex = 1;

  const updatableColumns = [
    'company_id',
    'product_code',
    'product_name',
    'category_id',
    'subcategory_id',
    'brand_id',
    'product_type_id',
    'description',
    'short_description',
    'manufacturer_name',
    'manufacturer_part_no',
    'default_unit_id',
    'is_variant_product',
    'track_stock',
    'allow_negative_stock',
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
    UPDATE products
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id
  `;

  const result = await pool.query(query, values);
  if (result.rowCount === 0) {
    return null;
  }

  return findById(id);
};

/**
 * Update product active status
 */
export const updateStatus = async (id, isActive, updatedBy = null) => {
  const pool = getPool();
  const query = `
    UPDATE products
    SET is_active = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING id
  `;
  const result = await pool.query(query, [isActive, updatedBy, id]);
  if (result.rowCount === 0) {
    return null;
  }
  return findById(id);
};

/**
 * Delete product by ID
 */
export const deleteById = async (id) => {
  const pool = getPool();
  const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export default {
  findAll,
  findById,
  findByCode,
  findByName,
  existsByCode,
  existsByName,
  countVariants,
  create,
  update,
  updateStatus,
  deleteById,
};
