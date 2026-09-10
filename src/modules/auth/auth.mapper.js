/**
 * Map authenticated user, token pair, and session into standard DTO
 *
 * @param {Object} user - User entity from DB
 * @param {string} accessToken - JWT access token
 * @param {string} refreshToken - Cryptographic refresh token
 * @param {Object} session - Created session entity
 * @returns {Object}
 */
export const toAuthResponseDTO = (user, accessToken, refreshToken, session) => {
  return {
    user: {
      id: Number(user.id),
      companyId: user.company_id ? Number(user.company_id) : null,
      branchId: user.branch_id ? Number(user.branch_id) : null,
      employeeId: user.employee_id ? Number(user.employee_id) : null,
      roleId: user.role_id ? Number(user.role_id) : null,
      username: user.username,
      email: user.email || null,
      phone: user.phone || null,
      profileImageUrl: user.profile_image_url || null,
      status: user.status,
      roleCode: user.role_code || 'USER',
      roleName: user.role_name || 'User',
      isSystemRole: Boolean(user.is_system_role),
      companyName: user.company_name || null,
      branchName: user.branch_name || null,
      lastLoginAt: user.last_login_at,
    },
    tokens: {
      tokenType: 'Bearer',
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    },
    session: {
      id: session.id,
      deviceName: session.device_name || null,
      deviceType: session.device_type || null,
      browser: session.browser || null,
      operatingSystem: session.operating_system || null,
      ipAddress: session.ip_address || null,
      createdAt: session.created_at,
      expiresAt: session.expires_at,
    },
  };
};

/**
 * Map user session entity to DTO with isCurrent indicator
 *
 * @param {Object} session
 * @param {string|null} currentSessionId
 * @returns {Object}
 */
export const toSessionDTO = (session, currentSessionId = null) => {
  if (!session) return null;

  return {
    id: session.id,
    userId: Number(session.user_id),
    deviceName: session.device_name || null,
    deviceType: session.device_type || null,
    browser: session.browser || null,
    browserVersion: session.browser_version || null,
    operatingSystem: session.operating_system || null,
    osVersion: session.os_version || null,
    ipAddress: session.ip_address || null,
    isActive: Boolean(session.is_active),
    isCurrent: Boolean(currentSessionId && session.id === currentSessionId),
    createdAt: session.created_at,
    lastActivityAt: session.last_activity_at || null,
    expiresAt: session.expires_at,
  };
};

/**
 * Map array of sessions
 */
export const toSessionListDTO = (sessions = [], currentSessionId = null) => {
  return sessions.map((s) => toSessionDTO(s, currentSessionId));
};

/**
 * Map login history entry to DTO
 *
 * @param {Object} entry
 * @returns {Object}
 */
export const toLoginHistoryDTO = (entry) => {
  if (!entry) return null;

  return {
    id: Number(entry.id),
    userId: entry.user_id ? Number(entry.user_id) : null,
    username: entry.username || null,
    email: entry.email || null,
    status: entry.status,
    reason: entry.reason || null,
    ipAddress: entry.ip_address || null,
    deviceName: entry.device_name || null,
    deviceType: entry.device_type || null,
    browser: entry.browser || null,
    operatingSystem: entry.operating_system || null,
    countryCode: entry.country_code || null,
    countryName: entry.country_name || null,
    city: entry.city || null,
    loginAt: entry.login_at,
    sessionId: entry.session_id || null,
  };
};

/**
 * Map array of login history entries
 */
export const toLoginHistoryListDTO = (entries = []) => {
  return entries.map(toLoginHistoryDTO);
};

export default {
  toAuthResponseDTO,
  toSessionDTO,
  toSessionListDTO,
  toLoginHistoryDTO,
  toLoginHistoryListDTO,
};
