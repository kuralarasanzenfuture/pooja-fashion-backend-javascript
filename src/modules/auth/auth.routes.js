import { Router } from 'express';
import {
  login,
  refreshToken,
  getMe,
  logout,
  logoutAll,
  getSessions,
  revokeSession,
  getLoginHistory,
  changePassword,
} from './auth.controller.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import {
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  sessionIdParamSchema,
  loginHistoryQuerySchema,
} from './auth.validation.js';

const router = Router();

// POST /api/auth/login - Authenticate user credentials & start session
router.post('/login', validate(loginSchema, 'body'), login);

// POST /api/auth/refresh-token - Refresh token rotation & access token issuance
router.post('/refresh-token', validate(refreshTokenSchema, 'body'), refreshToken);

// GET /api/auth/me - Get current authenticated user profile & session info
router.get('/me', verifyToken, getMe);

// POST /api/auth/logout - Terminate current session
router.post('/logout', verifyToken, logout);

// POST /api/auth/logout-all - Terminate all active sessions across all devices
router.post('/logout-all', verifyToken, logoutAll);

// GET /api/auth/sessions - Real-time active sessions management
router.get('/sessions', verifyToken, getSessions);

// DELETE /api/auth/sessions/:id - Remotely terminate a specific session
router.delete(
  '/sessions/:id',
  verifyToken,
  validate(sessionIdParamSchema, 'params'),
  revokeSession
);

// GET /api/auth/login-history - View audit history of login attempts
router.get(
  '/login-history',
  verifyToken,
  validate(loginHistoryQuerySchema, 'query'),
  getLoginHistory
);

// POST /api/auth/change-password - Change password with password history verification
router.post(
  '/change-password',
  verifyToken,
  validate(changePasswordSchema, 'body'),
  changePassword
);

export default router;
