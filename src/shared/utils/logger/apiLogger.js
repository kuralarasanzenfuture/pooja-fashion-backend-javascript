/**
 * Centralized API Debugging & Logging System
 * API Logger Engine
 *
 * Coordinates request/response debugging output based on environment:
 * - NODE_ENV=development: Outputs comprehensive colorized API debug flow.
 * - NODE_ENV=production : Completely disables development debug logs.
 *                         Retains only essential, sanitized operational warnings/errors.
 */
import env from '../../../config/env.js';
import logger from './logger.js';
import { consoleLogService } from '../../../modules/1consoleLog/consoleLog.service.js';
import {
  formatPostRequest,
  formatGetRequest,
  formatPutRequest,
  formatPatchRequest,
  formatDeleteRequest,
  formatErrorRequest,
  formatTimestamp,
} from './logFormatter.js';
import { sanitizePayload } from './sensitiveDataFilter.js';

export const isDevLoggingEnabled = () => {
  if (env.IS_PRODUCTION || env.NODE_ENV === 'production') return false;
  if (!env.API_DEBUG_ENABLED && env.NODE_ENV !== 'test') return false;
  if (env.NODE_ENV === 'test' && !process.env.DEBUG_API) return false;
  return env.LOG_LEVEL !== 'silent';
};

/**
 * Check if debug logging is enabled for a specific HTTP method
 * @param {string} method - 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', etc.
 * @returns {boolean}
 */
export const isMethodLoggingEnabled = (method) => {
  if (!isDevLoggingEnabled()) return false;
  if (typeof env.isMethodLoggingEnabled === 'function') {
    return env.isMethodLoggingEnabled(method);
  }
  return true;
};

/**
 * Identify error type from status and error properties
 */
export const identifyErrorType = (status, err) => {
  if (err?.name === 'ZodError' || err?.issues || status === 400) {
    if (err?.code === '23505' || err?.constraint) return 'DUPLICATE_RECORD_ERROR';
    if (err?.name === 'MulterError') return 'FILE_UPLOAD_ERROR';
    return 'VALIDATION_ERROR';
  }
  if (status === 401 || err?.name === 'JsonWebTokenError' || err?.name === 'TokenExpiredError') {
    return 'AUTHENTICATION_ERROR';
  }
  if (status === 403) {
    return 'AUTHORIZATION_ERROR';
  }
  if (status === 404 || err?.name === 'NotFoundError') {
    return 'NOT_FOUND_ERROR';
  }
  if (status === 409) {
    return 'CONFLICT_ERROR';
  }
  if (err?.code && String(err.code).startsWith('23')) {
    return 'DATABASE_ERROR';
  }
  if (status >= 500) {
    return 'INTERNAL_SERVER_ERROR';
  }
  return err?.name ? String(err.name).toUpperCase() : 'API_ERROR';
};

/**
 * Log completed API transaction
 */
export const logTransaction = ({
  req,
  res,
  responseBody = null,
  duration = 0,
  apiContext = {},
  error = null,
}) => {
  try {
    const status = res.statusCode || 200;
    const isError = status >= 400 || Boolean(error || req.apiError);

    // In production mode:
    // Never print request payload, response data, or development traces
    if (!isDevLoggingEnabled()) {
      if (isError && status >= 500) {
        // Operational log only for server errors
        logger.error(`API [${req.method}] ${req.originalUrl || req.url} failed with status ${status}`, {
          requestId: req.id || req.requestId,
          status,
          method: req.method,
          endpoint: req.originalUrl || req.url,
          errorType: identifyErrorType(status, error || req.apiError),
          errorMessage: (error || req.apiError)?.message || 'Server error',
          duration: `${duration}ms`,
        });
      }
      return;
    }

    const method = (req.method || 'GET').toUpperCase();

    // Check if development debug logging for this specific HTTP method is enabled
    if (!isMethodLoggingEnabled(method)) {
      return;
    }

    const endpoint = req.originalUrl || req.url || '/';
    const time = formatTimestamp();
    const requestId = req.id || req.requestId || null;

    // If an error occurred or response status is an error, format error block
    if (isError) {
      const activeError = error || req.apiError || {};
      const errorType = identifyErrorType(status, activeError);
      const errorMessage =
        activeError.message ||
        responseBody?.message ||
        (status === 404 ? 'Resource not found' : 'Request failed');

      const formattedError = formatErrorRequest({
        module: apiContext.module,
        category: apiContext.category,
        subcategory: apiContext.subcategory,
        method,
        endpoint,
        time,
        requestId,
        status,
        errorType,
        errorMessage,
        params: sanitizePayload(req.params),
        query: sanitizePayload(req.query),
        body: sanitizePayload(req.body),
        controller: apiContext.controller,
        service: apiContext.service,
        duration,
      });

      console.error(formattedError);
      return;
    }

    // Success transactions by HTTP method
    const params = sanitizePayload(req.params);
    const query = sanitizePayload(req.query);
    const frontendData = sanitizePayload(req.body);
    const backendData = frontendData; // Parsed request body
    const responseData = sanitizePayload(responseBody);
    const success = responseBody?.success !== undefined ? responseBody.success : status < 400;

    let output = '';

    switch (method) {
      case 'POST':
        output = formatPostRequest({
          module: apiContext.module,
          category: apiContext.category,
          subcategory: apiContext.subcategory,
          method,
          endpoint,
          time,
          requestId,
          frontendData,
          backendData,
          controller: apiContext.controller,
          service: apiContext.service,
          database: apiContext.database,
          status,
          success,
          responseData,
          duration,
        });
        break;

      case 'GET':
        output = formatGetRequest({
          module: apiContext.module,
          category: apiContext.category,
          subcategory: apiContext.subcategory,
          method,
          endpoint,
          time,
          requestId,
          params,
          query,
          controller: apiContext.controller,
          service: apiContext.service,
          operation: apiContext.operation,
          status,
          success,
          responseData,
          duration,
        });
        break;

      case 'PUT':
        output = formatPutRequest({
          module: apiContext.module,
          category: apiContext.category,
          subcategory: apiContext.subcategory,
          method,
          endpoint,
          time,
          requestId,
          params,
          frontendData,
          controller: apiContext.controller,
          service: apiContext.service,
          operation: apiContext.operation,
          status,
          success,
          responseData,
          duration,
        });
        break;

      case 'PATCH':
        output = formatPatchRequest({
          module: apiContext.module,
          category: apiContext.category,
          subcategory: apiContext.subcategory,
          method,
          endpoint,
          time,
          requestId,
          params,
          frontendData,
          updatedFields: req.body ? Object.keys(req.body) : [],
          controller: apiContext.controller,
          service: apiContext.service,
          operation: apiContext.operation,
          status,
          success,
          responseData,
          duration,
        });
        break;

      case 'DELETE':
        output = formatDeleteRequest({
          module: apiContext.module,
          category: apiContext.category,
          subcategory: apiContext.subcategory,
          method,
          endpoint,
          time,
          requestId,
          params,
          controller: apiContext.controller,
          service: apiContext.service,
          operation: apiContext.operation,
          status,
          success,
          responseData,
          duration,
        });
        break;

      default:
        output = formatGetRequest({
          module: apiContext.module,
          category: apiContext.category,
          subcategory: apiContext.subcategory,
          method,
          endpoint,
          time,
          requestId,
          params,
          query,
          controller: apiContext.controller,
          service: apiContext.service,
          operation: apiContext.operation,
          status,
          success,
          responseData,
          duration,
        });
        break;
    }

    console.log(output);
  } catch (err) {
    // Logging failures must never crash API execution
    if (env.NODE_ENV !== 'production' && env.NODE_ENV !== 'test') {
      console.warn('⚠️ [API_LOGGER_WARN]: Failed to format API debug log:', err.message);
    }
  }
};

/**
 * Explicit error logger called by error handling middleware
 */
export const logApiError = ({ req, res, err, status = 500, message = null, errorType = null }) => {
  try {
    req.apiError = err;
    const finalStatus = status || err.statusCode || err.status || 500;
    const resolvedType = errorType || identifyErrorType(finalStatus, err);
    const resolvedMsg = message || err.message || 'Internal server error';

    if (!isDevLoggingEnabled()) {
      // In production, log operational error only
      logger.error(`[API ERROR] ${req.method} ${req.originalUrl || req.url} - ${resolvedMsg}`, {
        requestId: req.id || req.requestId,
        status: finalStatus,
        errorType: resolvedType,
      });
      return;
    }

    const duration = req.executionTimeMs || 0;
    const apiContext = req.apiContext || {};

    // Record error in development dashboard
    try {
      consoleLogService.recordLog({
        req,
        res: { statusCode: finalStatus },
        responseBody: { success: false, message: resolvedMsg },
        duration,
        apiContext,
        error: {
          name: resolvedType,
          message: resolvedMsg,
          statusCode: finalStatus,
        },
      });
    } catch {
      // Ignore dashboard recording error
    }

    const method = (req.method || 'GET').toUpperCase();

    // Check if development debug logging for this specific HTTP method is enabled
    if (!isMethodLoggingEnabled(method)) {
      return;
    }

    const formatted = formatErrorRequest({
      module: apiContext.module || 'API',
      category: apiContext.category,
      subcategory: apiContext.subcategory,
      method,
      endpoint: req.originalUrl || req.url || '/',
      time: formatTimestamp(),
      requestId: req.id || req.requestId,
      status: finalStatus,
      errorType: resolvedType,
      errorMessage: resolvedMsg,
      params: sanitizePayload(req.params),
      query: sanitizePayload(req.query),
      body: sanitizePayload(req.body),
      controller: apiContext.controller,
      service: apiContext.service,
      duration,
    });

    console.error(formatted);
  } catch (loggingErr) {
    // Never crash on logging failure
  }
};

export const apiLogger = {
  isDevLoggingEnabled,
  isMethodLoggingEnabled,
  identifyErrorType,
  logTransaction,
  logApiError,
};

export default apiLogger;

