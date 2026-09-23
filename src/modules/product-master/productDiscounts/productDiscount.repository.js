import { getDatabasePool } from '../../../database/connection.js';
import { PRODUCT_DISCOUNT_SORT_FIELDS } from './productDiscount.types.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

const SELECT_PRODUCT_DISCOUNT_BASE = `
  SELECT
    pd.id,
    pd.company_id,
    c.company_name,
    c.company_code,
    pd.product_id,
    p.product_name,
    p.product_code,
    pd.variant_id,
    pv.sku AS variant_sku,
    pv.variant_name,
    pd.discount_id,
    d.discount_code,
    d.discount_name,
    d.discount_type,
    d.discount_value,
    d.minimum_quantity,
    d.maximum_discount,
    d.priority,
    d.is_stackable,
    pd.is_primary,
    pd.is_active,
    pd.created_by,
    u_creator.username AS created_by_name,
    pd.updated_by,
    u_updater.username AS updated_by_name,
    pd.created_at,
    pd.updated_at
  FROM product_discounts pd
  JOIN companies c ON pd.company_id = c.id
  JOIN products p ON pd.product_id = p.id
  LEFT JOIN product_variants pv ON pd.variant_id = pv.id
  JOIN discounts d ON pd.discount_id = d.id
  LEFT JOIN users u_creator ON pd.created_by = u_creator.id
  LEFT JOIN users u_updater ON pd.updated_by = u_updater.id
`;

/**
 * Verifies relational integrity: company -> product -> (optional variant) -> discount
 */
export const verifyHierarchy = async (
  companyId,
  productId,
  variantId = null,
  discountId = null,
  client = null
) => {
  const db = client || getPool();

  // 1. Verify product belongs to company
  const productQuery = `SELECT 1 FROM products WHERE id = $1 AND company_id = $2`;
  const productRes = await db.query(productQuery, [productId, companyId]);
  if (productRes.rowCount === 0) {
    return { valid: false, error: 'Product does not belong to company' };
  }

  // 2. If variant provided, verify variant belongs to product
  if (variantId) {
    const variantQuery = `SELECT 1 FROM product_variants WHERE id = $1 AND product_id = $2`;
    const variantRes = await db.query(variantQuery, [variantId, productId]);
    if (variantRes.rowCount === 0) {
      return { valid: false, error: 'Variant does not belong to product' };
    }
  }

  // 3. If discount provided, verify discount belongs to company and is active
  if (discountId) {
    const discountQuery = `SELECT 1 FROM discounts WHERE id = $1 AND company_id = $2`;
    const discountRes = await db.query(discountQuery, [discountId, companyId]);
    if (discountRes.rowCount === 0) {
      return { valid: false, error: 'Discount does not belong to company' };
    }
  }

  return { valid: true };
};

/**
 * Clears primary flag on all existing discounts for a variant
 */
export const clearPrimaryForVariant = async (variantId, client = null) => {
  const db = client || getPool();
  const query = `
    UPDATE product_discounts
    SET is_primary = FALSE, updated_at = CURRENT_TIMESTAMP
    WHERE variant_id = $1 AND is_primary = TRUE
  `;
  await db.query(query, [variantId]);
};

/**
 * Clears primary flag on all existing product-level discounts (where variant_id IS NULL)
 */
export const clearPrimaryForProduct = async (productId, client = null) => {
  const db = client || getPool();
  const query = `
    UPDATE product_discounts
    SET is_primary = FALSE, updated_at = CURRENT_TIMESTAMP
    WHERE product_id = $1 AND variant_id IS NULL AND is_primary = TRUE
  `;
  await db.query(query, [productId]);
};

/**
 * Creates a new product discount record
 */
export const createProductDiscount = async (data, client = null) => {
  const db = client || getPool();
  const {
    company_id,
    product_id,
    variant_id = null,
    discount_id,
    is_primary = false,
    is_active = true,
    created_by = null,
  } = data;

  const query = `
    INSERT INTO product_discounts (
      company_id,
      product_id,
      variant_id,
      discount_id,
      is_primary,
      is_active,
      created_by,
      updated_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
    RETURNING id
  `;

  const values = [
    company_id,
    product_id,
    variant_id,
    discount_id,
    is_primary,
    is_active,
    created_by,
  ];

  const result = await db.query(query, values);
  return findProductDiscountById(result.rows[0].id, db);
};

/**
 * Finds a single product discount by ID
 */
export const findProductDiscountById = async (id, client = null) => {
  const db = client || getPool();
  const query = `${SELECT_PRODUCT_DISCOUNT_BASE} WHERE pd.id = $1`;
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Finds an existing mapping between product/variant and discount
 */
export const findExistingMapping = async (
  companyId,
  productId,
  variantId,
  discountId,
  excludeId = null,
  client = null
) => {
  const db = client || getPool();
  let query = `
    SELECT id FROM product_discounts
    WHERE company_id = $1 AND product_id = $2 AND discount_id = $3
  `;
  const values = [companyId, productId, discountId];

  if (variantId) {
    query += ` AND variant_id = $4`;
    values.push(variantId);
  } else {
    query += ` AND variant_id IS NULL`;
  }

  if (excludeId) {
    query += ` AND id <> $${values.length + 1}`;
    values.push(excludeId);
  }

  const result = await db.query(query, values);
  return result.rows[0] || null;
};

/**
 * Resolves effective discount for POS checkout
 * Priority order:
 * 1. Variant-level specific discount over Product-level fallback
 * 2. Primary discount over non-primary
 * 3. Highest discount priority (priority DESC)
 * 4. Most recently created
 */
export const resolveEffectiveDiscount = async (
  companyId,
  productId,
  variantId = null,
  asOfDate = new Date().toISOString(),
  client = null
) => {
  const db = client || getPool();
  const query = `
    SELECT
      pd.id,
      pd.company_id,
      pd.product_id,
      p.product_name,
      p.product_code,
      pd.variant_id,
      pv.sku AS variant_sku,
      pv.variant_name,
      pd.discount_id,
      d.discount_code,
      d.discount_name,
      d.discount_type,
      d.discount_value,
      d.minimum_quantity,
      d.maximum_discount,
      d.start_at,
      d.end_at,
      d.priority,
      d.is_stackable,
      pd.is_primary,
      pd.is_active
    FROM product_discounts pd
    JOIN products p ON pd.product_id = p.id
    LEFT JOIN product_variants pv ON pd.variant_id = pv.id
    JOIN discounts d ON pd.discount_id = d.id
    WHERE pd.company_id = $1
      AND pd.product_id = $2
      AND (
        ($3::BIGINT IS NOT NULL AND pd.variant_id = $3::BIGINT)
        OR (pd.variant_id IS NULL)
      )
      AND pd.is_active = TRUE
      AND d.is_active = TRUE
      AND (d.start_at IS NULL OR d.start_at <= $4)
      AND (d.end_at IS NULL OR d.end_at >= $4)
    ORDER BY
      (CASE WHEN pd.variant_id IS NOT NULL THEN 1 ELSE 0 END) DESC,
      pd.is_primary DESC,
      d.priority DESC,
      pd.id ASC
    LIMIT 1
  `;

  const result = await db.query(query, [companyId, productId, variantId, asOfDate]);
  return result.rows[0] || null;
};

/**
 * Finds all discounts for a specific product ID and its variants
 */
export const findProductDiscountsByProductId = async (productId, client = null) => {
  const db = client || getPool();
  const query = `
    ${SELECT_PRODUCT_DISCOUNT_BASE}
    WHERE pd.product_id = $1
    ORDER BY pd.is_primary DESC, pd.variant_id NULLS FIRST, pd.id ASC
  `;
  const result = await db.query(query, [productId]);
  return result.rows;
};

/**
 * Finds product discounts with filters, sorting, and pagination
 */
export const findProductDiscounts = async (filters = {}) => {
  const pool = getPool();
  const {
    page = 1,
    limit = 20,
    sort_by = PRODUCT_DISCOUNT_SORT_FIELDS.ID,
    sort_order = 'desc',
    company_id,
    product_id,
    variant_id,
    discount_id,
    is_primary,
    is_active,
  } = filters;

  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (company_id) {
    conditions.push(`pd.company_id = $${paramIndex++}`);
    values.push(company_id);
  }

  if (product_id) {
    conditions.push(`pd.product_id = $${paramIndex++}`);
    values.push(product_id);
  }

  if (variant_id !== undefined) {
    if (variant_id === null || variant_id === 'null') {
      conditions.push(`pd.variant_id IS NULL`);
    } else {
      conditions.push(`pd.variant_id = $${paramIndex++}`);
      values.push(variant_id);
    }
  }

  if (discount_id) {
    conditions.push(`pd.discount_id = $${paramIndex++}`);
    values.push(discount_id);
  }

  if (is_primary !== undefined) {
    conditions.push(`pd.is_primary = $${paramIndex++}`);
    values.push(is_primary);
  }

  if (is_active !== undefined) {
    conditions.push(`pd.is_active = $${paramIndex++}`);
    values.push(is_active);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM product_discounts pd
    JOIN companies c ON pd.company_id = c.id
    JOIN products p ON pd.product_id = p.id
    JOIN discounts d ON pd.discount_id = d.id
    ${whereClause}
  `;
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].total, 10);

  const validSortColumns = {
    [PRODUCT_DISCOUNT_SORT_FIELDS.ID]: 'pd.id',
    [PRODUCT_DISCOUNT_SORT_FIELDS.CREATED_AT]: 'pd.created_at',
    [PRODUCT_DISCOUNT_SORT_FIELDS.PRODUCT_ID]: 'pd.product_id',
    [PRODUCT_DISCOUNT_SORT_FIELDS.VARIANT_ID]: 'pd.variant_id',
    [PRODUCT_DISCOUNT_SORT_FIELDS.DISCOUNT_ID]: 'pd.discount_id',
    [PRODUCT_DISCOUNT_SORT_FIELDS.PRIORITY]: 'd.priority',
  };
  const sortColumn = validSortColumns[sort_by] || 'pd.id';
  const order = sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  values.push(limit);
  const limitParam = `$${paramIndex++}`;
  values.push(offset);
  const offsetParam = `$${paramIndex++}`;

  const query = `
    ${SELECT_PRODUCT_DISCOUNT_BASE}
    ${whereClause}
    ORDER BY ${sortColumn} ${order}
    LIMIT ${limitParam} OFFSET ${offsetParam}
  `;

  const result = await pool.query(query, values);

  return {
    product_discounts: result.rows,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Updates an existing product discount record
 */
export const updateProductDiscount = async (id, updateData, client = null) => {
  const db = client || getPool();
  const allowedFields = ['discount_id', 'is_primary', 'is_active', 'updated_by'];

  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      setClauses.push(`${field} = $${paramIndex++}`);
      values.push(updateData[field]);
    }
  }

  if (setClauses.length === 0) {
    return findProductDiscountById(id, db);
  }

  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE product_discounts
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id
  `;

  const result = await db.query(query, values);
  if (result.rowCount === 0) return null;

  return findProductDiscountById(id, db);
};

/**
 * Updates status of a product discount record
 */
export const updateProductDiscountStatus = async (id, isActive, userId = null, client = null) => {
  const db = client || getPool();
  const query = `
    UPDATE product_discounts
    SET is_active = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING id
  `;
  const result = await db.query(query, [isActive, userId, id]);
  if (result.rowCount === 0) return null;
  return findProductDiscountById(id, db);
};

/**
 * Deletes a product discount record
 */
export const deleteProductDiscount = async (id, client = null) => {
  const db = client || getPool();
  const query = `DELETE FROM product_discounts WHERE id = $1 RETURNING id`;
  const result = await db.query(query, [id]);
  return result.rowCount > 0;
};
