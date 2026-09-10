import { getDatabasePool } from '../../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

/**
 * Find paginated list of company banks with optional filters
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  search,
  companyId,
  bankId,
  accountType,
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
    conditions.push(`cb.company_id = $${paramIndex++}`);
    values.push(companyId);
  }

  if (bankId !== undefined && bankId !== null) {
    conditions.push(`cb.bank_id = $${paramIndex++}`);
    values.push(bankId);
  }

  if (accountType) {
    conditions.push(`cb.account_type = $${paramIndex++}`);
    values.push(accountType);
  }

  if (isPrimary !== undefined && isPrimary !== null) {
    conditions.push(`cb.is_primary = $${paramIndex++}`);
    values.push(isPrimary);
  }

  if (isActive !== undefined && isActive !== null) {
    conditions.push(`cb.is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (search) {
    conditions.push(
      `(cb.account_name ILIKE $${paramIndex} OR cb.account_number ILIKE $${paramIndex} OR cb.branch_name ILIKE $${paramIndex} OR cb.ifsc_code ILIKE $${paramIndex} OR b.bank_name ILIKE $${paramIndex} OR c.company_name ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'cb.id',
    company_id: 'cb.company_id',
    bank_id: 'cb.bank_id',
    account_name: 'cb.account_name',
    account_number: 'cb.account_number',
    account_type: 'cb.account_type',
    branch_name: 'cb.branch_name',
    opening_balance: 'cb.opening_balance',
    current_balance: 'cb.current_balance',
    is_primary: 'cb.is_primary',
    is_active: 'cb.is_active',
    created_at: 'cb.created_at',
  };
  const orderColumn = allowedSortColumns[sortBy] || 'cb.created_at';
  const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const countQuery = `
    SELECT COUNT(*) AS total 
    FROM company_banks cb 
    JOIN companies c ON c.id = cb.company_id 
    JOIN banks b ON b.id = cb.bank_id 
    ${whereClause}
  `;

  const dataQuery = `
    SELECT cb.*, c.company_name, c.company_code, b.bank_name, b.bank_code 
    FROM company_banks cb 
    JOIN companies c ON c.id = cb.company_id 
    JOIN banks b ON b.id = cb.bank_id 
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
 * Find company bank by ID (with company and bank master details)
 */
export const findById = async (id) => {
  const pool = getPool();
  const query = `
    SELECT cb.*, c.company_name, c.company_code, b.bank_name, b.bank_code 
    FROM company_banks cb 
    JOIN companies c ON c.id = cb.company_id 
    JOIN banks b ON b.id = cb.bank_id 
    WHERE cb.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find all bank accounts belonging to a company
 */
export const findByCompanyId = async (companyId) => {
  const pool = getPool();
  const query = `
    SELECT cb.*, c.company_name, c.company_code, b.bank_name, b.bank_code 
    FROM company_banks cb 
    JOIN companies c ON c.id = cb.company_id 
    JOIN banks b ON b.id = cb.bank_id 
    WHERE cb.company_id = $1 
    ORDER BY cb.is_primary DESC, cb.created_at DESC
  `;
  const result = await pool.query(query, [companyId]);
  return result.rows;
};

/**
 * Find primary bank account for a company
 */
export const findPrimaryByCompanyId = async (companyId) => {
  const pool = getPool();
  const query = `
    SELECT cb.*, c.company_name, c.company_code, b.bank_name, b.bank_code 
    FROM company_banks cb 
    JOIN companies c ON c.id = cb.company_id 
    JOIN banks b ON b.id = cb.bank_id 
    WHERE cb.company_id = $1 AND cb.is_primary = TRUE 
    LIMIT 1
  `;
  const result = await pool.query(query, [companyId]);
  return result.rows[0] || null;
};

/**
 * Check if account number already exists for a company
 */
export const existsAccountNumber = async (companyId, accountNumber, excludeId = null) => {
  const pool = getPool();
  let query = 'SELECT id FROM company_banks WHERE company_id = $1 AND account_number = $2';
  const params = [companyId, accountNumber];

  if (excludeId) {
    query += ' AND id != $3';
    params.push(excludeId);
  }

  const result = await pool.query(query, params);
  return result.rowCount > 0;
};

/**
 * Reset is_primary = FALSE for all bank accounts of a company (optionally excluding one ID)
 */
export const resetPrimaryForCompany = async (companyId, excludeId = null) => {
  const pool = getPool();
  let query = `
    UPDATE company_banks 
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
 * Insert new company bank account
 */
export const create = async (data) => {
  const pool = getPool();
  const columns = [
    'company_id',
    'bank_id',
    'account_name',
    'account_number',
    'account_type',
    'branch_name',
    'branch_code',
    'ifsc_code',
    'micr_code',
    'swift_code',
    'opening_balance',
    'current_balance',
    'is_primary',
    'is_active',
    'notes',
  ];

  const openingBalance = data.opening_balance !== undefined ? data.opening_balance : 0;
  const currentBalance = data.current_balance !== undefined ? data.current_balance : openingBalance;

  const values = [
    data.company_id,
    data.bank_id,
    data.account_name,
    data.account_number,
    data.account_type || 'current',
    data.branch_name || null,
    data.branch_code || null,
    data.ifsc_code || null,
    data.micr_code || null,
    data.swift_code || null,
    openingBalance,
    currentBalance,
    data.is_primary !== undefined ? Boolean(data.is_primary) : false,
    data.is_active !== undefined ? Boolean(data.is_active) : true,
    data.notes || null,
  ];

  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  const query = `
    INSERT INTO company_banks (${columns.join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Update existing company bank account by ID
 */
export const update = async (id, data) => {
  const pool = getPool();
  const allowedFields = [
    'company_id',
    'bank_id',
    'account_name',
    'account_number',
    'account_type',
    'branch_name',
    'branch_code',
    'ifsc_code',
    'micr_code',
    'swift_code',
    'opening_balance',
    'current_balance',
    'is_primary',
    'is_active',
    'notes',
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
    UPDATE company_banks
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

/**
 * Update active status
 */
export const updateStatus = async (id, isActive) => {
  const pool = getPool();
  const query = `
    UPDATE company_banks
    SET is_active = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [isActive, id]);
  return result.rows[0] || null;
};

/**
 * Set bank as primary
 */
export const setPrimary = async (id) => {
  const pool = getPool();
  const query = `
    UPDATE company_banks
    SET is_primary = TRUE, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Delete company bank account by ID
 */
export const deleteBank = async (id) => {
  const pool = getPool();
  const query = 'DELETE FROM company_banks WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export default {
  findAll,
  findById,
  findByCompanyId,
  findPrimaryByCompanyId,
  existsAccountNumber,
  resetPrimaryForCompany,
  create,
  update,
  updateStatus,
  setPrimary,
  deleteBank,
  delete: deleteBank,
};
