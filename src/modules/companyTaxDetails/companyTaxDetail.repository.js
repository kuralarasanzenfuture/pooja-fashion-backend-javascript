import { getDatabasePool } from '../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

/**
 * Find paginated list of company tax details with optional filters
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  search,
  companyId,
  gstRegistrationType,
  isPrimary,
  isActive,
  sortBy = 'created_at',
  sortOrder = 'DESC',
} = {}) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (companyId !== undefined && companyId !== null) {
    conditions.push(`ctd.company_id = $${paramIndex++}`);
    values.push(companyId);
  }

  if (gstRegistrationType) {
    conditions.push(`ctd.gst_registration_type = $${paramIndex++}`);
    values.push(gstRegistrationType);
  }

  if (isPrimary !== undefined && isPrimary !== null) {
    conditions.push(`ctd.is_primary = $${paramIndex++}`);
    values.push(isPrimary);
  }

  if (isActive !== undefined && isActive !== null) {
    conditions.push(`ctd.is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (search) {
    conditions.push(
      `(ctd.gstin ILIKE $${paramIndex} OR ctd.pan_number ILIKE $${paramIndex} OR ctd.tan_number ILIKE $${paramIndex} OR ctd.tax_registered_name ILIKE $${paramIndex} OR c.company_name ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'ctd.id',
    company_id: 'ctd.company_id',
    gstin: 'ctd.gstin',
    pan_number: 'ctd.pan_number',
    tan_number: 'ctd.tan_number',
    gst_registration_type: 'ctd.gst_registration_type',
    tax_registered_name: 'ctd.tax_registered_name',
    is_primary: 'ctd.is_primary',
    is_active: 'ctd.is_active',
    created_at: 'ctd.created_at',
  };
  const orderColumn = allowedSortColumns[sortBy] || 'ctd.created_at';
  const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const countQuery = `
    SELECT COUNT(*) AS total 
    FROM company_tax_details ctd 
    JOIN companies c ON c.id = ctd.company_id 
    ${whereClause}
  `;

  const dataQuery = `
    SELECT ctd.*, c.company_name, c.company_code 
    FROM company_tax_details ctd 
    JOIN companies c ON c.id = ctd.company_id 
    ${whereClause} 
    ORDER BY ${orderColumn} ${direction} 
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
 * Find tax detail by ID (with company details)
 */
export const findById = async (id) => {
  const pool = getPool();
  const query = `
    SELECT ctd.*, c.company_name, c.company_code 
    FROM company_tax_details ctd 
    JOIN companies c ON c.id = ctd.company_id 
    WHERE ctd.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find all tax details belonging to a company
 */
export const findByCompanyId = async (companyId) => {
  const pool = getPool();
  const query = `
    SELECT ctd.*, c.company_name, c.company_code 
    FROM company_tax_details ctd 
    JOIN companies c ON c.id = ctd.company_id 
    WHERE ctd.company_id = $1 
    ORDER BY ctd.is_primary DESC, ctd.created_at DESC
  `;
  const result = await pool.query(query, [companyId]);
  return result.rows;
};

/**
 * Find primary tax detail for a company
 */
export const findPrimaryByCompanyId = async (companyId) => {
  const pool = getPool();
  const query = `
    SELECT ctd.*, c.company_name, c.company_code 
    FROM company_tax_details ctd 
    JOIN companies c ON c.id = ctd.company_id 
    WHERE ctd.company_id = $1 AND ctd.is_primary = TRUE 
    LIMIT 1
  `;
  const result = await pool.query(query, [companyId]);
  return result.rows[0] || null;
};

/**
 * Reset is_primary = FALSE for all tax records of a company (optionally excluding one ID)
 */
export const resetPrimaryForCompany = async (companyId, excludeId = null) => {
  const pool = getPool();
  let query = `
    UPDATE company_tax_details 
    SET is_primary = FALSE, updated_at = CURRENT_TIMESTAMP 
    WHERE company_id = $1 AND is_primary = TRUE
  `;
  const params = [companyId];

  if (excludeId) {
    query += ' AND id != $2';
    params.push(excludeId);
  }

  await pool.query(query, params);
};

/**
 * Insert new company tax detail
 */
export const create = async (data) => {
  const pool = getPool();
  const columns = [
    'company_id',
    'gstin',
    'pan_number',
    'tan_number',
    'gst_registration_type',
    'gst_state_code',
    'tax_registered_name',
    'is_primary',
    'is_active',
  ];

  const values = [
    data.company_id,
    data.gstin || null,
    data.pan_number || null,
    data.tan_number || null,
    data.gst_registration_type || null,
    data.gst_state_code || null,
    data.tax_registered_name || null,
    data.is_primary !== undefined ? Boolean(data.is_primary) : true,
    data.is_active !== undefined ? Boolean(data.is_active) : true,
  ];

  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  const query = `
    INSERT INTO company_tax_details (${columns.join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Update existing company tax detail by ID
 */
export const update = async (id, data) => {
  const pool = getPool();
  const allowedFields = [
    'company_id',
    'gstin',
    'pan_number',
    'tan_number',
    'gst_registration_type',
    'gst_state_code',
    'tax_registered_name',
    'is_primary',
    'is_active',
  ];

  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      setClauses.push(`${field} = $${paramIndex++}`);
      values.push(data[field]);
    }
  }

  if (setClauses.length === 0) {
    return findById(id);
  }

  setClauses.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const query = `
    UPDATE company_tax_details
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

/**
 * Update active status of a tax detail
 */
export const updateStatus = async (id, isActive) => {
  const pool = getPool();
  const query = `
    UPDATE company_tax_details
    SET is_active = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [isActive, id]);
  return result.rows[0] || null;
};

/**
 * Set a tax detail as primary
 */
export const setPrimary = async (id) => {
  const pool = getPool();
  const query = `
    UPDATE company_tax_details
    SET is_primary = TRUE, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Delete company tax detail by ID
 */
export const deleteTaxDetail = async (id) => {
  const pool = getPool();
  const query = 'DELETE FROM company_tax_details WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export default {
  findAll,
  findById,
  findByCompanyId,
  findPrimaryByCompanyId,
  resetPrimaryForCompany,
  create,
  update,
  updateStatus,
  setPrimary,
  deleteTaxDetail,
  delete: deleteTaxDetail,
};
