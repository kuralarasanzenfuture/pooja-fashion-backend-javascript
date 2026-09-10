import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { getDatabasePool } from '../database/connection.js';
import UnauthorizedError from '../shared/errors/UnauthorizedError.js';
import ForbiddenError from '../shared/errors/ForbiddenError.js';

const ACCESS_SECRET =
  env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET || 'local-dev-access-secret';

/**
 * Enhanced debug logger for authentication events
 * Enabled in development or when DEBUG_AUTH=true in environment
 */
const isDebugEnabled = () => {
  return process.env.DEBUG_AUTH === 'true' || env.NODE_ENV === 'development';
};

export const logAuthDebug = (stage, message, data = null) => {
  if (!isDebugEnabled()) return;

  const timestamp = new Date().toISOString();
  const logPrefix = `🔐 [AUTH:DEBUG] [${timestamp}] [${stage.toUpperCase()}]`;

  if (data) {
    // Sanitize any sensitive fields if present
    const sanitized = { ...data };
    if (sanitized.token) {
      sanitized.token = `${sanitized.token.slice(0, 12)}...[truncated]`;
    }
    console.log(`${logPrefix} ${message}`, sanitized);
  } else {
    console.log(`${logPrefix} ${message}`);
  }
};

/**
 * Helper to extract JWT token from Request across multiple standard vectors:
 * 1. Authorization Bearer header
 * 2. Cookie fallback ('access_token', 'token', 'jwt')
 * 3. Query string parameter fallback in development mode
 *
 * @param {import('express').Request} req
 * @returns {string|null}
 */
export const extractToken = (req) => {
  // 1. Authorization: Bearer <token>
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && typeof authHeader === 'string') {
    const parts = authHeader.trim().split(/\s+/);
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
      logAuthDebug('extract', 'Extracted token from Authorization header');
      return parts[1];
    }
  }

  // 2. Cookie fallback
  if (req.cookies) {
    const cookieToken =
      req.cookies.access_token || req.cookies.token || req.cookies.accessToken || req.cookies.jwt;

    if (cookieToken) {
      logAuthDebug('extract', 'Extracted token from cookie');
      return cookieToken;
    }
  }

  // 3. Development query fallback (e.g. ?token=...)
  if (env.NODE_ENV === 'development' && req.query?.token) {
    logAuthDebug('extract', 'Extracted token from query parameter (dev mode)');
    return String(req.query.token);
  }

  return null;
};

/**
 * Verify JWT Access Token, validate session state, and check user active status in PostgreSQL.
 * Attaches normalized user profile to `req.user`.
 */
export const verifyToken = async (req, res, next) => {
  const reqPath = req.originalUrl || req.url;
  logAuthDebug('verify', `Starting authentication for ${req.method} ${reqPath}`);

  try {
    // 1. Extract Token
    const token = extractToken(req);
    if (!token) {
      logAuthDebug('verify', 'Authentication failed: No token provided');
      return next(new UnauthorizedError('Authentication token required'));
    }

    // 2. Verify JWT signature and expiration
    let decoded;
    try {
      decoded = jwt.verify(token, ACCESS_SECRET);
      logAuthDebug('jwt', 'Token verified successfully', {
        userId: decoded.id || decoded.userId,
        expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : null,
      });
    } catch (jwtError) {
      logAuthDebug('jwt_error', `JWT verification failed: ${jwtError.message}`);
      if (jwtError.name === 'TokenExpiredError') {
        return next(new UnauthorizedError('Authentication token has expired'));
      }
      return next(new UnauthorizedError('Invalid authentication token'));
    }

    const userId = decoded.id || decoded.userId || decoded.sub;
    if (!userId) {
      logAuthDebug('verify', 'Token payload missing user identifier');
      return next(new UnauthorizedError('Invalid token payload: missing user id'));
    }

    const sessionId = decoded.session_id || decoded.sessionId || req.cookies?.session_id || null;

    // 3. Database Validation (PostgreSQL Pool)
    const pool = getDatabasePool();
    let dbUser = null;
    let isDbAvailable = Boolean(pool);

    if (pool) {
      try {
        // Query user with joined role details
        const userQuery = `
          SELECT u.id, u.company_id, u.email, u.status, u.role_id,
                 r.role_code, r.role_name, r.is_system_role
          FROM users u
          LEFT JOIN roles r ON r.id = u.role_id
          WHERE u.id = $1
          LIMIT 1
        `;
        const userRes = await pool.query(userQuery, [userId]);
        dbUser = userRes.rows[0] || null;

        if (!dbUser) {
          logAuthDebug('db_user', `User with ID ${userId} not found in database`);
          return next(new UnauthorizedError('User account not found'));
        }

        if (dbUser.status && dbUser.status !== 'active') {
          logAuthDebug('db_user', `User ${userId} status is '${dbUser.status}' (not active)`);
          return next(new ForbiddenError('User account is inactive or suspended'));
        }

        // 4. Session Validation (if session_id is tracked and user_refresh_tokens table exists)
        if (sessionId) {
          try {
            const sessionQuery = `
              SELECT id, is_active, expires_at 
              FROM user_refresh_tokens
              WHERE user_id = $1 
                AND session_id = $2
                AND is_active = TRUE
                AND expires_at > CURRENT_TIMESTAMP
              LIMIT 1
            `;
            const sessionRes = await pool.query(sessionQuery, [userId, sessionId]);
            if (sessionRes.rowCount === 0) {
              logAuthDebug('session', `Session ${sessionId} invalid, expired, or revoked`);
              return next(new UnauthorizedError('Session expired or logged out'));
            }
            logAuthDebug('session', `Session ${sessionId} verified`);
          } catch (sessionErr) {
            // If user_refresh_tokens table does not exist yet in schema, log debug info
            if (sessionErr.code === '42P01') {
              logAuthDebug(
                'session',
                'user_refresh_tokens table not yet present in schema (skipped DB session check)'
              );
            } else {
              throw sessionErr;
            }
          }
        }
      } catch (dbErr) {
        // If users table does not exist yet (pending migration), log debug and proceed with JWT payload
        if (dbErr.code === '42P01') {
          logAuthDebug(
            'db_user',
            'users table not yet present in schema; falling back to JWT decoded claims'
          );
          isDbAvailable = false;
        } else {
          logAuthDebug('db_error', `Database error during auth verification: ${dbErr.message}`);
          throw dbErr;
        }
      }
    }

    // 5. Attach Normalized User Profile to Request
    const normalizedRole = (
      dbUser?.role_code ||
      dbUser?.role_name ||
      decoded.role ||
      decoded.role_code ||
      'user'
    ).toLowerCase();

    req.user = {
      id: Number(userId),
      companyId: dbUser?.company_id ? Number(dbUser.company_id) : decoded.company_id || null,
      email: dbUser?.email || decoded.email || null,
      roleId: dbUser?.role_id ? Number(dbUser.role_id) : decoded.role_id || null,
      role: normalizedRole,
      roleCode: (dbUser?.role_code || decoded.role_code || normalizedRole).toUpperCase(),
      roleName: dbUser?.role_name || decoded.role_name || normalizedRole,
      isSystemRole: Boolean(dbUser?.is_system_role || decoded.is_system_role),
      sessionId: sessionId || null,
      authSource: isDbAvailable && dbUser ? 'database' : 'jwt_fallback',
    };

    logAuthDebug(
      'complete',
      `User authenticated successfully: [${req.user.id}] Role: ${req.user.roleCode}`
    );
    return next();
  } catch (err) {
    logAuthDebug('error', `Unhandled authentication error: ${err.message}`);
    return next(err);
  }
};

/**
 * Optional Authentication Middleware
 * If a token is provided and valid, attaches `req.user`.
 * If no token is provided, continues without error with `req.user = null`.
 */
export const optionalAuth = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    req.user = null;
    return next();
  }
  return verifyToken(req, res, next);
};

/**
 * Role-Based Authorization Guard
 * Accepts one or multiple allowed roles (e.g. 'ADMIN', 'SUPERADMIN', 'MANAGER')
 * Checks case-insensitively against user.role and user.roleCode.
 *
 * @param {...string} allowedRoles
 * @returns {import('express').RequestHandler}
 */
export const requireRoles = (...allowedRoles) => {
  const normalizedAllowed = allowedRoles.map((r) => String(r).trim().toLowerCase());

  return (req, res, next) => {
    if (!req.user) {
      logAuthDebug('rbac', 'Access denied: No authenticated user on request');
      return next(new UnauthorizedError('Authentication required'));
    }

    const userRole = (req.user.role || '').toLowerCase();
    const userRoleCode = (req.user.roleCode || '').toLowerCase();

    // SUPERADMIN always passes all role checks
    if (userRole === 'superadmin' || userRoleCode === 'superadmin') {
      logAuthDebug('rbac', 'Access granted: User is SUPERADMIN');
      return next();
    }

    const hasAccess = normalizedAllowed.some((role) => role === userRole || role === userRoleCode);

    if (!hasAccess) {
      logAuthDebug(
        'rbac',
        `Access denied: User role [${userRoleCode}] not in allowed list: [${normalizedAllowed.join(', ')}]`
      );
      return next(
        new ForbiddenError(
          `Forbidden: Access requires one of the following roles: ${allowedRoles.join(', ')}`
        )
      );
    }

    logAuthDebug('rbac', `Access granted for role [${userRoleCode}]`);
    return next();
  };
};

/**
 * Admin Only Guard (allows 'admin' and 'superadmin')
 */
export const adminOnly = requireRoles('admin', 'superadmin');

/**
 * Superadmin Only Guard
 */
export const superAdminOnly = requireRoles('superadmin');

/**
 * Diagnostic helper to inspect authentication status
 * @param {import('express').Request} req
 * @returns {object}
 */
export const debugAuthStatus = (req) => {
  const token = extractToken(req);
  let decoded = null;
  let tokenValid = false;
  let tokenError = null;

  if (token) {
    try {
      decoded = jwt.decode(token);
      jwt.verify(token, ACCESS_SECRET);
      tokenValid = true;
    } catch (e) {
      tokenError = e.message;
    }
  }

  return {
    isAuthenticated: Boolean(req.user),
    user: req.user || null,
    hasToken: Boolean(token),
    tokenValid,
    tokenError,
    decodedClaims: decoded,
    authHeadersPresent: Boolean(req.headers.authorization),
    cookiesPresent: Object.keys(req.cookies || {}),
  };
};

export default {
  verifyToken,
  authenticate: verifyToken,
  optionalAuth,
  requireRoles,
  adminOnly,
  superAdminOnly,
  extractToken,
  logAuthDebug,
  debugAuthStatus,
};
