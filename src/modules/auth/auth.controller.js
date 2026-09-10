import * as authService from './auth.service.js';
import { parseClientInfo, getCookieOptions } from './auth.utils.js';
import { sendSuccess } from '../../shared/utils/response.js';

/**
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const clientInfo = parseClientInfo(req);
    const { authData, accessToken, refreshToken, sessionId } = await authService.login(
      req.body,
      clientInfo
    );

    // Set secure HTTP-only cookies
    res.cookie('access_token', accessToken, getCookieOptions(false));
    res.cookie('refresh_token', refreshToken, getCookieOptions(true));
    res.cookie('session_id', sessionId, getCookieOptions(true));

    return sendSuccess(res, authData, 'Login successful');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/auth/refresh-token
 */
export const refreshToken = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.refresh_token || req.body?.refresh_token;
    const clientInfo = parseClientInfo(req);

    const result = await authService.refreshToken(rawRefreshToken, clientInfo);

    // Update cookies with rotated tokens
    res.cookie('access_token', result.accessToken, getCookieOptions(false));
    res.cookie('refresh_token', result.refreshToken, getCookieOptions(true));
    res.cookie('session_id', result.sessionId, getCookieOptions(true));

    return sendSuccess(res, result, 'Token refreshed successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    const profile = await authService.getCurrentUser(req.user.id, req.user.sessionId);
    return sendSuccess(res, profile, 'User profile retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    const clientInfo = parseClientInfo(req);
    await authService.logout(req.user?.sessionId, req.user?.id, clientInfo);

    // Clear authentication cookies
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    res.clearCookie('session_id', { path: '/' });

    return sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/auth/logout-all
 */
export const logoutAll = async (req, res, next) => {
  try {
    const clientInfo = parseClientInfo(req);
    await authService.logoutAll(req.user.id, clientInfo);

    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    res.clearCookie('session_id', { path: '/' });

    return sendSuccess(res, null, 'All sessions terminated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/auth/sessions
 */
export const getSessions = async (req, res, next) => {
  try {
    const sessions = await authService.getActiveSessions(req.user.id, req.user.sessionId);
    return sendSuccess(res, sessions, 'Active sessions retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/auth/sessions/:id
 */
export const revokeSession = async (req, res, next) => {
  try {
    await authService.revokeSessionById(req.user.id, req.params.id);
    return sendSuccess(res, null, 'Session revoked successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/auth/login-history
 */
export const getLoginHistory = async (req, res, next) => {
  try {
    const { history, meta } = await authService.getLoginHistory(req.user.id, req.query);
    return sendSuccess(res, history, 'Login history retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/auth/change-password
 */
export const changePassword = async (req, res, next) => {
  try {
    const clientInfo = parseClientInfo(req);
    const result = await authService.changePassword(
      req.user.id,
      req.body.current_password,
      req.body.new_password,
      clientInfo
    );

    // Clear old session cookies so user can re-authenticate
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    res.clearCookie('session_id', { path: '/' });

    return sendSuccess(res, null, result.message);
  } catch (error) {
    return next(error);
  }
};

export default {
  login,
  refreshToken,
  getMe,
  logout,
  logoutAll,
  getSessions,
  revokeSession,
  getLoginHistory,
  changePassword,
};
