/**
 * Centralized Live API Debugging Dashboard Tests
 * Unit and Integration Verification
 */
import { jest } from '@jest/globals';
import express from 'express';
import env from '../../src/config/env.js';
import corsOptions from '../../src/config/cors.js';
import {
  isSensitiveKey,
  sanitizeValue,
  sanitizePayload,
  sanitizeHeaders,
  REDACTED_LABEL,
} from '../../src/modules/1consoleLog/utils/sanitizeLogData.js';
import { formatLogEntry, getStatusText } from '../../src/modules/1consoleLog/utils/logFormatter.js';
import { ApiLogStore } from '../../src/modules/1consoleLog/services/apiLogStore.js';
import { ApiLogStream } from '../../src/modules/1consoleLog/services/apiLogStream.js';
import { ConsoleLogService } from '../../src/modules/1consoleLog/consoleLog.service.js';
import { consoleLogController } from '../../src/modules/1consoleLog/consoleLog.controller.js';
import consoleLogRoutes from '../../src/modules/1consoleLog/consoleLog.routes.js';
import { consoleLogMiddleware, ensureDevelopmentOnly } from '../../src/modules/1consoleLog/consoleLog.middleware.js';

describe('Centralized Live API Debugging Dashboard Tests', () => {

  // ==========================================
  // 1. SANITIZATION & SECURITY TESTS
  // ==========================================
  describe('Sanitization & Security Engine', () => {
    it('accurately identifies sensitive key names', () => {
      expect(isSensitiveKey('password')).toBe(true);
      expect(isSensitiveKey('confirmPassword')).toBe(true);
      expect(isSensitiveKey('access_token')).toBe(true);
      expect(isSensitiveKey('refresh_token')).toBe(true);
      expect(isSensitiveKey('authorization')).toBe(true);
      expect(isSensitiveKey('secret')).toBe(true);
      expect(isSensitiveKey('apiKey')).toBe(true);
      expect(isSensitiveKey('otp')).toBe(true);
      expect(isSensitiveKey('cookie')).toBe(true);

      // Safe keys must not be redacted
      expect(isSensitiveKey('name')).toBe(false);
      expect(isSensitiveKey('category_name')).toBe(false);
      expect(isSensitiveKey('description')).toBe(false);
      expect(isSensitiveKey('status')).toBe(false);
      expect(isSensitiveKey('id')).toBe(false);
    });

    it('redacts sensitive fields in nested payloads and arrays', () => {
      const payload = {
        name: 'Saree Collection',
        credentials: {
          password: 'superSecret123',
          apiKey: 'key_live_abc',
        },
        tokens: ['public', { token: 'jwt.token.val' }],
        authorizations: 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      };

      const sanitized = sanitizePayload(payload);
      expect(sanitized.name).toBe('Saree Collection');
      expect(sanitized.credentials.password).toBe(REDACTED_LABEL);
      expect(sanitized.credentials.apiKey).toBe(REDACTED_LABEL);
      expect(sanitized.tokens[1].token).toBe(REDACTED_LABEL);
      expect(sanitized.authorizations).toBe(REDACTED_LABEL);
    });

    it('handles circular references safely without crashing', () => {
      const circular = { name: 'Circular Test' };
      circular.self = circular;

      const sanitized = sanitizePayload(circular);
      expect(sanitized.name).toBe('Circular Test');
      expect(sanitized.self).toBe('[Circular Reference]');
    });

    it('sanitizes headers, stripping authorization tokens and cookies', () => {
      const headers = {
        host: 'localhost:5000',
        authorization: 'Bearer secret_token_xyz',
        cookie: 'sessionId=abc123456',
        'user-agent': 'Mozilla/5.0 TestBrowser',
        'content-type': 'application/json',
        'x-custom-trace': 'trace-99',
      };

      const sanitized = sanitizeHeaders(headers);
      expect(sanitized.authorization).toBe(REDACTED_LABEL);
      expect(sanitized.cookie).toBe(REDACTED_LABEL);
      expect(sanitized.host).toBe('localhost:5000');
      expect(sanitized['user-agent']).toBe('Mozilla/5.0 TestBrowser');
      expect(sanitized['content-type']).toBe('application/json');
      expect(sanitized['x-custom-trace']).toBe('trace-99');
    });

    it('replaces Buffer and binary data with metadata', () => {
      const buffer = Buffer.from('binary-file-content');
      const sanitized = sanitizeValue(buffer);
      expect(sanitized).toContain('[Binary Buffer: 19 bytes]');
    });
  });

  // ==========================================
  // 2. LOG FORMATTER TESTS
  // ==========================================
  describe('Log Formatter', () => {
    it('normalizes complete API transaction into standard dashboard record', () => {
      const req = {
        method: 'POST',
        originalUrl: '/api/categories',
        id: 'test-req-123',
        params: {},
        query: { draft: 'true' },
        body: { name: 'Silk Sarees', password: 'shouldBeRedacted' },
        headers: { host: 'localhost:5000' },
      };
      const res = { statusCode: 201 };

      const entry = formatLogEntry({
        req,
        res,
        responseBody: { success: true, data: { id: 10, name: 'Silk Sarees' } },
        duration: 35,
        apiContext: {
          module: 'CATEGORY',
          category: 'CATEGORY MANAGEMENT',
          subcategory: 'CREATE CATEGORY',
          controller: 'createCategory',
          service: 'CategoryService',
        },
      });

      expect(entry.id).toBeDefined();
      expect(entry.requestId).toBe('test-req-123');
      expect(entry.method).toBe('POST');
      expect(entry.endpoint).toBe('/api/categories');
      expect(entry.module).toBe('CATEGORY');
      expect(entry.category).toBe('CATEGORY MANAGEMENT');
      expect(entry.subcategory).toBe('CREATE CATEGORY');
      expect(entry.controller).toBe('createCategory');
      expect(entry.service).toBe('CategoryService');
      expect(entry.status).toBe(201);
      expect(entry.statusText).toBe('Created');
      expect(entry.success).toBe(true);
      expect(entry.duration).toBe(35);
      expect(entry.requestBody.name).toBe('Silk Sarees');
      expect(entry.requestBody.password).toBe(REDACTED_LABEL);
      expect(entry.responseBody.success).toBe(true);
    });

    it('correctly maps error details when request fails', () => {
      const req = {
        method: 'DELETE',
        originalUrl: '/api/categories/999',
        params: { id: '999' },
      };
      const res = { statusCode: 404 };

      const entry = formatLogEntry({
        req,
        res,
        responseBody: { success: false, message: 'Category not found' },
        duration: 12,
        error: new Error('Category not found'),
        apiContext: {
          module: 'CATEGORY',
          subcategory: 'DELETE CATEGORY',
        },
      });

      expect(entry.status).toBe(404);
      expect(entry.success).toBe(false);
      expect(entry.error).toBeDefined();
      expect(entry.error.errorMessage).toBe('Category not found');
      expect(entry.error.status).toBe(404);
    });
  });

  // ==========================================
  // 3. IN-MEMORY LOG STORE TESTS
  // ==========================================
  describe('In-Memory Log Store (apiLogStore)', () => {
    let store;

    beforeEach(() => {
      store = new ApiLogStore(10); // capacity 10 for testing
    });

    it('adds logs and maintains bounded size without exceeding maximum capacity', () => {
      for (let i = 1; i <= 15; i++) {
        store.addLog({
          id: `log-${i}`,
          method: 'GET',
          endpoint: `/api/items/${i}`,
          duration: 10 + i,
          status: 200,
          success: true,
          module: 'ITEM',
        });
      }

      expect(store.getCount()).toBe(10);
      // Newest should be at front
      const logs = store.getLogs();
      expect(logs[0].id).toBe('log-15');
      expect(logs[logs.length - 1].id).toBe('log-6');
    });

    it('filters logs by method, status, module, and search query', () => {
      store.addLog({ id: '1', method: 'GET', endpoint: '/api/categories', module: 'CATEGORY', status: 200, success: true });
      store.addLog({ id: '2', method: 'POST', endpoint: '/api/categories', module: 'CATEGORY', status: 201, success: true });
      store.addLog({ id: '3', method: 'PUT', endpoint: '/api/categories/1', module: 'CATEGORY', status: 200, success: true });
      store.addLog({ id: '4', method: 'PATCH', endpoint: '/api/subcategories/2', module: 'SUBCATEGORY', status: 200, success: true });
      store.addLog({ id: '5', method: 'DELETE', endpoint: '/api/categories/1', module: 'CATEGORY', status: 404, success: false });

      // Method filter
      expect(store.getLogs({ method: 'POST' })).toHaveLength(1);
      expect(store.getLogs({ method: 'DELETE' })).toHaveLength(1);

      // Status filter
      expect(store.getLogs({ status: '4xx' })).toHaveLength(1);
      expect(store.getLogs({ status: '2xx' })).toHaveLength(4);

      // Module filter
      expect(store.getLogs({ module: 'SUBCATEGORY' })).toHaveLength(1);
      expect(store.getLogs({ module: 'CATEGORY' })).toHaveLength(4);

      // Search query filter
      expect(store.getLogs({ search: 'subcategories' })).toHaveLength(1);
      expect(store.getLogs({ search: 'categories' })).toHaveLength(5);
    });

    it('calculates accurate statistics', () => {
      store.addLog({ id: '1', method: 'GET', status: 200, success: true, duration: 10, module: 'CATEGORY' });
      store.addLog({ id: '2', method: 'POST', status: 201, success: true, duration: 30, module: 'CATEGORY' });
      store.addLog({ id: '3', method: 'DELETE', status: 500, success: false, duration: 20, module: 'USER' });

      const stats = store.getStats();
      expect(stats.total).toBe(3);
      expect(stats.successful).toBe(2);
      expect(stats.failed).toBe(1);
      expect(stats.avgDuration).toBe(20.0);
      expect(stats.methods.GET).toBe(1);
      expect(stats.methods.POST).toBe(1);
      expect(stats.methods.DELETE).toBe(1);
      expect(stats.modules).toEqual(['CATEGORY', 'USER']);
    });

    it('clears all stored logs on clearLogs()', () => {
      store.addLog({ id: '1', method: 'GET' });
      store.addLog({ id: '2', method: 'POST' });
      expect(store.getCount()).toBe(2);

      store.clearLogs();
      expect(store.getCount()).toBe(0);
      expect(store.getLogs()).toHaveLength(0);
    });
  });

  // ==========================================
  // 4. SSE STREAM TESTS (apiLogStream)
  // ==========================================
  describe('SSE Stream Manager (apiLogStream)', () => {
    it('manages clients and broadcasts log events safely', () => {
      const stream = new ApiLogStream();

      const writtenData = [];
      const mockRes = {
        writeHead: jest.fn(),
        flushHeaders: jest.fn(),
        write: jest.fn((data) => writtenData.push(data)),
        end: jest.fn(),
        on: jest.fn(),
        removeListener: jest.fn(),
      };
      const mockReq = {
        on: jest.fn(),
        removeListener: jest.fn(),
      };

      stream.addClient(mockReq, mockRes);
      expect(mockRes.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({
        'Content-Type': 'text/event-stream',
      }));
      expect(stream.getClientCount()).toBe(1);

      // Broadcast log
      const testLog = { id: 'log-101', method: 'POST', endpoint: '/api/categories' };
      stream.broadcastLog(testLog);

      expect(writtenData.some((chunk) => chunk.includes('event: log'))).toBe(true);
      expect(writtenData.some((chunk) => chunk.includes('/api/categories'))).toBe(true);

      // Broadcast clear
      stream.broadcastClear();
      expect(writtenData.some((chunk) => chunk.includes('event: clear'))).toBe(true);

      // Remove client
      stream.removeClient(mockRes);
      expect(stream.getClientCount()).toBe(0);
    });
  });

  // ==========================================
  // 5. CONSOLE LOG SERVICE & CONTROLLER TESTS
  // ==========================================
  describe('ConsoleLogService & Controller HTTP Handlers', () => {
    let service;
    let store;
    let stream;

    beforeEach(() => {
      store = new ApiLogStore(50);
      stream = new ApiLogStream();
      service = new ConsoleLogService(store, stream);
    });

    it('records and returns formatted log across GET, POST, PUT, PATCH, DELETE', () => {
      const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

      for (const m of methods) {
        const req = {
          method: m,
          originalUrl: `/api/categories`,
          id: `req-${m}`,
          params: {},
          query: {},
          body: m === 'POST' || m === 'PUT' || m === 'PATCH' ? { name: `Name ${m}` } : null,
        };
        const res = { statusCode: m === 'POST' ? 201 : 200 };

        const entry = service.recordLog({
          req,
          res,
          responseBody: { success: true },
          duration: 25,
          apiContext: { module: 'CATEGORY', subcategory: `${m} CATEGORY` },
        });

        expect(entry.method).toBe(m);
        expect(entry.subcategory).toBe(`${m} CATEGORY`);
      }

      expect(service.getLogs().count).toBe(5);
    });

    it('getLogData controller endpoint returns JSON data and stats', () => {
      const mockReq = { query: { method: 'ALL' } };
      const mockJson = jest.fn();
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: mockJson,
      };

      consoleLogController.getLogData(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        stats: expect.any(Object),
        data: expect.any(Array),
      }));
    });

    it('clearLogs controller endpoint resets store and returns success', () => {
      const mockReq = {};
      const mockJson = jest.fn();
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: mockJson,
      };

      consoleLogController.clearLogs(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: expect.stringContaining('cleared'),
      }));
    });
  });

  // ==========================================
  // 6. PRODUCTION ENVIRONMENT PROTECTION TESTS
  // ==========================================
  describe('Production Mode Protection', () => {
    it('blocks dashboard access in production mode (ensureDevelopmentOnly returns 404)', () => {
      const originalEnv = env.NODE_ENV;
      const originalIsProd = env.IS_PRODUCTION;

      env.NODE_ENV = 'production';
      env.IS_PRODUCTION = true;

      const mockReq = { method: 'GET', originalUrl: '/__dev/api-logs' };
      const mockSend = jest.fn();
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: mockSend,
        json: jest.fn(),
      };
      const next = jest.fn();

      try {
        ensureDevelopmentOnly(mockReq, mockRes, next);
        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(next).not.toHaveBeenCalled();

        // Check controller endpoints also guard against production
        consoleLogController.serveDashboard(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(404);

        consoleLogController.getLogData(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(404);

        consoleLogController.streamLogs(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(404);

        consoleLogController.clearLogs(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(404);
      } finally {
        env.NODE_ENV = originalEnv;
        env.IS_PRODUCTION = originalIsProd;
      }
    });

    it('consoleLogMiddleware bypasses immediately in production mode', () => {
      const originalEnv = env.NODE_ENV;
      const originalIsProd = env.IS_PRODUCTION;

      env.NODE_ENV = 'production';
      env.IS_PRODUCTION = true;

      const mockReq = { method: 'POST', originalUrl: '/api/categories', body: { name: 'Test' } };
      const mockRes = {};
      const next = jest.fn();

      try {
        consoleLogMiddleware(mockReq, mockRes, next);
        expect(next).toHaveBeenCalledTimes(1);
      } finally {
        env.NODE_ENV = originalEnv;
        env.IS_PRODUCTION = originalIsProd;
      }
    });

    it('consoleLogMiddleware ignores internal dashboard routes to prevent recursive loops', () => {
      const mockReq = { method: 'GET', originalUrl: '/__dev/api-logs/data' };
      const mockRes = {};
      const next = jest.fn();

      consoleLogMiddleware(mockReq, mockRes, next);
      expect(next).toHaveBeenCalledTimes(1);
      // No listeners or wrapping should have occurred
      expect(mockRes.send).toBeUndefined();
    });
  });

  // ==========================================
  // 7. CORS POLICY & LOCAL DEV COMPATIBILITY
  // ==========================================
  describe('CORS Policy & Dashboard Origin Compatibility', () => {
    it('allows requests from backend port (e.g. http://localhost:5000) so dashboard clear logs works', (done) => {
      corsOptions.origin('http://localhost:5000', (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(true);
        done();
      });
    });

    it('allows requests from loopback 127.0.0.1 (e.g. http://127.0.0.1:5000)', (done) => {
      corsOptions.origin('http://127.0.0.1:5000', (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(true);
        done();
      });
    });

    it('allows requests from frontend dev origin (http://localhost:5173)', (done) => {
      corsOptions.origin('http://localhost:5173', (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(true);
        done();
      });
    });

    it('allows same-origin / non-browser requests without origin header', (done) => {
      corsOptions.origin(undefined, (err, allow) => {
        expect(err).toBeNull();
        expect(allow).toBe(true);
        done();
      });
    });
  });
});
