import { getDatabasePool } from '../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

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
      `(ctd.gstin ILIKE $${paramIndex} OR ctd.pan_number ILIKE $${paramIndex} OR ctd.tan_number ILIKE $${paramIndex} OR ctd.tax_registered_name ILIKE $${paramIndex} OR ctd.gst_state_code ILIKE $${paramIndex} OR c.company_name ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'ctd.id',
    company_id: 'ctd.company_id',
    companyId: 'ctd.company_id',
    company_name: 'c.company_name',
    companyName: 'c.company_name',
    gstin: 'ctd.gstin',
    pan_number: 'ctd.pan_number',
    panNumber: 'ctd.pan_number',
    tan_number: 'ctd.tan_number',
    tanNumber: 'ctd.tan_number',
    gst_registration_type: 'ctd.gst_registration_type',
    gstRegistrationType: 'ctd.gst_registration_type',
    tax_registered_name: 'ctd.tax_registered_name',
    taxRegisteredName: 'ctd.tax_registered_name',
    is_primary: 'ctd.is_primary',
    isPrimary: 'ctd.is_primary',
    is_active: 'ctd.is_active',
    isActive: 'ctd.is_active',
    created_at: 'ctd.created_at',
    createdAt: 'ctd.created_at',
  };
  const orderColumn = allowedSortColumns[sortBy] || 'ctd.created_at';
  const direction = String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

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
    data.company_id || data.companyId,
    data.gstin !== undefined ? (data.gstin ? data.gstin.toUpperCase() : null) : null,
    data.pan_number !== undefined ? (data.pan_number ? data.pan_number.toUpperCase() : null) : (data.panNumber ? data.panNumber.toUpperCase() : null),
    data.tan_number !== undefined ? (data.tan_number ? data.tan_number.toUpperCase() : null) : (data.tanNumber ? data.tanNumber.toUpperCase() : null),
    data.gst_registration_type || data.gstRegistrationType || 'regular',
    data.gst_state_code !== undefined ? data.gst_state_code : (data.gstStateCode || null),
    data.tax_registered_name !== undefined ? data.tax_registered_name : (data.taxRegisteredName || null),
    data.is_primary !== undefined ? Boolean(data.is_primary) : (data.isPrimary !== undefined ? Boolean(data.isPrimary) : true),
    data.is_active !== undefined ? Boolean(data.is_active) : (data.isActive !== undefined ? Boolean(data.isActive) : true),
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

export const update = async (id, data) => {
  const pool = getPool();
  const allowedFields = {
    company_id: 'company_id',
    companyId: 'company_id',
    gstin: 'gstin',
    pan_number: 'pan_number',
    panNumber: 'pan_number',
    tan_number: 'tan_number',
    tanNumber: 'tan_number',
    gst_registration_type: 'gst_registration_type',
    gstRegistrationType: 'gst_registration_type',
    gst_state_code: 'gst_state_code',
    gstStateCode: 'gst_state_code',
    tax_registered_name: 'tax_registered_name',
    taxRegisteredName: 'tax_registered_name',
    is_primary: 'is_primary',
    isPrimary: 'is_primary',
    is_active: 'is_active',
    isActive: 'is_active',
  };

  const setClauses = [];
  const values = [];
  const handled = new Set();
  let paramIndex = 1;

  for (const [key, col] of Object.entries(allowedFields)) {
    if (data[key] !== undefined && !handled.has(col)) {
      let val = data[key];
      if (typeof val === 'string' && ['gstin', 'pan_number', 'tan_number'].includes(col)) {
        val = val.trim().toUpperCase();
      }
      setClauses.push(`${col} = $${paramIndex++}`);
      values.push(val);
      handled.add(col);
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
