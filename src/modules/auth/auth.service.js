import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import * as authRepository from './auth.repository.js';
import {
  hashToken,
  generateRefreshToken,
  generateAccessToken,
  getRefreshTokenExpiry,
} from './auth.utils.js';
import { toAuthResponseDTO, toSessionListDTO, toLoginHistoryListDTO } from './auth.mapper.js';
import UnauthorizedError from '../../shared/errors/UnauthorizedError.js';
import ForbiddenError from '../../shared/errors/ForbiddenError.js';
import NotFoundError from '../../shared/errors/NotFoundError.js';
import BadRequestError from '../../shared/errors/BadRequestError.js';
import { getPaginationParams, formatPaginationMeta } from '../../shared/utils/pagination.js';

/**
 * Authenticate user credentials, create session, and issue access/refresh tokens
 */
export const login = async ({ identifier, password, company_id = null }, clientInfo = {}) => {
  const user = await authRepository.findUserForAuth(identifier, company_id);

  if (!user) {
    await authRepository.recordLoginHistory({
      username: identifier,
      status: 'failed',
      reason: 'User account not found',
      clientInfo,
    });
    throw new UnauthorizedError('Invalid username or password');
  }

  // 1. Check account lockout status
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    const remainingMins = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
    await authRepository.recordLoginHistory({
      userId: user.id,
      username: user.username,
      email: user.email,
      status: 'locked',
      reason: `Account locked. Remaining: ${remainingMins}m`,
      clientInfo,
    });
    throw new ForbiddenError(
      `Account is temporarily locked due to multiple failed login attempts. Please try again in ${remainingMins} minute(s).`
    );
  }

  // 2. Check general account status
  if (user.status && user.status !== 'active') {
    await authRepository.recordLoginHistory({
      userId: user.id,
      username: user.username,
      email: user.email,
      status: 'blocked',
      reason: `Account status: ${user.status}`,
      clientInfo,
    });
    throw new ForbiddenError(
      `Your account is ${user.status}. Please contact your system administrator.`
    );
  }

  // 3. Verify password hash
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const lockStats = await authRepository.updateLoginFailure(user.id);
    const isNowLocked = lockStats.status === 'locked';

    await authRepository.recordLoginHistory({
      userId: user.id,
      username: user.username,
      email: user.email,
      status: isNowLocked ? 'locked' : 'failed',
      reason: isNowLocked
        ? 'Account locked after reaching max failed attempts'
        : 'Invalid password provided',
      clientInfo,
    });

    if (isNowLocked) {
      throw new ForbiddenError(
        'Account has been temporarily locked for 15 minutes due to consecutive failed login attempts.'
      );
    }

    throw new UnauthorizedError('Invalid username or password');
  }

  // 4. Authentication Succeeded -> Initialize Session & Tokens
  const sessionId = crypto.randomUUID();
  const sessionExpiry = getRefreshTokenExpiry(30);

  // Update login stats in users table
  await authRepository.updateLoginSuccess(user.id, clientInfo.ipAddress);

  // Create active session
  const session = await authRepository.createSession({
    sessionId,
    userId: user.id,
    clientInfo,
    expiresAt: sessionExpiry,
  });

  // Generate & store hashed refresh token
  const rawRefreshToken = generateRefreshToken();
  const tokenHash = hashToken(rawRefreshToken);

  await authRepository.createRefreshToken({
    userId: user.id,
    sessionId,
    tokenHash,
    clientInfo,
    expiresAt: sessionExpiry,
  });

  // Record audit trail
  await authRepository.recordLoginHistory({
    userId: user.id,
    username: user.username,
    email: user.email,
    status: 'success',
    reason: 'Authentication successful',
    clientInfo,
    sessionId,
  });

  // Sign JWT Access Token
  const roleCode = user.role_code || 'USER';
  const accessToken = generateAccessToken({
    id: user.id,
    company_id: user.company_id,
    branch_id: user.branch_id,
    role_id: user.role_id,
    role: roleCode.toLowerCase(),
    role_code: roleCode,
    is_system_role: user.is_system_role,
    session_id: sessionId,
    token_version: user.token_version,
  });

  return {
    authData: toAuthResponseDTO(user, accessToken, rawRefreshToken, session),
    accessToken,
    refreshToken: rawRefreshToken,
    sessionId,
  };
};

/**
 * Rotate refresh token and issue new token pair
 */
export const refreshToken = async (rawRefreshToken, clientInfo = {}) => {
  if (!rawRefreshToken || typeof rawRefreshToken !== 'string') {
    throw new UnauthorizedError('Refresh token is required');
  }

  const tokenHash = hashToken(rawRefreshToken);
  const tokenRecord = await authRepository.findRefreshTokenWithUser(tokenHash);

  if (!tokenRecord) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  // Reuse Detection: If token is already inactive or has been rotated
  if (!tokenRecord.is_active || tokenRecord.replaced_by_token_id) {
    await authRepository.handleTokenReuse(tokenRecord.user_id, tokenRecord.session_id, tokenHash);

    await authRepository.recordLoginHistory({
      userId: tokenRecord.user_id,
      username: tokenRecord.username,
      email: tokenRecord.email,
      status: 'blocked',
      reason: 'Security breach: Attempted reuse of previously rotated refresh token',
      clientInfo,
      sessionId: tokenRecord.session_id,
    });

    throw new UnauthorizedError(
      'Security alert: Token reuse detected. Your session has been invalidated for security.'
    );
  }

  // Check token expiration
  if (new Date(tokenRecord.expires_at) < new Date()) {
    throw new UnauthorizedError('Refresh token has expired. Please log in again.');
  }

  // Check session active state
  if (!tokenRecord.session_is_active) {
    throw new UnauthorizedError('Session has been terminated. Please log in again.');
  }

  // Check user active status
  if (tokenRecord.user_status && tokenRecord.user_status !== 'active') {
    throw new ForbiddenError('User account is inactive or suspended');
  }

  // Refresh Token Rotation (RTR): Generate new token and supersede old one
  const newRawRefreshToken = generateRefreshToken();
  const newTokenHash = hashToken(newRawRefreshToken);
  const newExpiresAt = getRefreshTokenExpiry(30);

  await authRepository.rotateRefreshToken(tokenRecord.id, {
    userId: tokenRecord.user_id,
    sessionId: tokenRecord.session_id,
    tokenHash: newTokenHash,
    clientInfo,
    expiresAt: newExpiresAt,
  });

  const roleCode = tokenRecord.role_code || 'USER';
  const newAccessToken = generateAccessToken({
    id: tokenRecord.user_id,
    company_id: tokenRecord.company_id,
    role_id: tokenRecord.role_id,
    role: roleCode.toLowerCase(),
    role_code: roleCode,
    is_system_role: tokenRecord.is_system_role,
    session_id: tokenRecord.session_id,
    token_version: tokenRecord.token_version,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRawRefreshToken,
    sessionId: tokenRecord.session_id,
    expiresIn: 900,
  };
};

/**
 * Get profile of currently authenticated user
 */
export const getCurrentUser = async (userId, currentSessionId = null) => {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw new NotFoundError('User profile not found');
  }

  let currentSession = null;
  if (currentSessionId) {
    currentSession = await authRepository.findSessionById(currentSessionId);
  }

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
      companyCode: user.company_code || null,
      branchName: user.branch_name || null,
      branchCode: user.branch_code || null,
      lastLoginAt: user.last_login_at,
    },
    currentSession: currentSession
      ? {
          id: currentSession.id,
          deviceName: currentSession.device_name,
          deviceType: currentSession.device_type,
          browser: currentSession.browser,
          operatingSystem: currentSession.operating_system,
          ipAddress: currentSession.ip_address,
          createdAt: currentSession.created_at,
          lastActivityAt: currentSession.last_activity_at,
        }
      : null,
  };
};

/**
 * Terminate current session and revoke tokens
 */
export const logout = async (sessionId, userId, clientInfo = {}) => {
  if (sessionId) {
    await authRepository.revokeSession(sessionId, 'User logged out');
  }

  if (userId) {
    await authRepository.recordLoginHistory({
      userId,
      status: 'logout',
      reason: 'User initiated logout',
      clientInfo,
      sessionId,
    });
  }

  return { message: 'Logged out successfully' };
};

/**
 * Terminate all active sessions for the user and invalidate existing tokens
 */
export const logoutAll = async (userId, clientInfo = {}) => {
  await authRepository.revokeAllUserSessions(userId, 'User terminated all active sessions');

  await authRepository.recordLoginHistory({
    userId,
    status: 'logout',
    reason: 'User terminated all active sessions across all devices',
    clientInfo,
  });

  return { message: 'All active sessions have been terminated successfully' };
};

/**
 * Get real-time active sessions for the caller
 */
export const getActiveSessions = async (userId, currentSessionId = null) => {
  const sessions = await authRepository.getUserActiveSessions(userId);
  return toSessionListDTO(sessions, currentSessionId);
};

/**
 * Revoke specific session by ID
 */
export const revokeSessionById = async (userId, sessionIdToRevoke) => {
  const session = await authRepository.findSessionById(sessionIdToRevoke);

  if (!session || Number(session.user_id) !== Number(userId)) {
    throw new NotFoundError('Session not found or already terminated');
  }

  await authRepository.revokeSession(sessionIdToRevoke, 'Remote logout by user');
  return { message: 'Session revoked successfully' };
};

/**
 * Get user login audit trail
 */
export const getLoginHistory = async (userId, query = {}) => {
  const { page, limit, offset } = getPaginationParams(query);
  const status = query.status || null;

  const { rows, total } = await authRepository.getUserLoginHistory(userId, {
    limit,
    offset,
    status,
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    history: toLoginHistoryListDTO(rows),
    meta,
  };
};

/**
 * Change password with Password History check (preventing reuse of last 5 passwords)
 */
export const changePassword = async (userId, currentPassword, newPassword, clientInfo = {}) => {
  const pool = (await import('../../database/connection.js')).getDatabasePool();
  const userRes = await pool.query(`SELECT * FROM users WHERE id = $1`, [userId]);
  const userRecord = userRes.rows[0];

  if (!userRecord) {
    throw new NotFoundError('User not found');
  }

  // 1. Verify current password
  const isMatch = await bcrypt.compare(currentPassword, userRecord.password_hash);
  if (!isMatch) {
    throw new BadRequestError('Current password is incorrect');
  }

  // 2. Prevent identical new password
  if (currentPassword === newPassword) {
    throw new BadRequestError('New password must be different from current password');
  }

  // 3. Password History Check: Prevent reuse of last 5 passwords
  const recentHashes = await authRepository.getRecentPasswordHashes(userId, 5);
  for (const prevHash of recentHashes) {
    if (bcrypt.compareSync(newPassword, prevHash)) {
      throw new BadRequestError(
        'For security reasons, you cannot reuse any of your last 5 passwords'
      );
    }
  }

  // 4. Hash new password with strong salt
  const salt = await bcrypt.genSalt(12);
  const newPasswordHash = await bcrypt.hash(newPassword, salt);

  // 5. Update user password, increment token_version, and write to password_history
  await authRepository.updateUserPassword(userId, newPasswordHash);

  // 6. Terminate all other sessions
  await authRepository.revokeAllUserSessions(userId, 'Password changed');

  // 7. Audit log
  await authRepository.recordLoginHistory({
    userId,
    username: userRecord.username,
    email: userRecord.email,
    status: 'success',
    reason: 'Password changed successfully',
    clientInfo,
  });

  return {
    message: 'Password changed successfully. All other sessions have been logged out.',
  };
};

export default {
  login,
  refreshToken,
  getCurrentUser,
  logout,
  logoutAll,
  getActiveSessions,
  revokeSessionById,
  getLoginHistory,
  changePassword,
};
