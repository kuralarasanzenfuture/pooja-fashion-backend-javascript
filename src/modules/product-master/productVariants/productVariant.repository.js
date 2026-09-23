import { getDatabasePool } from '../../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

const BASE_VARIANT_SELECT = `
  SELECT 
    pv.*,
    c.company_name,
    c.company_code,
    p.product_code,
    p.product_name,
    sg.group_name AS size_group_name,
    sg.group_code AS size_group_code,
    s.size_name,
    s.size_code,
    col.color_name,
    col.color_code,
    col.hex_code AS color_hex_code,
    m.material_name,
    m.material_code,
    u.unit_name,
    u.unit_code,
    u.symbol AS unit_symbol
  FROM product_variants pv
  JOIN companies c ON pv.company_id = c.id
  JOIN products p ON pv.product_id = p.id
  LEFT JOIN size_groups sg ON pv.size_group_id = sg.id
  LEFT JOIN sizes s ON pv.size_id = s.id
  LEFT JOIN colors col ON pv.color_id = col.id
  LEFT JOIN materials m ON pv.material_id = m.id
  JOIN units u ON pv.unit_id = u.id
`;

/**
 * Find paginated list of product variants with filters
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  search,
  companyId,
  productId,
  sizeGroupId,
  sizeId,
  colorId,
  materialId,
  unitId,
  isDefault,
  trackStock,
  allowNegativeStock,
  isActive,
  sortBy = 'sku',
  sortOrder = 'ASC',
} = {}) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (companyId !== undefined && companyId !== null) {
    conditions.push(`pv.company_id = $${paramIndex++}`);
    values.push(companyId);
  }

  if (productId !== undefined && productId !== null) {
    conditions.push(`pv.product_id = $${paramIndex++}`);
    values.push(productId);
  }

  if (sizeGroupId !== undefined && sizeGroupId !== null) {
    conditions.push(`pv.size_group_id = $${paramIndex++}`);
    values.push(sizeGroupId);
  }

  if (sizeId !== undefined && sizeId !== null) {
    conditions.push(`pv.size_id = $${paramIndex++}`);
    values.push(sizeId);
  }

  if (colorId !== undefined && colorId !== null) {
    conditions.push(`pv.color_id = $${paramIndex++}`);
    values.push(colorId);
  }

  if (materialId !== undefined && materialId !== null) {
    conditions.push(`pv.material_id = $${paramIndex++}`);
    values.push(materialId);
  }

  if (unitId !== undefined && unitId !== null) {
    conditions.push(`pv.unit_id = $${paramIndex++}`);
    values.push(unitId);
  }

  if (isDefault !== undefined && isDefault !== null) {
    conditions.push(`pv.is_default = $${paramIndex++}`);
    values.push(isDefault);
  }

  if (trackStock !== undefined && trackStock !== null) {
    conditions.push(`pv.track_stock = $${paramIndex++}`);
    values.push(trackStock);
  }

  if (allowNegativeStock !== undefined && allowNegativeStock !== null) {
    conditions.push(`pv.allow_negative_stock = $${paramIndex++}`);
    values.push(allowNegativeStock);
  }

  if (isActive !== undefined && isActive !== null) {
    conditions.push(`pv.is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (search) {
    conditions.push(
      `(pv.sku ILIKE $${paramIndex} OR pv.variant_name ILIKE $${paramIndex} OR pv.variant_code ILIKE $${paramIndex} OR pv.model_no ILIKE $${paramIndex} OR pv.style_code ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'pv.id',
    sku: 'pv.sku',
    variant_code: 'pv.variant_code',
    variant_name: 'pv.variant_name',
    product_id: 'pv.product_id',
    size_group_id: 'pv.size_group_id',
    size_id: 'pv.size_id',
    color_id: 'pv.color_id',
    material_id: 'pv.material_id',
    unit_id: 'pv.unit_id',
    weight: 'pv.weight',
    is_default: 'pv.is_default',
    is_active: 'pv.is_active',
    created_at: 'pv.created_at',
  };

  const orderColumn = allowedSortColumns[sortBy] || 'pv.sku';
  const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM product_variants pv
    ${whereClause}
  `;

  const dataQuery = `
    ${BASE_PRODUCT_VARIANT_SELECT || BASE_VARIANT_SELECT}
    ${whereClause}
    ORDER BY ${orderColumn} ${direction}, pv.id ASC
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
 * Find single product variant by primary key ID
 */
export const findById = async (id, client = null) => {
  const runner = client || getPool();
  const query = `
    ${BASE_VARIANT_SELECT}
    WHERE pv.id = $1
  `;
  const result = await runner.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find product variant by company ID and SKU
 */
export const findBySku = async (companyId, sku) => {
  const pool = getPool();
  const query = `
    ${BASE_VARIANT_SELECT}
    WHERE pv.company_id = $1 AND LOWER(pv.sku) = LOWER($2)
  `;
  const result = await pool.query(query, [companyId, sku]);
  return result.rows[0] || null;
};

/**
 * Find all product variants for a given product
 */
export const findByProductId = async (productId, { isActive = null } = {}) => {
  const pool = getPool();
  const conditions = ['pv.product_id = $1'];
  const values = [productId];

  if (isActive !== null && isActive !== undefined) {
    conditions.push('pv.is_active = $2');
    values.push(isActive);
  }

  const query = `
    ${BASE_VARIANT_SELECT}
    WHERE ${conditions.join(' AND ')}
    ORDER BY pv.is_default DESC, pv.sku ASC
  `;
  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * Check if SKU already exists for this company
 */
export const existsBySku = async (companyId, sku, excludeId = null) => {
  const pool = getPool();
  let query = `
    SELECT 1 FROM product_variants 
    WHERE company_id = $1 AND LOWER(sku) = LOWER($2)
  `;
  const values = [companyId, sku];

  if (excludeId) {
    query += ' AND id <> $3';
    values.push(excludeId);
  }

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};

/**
 * Clear default flag for all variants of a product
 */
export const clearDefault = async (productId, client = null) => {
  const runner = client || getPool();
  const query = `
    UPDATE product_variants
    SET is_default = FALSE, updated_at = CURRENT_TIMESTAMP
    WHERE product_id = $1 AND is_default = TRUE
  `;
  await runner.query(query, [productId]);
};

/**
 * Check dependent price histories referencing product variant
 */
export const countPriceHistories = async (variantId) => {
  const pool = getPool();
  try {
    const query = 'SELECT COUNT(*) AS count FROM product_price_history WHERE variant_id = $1';
    const result = await pool.query(query, [variantId]);
    return parseInt(result.rows[0]?.count || 0, 10);
  } catch (error) {
    if (error.code === '42P01') {
      return 0;
    }
    throw error;
  }
};

/**
 * Create a new product variant
 */
export const create = async (data, client = null) => {
  const runner = client || getPool();
  const query = `
    INSERT INTO product_variants (
      company_id,
      product_id,
      sku,
      variant_code,
      variant_name,
      size_group_id,
      size_id,
      color_id,
      material_id,
      unit_id,
      model_no,
      style_code,
      weight,
      track_stock,
      allow_negative_stock,
      is_default,
      is_active,
      created_by
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
    )
    RETURNING id
  `;

  const values = [
    data.company_id,
    data.product_id,
    data.sku,
    data.variant_code || null,
    data.variant_name || null,
    data.size_group_id || null,
    data.size_id || null,
    data.color_id || null,
    data.material_id || null,
    data.unit_id,
    data.model_no || null,
    data.style_code || null,
    data.weight !== undefined ? data.weight : null,
    data.track_stock !== undefined ? data.track_stock : true,
    data.allow_negative_stock !== undefined ? data.allow_negative_stock : false,
    data.is_default !== undefined ? data.is_default : false,
    data.is_active !== undefined ? data.is_active : true,
    data.created_by || null,
  ];

  const result = await runner.query(query, values);
  return findById(result.rows[0].id, runner);
};

/**
 * Update an existing product variant
 */
export const update = async (id, data, client = null) => {
  const runner = client || getPool();
  const fields = [];
  const values = [];
  let paramIndex = 1;

  const updatableColumns = [
    'company_id',
    'product_id',
    'sku',
    'variant_code',
    'variant_name',
    'size_group_id',
    'size_id',
    'color_id',
    'material_id',
    'unit_id',
    'model_no',
    'style_code',
    'weight',
    'track_stock',
    'allow_negative_stock',
    'is_default',
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
    return findById(id, runner);
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE product_variants
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id
  `;

  const result = await runner.query(query, values);
  if (result.rowCount === 0) {
    return null;
  }

  return findById(id, runner);
};

/**
 * Update product variant active status
 */
export const updateStatus = async (id, isActive, updatedBy = null) => {
  const pool = getPool();
  const query = `
    UPDATE product_variants
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
 * Delete product variant by ID
 */
export const deleteById = async (id) => {
  const pool = getPool();
  const query = 'DELETE FROM product_variants WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export default {
  findAll,
  findById,
  findBySku,
  findByProductId,
  existsBySku,
  clearDefault,
  countPriceHistories,
  create,
  update,
  updateStatus,
  deleteById,
};
