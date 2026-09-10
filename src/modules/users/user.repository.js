import { getDatabasePool } from '../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

/**
 * Find paginated list of users with multi-tenant filtering, role and branch joins, and search
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  search,
  companyId,
  branchId,
  roleId,
  status,
  sortBy = 'id',
  sortOrder = 'ASC',
} = {}) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (companyId !== null && companyId !== undefined) {
    conditions.push(`u.company_id = $${paramIndex++}`);
    values.push(companyId);
  }

  if (branchId !== null && branchId !== undefined) {
    conditions.push(`u.branch_id = $${paramIndex++}`);
    values.push(branchId);
  }

  if (roleId !== null && roleId !== undefined) {
    conditions.push(`u.role_id = $${paramIndex++}`);
    values.push(roleId);
  }

  if (status) {
    conditions.push(`u.status = $${paramIndex++}`);
    values.push(status);
  }

  if (search) {
    conditions.push(
      `(u.username ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR u.phone ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'u.id',
    username: 'u.username',
    email: 'u.email',
    status: 'u.status',
    company_id: 'u.company_id',
    branch_id: 'u.branch_id',
    role_id: 'u.role_id',
    created_at: 'u.created_at',
    last_login_at: 'u.last_login_at',
  };

  const orderColumn = allowedSortColumns[sortBy] || 'u.id';
  const direction = String(sortOrder).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const countQuery = `SELECT COUNT(*) AS total FROM users u ${whereClause}`;
  const dataQuery = `
    SELECT 
      u.*,
      c.company_name, c.company_code,
      b.branch_name, b.branch_code,
      r.role_code, r.role_name, r.is_system_role
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    LEFT JOIN branches b ON b.id = u.branch_id
    LEFT JOIN roles r ON r.id = u.role_id
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
 * Find user by primary ID with role, branch, and company details
 */
export const findById = async (id) => {
  const pool = getPool();
  const query = `
    SELECT 
      u.*,
      c.company_name, c.company_code,
      b.branch_name, b.branch_code,
      r.role_code, r.role_name, r.is_system_role
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    LEFT JOIN branches b ON b.id = u.branch_id
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE u.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find user by company ID and username
 */
export const findByUsername = async (companyId, username) => {
  const pool = getPool();
  const query = `
    SELECT u.*, r.role_code, r.role_name
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE u.company_id = $1 AND LOWER(u.username) = LOWER($2)
  `;
  const result = await pool.query(query, [companyId, username]);
  return result.rows[0] || null;
};

/**
 * Find user by email
 */
export const findByEmail = async (email) => {
  const pool = getPool();
  const query = `
    SELECT u.*, r.role_code, r.role_name
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE LOWER(u.email) = LOWER($1)
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
};

/**
 * Find user by phone number
 */
export const findByPhone = async (companyId, phone) => {
  const pool = getPool();
  const query = `
    SELECT u.*, r.role_code, r.role_name
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE u.company_id = $1 AND u.phone = $2
  `;
  const result = await pool.query(query, [companyId, phone]);
  return result.rows[0] || null;
};

/**
 * Check if username already exists for this company
 */
export const existsByUsername = async (companyId, username, excludeId = null) => {
  const pool = getPool();
  let query = 'SELECT id FROM users WHERE company_id = $1 AND LOWER(username) = LOWER($2)';
  const params = [companyId, username];

  if (excludeId) {
    query += ' AND id != $3';
    params.push(excludeId);
  }

  const result = await pool.query(query, params);
  return result.rowCount > 0;
};

/**
 * Check if email already exists globally
 */
export const existsByEmail = async (email, excludeId = null) => {
  if (!email) return false;
  const pool = getPool();
  let query = 'SELECT id FROM users WHERE LOWER(email) = LOWER($1)';
  const params = [email];

  if (excludeId) {
    query += ' AND id != $2';
    params.push(excludeId);
  }

  const result = await pool.query(query, params);
  return result.rowCount > 0;
};

/**
 * Check if phone number already exists for this company
 */
export const existsByPhone = async (companyId, phone, excludeId = null) => {
  if (!phone) return false;
  const pool = getPool();
  let query = 'SELECT id FROM users WHERE company_id = $1 AND phone = $2';
  const params = [companyId, phone];

  if (excludeId) {
    query += ' AND id != $3';
    params.push(excludeId);
  }

  const result = await pool.query(query, params);
  return result.rowCount > 0;
};

/**
 * Insert a new user record
 */
export const create = async (data) => {
  const pool = getPool();
  const columns = [
    'company_id',
    'branch_id',
    'employee_id',
    'role_id',
    'username',
    'email',
    'phone',
    'password_hash',
    'profile_image_url',
    'status',
    'is_email_verified',
    'is_phone_verified',
    'two_factor_enabled',
    'created_by',
    'updated_by',
  ];

  const values = [
    data.company_id,
    data.branch_id || null,
    data.employee_id || null,
    data.role_id || null,
    data.username.trim(),
    data.email ? data.email.trim().toLowerCase() : null,
    data.phone ? data.phone.trim() : null,
    data.password_hash,
    data.profile_image_url || null,
    data.status || 'active',
    Boolean(data.is_email_verified),
    Boolean(data.is_phone_verified),
    Boolean(data.two_factor_enabled),
    data.created_by || null,
    data.updated_by || null,
  ];

  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  const query = `
    INSERT INTO users (${columns.join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Update an existing user's profile details
 */
export const update = async (id, data) => {
  const pool = getPool();
  const allowedFields = [
    'branch_id',
    'employee_id',
    'role_id',
    'username',
    'email',
    'phone',
    'profile_image_url',
    'is_email_verified',
    'is_phone_verified',
    'two_factor_enabled',
    'updated_by',
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

  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE users
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

/**
 * Update user password, log to password_history, and increment token_version to invalidate old sessions
 */
export const updatePassword = async (id, passwordHash, mustChangePassword = false) => {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Update user password and token_version
    const updateQuery = `
      UPDATE users
      SET 
        password_hash = $1,
        password_changed_at = CURRENT_TIMESTAMP,
        must_change_password = $2,
        token_version = token_version + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const updateRes = await client.query(updateQuery, [passwordHash, mustChangePassword, id]);
    const updatedUser = updateRes.rows[0];

    // 2. Insert into password_history table
    await client.query('INSERT INTO password_history (user_id, password_hash) VALUES ($1, $2)', [
      id,
      passwordHash,
    ]);

    // 3. Invalidate active refresh tokens
    await client.query(
      `UPDATE user_refresh_tokens 
       SET is_active = FALSE, revoked_at = CURRENT_TIMESTAMP, revoked_reason = 'password_changed'
       WHERE user_id = $1 AND is_active = TRUE`,
      [id]
    );

    await client.query('COMMIT');
    return updatedUser;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update user account status (active, inactive, blocked, locked)
 */
export const updateStatus = async (id, status, lockedUntil = null) => {
  const pool = getPool();
  const query = `
    UPDATE users
    SET 
      status = $1,
      locked_until = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *
  `;
  const result = await pool.query(query, [status, lockedUntil, id]);
  return result.rows[0] || null;
};

/**
 * Record a login attempt (resets or increments failed attempts and manages account locking)
 */
export const recordLoginAttempt = async (
  id,
  { success, ipAddress, maxAttempts = 5, lockDurationMinutes = 15 }
) => {
  const pool = getPool();

  if (success) {
    const query = `
      UPDATE users
      SET 
        failed_login_attempts = 0,
        locked_until = NULL,
        last_login_at = CURRENT_TIMESTAMP,
        last_login_ip = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id, ipAddress || null]);
    return result.rows[0] || null;
  }

  // Failed attempt: increment and lock if exceeded
  const query = `
    UPDATE users
    SET 
      failed_login_attempts = failed_login_attempts + 1,
      status = CASE 
        WHEN failed_login_attempts + 1 >= $2 THEN 'locked' 
        ELSE status 
      END,
      locked_until = CASE 
        WHEN failed_login_attempts + 1 >= $2 THEN CURRENT_TIMESTAMP + ($3 || ' minutes')::INTERVAL 
        ELSE locked_until 
      END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const result = await pool.query(query, [id, maxAttempts, String(lockDurationMinutes)]);
  return result.rows[0] || null;
};

/**
 * Delete a user record
 */
export const deleteUser = async (id) => {
  const pool = getPool();
  const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export default {
  findAll,
  findById,
  findByUsername,
  findByEmail,
  findByPhone,
  existsByUsername,
  existsByEmail,
  existsByPhone,
  create,
  update,
  updatePassword,
  updateStatus,
  recordLoginAttempt,
  deleteUser,
  delete: deleteUser,
};
