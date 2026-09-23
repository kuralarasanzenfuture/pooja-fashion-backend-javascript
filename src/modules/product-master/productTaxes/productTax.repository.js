import { getDatabasePool } from '../../../database/connection.js';
import { PRODUCT_TAX_SORT_FIELDS } from './productTax.types.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

const SELECT_PRODUCT_TAX_BASE = `
  SELECT
    pt.id,
    pt.company_id,
    c.company_name,
    c.company_code,
    pt.product_id,
    p.product_name,
    p.product_code,
    pt.variant_id,
    pv.sku AS variant_sku,
    pv.variant_name,
    pt.tax_id,
    t.tax_code,
    t.tax_name,
    t.tax_type,
    t.rate,
    t.cgst_rate,
    t.sgst_rate,
    t.igst_rate,
    t.cess_rate,
    t.is_inclusive,
    pt.is_primary,
    pt.effective_from,
    pt.effective_to,
    pt.is_active,
    pt.created_by,
    u_creator.username AS created_by_name,
    pt.updated_by,
    u_updater.username AS updated_by_name,
    pt.created_at,
    pt.updated_at
  FROM product_taxes pt
  JOIN companies c ON pt.company_id = c.id
  JOIN products p ON pt.product_id = p.id
  LEFT JOIN product_variants pv ON pt.variant_id = pv.id
  JOIN taxes t ON pt.tax_id = t.id
  LEFT JOIN users u_creator ON pt.created_by = u_creator.id
  LEFT JOIN users u_updater ON pt.updated_by = u_updater.id
`;

/**
 * Verifies relational integrity: company -> product -> (optional variant) -> tax
 */
export const verifyHierarchy = async (
  companyId,
  productId,
  variantId = null,
  taxId = null,
  client = null
) => {
  const db = client || getPool();

  // 1. Verify product belongs to company
  const productQuery = `SELECT 1 FROM products WHERE id = $1 AND company_id = $2`;
  const productRes = await db.query(productQuery, [productId, companyId]);
  if (productRes.rowCount === 0) return { valid: false, error: 'Product does not belong to company' };

  // 2. If variant provided, verify variant belongs to product
  if (variantId) {
    const variantQuery = `SELECT 1 FROM product_variants WHERE id = $1 AND product_id = $2`;
    const variantRes = await db.query(variantQuery, [variantId, productId]);
    if (variantRes.rowCount === 0) return { valid: false, error: 'Variant does not belong to product' };
  }

  // 3. If tax provided, verify tax belongs to company
  if (taxId) {
    const taxQuery = `SELECT 1 FROM taxes WHERE id = $1 AND company_id = $2`;
    const taxRes = await db.query(taxQuery, [taxId, companyId]);
    if (taxRes.rowCount === 0) return { valid: false, error: 'Tax slab does not belong to company' };
  }

  return { valid: true };
};

/**
 * Creates a new product tax record
 */
export const createProductTax = async (data, client = null) => {
  const db = client || getPool();
  const {
    company_id,
    product_id,
    variant_id = null,
    tax_id,
    is_primary = false,
    effective_from = new Date().toISOString(),
    effective_to = null,
    is_active = true,
    created_by = null,
  } = data;

  const query = `
    INSERT INTO product_taxes (
      company_id,
      product_id,
      variant_id,
      tax_id,
      is_primary,
      effective_from,
      effective_to,
      is_active,
      created_by,
      updated_by
    ) VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_TIMESTAMP), $7, $8, $9, $9)
    RETURNING id
  `;

  const values = [
    company_id,
    product_id,
    variant_id,
    tax_id,
    is_primary,
    effective_from,
    effective_to,
    is_active,
    created_by,
  ];

  const result = await db.query(query, values);
  return findProductTaxById(result.rows[0].id, db);
};

/**
 * Finds a single product tax by ID
 */
export const findProductTaxById = async (id, client = null) => {
  const db = client || getPool();
  const query = `${SELECT_PRODUCT_TAX_BASE} WHERE pt.id = $1`;
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Clears primary status for other taxes assigned to a variant
 */
export const clearPrimaryForVariant = async (variantId, client = null) => {
  const db = client || getPool();
  const query = `
    UPDATE product_taxes
    SET is_primary = FALSE,
        updated_at = CURRENT_TIMESTAMP
    WHERE variant_id = $1
      AND is_primary = TRUE
  `;
  await db.query(query, [variantId]);
};

/**
 * Clears primary status for product-level taxes (where variant_id IS NULL)
 */
export const clearPrimaryForProduct = async (productId, client = null) => {
  const db = client || getPool();
  const query = `
    UPDATE product_taxes
    SET is_primary = FALSE,
        updated_at = CURRENT_TIMESTAMP
    WHERE product_id = $1
      AND variant_id IS NULL
      AND is_primary = TRUE
  `;
  await db.query(query, [productId]);
};

/**
 * Resolves effective tax for POS checkout (Variant first, fallback to product level)
 */
export const resolveEffectiveTax = async (
  companyId,
  productId,
  variantId = null,
  asOfDate = new Date().toISOString(),
  client = null
) => {
  const db = client || getPool();
  const query = `
    SELECT
      pt.id,
      pt.company_id,
      pt.product_id,
      p.product_name,
      p.product_code,
      pt.variant_id,
      pv.sku AS variant_sku,
      pv.variant_name,
      pt.tax_id,
      t.tax_code,
      t.tax_name,
      t.tax_type,
      t.rate,
      t.cgst_rate,
      t.sgst_rate,
      t.igst_rate,
      t.cess_rate,
      t.is_inclusive,
      pt.is_primary,
      pt.effective_from,
      pt.effective_to,
      pt.is_active
    FROM product_taxes pt
    JOIN products p ON pt.product_id = p.id
    LEFT JOIN product_variants pv ON pt.variant_id = pv.id
    JOIN taxes t ON pt.tax_id = t.id
    WHERE pt.company_id = $1
      AND pt.product_id = $2
      AND (
        ($3::BIGINT IS NOT NULL AND pt.variant_id = $3::BIGINT)
        OR (pt.variant_id IS NULL)
      )
      AND pt.is_active = TRUE
      AND t.is_active = TRUE
      AND pt.effective_from <= $4
      AND (pt.effective_to IS NULL OR pt.effective_to > $4)
    ORDER BY
      (CASE WHEN pt.variant_id IS NOT NULL THEN 1 ELSE 0 END) DESC,
      pt.is_primary DESC,
      pt.effective_from DESC
    LIMIT 1
  `;

  const result = await db.query(query, [companyId, productId, variantId, asOfDate]);
  return result.rows[0] || null;
};

/**
 * Finds all taxes for a specific product ID
 */
export const findProductTaxesByProductId = async (productId, client = null) => {
  const db = client || getPool();
  const query = `
    ${SELECT_PRODUCT_TAX_BASE}
    WHERE pt.product_id = $1
    ORDER BY pt.is_primary DESC, pt.variant_id NULLS FIRST, pt.id ASC
  `;
  const result = await db.query(query, [productId]);
  return result.rows;
};

/**
 * Finds product taxes with filters and pagination
 */
export const findProductTaxes = async (filters = {}) => {
  const pool = getPool();
  const {
    page = 1,
    limit = 20,
    sort_by = PRODUCT_TAX_SORT_FIELDS.ID,
    sort_order = 'desc',
    company_id,
    product_id,
    variant_id,
    tax_id,
    is_primary,
    is_active,
  } = filters;

  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (company_id) {
    conditions.push(`pt.company_id = $${paramIndex++}`);
    values.push(company_id);
  }

  if (product_id) {
    conditions.push(`pt.product_id = $${paramIndex++}`);
    values.push(product_id);
  }

  if (variant_id !== undefined) {
    if (variant_id === null || variant_id === 'null') {
      conditions.push(`pt.variant_id IS NULL`);
    } else {
      conditions.push(`pt.variant_id = $${paramIndex++}`);
      values.push(variant_id);
    }
  }

  if (tax_id) {
    conditions.push(`pt.tax_id = $${paramIndex++}`);
    values.push(tax_id);
  }

  if (is_primary !== undefined) {
    conditions.push(`pt.is_primary = $${paramIndex++}`);
    values.push(is_primary);
  }

  if (is_active !== undefined) {
    conditions.push(`pt.is_active = $${paramIndex++}`);
    values.push(is_active);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM product_taxes pt
    JOIN companies c ON pt.company_id = c.id
    JOIN products p ON pt.product_id = p.id
    JOIN taxes t ON pt.tax_id = t.id
    ${whereClause}
  `;
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].total, 10);

  const validSortColumns = {
    [PRODUCT_TAX_SORT_FIELDS.ID]: 'pt.id',
    [PRODUCT_TAX_SORT_FIELDS.EFFECTIVE_FROM]: 'pt.effective_from',
    [PRODUCT_TAX_SORT_FIELDS.CREATED_AT]: 'pt.created_at',
    [PRODUCT_TAX_SORT_FIELDS.PRODUCT_ID]: 'pt.product_id',
    [PRODUCT_TAX_SORT_FIELDS.VARIANT_ID]: 'pt.variant_id',
    [PRODUCT_TAX_SORT_FIELDS.TAX_ID]: 'pt.tax_id',
  };
  const sortColumn = validSortColumns[sort_by] || 'pt.id';
  const order = sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  values.push(limit);
  const limitParam = `$${paramIndex++}`;
  values.push(offset);
  const offsetParam = `$${paramIndex++}`;

  const query = `
    ${SELECT_PRODUCT_TAX_BASE}
    ${whereClause}
    ORDER BY ${sortColumn} ${order}
    LIMIT ${limitParam} OFFSET ${offsetParam}
  `;

  const result = await pool.query(query, values);

  return {
    product_taxes: result.rows,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Updates an existing product tax record
 */
export const updateProductTax = async (id, updateData, client = null) => {
  const db = client || getPool();
  const allowedFields = [
    'tax_id',
    'is_primary',
    'effective_from',
    'effective_to',
    'is_active',
    'updated_by',
  ];

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
    return findProductTaxById(id, db);
  }

  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE product_taxes
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id
  `;

  const result = await db.query(query, values);
  if (result.rowCount === 0) return null;

  return findProductTaxById(id, db);
};

/**
 * Deletes a product tax record
 */
export const deleteProductTax = async (id, client = null) => {
  const db = client || getPool();
  const query = `DELETE FROM product_taxes WHERE id = $1 RETURNING id`;
  const result = await db.query(query, [id]);
  return result.rowCount > 0;
};
