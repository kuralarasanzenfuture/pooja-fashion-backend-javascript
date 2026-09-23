import { getDatabasePool } from '../../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

const BASE_BARCODE_SELECT = `
  SELECT 
    pb.*,
    c.company_name,
    c.company_code,
    p.product_code,
    p.product_name,
    p.category_id,
    pv.sku AS variant_sku,
    pv.variant_name,
    pv.variant_code,
    pv.weight,
    pv.track_stock,
    pv.allow_negative_stock,
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
  FROM product_barcodes pb
  JOIN companies c ON pb.company_id = c.id
  JOIN products p ON pb.product_id = p.id
  JOIN product_variants pv ON pb.variant_id = pv.id
  LEFT JOIN sizes s ON pv.size_id = s.id
  LEFT JOIN colors col ON pv.color_id = col.id
  LEFT JOIN materials m ON pv.material_id = m.id
  JOIN units u ON pv.unit_id = u.id
`;

/**
 * Find paginated list of product barcodes with filters
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  search,
  companyId,
  productId,
  variantId,
  barcodeType,
  isPrimary,
  isActive,
  sortBy = 'id',
  sortOrder = 'DESC',
} = {}) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (companyId !== undefined && companyId !== null) {
    conditions.push(`pb.company_id = $${paramIndex++}`);
    values.push(companyId);
  }

  if (productId !== undefined && productId !== null) {
    conditions.push(`pb.product_id = $${paramIndex++}`);
    values.push(productId);
  }

  if (variantId !== undefined && variantId !== null) {
    conditions.push(`pb.variant_id = $${paramIndex++}`);
    values.push(variantId);
  }

  if (barcodeType) {
    conditions.push(`pb.barcode_type = $${paramIndex++}`);
    values.push(barcodeType);
  }

  if (isPrimary !== undefined && isPrimary !== null) {
    conditions.push(`pb.is_primary = $${paramIndex++}`);
    values.push(isPrimary);
  }

  if (isActive !== undefined && isActive !== null) {
    conditions.push(`pb.is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (search) {
    conditions.push(
      `(pb.barcode ILIKE $${paramIndex} OR pv.sku ILIKE $${paramIndex} OR p.product_name ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'pb.id',
    barcode: 'pb.barcode',
    barcode_type: 'pb.barcode_type',
    product_id: 'pb.product_id',
    variant_id: 'pb.variant_id',
    is_primary: 'pb.is_primary',
    is_active: 'pb.is_active',
    created_at: 'pb.created_at',
  };

  const orderColumn = allowedSortColumns[sortBy] || 'pb.id';
  const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const countQuery = `
    SELECT COUNT(pb.id) AS total
    FROM product_barcodes pb
    JOIN products p ON pb.product_id = p.id
    JOIN product_variants pv ON pb.variant_id = pv.id
    ${whereClause}
  `;

  const dataQuery = `
    ${BASE_BARCODE_SELECT}
    ${whereClause}
    ORDER BY pb.is_primary DESC, ${orderColumn} ${direction}
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
 * Find single barcode by primary key ID
 */
export const findById = async (id, client = null) => {
  const runner = client || getPool();
  const query = `
    ${BASE_BARCODE_SELECT}
    WHERE pb.id = $1
  `;
  const result = await runner.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find barcode by company ID and barcode string (POS scan)
 */
export const findByBarcode = async (companyId, barcode) => {
  const pool = getPool();
  const query = `
    ${BASE_BARCODE_SELECT}
    WHERE pb.company_id = $1 AND pb.barcode = $2
  `;
  const result = await pool.query(query, [companyId, barcode]);
  return result.rows[0] || null;
};

/**
 * Find all barcodes for a given variant
 */
export const findByVariantId = async (variantId, { isActive = null } = {}) => {
  const pool = getPool();
  const conditions = ['pb.variant_id = $1'];
  const values = [variantId];

  if (isActive !== null && isActive !== undefined) {
    conditions.push('pb.is_active = $2');
    values.push(isActive);
  }

  const query = `
    ${BASE_BARCODE_SELECT}
    WHERE ${conditions.join(' AND ')}
    ORDER BY pb.is_primary DESC, pb.id ASC
  `;
  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * Check if barcode string already exists for this company
 */
export const existsByBarcode = async (companyId, barcode, excludeId = null) => {
  const pool = getPool();
  let query = `
    SELECT 1 FROM product_barcodes
    WHERE company_id = $1 AND barcode = $2
  `;
  const values = [companyId, barcode];

  if (excludeId) {
    query += ' AND id <> $3';
    values.push(excludeId);
  }

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};

/**
 * Clear primary flag for all barcodes of a variant
 */
export const clearPrimary = async (variantId, client = null) => {
  const runner = client || getPool();
  const query = `
    UPDATE product_barcodes
    SET is_primary = FALSE
    WHERE variant_id = $1 AND is_primary = TRUE
  `;
  await runner.query(query, [variantId]);
};

/**
 * Create a new product barcode
 */
export const create = async (data, client = null) => {
  const runner = client || getPool();
  const query = `
    INSERT INTO product_barcodes (
      company_id,
      product_id,
      variant_id,
      barcode,
      barcode_type,
      is_primary,
      is_active,
      created_by
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8
    )
    RETURNING id
  `;

  const values = [
    data.company_id,
    data.product_id,
    data.variant_id,
    data.barcode,
    data.barcode_type || 'INTERNAL',
    data.is_primary !== undefined ? data.is_primary : false,
    data.is_active !== undefined ? data.is_active : true,
    data.created_by || null,
  ];

  const result = await runner.query(query, values);
  return findById(result.rows[0].id, runner);
};

/**
 * Update an existing product barcode
 */
export const update = async (id, data, client = null) => {
  const runner = client || getPool();
  const fields = [];
  const values = [];
  let paramIndex = 1;

  const updatableColumns = [
    'barcode',
    'barcode_type',
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
    UPDATE product_barcodes
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
 * Update barcode active status
 */
export const updateStatus = async (id, isActive) => {
  const pool = getPool();
  const query = `
    UPDATE product_barcodes
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
 * Delete barcode by ID
 */
export const deleteById = async (id) => {
  const pool = getPool();
  const query = 'DELETE FROM product_barcodes WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export default {
  findAll,
  findById,
  findByBarcode,
  findByVariantId,
  existsByBarcode,
  clearPrimary,
  create,
  update,
  updateStatus,
  deleteById,
};
