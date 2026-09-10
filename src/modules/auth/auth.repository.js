import { getDatabasePool } from '../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

/**
 * Find user for authentication by username or email, optional companyId filter
 */
export const findUserForAuth = async (identifier, companyId = null) => {
  const pool = getPool();
  const conditions = [
    '(LOWER(u.username) = LOWER($1) OR LOWER(u.email) = LOWER($1) OR u.phone = $1)',
  ];
  const values = [identifier.trim()];

  if (companyId) {
    values.push(companyId);
    conditions.push(`u.company_id = $${values.length}`);
  }

  const query = `
    SELECT 
      u.*,
      r.role_code,
      r.role_name,
      r.is_system_role,
      c.company_name,
      c.company_code,
      b.branch_name,
      b.branch_code
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    LEFT JOIN companies c ON c.id = u.company_id
    LEFT JOIN branches b ON b.id = u.branch_id
    WHERE ${conditions.join(' AND ')}
    LIMIT 1
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

/**
 * Find user by ID with joined details
 */
export const findUserById = async (userId) => {
  const pool = getPool();
  const query = `
    SELECT 
      u.id,
      u.company_id,
      u.branch_id,
      u.employee_id,
      u.role_id,
      u.username,
      u.email,
      u.phone,
      u.profile_image_url,
      u.status,
      u.is_email_verified,
      u.is_phone_verified,
      u.failed_login_attempts,
      u.locked_until,
      u.last_login_at,
      u.last_login_ip,
      u.token_version,
      u.two_factor_enabled,
      u.created_at,
      u.updated_at,
      r.role_code,
      r.role_name,
      r.is_system_role,
      c.company_name,
      c.company_code,
      b.branch_name,
      b.branch_code
    FROM users u
    LEFT JOIN roles r ON r.id = u.role_id
    LEFT JOIN companies c ON c.id = u.company_id
    LEFT JOIN branches b ON b.id = u.branch_id
    WHERE u.id = $1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0] || null;
};

/**
 * Record an audit log entry in login_history
 */
export const recordLoginHistory = async ({
  userId = null,
  username = null,
  email = null,
  status,
  reason = null,
  clientInfo = {},
  sessionId = null,
  requestId = null,
}) => {
  try {
    const pool = getPool();
    const query = `
      INSERT INTO login_history (
        user_id, username, email, status, reason,
        ip_address, user_agent, device_name, device_type,
        browser, browser_version, operating_system, os_version,
        country_code, country_name, city, session_id, request_id
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12, $13,
        $14, $15, $16, $17, $18
      ) RETURNING id
    `;

    const values = [
      userId,
      username,
      email,
      status,
      reason,
      clientInfo.ipAddress || null,
      clientInfo.userAgent || null,
      clientInfo.deviceName || null,
      clientInfo.deviceType || null,
      clientInfo.browser || null,
      clientInfo.browserVersion || null,
      clientInfo.operatingSystem || null,
      clientInfo.osVersion || null,
      clientInfo.countryCode || null,
      clientInfo.countryName || null,
      clientInfo.city || null,
      sessionId,
      requestId,
    ];

    await pool.query(query, values);
  } catch (error) {
    console.error('Failed to write login_history audit entry:', error.message);
  }
};

/**
 * Update user on successful login: reset failed attempts, update login timestamps & IP
 */
export const updateLoginSuccess = async (userId, ipAddress) => {
  const pool = getPool();
  const query = `
    UPDATE users
    SET 
      failed_login_attempts = 0,
      locked_until = NULL,
      last_login_at = CURRENT_TIMESTAMP,
      last_login_ip = $1
    WHERE id = $2
    RETURNING id
  `;
  await pool.query(query, [ipAddress || null, userId]);
};

/**
 * Update user on failed login: increment failed attempts, lock account if >= 5 attempts
 */
export const updateLoginFailure = async (userId, maxAttempts = 5, lockDurationMinutes = 15) => {
  const pool = getPool();
  const query = `
    UPDATE users
    SET 
      failed_login_attempts = failed_login_attempts + 1,
      locked_until = CASE 
        WHEN failed_login_attempts + 1 >= $2 THEN CURRENT_TIMESTAMP + ($3 * INTERVAL '1 minute')
        ELSE locked_until 
      END,
      status = CASE 
        WHEN failed_login_attempts + 1 >= $2 THEN 'locked'
        ELSE status 
      END
    WHERE id = $1
    RETURNING failed_login_attempts, locked_until, status
  `;
  const result = await pool.query(query, [userId, maxAttempts, lockDurationMinutes]);
  return result.rows[0];
};

/**
 * Create a new user session record in user_sessions
 */
export const createSession = async ({ sessionId, userId, clientInfo = {}, expiresAt }) => {
  const pool = getPool();
  const query = `
    INSERT INTO user_sessions (
      id, user_id, device_name, device_type,
      browser, browser_version, operating_system, os_version,
      user_agent, ip_address, is_active, expires_at, last_activity_at
    ) VALUES (
      $1, $2, $3, $4,
      $5, $6, $7, $8,
      $9, $10, TRUE, $11, CURRENT_TIMESTAMP
    ) RETURNING *
  `;

  const values = [
    sessionId,
    userId,
    clientInfo.deviceName || null,
    clientInfo.deviceType || null,
    clientInfo.browser || null,
    clientInfo.browserVersion || null,
    clientInfo.operatingSystem || null,
    clientInfo.osVersion || null,
    clientInfo.userAgent || null,
    clientInfo.ipAddress || null,
    expiresAt,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Update session last activity timestamp
 */
export const updateSessionActivity = async (sessionId) => {
  try {
    const pool = getPool();
    const query = `
      UPDATE user_sessions
      SET last_activity_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_active = TRUE
    `;
    await pool.query(query, [sessionId]);
  } catch (error) {
    console.error('Failed to update session activity:', error.message);
  }
};

/**
 * Create a user refresh token record in user_refresh_tokens
 */
export const createRefreshToken = async ({
  userId,
  sessionId,
  tokenHash,
  clientInfo = {},
  expiresAt,
  rotatedFromTokenId = null,
}) => {
  const pool = getPool();
  const query = `
    INSERT INTO user_refresh_tokens (
      user_id, session_id, refresh_token_hash,
      ip_address, user_agent, device_name, device_type,
      browser, browser_version, operating_system, os_version,
      is_active, expires_at, rotated_from_token_id
    ) VALUES (
      $1, $2, $3,
      $4, $5, $6, $7,
      $8, $9, $10, $11,
      TRUE, $12, $13
    ) RETURNING *
  `;

  const values = [
    userId,
    sessionId,
    tokenHash,
    clientInfo.ipAddress || null,
    clientInfo.userAgent || null,
    clientInfo.deviceName || null,
    clientInfo.deviceType || null,
    clientInfo.browser || null,
    clientInfo.browserVersion || null,
    clientInfo.operatingSystem || null,
    clientInfo.osVersion || null,
    expiresAt,
    rotatedFromTokenId,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Find refresh token with joined user and role details
 */
export const findRefreshTokenWithUser = async (tokenHash) => {
  const pool = getPool();
  const query = `
    SELECT 
      rt.*,
      s.is_active AS session_is_active,
      s.expires_at AS session_expires_at,
      u.id AS user_id,
      u.company_id,
      u.username,
      u.email,
      u.status AS user_status,
      u.token_version,
      r.id AS role_id,
      r.role_code,
      r.role_name,
      r.is_system_role
    FROM user_refresh_tokens rt
    LEFT JOIN user_sessions s ON s.id = rt.session_id
    INNER JOIN users u ON u.id = rt.user_id
    LEFT JOIN roles r ON r.id = u.role_id
    WHERE rt.refresh_token_hash = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [tokenHash]);
  return result.rows[0] || null;
};

/**
 * Rotate refresh token: mark old token rotated/inactive, create new active token
 */
export const rotateRefreshToken = async (oldTokenId, newTokenData) => {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Deactivate old token first to satisfy active session partial index
    await client.query(
      `UPDATE user_refresh_tokens
       SET 
         is_active = FALSE,
         last_used_at = CURRENT_TIMESTAMP,
         revoked_at = CURRENT_TIMESTAMP,
         revoked_reason = 'Rotated'
       WHERE id = $1`,
      [oldTokenId]
    );

    // 2. Create new active refresh token
    const insertQuery = `
      INSERT INTO user_refresh_tokens (
        user_id, session_id, refresh_token_hash,
        ip_address, user_agent, device_name, device_type,
        browser, browser_version, operating_system, os_version,
        is_active, expires_at, rotated_from_token_id
      ) VALUES (
        $1, $2, $3,
        $4, $5, $6, $7,
        $8, $9, $10, $11,
        TRUE, $12, $13
      ) RETURNING *
    `;

    const insertValues = [
      newTokenData.userId,
      newTokenData.sessionId,
      newTokenData.tokenHash,
      newTokenData.clientInfo.ipAddress || null,
      newTokenData.clientInfo.userAgent || null,
      newTokenData.clientInfo.deviceName || null,
      newTokenData.clientInfo.deviceType || null,
      newTokenData.clientInfo.browser || null,
      newTokenData.clientInfo.browserVersion || null,
      newTokenData.clientInfo.operatingSystem || null,
      newTokenData.clientInfo.osVersion || null,
      newTokenData.expiresAt,
      oldTokenId,
    ];

    const newTokRes = await client.query(insertQuery, insertValues);
    const newToken = newTokRes.rows[0];

    // 3. Link old token replaced_by_token_id to new token
    await client.query(`UPDATE user_refresh_tokens SET replaced_by_token_id = $1 WHERE id = $2`, [
      newToken.id,
      oldTokenId,
    ]);

    // 4. Update session last activity
    await client.query(
      `UPDATE user_sessions SET last_activity_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [newTokenData.sessionId]
    );

    await client.query('COMMIT');
    return newToken;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Handle reuse detection: if a rotated token is presented, revoke the entire session
 */
export const handleTokenReuse = async (userId, sessionId, tokenHash) => {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Mark reuse on this token
    await client.query(
      `UPDATE user_refresh_tokens SET reuse_detected_at = CURRENT_TIMESTAMP WHERE refresh_token_hash = $1`,
      [tokenHash]
    );

    // 2. Revoke all refresh tokens for this session
    await client.query(
      `UPDATE user_refresh_tokens
       SET is_active = FALSE, revoked_at = CURRENT_TIMESTAMP, revoked_reason = 'Reuse detected - session invalidated'
       WHERE session_id = $1`,
      [sessionId]
    );

    // 3. Revoke session in user_sessions
    await client.query(
      `UPDATE user_sessions
       SET is_active = FALSE, revoked_at = CURRENT_TIMESTAMP, revoked_reason = 'Security breach: token reuse detected'
       WHERE id = $1`,
      [sessionId]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error handling token reuse:', error.message);
  } finally {
    client.release();
  }
};

/**
 * Revoke specific session by ID
 */
export const revokeSession = async (sessionId, reason = 'User logged out') => {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE user_sessions 
       SET is_active = FALSE, revoked_at = CURRENT_TIMESTAMP, revoked_reason = $1
       WHERE id = $2`,
      [reason, sessionId]
    );

    await client.query(
      `UPDATE user_refresh_tokens
       SET is_active = FALSE, revoked_at = CURRENT_TIMESTAMP, revoked_reason = $1
       WHERE session_id = $2`,
      [reason, sessionId]
    );

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Revoke all sessions for a user and increment token_version for instant access token invalidation
 */
export const revokeAllUserSessions = async (userId, reason = 'User logged out of all devices') => {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Revoke all sessions
    await client.query(
      `UPDATE user_sessions
       SET is_active = FALSE, revoked_at = CURRENT_TIMESTAMP, revoked_reason = $1
       WHERE user_id = $2 AND is_active = TRUE`,
      [reason, userId]
    );

    // Revoke all refresh tokens
    await client.query(
      `UPDATE user_refresh_tokens
       SET is_active = FALSE, revoked_at = CURRENT_TIMESTAMP, revoked_reason = $1
       WHERE user_id = $2 AND is_active = TRUE`,
      [reason, userId]
    );

    // Increment user token_version so all existing access tokens are rejected
    await client.query(`UPDATE users SET token_version = token_version + 1 WHERE id = $1`, [
      userId,
    ]);

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get active sessions for a user
 */
export const getUserActiveSessions = async (userId) => {
  const pool = getPool();
  const query = `
    SELECT * 
    FROM user_sessions
    WHERE user_id = $1 
      AND is_active = TRUE 
      AND expires_at > CURRENT_TIMESTAMP
    ORDER BY last_activity_at DESC NULLS LAST, created_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

/**
 * Find session by ID
 */
export const findSessionById = async (sessionId) => {
  const pool = getPool();
  const query = `SELECT * FROM user_sessions WHERE id = $1`;
  const result = await pool.query(query, [sessionId]);
  return result.rows[0] || null;
};

/**
 * Get recent password hashes for user from password_history
 */
export const getRecentPasswordHashes = async (userId, limit = 5) => {
  const pool = getPool();
  const query = `
    SELECT password_hash 
    FROM password_history 
    WHERE user_id = $1 
    ORDER BY created_at DESC 
    LIMIT $2
  `;
  const result = await pool.query(query, [userId, limit]);
  return result.rows.map((row) => row.password_hash);
};

/**
 * Record password hash in password_history
 */
export const recordPasswordHistory = async (userId, passwordHash) => {
  const pool = getPool();
  const query = `
    INSERT INTO password_history (user_id, password_hash)
    VALUES ($1, $2)
  `;
  await pool.query(query, [userId, passwordHash]);
};

/**
 * Update user password and increment token_version
 */
export const updateUserPassword = async (userId, newPasswordHash) => {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Update user password and token_version
    await client.query(
      `UPDATE users 
       SET password_hash = $1, 
           password_changed_at = CURRENT_TIMESTAMP, 
           token_version = token_version + 1,
           must_change_password = FALSE
       WHERE id = $2`,
      [newPasswordHash, userId]
    );

    // 2. Record in password_history
    await client.query(`INSERT INTO password_history (user_id, password_hash) VALUES ($1, $2)`, [
      userId,
      newPasswordHash,
    ]);

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get user login history paginated
 */
export const getUserLoginHistory = async (
  userId,
  { limit = 10, offset = 0, status = null } = {}
) => {
  const pool = getPool();
  const conditions = ['user_id = $1'];
  const values = [userId];

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const countQuery = `SELECT COUNT(*)::int AS total FROM login_history ${whereClause}`;
  const dataQuery = `
    SELECT * 
    FROM login_history 
    ${whereClause}
    ORDER BY login_at DESC 
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;

  const [countRes, dataRes] = await Promise.all([
    pool.query(countQuery, values),
    pool.query(dataQuery, [...values, limit, offset]),
  ]);

  return {
    rows: dataRes.rows,
    total: countRes.rows[0]?.total || 0,
  };
};

export default {
  findUserForAuth,
  findUserById,
  recordLoginHistory,
  updateLoginSuccess,
  updateLoginFailure,
  createSession,
  updateSessionActivity,
  createRefreshToken,
  findRefreshTokenWithUser,
  rotateRefreshToken,
  handleTokenReuse,
  revokeSession,
  revokeAllUserSessions,
  getUserActiveSessions,
  findSessionById,
  getRecentPasswordHashes,
  recordPasswordHistory,
  updateUserPassword,
  getUserLoginHistory,
};
