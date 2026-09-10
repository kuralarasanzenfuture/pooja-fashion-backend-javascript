import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import {
  extractToken,
  verifyToken,
  optionalAuth,
  requireRoles,
  adminOnly,
  superAdminOnly,
  debugAuthStatus,
} from '../../src/middlewares/auth.middleware.js';
import env from '../../src/config/env.js';

const SECRET = env.JWT_ACCESS_SECRET || 'local-dev-access-secret';

describe('Auth Middleware & RBAC System', () => {
  describe('extractToken', () => {
    it('should extract token from Bearer Authorization header', () => {
      const req = {
        headers: { authorization: 'Bearer my-sample-jwt-token' },
      };
      expect(extractToken(req)).toBe('my-sample-jwt-token');
    });

    it('should handle lowercase bearer header', () => {
      const req = {
        headers: { authorization: 'bearer my-sample-jwt-token' },
      };
      expect(extractToken(req)).toBe('my-sample-jwt-token');
    });

    it('should extract token from access_token cookie fallback', () => {
      const req = {
        headers: {},
        cookies: { access_token: 'cookie-jwt-token' },
      };
      expect(extractToken(req)).toBe('cookie-jwt-token');
    });

    it('should return null when no token is present', () => {
      const req = { headers: {}, cookies: {} };
      expect(extractToken(req)).toBeNull();
    });
  });

  describe('verifyToken', () => {
    it('should return 401 UnauthorizedError when no token is provided', async () => {
      const req = { headers: {}, cookies: {} };
      const res = {};
      const next = jest.fn();

      await verifyToken(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Authentication token required',
        })
      );
    });

    it('should return 401 when token signature is invalid', async () => {
      const req = {
        headers: { authorization: 'Bearer invalid.jwt.token' },
      };
      const res = {};
      const next = jest.fn();

      await verifyToken(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Invalid authentication token',
        })
      );
    });

    it('should return 401 when token has expired', async () => {
      const expiredToken = jwt.sign({ id: 1 }, SECRET, { expiresIn: -10 });
      const req = {
        headers: { authorization: `Bearer ${expiredToken}` },
      };
      const res = {};
      const next = jest.fn();

      await verifyToken(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Authentication token has expired',
        })
      );
    });

    it('should successfully decode valid token and attach req.user', async () => {
      const validToken = jwt.sign({ id: 42, role: 'admin', session_id: 'sess-123' }, SECRET, {
        expiresIn: '1h',
      });
      const req = {
        headers: { authorization: `Bearer ${validToken}` },
      };
      const res = {};
      const next = jest.fn();

      await verifyToken(req, res, next);
      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(42);
      expect(req.user.role).toBe('admin');
      expect(req.user.sessionId).toBe('sess-123');
    });
  });

  describe('optionalAuth', () => {
    it('should set req.user to null and proceed when no token provided', async () => {
      const req = { headers: {}, cookies: {} };
      const res = {};
      const next = jest.fn();

      await optionalAuth(req, res, next);
      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalledWith();
    });

    it('should attach user when valid token provided', async () => {
      const token = jwt.sign({ id: 99, role: 'manager' }, SECRET, { expiresIn: '1h' });
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = {};
      const next = jest.fn();

      await optionalAuth(req, res, next);
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(99);
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('Role Authorization (requireRoles, adminOnly, superAdminOnly)', () => {
    it('should block unauthenticated requests with 401', () => {
      const req = {};
      const res = {};
      const next = jest.fn();

      adminOnly(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    });

    it('adminOnly should allow admin user', () => {
      const req = { user: { role: 'admin', roleCode: 'ADMIN' } };
      const res = {};
      const next = jest.fn();

      adminOnly(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('adminOnly should allow superadmin user', () => {
      const req = { user: { role: 'superadmin', roleCode: 'SUPERADMIN' } };
      const res = {};
      const next = jest.fn();

      adminOnly(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('adminOnly should deny regular user with 403 Forbidden', () => {
      const req = { user: { role: 'cashier', roleCode: 'CASHIER' } };
      const res = {};
      const next = jest.fn();

      adminOnly(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });

    it('superAdminOnly should deny admin user', () => {
      const req = { user: { role: 'admin', roleCode: 'ADMIN' } };
      const res = {};
      const next = jest.fn();

      superAdminOnly(req, res, next);
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
    });

    it('requireRoles should match custom role codes', () => {
      const guard = requireRoles('STORE_MANAGER', 'INVENTORY_MANAGER');
      const req = { user: { role: 'store_manager', roleCode: 'STORE_MANAGER' } };
      const res = {};
      const next = jest.fn();

      guard(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('debugAuthStatus', () => {
    it('should return diagnostic information', () => {
      const token = jwt.sign({ id: 10 }, SECRET, { expiresIn: '1h' });
      const req = {
        headers: { authorization: `Bearer ${token}` },
        user: { id: 10, role: 'admin' },
      };

      const diagnostics = debugAuthStatus(req);
      expect(diagnostics.isAuthenticated).toBe(true);
      expect(diagnostics.tokenValid).toBe(true);
      expect(diagnostics.decodedClaims.id).toBe(10);
      expect(diagnostics.authHeadersPresent).toBe(true);
    });
  });
});
