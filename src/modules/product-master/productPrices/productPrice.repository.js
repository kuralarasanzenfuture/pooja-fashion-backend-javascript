import { getDatabasePool } from '../../../database/connection.js';
import {
  PRODUCT_PRICE_SORT_FIELDS,
  PRODUCT_PRICE_HISTORY_SORT_FIELDS,
} from './productPrice.types.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

const SELECT_PRICE_BASE = `
  SELECT
    pp.id,
    pp.company_id,
    c.company_name,
    c.company_code,
    pp.product_id,
    p.product_name,
    p.product_code,
    pp.variant_id,
    pv.sku AS variant_sku,
    pv.variant_name,
    pp.price_type,
    pp.purchase_price,
    pp.cost_price,
    pp.mrp,
    pp.selling_price,
    pp.min_selling_price,
    pp.currency_code,
    pp.effective_from,
    pp.effective_to,
    pp.is_active,
    pp.created_by,
    u_creator.username AS created_by_name,
    pp.updated_by,
    u_updater.username AS updated_by_name,
    pp.created_at,
    pp.updated_at
  FROM product_prices pp
  JOIN companies c ON pp.company_id = c.id
  JOIN products p ON pp.product_id = p.id
  JOIN product_variants pv ON pp.variant_id = pv.id
  LEFT JOIN users u_creator ON pp.created_by = u_creator.id
  LEFT JOIN users u_updater ON pp.updated_by = u_updater.id
`;

const SELECT_HISTORY_BASE = `
  SELECT
    pph.id,
    pph.company_id,
    c.company_name,
    c.company_code,
    pph.product_id,
    p.product_name,
    p.product_code,
    pph.variant_id,
    pv.sku AS variant_sku,
    pv.variant_name,
    pph.product_price_id,
    pph.price_type,
    pph.old_purchase_price,
    pph.new_purchase_price,
    pph.old_cost_price,
    pph.new_cost_price,
    pph.old_mrp,
    pph.new_mrp,
    pph.old_selling_price,
    pph.new_selling_price,
    pph.reason,
    pph.changed_by,
    u.username AS changed_by_name,
    pph.changed_at
  FROM product_price_history pph
  JOIN companies c ON pph.company_id = c.id
  JOIN products p ON pph.product_id = p.id
  JOIN product_variants pv ON pph.variant_id = pv.id
  LEFT JOIN users u ON pph.changed_by = u.id
`;

/**
 * Verifies relational integrity: company -> product -> variant
 */
export const verifyHierarchy = async (companyId, productId, variantId, client = null) => {
  const db = client || getPool();
  const query = `
    SELECT 1
    FROM product_variants pv
    JOIN products p ON pv.product_id = p.id
    WHERE pv.id = $1 AND pv.product_id = $2 AND p.company_id = $3
  `;
  const result = await db.query(query, [variantId, productId, companyId]);
  return result.rowCount > 0;
};

/**
 * Creates a new product price record
 */
export const createPrice = async (priceData, client = null) => {
  const db = client || getPool();
  const {
    company_id,
    product_id,
    variant_id,
    price_type,
    purchase_price,
    cost_price,
    mrp,
    selling_price,
    min_selling_price,
    currency_code = 'INR',
    effective_from = new Date().toISOString(),
    effective_to = null,
    is_active = true,
    created_by = null,
  } = priceData;

  const query = `
    INSERT INTO product_prices (
      company_id,
      product_id,
      variant_id,
      price_type,
      purchase_price,
      cost_price,
      mrp,
      selling_price,
      min_selling_price,
      currency_code,
      effective_from,
      effective_to,
      is_active,
      created_by,
      updated_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11, CURRENT_TIMESTAMP), $12, $13, $14, $14)
    RETURNING id
  `;

  const values = [
    company_id,
    product_id,
    variant_id,
    price_type,
    purchase_price,
    cost_price,
    mrp,
    selling_price,
    min_selling_price,
    currency_code,
    effective_from,
    effective_to,
    is_active,
    created_by,
  ];

  const result = await db.query(query, values);
  return findPriceById(result.rows[0].id, db);
};

/**
 * Finds a single price by ID with joined relations
 */
export const findPriceById = async (id, client = null) => {
  const db = client || getPool();
  const query = `${SELECT_PRICE_BASE} WHERE pp.id = $1`;
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Finds active price for variant and price type as of timestamp
 */
export const findActivePrice = async (
  variantId,
  priceType = 'RETAIL',
  asOfDate = new Date().toISOString(),
  client = null
) => {
  const db = client || getPool();
  const query = `
    ${SELECT_PRICE_BASE}
    WHERE pp.variant_id = $1
      AND pp.price_type = $2
      AND pp.is_active = TRUE
      AND pp.effective_from <= $3
      AND (pp.effective_to IS NULL OR pp.effective_to > $3)
    ORDER BY pp.effective_from DESC
    LIMIT 1
  `;
  const result = await db.query(query, [variantId, priceType, asOfDate]);
  return result.rows[0] || null;
};

/**
 * Expires any existing active prices overlapping with the new effective_from
 */
export const expireOverlappingPrices = async (
  variantId,
  priceType,
  newEffectiveFrom,
  client = null
) => {
  const db = client || getPool();
  const query = `
    UPDATE product_prices
    SET effective_to = $3,
        updated_at = CURRENT_TIMESTAMP
    WHERE variant_id = $1
      AND price_type = $2
      AND is_active = TRUE
      AND (effective_to IS NULL OR effective_to > $3)
      AND effective_from < $3
    RETURNING id, effective_to
  `;
  const result = await db.query(query, [variantId, priceType, newEffectiveFrom]);
  return result.rows;
};

/**
 * Finds product prices with filters and pagination
 */
export const findPrices = async (filters = {}) => {
  const pool = getPool();
  const {
    page = 1,
    limit = 20,
    sort_by = PRODUCT_PRICE_SORT_FIELDS.EFFECTIVE_FROM,
    sort_order = 'desc',
    search,
    company_id,
    product_id,
    variant_id,
    price_type,
    is_active,
    currency_code,
  } = filters;

  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (company_id) {
    conditions.push(`pp.company_id = $${paramIndex++}`);
    values.push(company_id);
  }

  if (product_id) {
    conditions.push(`pp.product_id = $${paramIndex++}`);
    values.push(product_id);
  }

  if (variant_id) {
    conditions.push(`pp.variant_id = $${paramIndex++}`);
    values.push(variant_id);
  }

  if (price_type) {
    conditions.push(`pp.price_type = $${paramIndex++}`);
    values.push(price_type);
  }

  if (is_active !== undefined) {
    conditions.push(`pp.is_active = $${paramIndex++}`);
    values.push(is_active);
  }

  if (currency_code) {
    conditions.push(`pp.currency_code = $${paramIndex++}`);
    values.push(currency_code);
  }

  if (search) {
    conditions.push(
      `(p.product_name ILIKE $${paramIndex} OR p.product_code ILIKE $${paramIndex} OR pv.sku ILIKE $${paramIndex} OR pv.variant_name ILIKE $${paramIndex} OR pp.price_type ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Count total query
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM product_prices pp
    JOIN companies c ON pp.company_id = c.id
    JOIN products p ON pp.product_id = p.id
    JOIN product_variants pv ON pp.variant_id = pv.id
    ${whereClause}
  `;
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].total, 10);

  // Sorting and pagination
  const validSortColumns = {
    [PRODUCT_PRICE_SORT_FIELDS.ID]: 'pp.id',
    [PRODUCT_PRICE_SORT_FIELDS.EFFECTIVE_FROM]: 'pp.effective_from',
    [PRODUCT_PRICE_SORT_FIELDS.SELLING_PRICE]: 'pp.selling_price',
    [PRODUCT_PRICE_SORT_FIELDS.MRP]: 'pp.mrp',
    [PRODUCT_PRICE_SORT_FIELDS.CREATED_AT]: 'pp.created_at',
  };
  const sortColumn = validSortColumns[sort_by] || 'pp.effective_from';
  const order = sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  values.push(limit);
  const limitParam = `$${paramIndex++}`;
  values.push(offset);
  const offsetParam = `$${paramIndex++}`;

  const query = `
    ${SELECT_PRICE_BASE}
    ${whereClause}
    ORDER BY ${sortColumn} ${order}
    LIMIT ${limitParam} OFFSET ${offsetParam}
  `;

  const result = await pool.query(query, values);

  return {
    prices: result.rows,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Updates a product price record
 */
export const updatePrice = async (id, updateData, client = null) => {
  const db = client || getPool();
  const allowedFields = [
    'price_type',
    'purchase_price',
    'cost_price',
    'mrp',
    'selling_price',
    'min_selling_price',
    'currency_code',
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
    return findPriceById(id, db);
  }

  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE product_prices
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id
  `;

  const result = await db.query(query, values);
  if (result.rowCount === 0) return null;

  return findPriceById(id, db);
};

/**
 * Deletes a product price record
 */
export const deletePrice = async (id, client = null) => {
  const db = client || getPool();
  const query = `
    DELETE FROM product_prices
    WHERE id = $1
    RETURNING id
  `;
  const result = await db.query(query, [id]);
  return result.rowCount > 0;
};

/**
 * Creates an audit history entry in product_price_history
 */
export const createPriceHistory = async (historyData, client = null) => {
  const db = client || getPool();
  const {
    company_id,
    product_id,
    variant_id,
    product_price_id = null,
    price_type,
    old_purchase_price = null,
    new_purchase_price = null,
    old_cost_price = null,
    new_cost_price = null,
    old_mrp = null,
    new_mrp = null,
    old_selling_price = null,
    new_selling_price = null,
    reason = null,
    changed_by = null,
  } = historyData;

  const query = `
    INSERT INTO product_price_history (
      company_id,
      product_id,
      variant_id,
      product_price_id,
      price_type,
      old_purchase_price,
      new_purchase_price,
      old_cost_price,
      new_cost_price,
      old_mrp,
      new_mrp,
      old_selling_price,
      new_selling_price,
      reason,
      changed_by,
      changed_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP)
    RETURNING id
  `;

  const values = [
    company_id,
    product_id,
    variant_id,
    product_price_id,
    price_type,
    old_purchase_price,
    new_purchase_price,
    old_cost_price,
    new_cost_price,
    old_mrp,
    new_mrp,
    old_selling_price,
    new_selling_price,
    reason,
    changed_by,
  ];

  const result = await db.query(query, values);
  return findPriceHistoryById(result.rows[0].id, db);
};

/**
 * Finds a single price history entry by ID
 */
export const findPriceHistoryById = async (id, client = null) => {
  const db = client || getPool();
  const query = `${SELECT_HISTORY_BASE} WHERE pph.id = $1`;
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Finds price history with filters and pagination
 */
export const findPriceHistory = async (filters = {}) => {
  const pool = getPool();
  const {
    page = 1,
    limit = 20,
    sort_by = PRODUCT_PRICE_HISTORY_SORT_FIELDS.CHANGED_AT,
    sort_order = 'desc',
    company_id,
    product_id,
    variant_id,
    product_price_id,
    price_type,
    date_from,
    date_to,
  } = filters;

  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (company_id) {
    conditions.push(`pph.company_id = $${paramIndex++}`);
    values.push(company_id);
  }

  if (product_id) {
    conditions.push(`pph.product_id = $${paramIndex++}`);
    values.push(product_id);
  }

  if (variant_id) {
    conditions.push(`pph.variant_id = $${paramIndex++}`);
    values.push(variant_id);
  }

  if (product_price_id) {
    conditions.push(`pph.product_price_id = $${paramIndex++}`);
    values.push(product_price_id);
  }

  if (price_type) {
    conditions.push(`pph.price_type = $${paramIndex++}`);
    values.push(price_type);
  }

  if (date_from) {
    conditions.push(`pph.changed_at >= $${paramIndex++}`);
    values.push(date_from);
  }

  if (date_to) {
    conditions.push(`pph.changed_at <= $${paramIndex++}`);
    values.push(date_to);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM product_price_history pph
    JOIN companies c ON pph.company_id = c.id
    JOIN products p ON pph.product_id = p.id
    JOIN product_variants pv ON pph.variant_id = pv.id
    ${whereClause}
  `;
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].total, 10);

  const validSortColumns = {
    [PRODUCT_PRICE_HISTORY_SORT_FIELDS.ID]: 'pph.id',
    [PRODUCT_PRICE_HISTORY_SORT_FIELDS.CHANGED_AT]: 'pph.changed_at',
    [PRODUCT_PRICE_HISTORY_SORT_FIELDS.PRICE_TYPE]: 'pph.price_type',
  };
  const sortColumn = validSortColumns[sort_by] || 'pph.changed_at';
  const order = sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  values.push(limit);
  const limitParam = `$${paramIndex++}`;
  values.push(offset);
  const offsetParam = `$${paramIndex++}`;

  const query = `
    ${SELECT_HISTORY_BASE}
    ${whereClause}
    ORDER BY ${sortColumn} ${order}
    LIMIT ${limitParam} OFFSET ${offsetParam}
  `;

  const result = await pool.query(query, values);

  return {
    history: result.rows,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit) || 1,
    },
  };
};
