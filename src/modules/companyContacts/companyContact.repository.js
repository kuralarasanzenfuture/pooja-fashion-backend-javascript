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
  contactType,
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
    conditions.push(`cc.company_id = $${paramIndex++}`);
    values.push(companyId);
  }

  if (contactType) {
    conditions.push(`cc.contact_type = $${paramIndex++}`);
    values.push(contactType);
  }

  if (isPrimary !== undefined && isPrimary !== null) {
    conditions.push(`cc.is_primary = $${paramIndex++}`);
    values.push(isPrimary);
  }

  if (isActive !== undefined && isActive !== null) {
    conditions.push(`cc.is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (search) {
    conditions.push(
      `(cc.contact_name ILIKE $${paramIndex} OR cc.designation ILIKE $${paramIndex} OR cc.email ILIKE $${paramIndex} OR cc.phone ILIKE $${paramIndex} OR cc.mobile ILIKE $${paramIndex} OR c.company_name ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'cc.id',
    company_id: 'cc.company_id',
    companyId: 'cc.company_id',
    company_name: 'c.company_name',
    companyName: 'c.company_name',
    contact_type: 'cc.contact_type',
    contactType: 'cc.contact_type',
    contact_name: 'cc.contact_name',
    contactName: 'cc.contact_name',
    designation: 'cc.designation',
    email: 'cc.email',
    is_primary: 'cc.is_primary',
    isPrimary: 'cc.is_primary',
    is_active: 'cc.is_active',
    isActive: 'cc.is_active',
    created_at: 'cc.created_at',
    createdAt: 'cc.created_at',
  };
  const orderColumn = allowedSortColumns[sortBy] || 'cc.created_at';
  const direction = String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const countQuery = `
    SELECT COUNT(*) AS total 
    FROM company_contacts cc 
    JOIN companies c ON c.id = cc.company_id 
    ${whereClause}
  `;

  const dataQuery = `
    SELECT cc.*, c.company_name, c.company_code 
    FROM company_contacts cc 
    JOIN companies c ON c.id = cc.company_id 
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
    SELECT cc.*, c.company_name, c.company_code 
    FROM company_contacts cc 
    JOIN companies c ON c.id = cc.company_id 
    WHERE cc.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export const findByCompanyId = async (companyId) => {
  const pool = getPool();
  const query = `
    SELECT cc.*, c.company_name, c.company_code 
    FROM company_contacts cc 
    JOIN companies c ON c.id = cc.company_id 
    WHERE cc.company_id = $1 
    ORDER BY cc.is_primary DESC, cc.created_at DESC
  `;
  const result = await pool.query(query, [companyId]);
  return result.rows;
};

export const findPrimaryByCompanyId = async (companyId) => {
  const pool = getPool();
  const query = `
    SELECT cc.*, c.company_name, c.company_code 
    FROM company_contacts cc 
    JOIN companies c ON c.id = cc.company_id 
    WHERE cc.company_id = $1 AND cc.is_primary = TRUE 
    LIMIT 1
  `;
  const result = await pool.query(query, [companyId]);
  return result.rows[0] || null;
};

export const resetPrimaryForCompany = async (companyId, excludeId = null) => {
  const pool = getPool();
  let query = `
    UPDATE company_contacts 
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
    'contact_type',
    'contact_name',
    'designation',
    'email',
    'phone',
    'mobile',
    'is_primary',
    'is_active',
  ];

  const values = [
    data.company_id || data.companyId,
    data.contact_type || data.contactType,
    data.contact_name || data.contactName,
    data.designation !== undefined ? data.designation : null,
    data.email !== undefined ? data.email : null,
    data.phone !== undefined ? data.phone : null,
    data.mobile !== undefined ? data.mobile : null,
    data.is_primary !== undefined ? Boolean(data.is_primary) : (data.isPrimary !== undefined ? Boolean(data.isPrimary) : false),
    data.is_active !== undefined ? Boolean(data.is_active) : (data.isActive !== undefined ? Boolean(data.isActive) : true),
  ];

  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  const query = `
    INSERT INTO company_contacts (${columns.join(', ')})
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
    contact_type: 'contact_type',
    contactType: 'contact_type',
    contact_name: 'contact_name',
    contactName: 'contact_name',
    designation: 'designation',
    email: 'email',
    phone: 'phone',
    mobile: 'mobile',
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
      setClauses.push(`${col} = $${paramIndex++}`);
      values.push(data[key]);
      handled.add(col);
    }
  }

  if (setClauses.length === 0) {
    return findById(id);
  }

  setClauses.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);

  const query = `
    UPDATE company_contacts
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
    UPDATE company_contacts
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
    UPDATE company_contacts
    SET is_primary = TRUE, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export const deleteContact = async (id) => {
  const pool = getPool();
  const query = 'DELETE FROM company_contacts WHERE id = $1 RETURNING *';
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
  deleteContact,
  delete: deleteContact,
};
