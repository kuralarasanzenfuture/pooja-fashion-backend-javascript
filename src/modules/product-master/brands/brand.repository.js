import { getDatabasePool } from '../../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

/**
 * Find paginated list of brands with filters
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  search,
  companyId,
  isActive,
  hasLogo,
  sortBy = 'display_order',
  sortOrder = 'ASC',
} = {}) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (companyId !== undefined && companyId !== null) {
    conditions.push(`b.company_id = $${paramIndex++}`);
    values.push(companyId);
  }

  if (hasLogo !== undefined && hasLogo !== null && hasLogo !== '') {
    if (hasLogo === true || hasLogo === 'true' || hasLogo === 'with_logo') {
      conditions.push(`(b.logo_url IS NOT NULL AND b.logo_url <> '')`);
    } else if (hasLogo === false || hasLogo === 'false' || hasLogo === 'without_logo') {
      conditions.push(`(b.logo_url IS NULL OR b.logo_url = '')`);
    }
  }

  if (isActive !== undefined && isActive !== null) {
    conditions.push(`b.is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (search) {
    conditions.push(
      `(b.brand_name ILIKE $${paramIndex} OR b.brand_code ILIKE $${paramIndex} OR b.description ILIKE $${paramIndex} OR c.company_name ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'b.id',
    brand_code: 'b.brand_code',
    brand_name: 'b.brand_name',
    display_order: 'b.display_order',
    created_at: 'b.created_at',
    is_active: 'b.is_active',
  };

  const orderColumn = allowedSortColumns[sortBy] || 'b.display_order';
  const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM brands b
    LEFT JOIN companies c ON c.id = b.company_id
    ${whereClause}
  `;

  const dataQuery = `
    SELECT 
      b.*,
      c.company_name,
      c.company_code
    FROM brands b
    LEFT JOIN companies c ON c.id = b.company_id
    ${whereClause}
    ORDER BY ${orderColumn} ${direction}, b.brand_name ASC
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
 * Find single brand by ID
 */
export const findById = async (id) => {
  const pool = getPool();
  const query = `
    SELECT 
      b.*,
      c.company_name,
      c.company_code
    FROM brands b
    LEFT JOIN companies c ON c.id = b.company_id
    WHERE b.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find brand by company ID and brand code
 */
export const findByCode = async (companyId, brandCode) => {
  const pool = getPool();
  const query = `
    SELECT 
      b.*,
      c.company_name,
      c.company_code
    FROM brands b
    LEFT JOIN companies c ON c.id = b.company_id
    WHERE b.company_id = $1 AND LOWER(b.brand_code) = LOWER($2)
  `;
  const result = await pool.query(query, [companyId, brandCode]);
  return result.rows[0] || null;
};

/**
 * Find brand by company ID and brand name
 */
export const findByName = async (companyId, brandName) => {
  const pool = getPool();
  const query = `
    SELECT 
      b.*,
      c.company_name,
      c.company_code
    FROM brands b
    LEFT JOIN companies c ON c.id = b.company_id
    WHERE b.company_id = $1 AND LOWER(b.brand_name) = LOWER($2)
  `;
  const result = await pool.query(query, [companyId, brandName]);
  return result.rows[0] || null;
};

/**
 * Find all brands for a given company (pageless list)
 */
export const findByCompanyId = async (companyId, { isActive = null } = {}) => {
  const pool = getPool();
  const conditions = ['b.company_id = $1'];
  const values = [companyId];

  if (isActive !== null && isActive !== undefined) {
    conditions.push('b.is_active = $2');
    values.push(isActive);
  }

  const query = `
    SELECT 
      b.*,
      c.company_name,
      c.company_code
    FROM brands b
    LEFT JOIN companies c ON c.id = b.company_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY b.display_order ASC, b.brand_name ASC
  `;
  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * Find all brands for a company without pagination with full filtering
 */
export const findAllByCompany = async (
  companyId,
  {
    isActive = null,
    hasLogo = null,
    search = null,
    sortBy = 'display_order',
    sortOrder = 'ASC',
  } = {}
) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (companyId !== null && companyId !== undefined) {
    conditions.push(`b.company_id = $${paramIndex++}`);
    values.push(companyId);
  }

  if (isActive !== null && isActive !== undefined) {
    conditions.push(`b.is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (hasLogo !== undefined && hasLogo !== null && hasLogo !== '') {
    if (hasLogo === true || hasLogo === 'true' || hasLogo === 'with_logo') {
      conditions.push(`(b.logo_url IS NOT NULL AND b.logo_url <> '')`);
    } else if (hasLogo === false || hasLogo === 'false' || hasLogo === 'without_logo') {
      conditions.push(`(b.logo_url IS NULL OR b.logo_url = '')`);
    }
  }

  if (search) {
    conditions.push(
      `(b.brand_name ILIKE $${paramIndex} OR b.brand_code ILIKE $${paramIndex} OR b.description ILIKE $${paramIndex} OR c.company_name ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const allowedSortColumns = {
    id: 'b.id',
    brand_code: 'b.brand_code',
    brand_name: 'b.brand_name',
    display_order: 'b.display_order',
    created_at: 'b.created_at',
    is_active: 'b.is_active',
  };
  const orderCol = allowedSortColumns[sortBy] || 'b.display_order';
  const direction = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const query = `
    SELECT 
      b.*,
      c.company_name,
      c.company_code
    FROM brands b
    LEFT JOIN companies c ON c.id = b.company_id
    ${whereClause}
    ORDER BY ${orderCol} ${direction}, b.brand_name ASC
  `;
  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * Get brand aggregate statistics for a company
 */
export const getBrandStats = async (companyId = null) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  if (companyId) {
    conditions.push('company_id = $1');
    values.push(companyId);
  }
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT 
      COUNT(*) AS total_brands,
      COUNT(*) FILTER (WHERE is_active = TRUE) AS active_brands,
      COUNT(*) FILTER (WHERE is_active = FALSE) AS inactive_brands,
      COUNT(*) FILTER (WHERE logo_url IS NOT NULL AND logo_url <> '') AS brands_with_logos
    FROM brands
    ${whereClause}
  `;

  const res = await pool.query(query, values);
  const row = res.rows[0] || {};

  return {
    totalBrands: parseInt(row.total_brands || 0, 10),
    activeBrands: parseInt(row.active_brands || 0, 10),
    inactiveBrands: parseInt(row.inactive_brands || 0, 10),
    brandsWithLogos: parseInt(row.brands_with_logos || 0, 10),
  };
};

/**
 * Reorder brands in bulk
 */
export const reorderBrands = async (items = [], companyId = null) => {
  if (!Array.isArray(items) || items.length === 0) return [];
  const pool = getPool();
  const updatedIds = [];

  for (const item of items) {
    const id = Number(item.id);
    const displayOrder = Math.max(0, parseInt(item.display_order ?? item.displayOrder ?? 0, 10));
    let q = 'UPDATE brands SET display_order = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    const vals = [displayOrder, id];
    if (companyId) {
      q += ' AND company_id = $3';
      vals.push(companyId);
    }
    const res = await pool.query(q, vals);
    if (res.rowCount > 0) {
      updatedIds.push(id);
    }
  }

  return updatedIds;
};

/**
 * Check if brand code already exists for company
 */
export const existsByCode = async (companyId, brandCode, excludeId = null) => {
  const pool = getPool();
  let query = `
    SELECT 1 FROM brands 
    WHERE company_id = $1 AND LOWER(brand_code) = LOWER($2)
  `;
  const values = [companyId, brandCode];

  if (excludeId) {
    query += ' AND id <> $3';
    values.push(excludeId);
  }

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};

/**
 * Check if brand name already exists for company
 */
export const existsByName = async (companyId, brandName, excludeId = null) => {
  const pool = getPool();
  let query = `
    SELECT 1 FROM brands 
    WHERE company_id = $1 AND LOWER(brand_name) = LOWER($2)
  `;
  const values = [companyId, brandName];

  if (excludeId) {
    query += ' AND id <> $3';
    values.push(excludeId);
  }

  const result = await pool.query(query, values);
  return result.rowCount > 0;
};

/**
 * Count products referencing brand
 */
export const countProducts = async (brandId) => {
  const pool = getPool();
  try {
    const query = 'SELECT COUNT(*) AS count FROM products WHERE brand_id = $1';
    const result = await pool.query(query, [brandId]);
    return parseInt(result.rows[0]?.count || 0, 10);
  } catch (error) {
    if (error.code === '42P01') {
      return 0;
    }
    throw error;
  }
};

/**
 * Create a new brand
 */
export const create = async (data) => {
  const pool = getPool();
  const query = `
    INSERT INTO brands (
      company_id,
      brand_code,
      brand_name,
      description,
      logo_url,
      logo_key,
      website_url,
      display_order,
      is_active,
      created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  const values = [
    data.company_id,
    data.brand_code,
    data.brand_name,
    data.description || null,
    data.logo_url || null,
    data.logo_key || null,
    data.website_url || null,
    data.display_order ?? 0,
    data.is_active !== undefined ? data.is_active : true,
    data.created_by || null,
  ];

  const result = await pool.query(query, values);
  return findById(result.rows[0].id);
};

/**
 * Update an existing brand
 */
export const update = async (id, data) => {
  const pool = getPool();
  const fields = [];
  const values = [];
  let paramIndex = 1;

  const updatableColumns = [
    'company_id',
    'brand_code',
    'brand_name',
    'description',
    'logo_url',
    'logo_key',
    'website_url',
    'display_order',
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
    UPDATE brands
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
 * Update brand active status
 */
export const updateStatus = async (id, isActive, updatedBy = null) => {
  const pool = getPool();
  const query = `
    UPDATE brands
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
 * Delete brand by ID
 */
export const deleteById = async (id) => {
  const pool = getPool();
  const query = 'DELETE FROM brands WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export default {
  findAll,
  findById,
  findByCode,
  findByName,
  findByCompanyId,
  findAllByCompany,
  getBrandStats,
  reorderBrands,
  existsByCode,
  existsByName,
  countProducts,
  create,
  update,
  updateStatus,
  deleteById,
};
