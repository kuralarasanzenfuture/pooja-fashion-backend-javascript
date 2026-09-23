import { getDatabasePool } from '../../../database/connection.js';
import { TAX_SORT_FIELDS } from './tax.types.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

const SELECT_TAX_BASE = `
  SELECT
    t.id,
    t.company_id,
    c.company_name,
    c.company_code,
    t.tax_code,
    t.tax_name,
    t.tax_type,
    t.rate,
    t.cgst_rate,
    t.sgst_rate,
    t.igst_rate,
    t.cess_rate,
    t.is_inclusive,
    t.is_active,
    t.created_by,
    u_creator.username AS created_by_name,
    t.updated_by,
    u_updater.username AS updated_by_name,
    t.created_at,
    t.updated_at
  FROM taxes t
  JOIN companies c ON t.company_id = c.id
  LEFT JOIN users u_creator ON t.created_by = u_creator.id
  LEFT JOIN users u_updater ON t.updated_by = u_updater.id
`;

/**
 * Creates a new tax record
 */
export const createTax = async (taxData, client = null) => {
  const db = client || getPool();
  const {
    company_id,
    tax_code,
    tax_name,
    tax_type = 'GST',
    rate,
    cgst_rate = 0,
    sgst_rate = 0,
    igst_rate = 0,
    cess_rate = 0,
    is_inclusive = false,
    is_active = true,
    created_by = null,
  } = taxData;

  const query = `
    INSERT INTO taxes (
      company_id,
      tax_code,
      tax_name,
      tax_type,
      rate,
      cgst_rate,
      sgst_rate,
      igst_rate,
      cess_rate,
      is_inclusive,
      is_active,
      created_by,
      updated_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12)
    RETURNING id
  `;

  const values = [
    company_id,
    tax_code,
    tax_name,
    tax_type,
    rate,
    cgst_rate,
    sgst_rate,
    igst_rate,
    cess_rate,
    is_inclusive,
    is_active,
    created_by,
  ];

  const result = await db.query(query, values);
  return findTaxById(result.rows[0].id, db);
};

/**
 * Finds a tax by ID
 */
export const findTaxById = async (id, client = null) => {
  const db = client || getPool();
  const query = `${SELECT_TAX_BASE} WHERE t.id = $1`;
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Finds a tax by unique code within company
 */
export const findTaxByCode = async (companyId, taxCode, excludeId = null, client = null) => {
  const db = client || getPool();
  const query = `
    ${SELECT_TAX_BASE}
    WHERE t.company_id = $1
      AND LOWER(t.tax_code) = LOWER($2)
      AND ($3::BIGINT IS NULL OR t.id <> $3)
  `;
  const result = await db.query(query, [companyId, taxCode, excludeId]);
  return result.rows[0] || null;
};

/**
 * Finds a tax by unique name within company
 */
export const findTaxByName = async (companyId, taxName, excludeId = null, client = null) => {
  const db = client || getPool();
  const query = `
    ${SELECT_TAX_BASE}
    WHERE t.company_id = $1
      AND LOWER(t.tax_name) = LOWER($2)
      AND ($3::BIGINT IS NULL OR t.id <> $3)
  `;
  const result = await db.query(query, [companyId, taxName, excludeId]);
  return result.rows[0] || null;
};

/**
 * Checks if tax is currently assigned to products
 */
export const isTaxInUse = async (id, client = null) => {
  const db = client || getPool();
  try {
    const query = `SELECT COUNT(*) AS count FROM product_taxes WHERE tax_id = $1`;
    const result = await db.query(query, [id]);
    return parseInt(result.rows[0]?.count || 0, 10) > 0;
  } catch {
    // If product_taxes table doesn't exist yet, return false
    return false;
  }
};

/**
 * Finds taxes with filters, search, and pagination
 */
export const findTaxes = async (filters = {}) => {
  const pool = getPool();
  const {
    page = 1,
    limit = 20,
    sort_by = TAX_SORT_FIELDS.RATE,
    sort_order = 'asc',
    search,
    company_id,
    tax_type,
    is_active,
    is_inclusive,
    min_rate,
    max_rate,
  } = filters;

  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (company_id) {
    conditions.push(`t.company_id = $${paramIndex++}`);
    values.push(company_id);
  }

  if (tax_type) {
    conditions.push(`t.tax_type = $${paramIndex++}`);
    values.push(tax_type);
  }

  if (is_active !== undefined) {
    conditions.push(`t.is_active = $${paramIndex++}`);
    values.push(is_active);
  }

  if (is_inclusive !== undefined) {
    conditions.push(`t.is_inclusive = $${paramIndex++}`);
    values.push(is_inclusive);
  }

  if (min_rate !== undefined) {
    conditions.push(`t.rate >= $${paramIndex++}`);
    values.push(min_rate);
  }

  if (max_rate !== undefined) {
    conditions.push(`t.rate <= $${paramIndex++}`);
    values.push(max_rate);
  }

  if (search) {
    conditions.push(
      `(t.tax_code ILIKE $${paramIndex} OR t.tax_name ILIKE $${paramIndex} OR t.tax_type ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM taxes t
    JOIN companies c ON t.company_id = c.id
    ${whereClause}
  `;
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].total, 10);

  const validSortColumns = {
    [TAX_SORT_FIELDS.ID]: 't.id',
    [TAX_SORT_FIELDS.TAX_CODE]: 't.tax_code',
    [TAX_SORT_FIELDS.TAX_NAME]: 't.tax_name',
    [TAX_SORT_FIELDS.RATE]: 't.rate',
    [TAX_SORT_FIELDS.CREATED_AT]: 't.created_at',
  };
  const sortColumn = validSortColumns[sort_by] || 't.rate';
  const order = sort_order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  const offset = (page - 1) * limit;

  values.push(limit);
  const limitParam = `$${paramIndex++}`;
  values.push(offset);
  const offsetParam = `$${paramIndex++}`;

  const query = `
    ${SELECT_TAX_BASE}
    ${whereClause}
    ORDER BY ${sortColumn} ${order}
    LIMIT ${limitParam} OFFSET ${offsetParam}
  `;

  const result = await pool.query(query, values);

  return {
    taxes: result.rows,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Updates an existing tax record
 */
export const updateTax = async (id, updateData, client = null) => {
  const db = client || getPool();
  const allowedFields = [
    'tax_code',
    'tax_name',
    'tax_type',
    'rate',
    'cgst_rate',
    'sgst_rate',
    'igst_rate',
    'cess_rate',
    'is_inclusive',
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
    return findTaxById(id, db);
  }

  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE taxes
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING id
  `;

  const result = await db.query(query, values);
  if (result.rowCount === 0) return null;

  return findTaxById(id, db);
};

/**
 * Deletes a tax record
 */
export const deleteTax = async (id, client = null) => {
  const db = client || getPool();
  const query = `DELETE FROM taxes WHERE id = $1 RETURNING id`;
  const result = await db.query(query, [id]);
  return result.rowCount > 0;
};
