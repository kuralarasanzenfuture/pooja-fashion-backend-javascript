import { describe, it, expect } from '@jest/globals';
import jwt from 'jsonwebtoken';
import {
  getClientIp,
  parseClientInfo,
  hashToken,
  generateRefreshToken,
  generateAccessToken,
  getRefreshTokenExpiry,
  getCookieOptions,
} from '../../src/modules/auth/auth.utils.js';

describe('Auth Utils Unit Tests', () => {
  describe('getClientIp', () => {
    it('should extract first IP from x-forwarded-for', () => {
      const req = {
        headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18' },
      };
      expect(getClientIp(req)).toBe('203.0.113.195');
    });

    it('should strip IPv6 mapping ::ffff:', () => {
      const req = {
        headers: {},
        ip: '::ffff:192.168.1.1',
      };
      expect(getClientIp(req)).toBe('192.168.1.1');
    });

    it('should return fallback 127.0.0.1 if request is null or empty', () => {
      expect(getClientIp(null)).toBeNull();
      expect(getClientIp({ headers: {} })).toBe('127.0.0.1');
    });
  });

  describe('parseClientInfo', () => {
    it('should detect Windows and Chrome on Desktop', () => {
      const req = {
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      };
      const info = parseClientInfo(req);
      expect(info.operatingSystem).toBe('Windows');
      expect(info.osVersion).toBe('10/11');
      expect(info.browser).toBe('Chrome');
      expect(info.deviceType).toBe('Desktop');
    });

    it('should detect iPhone and Safari on Mobile', () => {
      const req = {
        headers: {
          'user-agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        },
      };
      const info = parseClientInfo(req);
      expect(info.operatingSystem).toBe('iOS');
      expect(info.browser).toBe('Safari');
      expect(info.deviceType).toBe('Mobile');
    });

    it('should detect Postman bot/tool', () => {
      const req = {
        headers: {
          'user-agent': 'PostmanRuntime/7.36.0',
        },
      };
      const info = parseClientInfo(req);
      expect(info.browser).toBe('Postman');
      expect(info.deviceType).toBe('Bot/Tool');
    });
  });

  describe('hashToken', () => {
    it('should produce consistent 64-character SHA-256 hex digest', () => {
      const token = 'sample-refresh-token-value-12345';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
      expect(hash1).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should throw error if empty or non-string token is provided', () => {
      expect(() => hashToken(null)).toThrow();
      expect(() => hashToken('')).toThrow();
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate cryptographically random 80-character hex string', () => {
      const token1 = generateRefreshToken();
      const token2 = generateRefreshToken();

      expect(token1).toHaveLength(80);
      expect(token2).toHaveLength(80);
      expect(token1).not.toBe(token2);
    });
  });

  describe('generateAccessToken', () => {
    it('should produce a valid signed JWT with custom claims', () => {
      const payload = {
        id: 42,
        role: 'admin',
        role_code: 'ADMIN',
        session_id: 'sample-uuid',
      };
      const token = generateAccessToken(payload);
      expect(typeof token).toBe('string');

      const decoded = jwt.decode(token);
      expect(decoded.id).toBe(42);
      expect(decoded.role_code).toBe('ADMIN');
      expect(decoded.session_id).toBe('sample-uuid');
    });
  });

  describe('getRefreshTokenExpiry', () => {
    it('should calculate future date by requested number of days', () => {
      const expiry = getRefreshTokenExpiry(30);
      const diffMs = expiry.getTime() - Date.now();
      const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
      expect(diffDays).toBe(30);
    });
  });

  describe('getCookieOptions', () => {
    it('should configure httpOnly and standard path', () => {
      const accessOpts = getCookieOptions(false);
      expect(accessOpts.httpOnly).toBe(true);
      expect(accessOpts.path).toBe('/');
      expect(accessOpts.maxAge).toBe(15 * 60 * 1000);

      const refreshOpts = getCookieOptions(true);
      expect(refreshOpts.httpOnly).toBe(true);
      expect(refreshOpts.maxAge).toBe(30 * 24 * 60 * 60 * 1000);
    });
  });
});
