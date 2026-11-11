/**
 * Centralized API Debugging & Logging System
 * Unit & Integration Tests
 */
import { jest } from '@jest/globals';
import {
  isSensitiveKey,
  sanitizePayload,
  sanitizeValue,
  safeFormatJson,
  REDACTED_LABEL,
} from '../../src/shared/utils/logger/sensitiveDataFilter.js';
import {
  formatPostRequest,
  formatGetRequest,
  formatPutRequest,
  formatPatchRequest,
  formatDeleteRequest,
  formatErrorRequest,
  formatTimestamp,
  getMethodColor,
  COLORS,
} from '../../src/shared/utils/logger/logFormatter.js';
import { detectApiContext } from '../../src/shared/utils/logger/apiDetector.js';
import env from '../../src/config/env.js';
import {
  apiLogger,
  identifyErrorType,
  isDevLoggingEnabled,
  isMethodLoggingEnabled,
} from '../../src/shared/utils/logger/apiLogger.js';
import { logger } from '../../src/shared/utils/logger/logger.js';
import {
  apiLoggerMiddleware,
  setApiContext,
} from '../../src/middlewares/apiLogger.middleware.js';
import { errorHandler } from '../../src/middlewares/error.middleware.js';

describe('Centralized API Debugging & Logging System Tests', () => {
  // ==========================================
  // 1. SENSITIVE DATA FILTER TESTS
  // ==========================================
  describe('Sensitive Data Filter (Security & Redaction)', () => {
    it('should identify sensitive keys accurately', () => {
      expect(isSensitiveKey('password')).toBe(true);
      expect(isSensitiveKey('confirmPassword')).toBe(true);
      expect(isSensitiveKey('confirm_password')).toBe(true);
      expect(isSensitiveKey('accessToken')).toBe(true);
      expect(isSensitiveKey('refresh_token')).toBe(true);
      expect(isSensitiveKey('token')).toBe(true);
      expect(isSensitiveKey('jwt')).toBe(true);
      expect(isSensitiveKey('authorization')).toBe(true);
      expect(isSensitiveKey('apiKey')).toBe(true);
      expect(isSensitiveKey('api_key')).toBe(true);
      expect(isSensitiveKey('secret')).toBe(true);
      expect(isSensitiveKey('client_secret')).toBe(true);
      expect(isSensitiveKey('otp')).toBe(true);
      expect(isSensitiveKey('pin')).toBe(true);
      expect(isSensitiveKey('cvv')).toBe(true);
      expect(isSensitiveKey('card_number')).toBe(true);
      expect(isSensitiveKey('credit_card')).toBe(true);
      expect(isSensitiveKey('cookie')).toBe(true);

      // Safe keys must NOT be masked
      expect(isSensitiveKey('name')).toBe(false);
      expect(isSensitiveKey('category_name')).toBe(false);
      expect(isSensitiveKey('email')).toBe(false);
      expect(isSensitiveKey('display_order')).toBe(false);
      expect(isSensitiveKey('id')).toBe(false);
    });

    it('should redact sensitive keys in nested objects and arrays', () => {
      const payload = {
        name: 'Electronics',
        credentials: {
          password: 'superSecretPassword123!',
          apiKey: 'key_live_99887766',
        },
        tokens: ['public-token-1', { refreshToken: 'rt_abc_123' }],
        user: {
          profile: {
            pin: 1234,
            email: 'admin@poojafashion.com',
          },
        },
      };

      const sanitized = sanitizePayload(payload);
      expect(sanitized.name).toBe('Electronics');
      expect(sanitized.credentials.password).toBe(REDACTED_LABEL);
      expect(sanitized.credentials.apiKey).toBe(REDACTED_LABEL);
      expect(sanitized.tokens[1].refreshToken).toBe(REDACTED_LABEL);
      expect(sanitized.user.profile.pin).toBe(REDACTED_LABEL);
      expect(sanitized.user.profile.email).toBe('admin@poojafashion.com');
    });

    it('should safely handle circular references without crashing', () => {
      const circularObj = { name: 'Parent Category' };
      circularObj.self = circularObj;

      const sanitized = sanitizePayload(circularObj);
      expect(sanitized.name).toBe('Parent Category');
      expect(sanitized.self).toBe('[Circular]');
    });

    it('should detect Buffer and binary data', () => {
      const buffer = Buffer.from('binary-image-data-test');
      const sanitized = sanitizePayload({ imageBuffer: buffer });
      expect(sanitized.imageBuffer).toContain('[Binary Data:');
    });

    it('should sanitize Multer file objects into safe metadata', () => {
      const multerFile = {
        fieldname: 'image',
        originalname: 'silk-saree.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 1048576,
        destination: '/uploads',
        filename: 'silk-saree-12345.png',
        path: '/uploads/silk-saree-12345.png',
        buffer: Buffer.from('sample'),
      };

      const sanitized = sanitizePayload({ file: multerFile });
      expect(sanitized.file).toEqual({
        fieldname: 'image',
        originalname: 'silk-saree.png',
        mimetype: 'image/png',
        size: 1048576,
        destination: '/uploads',
        path: '/uploads/silk-saree-12345.png',
      });
    });

    it('should truncate excessively long strings to prevent terminal buffer overflows', () => {
      const longStr = 'A'.repeat(2000);
      const sanitized = sanitizePayload({ content: longStr });
      expect(sanitized.content).toContain('[truncated');
      expect(sanitized.content.length).toBeLessThan(2000);
    });

    it('should redact bearer token strings', () => {
      const sanitized = sanitizePayload({
        authHeader: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDcSemACt8x4iTMCda8Yhe3iZaWbvV5XKSTbuAn0M',
      });
      expect(sanitized.authHeader).toBe('Bearer [REDACTED]');
    });
  });

  // ==========================================
  // 2. API DETECTOR TESTS
  // ==========================================
  describe('API Detector (Automatic Module & Category Recognition)', () => {
    it('should detect Category module from route path and method', () => {
      const req = {
        method: 'POST',
        originalUrl: '/api/categories',
        params: {},
      };
      const context = detectApiContext(req);
      expect(context.module).toBe('CATEGORY');
      expect(context.category).toBe('CATEGORY MANAGEMENT');
      expect(context.subcategory).toBe('CREATE CATEGORY');
      expect(context.database).toBe('INSERT category');
    });

    it('should detect Subcategory module from nested product-master path', () => {
      const req = {
        method: 'GET',
        originalUrl: '/api/product-master/subcategories/stats',
        params: {},
      };
      const context = detectApiContext(req);
      expect(context.module).toBe('SUBCATEGORY');
      expect(context.category).toBe('SUBCATEGORY MANAGEMENT');
      expect(context.subcategory).toBe('GET SUBCATEGORY STATS');
    });

    it('should prioritize explicit route metadata when setApiContext is used', () => {
      const req = {
        method: 'PATCH',
        originalUrl: '/api/categories/10/status',
        params: { id: '10' },
        apiContext: {
          module: 'CATEGORY',
          category: 'CATEGORY MANAGEMENT',
          subcategory: 'CUSTOM STATUS UPDATE',
          controller: 'categoryController.updateStatus',
          service: 'CategoryService',
        },
      };
      const context = detectApiContext(req);
      expect(context.module).toBe('CATEGORY');
      expect(context.subcategory).toBe('CUSTOM STATUS UPDATE');
      expect(context.controller).toBe('categoryController.updateStatus');
    });

    it('should automatically handle other project modules (Auth, User, Product, Company)', () => {
      expect(detectApiContext({ method: 'POST', originalUrl: '/api/auth/login' }).module).toBe('AUTH');
      expect(detectApiContext({ method: 'GET', originalUrl: '/api/users' }).module).toBe('USER');
      expect(detectApiContext({ method: 'POST', originalUrl: '/api/products' }).module).toBe('PRODUCT');
      expect(detectApiContext({ method: 'GET', originalUrl: '/api/companies' }).module).toBe('COMPANY');
    });
  });

  // ==========================================
  // 3. LOG FORMATTER TESTS
  // ==========================================
  describe('Log Formatter (POST, GET, PUT, PATCH, DELETE, ERROR)', () => {
    it('should format POST request debug block with expected sections', () => {
      const output = formatPostRequest({
        module: 'CATEGORY',
        category: 'CATEGORY MANAGEMENT',
        subcategory: 'CREATE CATEGORY',
        method: 'POST',
        endpoint: '/api/categories',
        time: '2026-11-11 12:30:00',
        requestId: 'test-req-001',
        frontendData: { name: 'Electronics', description: 'Gadgets' },
        backendData: { name: 'Electronics', description: 'Gadgets' },
        controller: 'createCategory',
        service: 'CategoryService',
        database: 'INSERT category',
        status: 201,
        success: true,
        responseData: { success: true, data: { id: 10, name: 'Electronics' } },
        duration: 35,
      });

      expect(output).toContain('[API DEBUG] POST REQUEST');
      expect(output).toContain('MODULE       : CATEGORY');
      expect(output).toContain('CATEGORY     : CATEGORY MANAGEMENT');
      expect(output).toContain('SUBCATEGORY  : CREATE CATEGORY');
      expect(output).toContain('[FRONTEND REQUEST DATA]');
      expect(output).toContain('"name": "Electronics"');
      expect(output).toContain('[BACKEND REQUEST]');
      expect(output).toContain('[BACKEND PROCESSING]');
      expect(output).toContain('Controller    : createCategory');
      expect(output).toContain('Database      : INSERT category');
      expect(output).toContain('[API RESPONSE]');
      expect(output).toContain('Status        : 201');
      expect(output).toContain('Execution Time: 35ms');
      expect(output).toContain('[API DEBUG] POST COMPLETED');
    });

    it('should format GET request debug block with params, query, and response', () => {
      const output = formatGetRequest({
        module: 'CATEGORY',
        category: 'CATEGORY MANAGEMENT',
        subcategory: 'GET ALL CATEGORIES',
        method: 'GET',
        endpoint: '/api/categories',
        time: '2026-11-11 12:30:00',
        requestId: 'test-req-002',
        params: {},
        query: { page: '1', limit: '10', search: 'Silk' },
        controller: 'getCategories',
        service: 'CategoryService',
        operation: 'Fetch categories',
        status: 200,
        success: true,
        responseData: { success: true, data: [{ id: 1, name: 'Silk Sarees' }] },
        duration: 45,
      });

      expect(output).toContain('[API DEBUG] GET REQUEST');
      expect(output).toContain('[REQUEST PARAMETERS]');
      expect(output).toContain('"search": "Silk"');
      expect(output).toContain('Controller : getCategories');
      expect(output).toContain('Operation  : Fetch categories');
      expect(output).toContain('Execution Time: 45ms');
      expect(output).toContain('[API DEBUG] GET COMPLETED');
    });

    it('should format PUT request debug block with target record ID and data', () => {
      const output = formatPutRequest({
        module: 'CATEGORY',
        category: 'CATEGORY MANAGEMENT',
        subcategory: 'UPDATE CATEGORY',
        method: 'PUT',
        endpoint: '/api/categories/10',
        time: '2026-11-11 12:30:00',
        requestId: 'test-req-003',
        params: { id: '10' },
        frontendData: { name: 'Updated Electronics' },
        controller: 'updateCategory',
        service: 'CategoryService',
        operation: 'UPDATE category ID 10',
        status: 200,
        success: true,
        responseData: { success: true, message: 'Category updated successfully' },
        duration: 28,
      });

      expect(output).toContain('[API DEBUG] PUT REQUEST');
      expect(output).toContain('[REQUEST PARAMS]');
      expect(output).toContain('"id": "10"');
      expect(output).toContain('[FRONTEND REQUEST DATA]');
      expect(output).toContain('Operation  : UPDATE category ID 10');
      expect(output).toContain('[API DEBUG] PUT COMPLETED');
    });

    it('should format PATCH request debug block with updated fields breakdown', () => {
      const output = formatPatchRequest({
        module: 'CATEGORY',
        category: 'CATEGORY MANAGEMENT',
        subcategory: 'UPDATE CATEGORY STATUS',
        method: 'PATCH',
        endpoint: '/api/categories/10/status',
        time: '2026-11-11 12:30:00',
        requestId: 'test-req-004',
        params: { id: '10' },
        frontendData: { is_active: false },
        updatedFields: ['is_active'],
        controller: 'updateStatus',
        service: 'CategoryService',
        operation: 'UPDATE STATUS category ID 10',
        status: 200,
        success: true,
        responseData: { success: true, message: 'Status updated' },
        duration: 22,
      });

      expect(output).toContain('[API DEBUG] PATCH REQUEST');
      expect(output).toContain('Updated Fields:');
      expect(output).toContain('"is_active"');
      expect(output).toContain('Execution Time: 22ms');
      expect(output).toContain('[API DEBUG] PATCH COMPLETED');
    });

    it('should format DELETE request debug block accurately', () => {
      const output = formatDeleteRequest({
        module: 'CATEGORY',
        category: 'CATEGORY MANAGEMENT',
        subcategory: 'DELETE CATEGORY',
        method: 'DELETE',
        endpoint: '/api/categories/10',
        time: '2026-11-11 12:30:00',
        requestId: 'test-req-005',
        params: { id: '10' },
        controller: 'deleteCategory',
        service: 'CategoryService',
        operation: 'DELETE category ID 10',
        status: 200,
        success: true,
        responseData: { success: true, message: 'Category deleted successfully' },
        duration: 30,
      });

      expect(output).toContain('[API DEBUG] DELETE REQUEST');
      expect(output).toContain('Operation  : DELETE category ID 10');
      expect(output).toContain('Execution Time: 30ms');
      expect(output).toContain('[API DEBUG] DELETE COMPLETED');
    });

    it('should format centralized ERROR log block with error type and location', () => {
      const output = formatErrorRequest({
        module: 'CATEGORY',
        category: 'CATEGORY MANAGEMENT',
        subcategory: 'CREATE CATEGORY',
        method: 'POST',
        endpoint: '/api/categories',
        time: '2026-11-11 12:30:00',
        requestId: 'test-req-006',
        status: 400,
        errorType: 'VALIDATION_ERROR',
        errorMessage: 'Category name is required',
        params: {},
        query: {},
        body: { name: '' },
        controller: 'createCategory',
        service: 'CategoryService',
        duration: 15,
      });

      expect(output).toContain('[API ERROR]');
      expect(output).toContain('STATUS        : 400');
      expect(output).toContain('ERROR TYPE    : VALIDATION_ERROR');
      expect(output).toContain('ERROR MESSAGE : Category name is required');
      expect(output).toContain('[REQUEST DATA]');
      expect(output).toContain('"name": ""');
      expect(output).toContain('[ERROR LOCATION]');
      expect(output).toContain('Controller : createCategory');
      expect(output).toContain('[EXECUTION TIME]');
      expect(output).toContain('15ms');
    });
  });

  // ==========================================
  // 4. ENVIRONMENT-BASED LOGGING RULES
  // ==========================================
  describe('Environment-Based Logging Rules (Development vs Production)', () => {
    it('identifyErrorType categorizes errors properly', () => {
      expect(identifyErrorType(400, { name: 'ZodError' })).toBe('VALIDATION_ERROR');
      expect(identifyErrorType(401, { name: 'JsonWebTokenError' })).toBe('AUTHENTICATION_ERROR');
      expect(identifyErrorType(403, { name: 'ForbiddenError' })).toBe('AUTHORIZATION_ERROR');
      expect(identifyErrorType(404, { name: 'NotFoundError' })).toBe('NOT_FOUND_ERROR');
      expect(identifyErrorType(400, { code: '23505' })).toBe('DUPLICATE_RECORD_ERROR');
      expect(identifyErrorType(500, { message: 'Database crash' })).toBe('INTERNAL_SERVER_ERROR');
    });

    it('getMethodColor returns correct color mappings', () => {
      expect(getMethodColor('GET')).toBe(COLORS.blue);
      expect(getMethodColor('POST')).toBe(COLORS.green);
      expect(getMethodColor('PUT')).toBe(COLORS.yellow);
      expect(getMethodColor('PATCH')).toBe(COLORS.cyan);
      expect(getMethodColor('DELETE')).toBe(COLORS.red);
    });

    it('formatTimestamp returns valid YYYY-MM-DD HH:mm:ss string', () => {
      const ts = formatTimestamp(new Date('2026-11-11T12:30:45.000Z'));
      expect(ts).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });
  });

  // ==========================================
  // 5. MIDDLEWARE INTEGRATION TESTS
  // ==========================================
  describe('API Logger Middleware Integration', () => {
    it('apiLoggerMiddleware assigns req.id and sets X-Request-ID header', () => {
      const req = {
        method: 'GET',
        headers: {},
        originalUrl: '/api/categories',
      };
      const headers = {};
      const res = {
        getHeader: (k) => headers[k],
        setHeader: (k, v) => {
          headers[k] = v;
        },
        send: jest.fn(),
        json: jest.fn(),
        on: jest.fn(),
        removeListener: jest.fn(),
      };
      const next = jest.fn();

      apiLoggerMiddleware(req, res, next);

      expect(req.id).toBeDefined();
      expect(req.requestId).toBe(req.id);
      expect(headers['X-Request-ID']).toBe(req.id);
      expect(next).toHaveBeenCalled();
    });

    it('setApiContext helper attaches metadata to req.apiContext', () => {
      const req = {};
      const res = {};
      const next = jest.fn();

      const middleware = setApiContext({
        module: 'CATEGORY',
        category: 'CATEGORY MANAGEMENT',
        subcategory: 'CREATE CATEGORY',
      });

      middleware(req, res, next);

      expect(req.apiContext).toEqual({
        module: 'CATEGORY',
        category: 'CATEGORY MANAGEMENT',
        subcategory: 'CREATE CATEGORY',
      });
      expect(next).toHaveBeenCalled();
    });

    it('apiLoggerMiddleware intercepts response and logs transaction on finish', () => {
      const listeners = {};
      const req = {
        method: 'POST',
        originalUrl: '/api/categories',
        headers: { 'x-request-id': 'req-test-999' },
        body: { name: 'Party Wear Sarees', password: 'secretPassword123' },
        params: {},
        query: {},
        apiContext: {
          module: 'CATEGORY',
          category: 'CATEGORY MANAGEMENT',
          subcategory: 'CREATE CATEGORY',
          controller: 'createCategory',
          service: 'CategoryService',
          database: 'INSERT category',
        },
      };

      const res = {
        statusCode: 201,
        getHeader: () => null,
        setHeader: jest.fn(),
        on: (event, cb) => {
          listeners[event] = cb;
        },
        removeListener: jest.fn(),
      };
      const next = jest.fn();

      const prevDebug = process.env.DEBUG_API;
      process.env.DEBUG_API = 'true';
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      try {
        apiLoggerMiddleware(req, res, next);

        // Simulate sending response
        res.json({
          success: true,
          message: 'Category created successfully',
          data: { id: 10, name: 'Party Wear Sarees' },
        });

        // Simulate response finish event
        listeners['finish']();

        expect(logSpy).toHaveBeenCalled();
        const loggedOutput = logSpy.mock.calls.map((c) => c[0]).join('\n');
        expect(loggedOutput).toContain('[API DEBUG] POST REQUEST');
        expect(loggedOutput).toContain('MODULE       : CATEGORY');
        expect(loggedOutput).toContain('SUBCATEGORY  : CREATE CATEGORY');
        expect(loggedOutput).toContain('"name": "Party Wear Sarees"');
        expect(loggedOutput).toContain(REDACTED_LABEL); // Password was redacted
        expect(loggedOutput).toContain('[API RESPONSE]');
        expect(loggedOutput).toContain('Status        : 201');
        expect(loggedOutput).toContain('[API DEBUG] POST COMPLETED');
      } finally {
        logSpy.mockRestore();
        process.env.DEBUG_API = prevDebug;
      }
    });

    it('errorHandler passes error to apiLogger.logApiError and responds cleanly', () => {
      const err = new Error('Category name already exists');
      err.statusCode = 400;

      const req = {
        method: 'POST',
        originalUrl: '/api/categories',
        id: 'err-test-uuid-1',
        requestId: 'err-test-uuid-1',
        params: {},
        query: {},
        body: { name: 'Existing Category' },
        apiContext: {
          module: 'CATEGORY',
          category: 'CATEGORY MANAGEMENT',
          subcategory: 'CREATE CATEGORY',
          controller: 'createCategory',
          service: 'CategoryService',
        },
      };

      const resJson = jest.fn();
      const res = {
        status: jest.fn().mockReturnThis(),
        json: resJson,
      };
      const next = jest.fn();

      const prevDebug = process.env.DEBUG_API;
      process.env.DEBUG_API = 'true';
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(resJson).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: 'Category name already exists',
            requestId: 'err-test-uuid-1',
          })
        );

        expect(errorSpy).toHaveBeenCalled();
        const loggedError = errorSpy.mock.calls.map((c) => c[0]).join('\n');
        expect(loggedError).toContain('[API ERROR]');
        expect(loggedError).toContain('MODULE        : CATEGORY');
        expect(loggedError).toContain('STATUS        : 400');
        expect(loggedError).toContain('Category name already exists');
      } finally {
        errorSpy.mockRestore();
        process.env.DEBUG_API = prevDebug;
      }
    });
  });

  // ==========================================
  // 6. GRANULAR METHOD-LEVEL LOGGING TESTS
  // ==========================================
  describe('Granular Method-Level Debug Logging Configuration', () => {
    const originalEnv = { ...process.env };
    const originalEnvGet = env.LOG_GET;
    const originalEnvPost = env.LOG_POST;
    const originalEnvPut = env.LOG_PUT;
    const originalEnvPatch = env.LOG_PATCH;
    const originalEnvDelete = env.LOG_DELETE;
    const originalEnvOptions = env.LOG_OPTIONS;

    afterEach(() => {
      process.env = { ...originalEnv };
      env.LOG_GET = originalEnvGet;
      env.LOG_POST = originalEnvPost;
      env.LOG_PUT = originalEnvPut;
      env.LOG_PATCH = originalEnvPatch;
      env.LOG_DELETE = originalEnvDelete;
      env.LOG_OPTIONS = originalEnvOptions;
    });

    it('evaluates isMethodLoggingEnabled correctly for specified methods (GET=true, POST=true, PATCH=true)', () => {
      // Simulate user configuration: GET, POST, PATCH enabled; PUT, DELETE disabled
      env.LOG_GET = true;
      env.LOG_POST = true;
      env.LOG_PATCH = true;
      env.LOG_PUT = false;
      env.LOG_DELETE = false;
      env.LOG_OPTIONS = false;
      delete process.env.LOG_METHODS;

      expect(env.isMethodLoggingEnabled('GET')).toBe(true);
      expect(env.isMethodLoggingEnabled('POST')).toBe(true);
      expect(env.isMethodLoggingEnabled('PATCH')).toBe(true);
      expect(env.isMethodLoggingEnabled('PUT')).toBe(false);
      expect(env.isMethodLoggingEnabled('DELETE')).toBe(false);
      expect(env.isMethodLoggingEnabled('OPTIONS')).toBe(false);
    });

    it('supports comma-separated LOG_METHODS whitelist (e.g. "GET,POST,PATCH")', () => {
      process.env.LOG_METHODS = 'GET,POST,PATCH';

      expect(env.isMethodLoggingEnabled('GET')).toBe(true);
      expect(env.isMethodLoggingEnabled('get')).toBe(true);
      expect(env.isMethodLoggingEnabled('POST')).toBe(true);
      expect(env.isMethodLoggingEnabled('post')).toBe(true);
      expect(env.isMethodLoggingEnabled('PATCH')).toBe(true);
      expect(env.isMethodLoggingEnabled('patch')).toBe(true);
      expect(env.isMethodLoggingEnabled('PUT')).toBe(false);
      expect(env.isMethodLoggingEnabled('DELETE')).toBe(false);
    });

    it('suppresses console debug logging for disabled methods and logs enabled methods', () => {
      // Configure: only GET, POST, PATCH enabled
      env.LOG_GET = true;
      env.LOG_POST = true;
      env.LOG_PATCH = true;
      env.LOG_PUT = false;
      env.LOG_DELETE = false;
      delete process.env.LOG_METHODS;

      const prevDebug = process.env.DEBUG_API;
      process.env.DEBUG_API = 'true';
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      try {
        // 1. POST request - SHOULD log
        apiLogger.logTransaction({
          req: { method: 'POST', originalUrl: '/api/categories', body: { name: 'Silk Sarees' } },
          res: { statusCode: 201 },
          responseBody: { success: true, data: { id: 1 } },
          duration: 30,
          apiContext: { module: 'CATEGORY', subcategory: 'CREATE CATEGORY' },
        });
        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(logSpy.mock.calls[0][0]).toContain('[API DEBUG] POST REQUEST');

        logSpy.mockClear();

        // 2. PUT request - SHOULD BE SUPPRESSED
        apiLogger.logTransaction({
          req: { method: 'PUT', originalUrl: '/api/categories/1', body: { name: 'Updated Sarees' } },
          res: { statusCode: 200 },
          responseBody: { success: true },
          duration: 25,
          apiContext: { module: 'CATEGORY', subcategory: 'UPDATE CATEGORY' },
        });
        expect(logSpy).not.toHaveBeenCalled();

        logSpy.mockClear();

        // 3. PATCH request - SHOULD log
        apiLogger.logTransaction({
          req: { method: 'PATCH', originalUrl: '/api/categories/1', body: { status: true } },
          res: { statusCode: 200 },
          responseBody: { success: true },
          duration: 20,
          apiContext: { module: 'CATEGORY', subcategory: 'UPDATE CATEGORY STATUS' },
        });
        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(logSpy.mock.calls[0][0]).toContain('[API DEBUG] PATCH REQUEST');

        logSpy.mockClear();

        // 4. DELETE request - SHOULD BE SUPPRESSED
        apiLogger.logTransaction({
          req: { method: 'DELETE', originalUrl: '/api/categories/1', params: { id: '1' } },
          res: { statusCode: 200 },
          responseBody: { success: true },
          duration: 15,
          apiContext: { module: 'CATEGORY', subcategory: 'DELETE CATEGORY' },
        });
        expect(logSpy).not.toHaveBeenCalled();

        logSpy.mockClear();

        // 5. GET request - SHOULD log
        apiLogger.logTransaction({
          req: { method: 'GET', originalUrl: '/api/categories', query: { page: '1' } },
          res: { statusCode: 200 },
          responseBody: { success: true, data: [] },
          duration: 10,
          apiContext: { module: 'CATEGORY', subcategory: 'GET CATEGORIES' },
        });
        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(logSpy.mock.calls[0][0]).toContain('[API DEBUG] GET REQUEST');
      } finally {
        logSpy.mockRestore();
        process.env.DEBUG_API = prevDebug;
      }
    });

    it('suppresses dev error output for disabled methods and formats for enabled methods', () => {
      env.LOG_POST = true;
      env.LOG_DELETE = false;
      delete process.env.LOG_METHODS;

      const prevDebug = process.env.DEBUG_API;
      process.env.DEBUG_API = 'true';
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        // Disabled method (DELETE) error -> dev console.error suppressed
        apiLogger.logApiError({
          req: { method: 'DELETE', originalUrl: '/api/categories/999' },
          res: {},
          err: new Error('Category not found'),
          status: 404,
        });
        expect(errorSpy).not.toHaveBeenCalled();

        // Enabled method (POST) error -> dev console.error outputs formatted error box
        apiLogger.logApiError({
          req: { method: 'POST', originalUrl: '/api/categories' },
          res: {},
          err: new Error('Validation failed'),
          status: 400,
        });
        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy.mock.calls[0][0]).toContain('[API ERROR]');
      } finally {
        errorSpy.mockRestore();
        process.env.DEBUG_API = prevDebug;
      }
    });

    it('completely silences all development debug logging in production mode regardless of method flags', () => {
      const prevNodeEnv = env.NODE_ENV;
      env.NODE_ENV = 'production';
      env.LOG_GET = true;
      env.LOG_POST = true;

      try {
        expect(isDevLoggingEnabled()).toBe(false);
        expect(isMethodLoggingEnabled('GET')).toBe(false);
        expect(isMethodLoggingEnabled('POST')).toBe(false);
      } finally {
        env.NODE_ENV = prevNodeEnv;
      }
    });
  });
});
