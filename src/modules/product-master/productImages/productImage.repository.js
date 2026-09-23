import { getDatabasePool } from '../../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

const BASE_IMAGE_SELECT = `
  SELECT 
    pi.*,
    c.company_name,
    c.company_code,
    p.product_code,
    p.product_name,
    pv.sku AS variant_sku,
    pv.variant_name
  FROM product_images pi
  JOIN companies c ON pi.company_id = c.id
  JOIN products p ON pi.product_id = p.id
  LEFT JOIN product_variants pv ON pi.variant_id = pv.id
`;

/**
 * Find paginated list of product images with filters
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  search,
  companyId,
  productId,
  variantId,
  isPrimary,
  isActive,
  sortBy = 'id',
  sortOrder = 'ASC',
} = {}) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (companyId !== undefined && companyId !== null) {
    conditions.push(`pi.company_id = $${paramIndex++}`);
    values.push(companyId);
  }

  if (productId !== undefined && productId !== null) {
    conditions.push(`pi.product_id = $${paramIndex++}`);
    values.push(productId);
  }

  if (variantId !== undefined && variantId !== null) {
    conditions.push(`pi.variant_id = $${paramIndex++}`);
    values.push(variantId);
  }

  if (isPrimary !== undefined && isPrimary !== null) {
    conditions.push(`pi.is_primary = $${paramIndex++}`);
    values.push(isPrimary);
  }

  if (isActive !== undefined && isActive !== null) {
    conditions.push(`pi.is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (search) {
    conditions.push(
      `(pi.alt_text ILIKE $${paramIndex} OR pi.original_file_name ILIKE $${paramIndex} OR p.product_name ILIKE $${paramIndex} OR pv.sku ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'pi.id',
    display_order: 'pi.display_order',
    product_id: 'pi.product_id',
    variant_id: 'pi.variant_id',
    is_primary: 'pi.is_primary',
    is_active: 'pi.is_active',
    created_at: 'pi.created_at',
  };

  const orderColumn = allowedSortColumns[sortBy] || 'pi.display_order';
  const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const countQuery = `
    SELECT COUNT(pi.id) AS total
    FROM product_images pi
    JOIN products p ON pi.product_id = p.id
    LEFT JOIN product_variants pv ON pi.variant_id = pv.id
    ${whereClause}
  `;

  const dataQuery = `
    ${BASE_IMAGE_SELECT}
    ${whereClause}
    ORDER BY pi.is_primary DESC, ${orderColumn} ${direction}, pi.id ASC
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
 * Find single product image by primary key ID
 */
export const findById = async (id, client = null) => {
  const runner = client || getPool();
  const query = `
    ${BASE_IMAGE_SELECT}
    WHERE pi.id = $1
  `;
  const result = await runner.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find all images for a given product
 */
export const findByProductId = async (
  productId,
  { variantId = null, isPrimary = null, isActive = null } = {}
) => {
  const pool = getPool();
  const conditions = ['pi.product_id = $1'];
  const values = [productId];
  let paramIndex = 2;

  if (variantId !== null && variantId !== undefined) {
    conditions.push(`pi.variant_id = $${paramIndex++}`);
    values.push(variantId);
  }

  if (isPrimary !== null && isPrimary !== undefined) {
    conditions.push(`pi.is_primary = $${paramIndex++}`);
    values.push(isPrimary);
  }

  if (isActive !== null && isActive !== undefined) {
    conditions.push(`pi.is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  const query = `
    ${BASE_IMAGE_SELECT}
    WHERE ${conditions.join(' AND ')}
    ORDER BY pi.is_primary DESC, pi.display_order ASC, pi.id ASC
  `;
  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * Clear primary flag for product-level images (variant_id IS NULL)
 */
export const clearPrimaryForProduct = async (productId, client = null) => {
  const runner = client || getPool();
  const query = `
    UPDATE product_images
    SET is_primary = FALSE
    WHERE product_id = $1 AND variant_id IS NULL AND is_primary = TRUE
  `;
  await runner.query(query, [productId]);
};

/**
 * Clear primary flag for variant-level images
 */
export const clearPrimaryForVariant = async (variantId, client = null) => {
  const runner = client || getPool();
  const query = `
    UPDATE product_images
    SET is_primary = FALSE
    WHERE variant_id = $1 AND is_primary = TRUE
  `;
  await runner.query(query, [variantId]);
};

/**
 * Create a new product image record
 */
export const create = async (data, client = null) => {
  const runner = client || getPool();
  const query = `
    INSERT INTO product_images (
      company_id,
      product_id,
      variant_id,
      image_url,
      image_key,
      original_file_name,
      mime_type,
      file_size,
      width,
      height,
      alt_text,
      display_order,
      is_primary,
      is_active,
      created_by
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
    )
    RETURNING id
  `;

  const values = [
    data.company_id,
    data.product_id,
    data.variant_id || null,
    data.image_url,
    data.image_key || null,
    data.original_file_name || null,
    data.mime_type || null,
    data.file_size !== undefined ? data.file_size : null,
    data.width !== undefined ? data.width : null,
    data.height !== undefined ? data.height : null,
    data.alt_text || null,
    data.display_order !== undefined ? data.display_order : 0,
    data.is_primary !== undefined ? data.is_primary : false,
    data.is_active !== undefined ? data.is_active : true,
    data.created_by || null,
  ];

  const result = await runner.query(query, values);
  return findById(result.rows[0].id, runner);
};

/**
 * Update an existing product image record
 */
export const update = async (id, data, client = null) => {
  const runner = client || getPool();
  const fields = [];
  const values = [];
  let paramIndex = 1;

  const updatableColumns = [
    'image_url',
    'image_key',
    'original_file_name',
    'mime_type',
    'file_size',
    'width',
    'height',
    'alt_text',
    'display_order',
    'is_primary',
    'is_active',
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

  values.push(id);

  const query = `
    UPDATE product_images
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
 * Update image display order
 */
export const updateDisplayOrder = async (id, displayOrder, client = null) => {
  const runner = client || getPool();
  const query = `
    UPDATE product_images
    SET display_order = $1
    WHERE id = $2
    RETURNING id
  `;
  const result = await runner.query(query, [displayOrder, id]);
  return result.rowCount > 0;
};

/**
 * Update image active status
 */
export const updateStatus = async (id, isActive) => {
  const pool = getPool();
  const query = `
    UPDATE product_images
    SET is_active = $1
    WHERE id = $2
    RETURNING id
  `;
  const result = await pool.query(query, [isActive, id]);
  if (result.rowCount === 0) {
    return null;
  }
  return findById(id);
};

/**
 * Delete product image by ID
 */
export const deleteById = async (id) => {
  const pool = getPool();
  const query = 'DELETE FROM product_images WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export default {
  findAll,
  findById,
  findByProductId,
  clearPrimaryForProduct,
  clearPrimaryForVariant,
  create,
  update,
  updateDisplayOrder,
  updateStatus,
  deleteById,
};
