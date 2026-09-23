import { getDatabasePool } from '../../../database/connection.js';
import { DISCOUNT_SORT_FIELDS } from './discount.types.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

const SELECT_DISCOUNT_BASE = `
  SELECT
    d.id,
    d.company_id,
    c.company_name,
    c.company_code,
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
    d.is_active,
    d.created_by,
    u_creator.username AS created_by_name,
    d.updated_by,
    u_updater.username AS updated_by_name,
    d.created_at,
    d.updated_at
  FROM discounts d
  JOIN companies c ON d.company_id = c.id
  LEFT JOIN users u_creator ON d.created_by = u_creator.id
  LEFT JOIN users u_updater ON d.updated_by = u_updater.id
`;

/**
 * Creates a new discount record
 */
export const createDiscount = async (data, client = null) => {
  const db = client || getPool();
  const {
    company_id,
    discount_code,
    discount_name,
    discount_type,
    discount_value,
    minimum_quantity = null,
    maximum_discount = null,
    start_at = null,
    end_at = null,
    priority = 0,
    is_stackable = false,
    is_active = true,
    created_by = null,
  } = data;

  const query = `
    INSERT INTO discounts (
      company_id,
      discount_code,
      discount_name,
      discount_type,
      discount_value,
      minimum_quantity,
      maximum_discount,
      start_at,
      end_at,
      priority,
      is_stackable,
      is_active,
      created_by,
      updated_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13)
    RETURNING id
  `;

  const values = [
    company_id,
    discount_code,
    discount_name,
    discount_type,
    discount_value,
    minimum_quantity,
    maximum_discount,
    start_at,
    end_at,
    priority,
    is_stackable,
    is_active,
    created_by,
  ];

  const result = await db.query(query, values);
  return findDiscountById(result.rows[0].id, db);
};

/**
 * Finds a single discount by ID
 */
export const findDiscountById = async (id, client = null) => {
  const db = client || getPool();
  const query = `${SELECT_DISCOUNT_BASE} WHERE d.id = $1`;
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Finds a discount by unique code within company
 */
export const findDiscountByCode = async (
  companyId,
  discountCode,
  excludeId = null,
  client = null
) => {
  const db = client || getPool();
  const query = `
    ${SELECT_DISCOUNT_BASE}
    WHERE d.company_id = $1
      AND LOWER(d.discount_code) = LOWER($2)
      AND ($3::BIGINT IS NULL OR d.id <> $3)
  `;
  const result = await db.query(query, [companyId, discountCode, excludeId]);
  return result.rows[0] || null;
};

/**
 * Checks if discount is currently linked to product_discounts
 */
export const isDiscountInUse = async (id, client = null) => {
  const db = client || getPool();
  try {
    const query = `SELECT COUNT(*) AS count FROM product_discounts WHERE discount_id = $1`;
    const result = await db.query(query, [id]);
    return parseInt(result.rows[0]?.count || 0, 10) > 0;
  } catch {
    return false;
  }
};

/**
 * Finds discounts with filters, search, and pagination
 */
export const findDiscounts = async (filters = {}) => {
  const pool = getPool();
  const {
    page = 1,
    limit = 20,
    sort_by = DISCOUNT_SORT_FIELDS.PRIORITY,
    sort_order = 'desc',
    search,
    company_id,
    discount_type,
    is_active,
    is_stackable,
    as_of,
  } = filters;

  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (company_id) {
    conditions.push(`d.company_id = $${paramIndex++}`);
    values.push(company_id);
  }

  if (discount_type) {
    conditions.push(`d.discount_type = $${paramIndex++}`);
    values.push(discount_type);
  }

  if (is_active !== undefined) {
    conditions.push(`d.is_active = $${paramIndex++}`);
    values.push(is_active);
  }

  if (is_stackable !== undefined) {
    conditions.push(`d.is_stackable = $${paramIndex++}`);
    values.push(is_stackable);
  }

  if (as_of) {
    conditions.push(
      `(d.start_at IS NULL OR d.start_at <= $${paramIndex}) AND (d.end_at IS NULL OR d.end_at >= $${paramIndex})`
    );
    values.push(as_of);
    paramIndex++;
  }

  if (search) {
    conditions.push(
      `(d.discount_code ILIKE $${paramIndex} OR d.discount_name ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM discounts d
    JOIN companies c ON d.company_id = c.id
    ${whereClause}
  `;
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].total, 10);

  const validSortColumns = {
    [DISCOUNT_SORT_FIELDS.ID]: 'd.id',
    [DISCOUNT_SORT_FIELDS.DISCOUNT_CODE]: 'd.discount_code',
    [DISCOUNT_SORT_FIELDS.DISCOUNT_NAME]: 'd.discount_name',
    [DISCOUNT_SORT_FIELDS.DISCOUNT_VALUE]: 'd.discount_value',
    [DISCOUNT_SORT_FIELDS.PRIORITY]: 'd.priority',
    [DISCOUNT_SORT_FIELDS.START_AT]: 'd.start_at',
    [DISCOUNT_SORT_FIELDS.END_AT]: 'd.end_at',
    [DISCOUNT_SORT_FIELDS.CREATED_AT]: 'd.created_at',
  };
  const sortColumn = validSortColumns[sort_by] || 'd.priority';
  const order = sort_order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * limit;

  values.push(limit);
  const limitParam = `$${paramIndex++}`;
  values.push(offset);
  const offsetParam = `$${paramIndex++}`;

  const query = `
    ${SELECT_DISCOUNT_BASE}
    ${whereClause}
    ORDER BY ${sortColumn} ${order}
    LIMIT ${limitParam} OFFSET ${offsetParam}
  `;

  const result = await pool.query(query, values);

  return {
    discounts: result.rows,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Updates an existing discount record
 */
export const updateDiscount = async (id, updateData, client = null) => {
  const db = client || getPool();
  const allowedFields = [
    'discount_code',
    'discount_name',
    'discount_type',
    'discount_value',
    'minimum_quantity',
    'maximum_discount',
    'start_at',
    'end_at',
    'priority',
    'is_stackable',
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
    return findDiscountById(id, db);
  }

  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE discounts
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id
  `;

  const result = await db.query(query, values);
  if (result.rowCount === 0) return null;

  return findDiscountById(id, db);
};

/**
 * Deletes a discount record
 */
export const deleteDiscount = async (id, client = null) => {
  const db = client || getPool();
  const query = `DELETE FROM discounts WHERE id = $1 RETURNING id`;
  const result = await db.query(query, [id]);
  return result.rowCount > 0;
};
