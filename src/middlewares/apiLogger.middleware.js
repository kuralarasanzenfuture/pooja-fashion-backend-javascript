/**
 * Centralized API Debugging & Logging Middleware
 * Captures request details, intercepts response bodies, calculates accurate execution time,
 * and passes sanitized transactions to the central API logger.
 */
import crypto from 'crypto';
import env from '../config/env.js';
import { apiLogger } from '../shared/utils/logger/apiLogger.js';
import { detectApiContext } from '../shared/utils/logger/apiDetector.js';
import { consoleLogService } from '../modules/1consoleLog/consoleLog.service.js';

/**
 * Route metadata middleware helper
 * Enables individual routes to explicitly declare structured category and operation metadata
 *
 * @example
 * router.post('/', setApiContext({
 *   module: 'CATEGORY',
 *   category: 'CATEGORY MANAGEMENT',
 *   subcategory: 'CREATE CATEGORY',
 *   controller: 'createCategory',
 *   service: 'CategoryService',
 *   database: 'INSERT category'
 * }), create);
 */
export const setApiContext = (metadata = {}) => (req, res, next) => {
  req.apiContext = {
    ...(req.apiContext || {}),
    ...metadata,
  };
  next();
};

/**
 * Global API Logger Middleware
 */
export const apiLoggerMiddleware = (req, res, next) => {
  // Ensure unique Request ID across the system
  const requestId =
    req.id ||
    req.requestId ||
    req.headers['x-request-id'] ||
    req.headers['request-id'] ||
    crypto.randomUUID();

  req.id = String(requestId);
  req.requestId = req.id;
  if (!res.getHeader('X-Request-ID')) {
    res.setHeader('X-Request-ID', req.id);
  }

  // Fast gate: in production, completely bypass debugging
  if (env.IS_PRODUCTION || env.NODE_ENV === 'production') {
    return next();
  }

  // Prevent recording dashboard internal queries or static assets
  const reqPath = req.originalUrl || req.url || '';
  if (
    reqPath.startsWith('/__dev') ||
    reqPath.startsWith('/assets') ||
    reqPath.startsWith('/uploads') ||
    reqPath.startsWith('/favicon.ico')
  ) {
    return next();
  }

  const startTime = Date.now();
  let responseBody = null;
  let isFinished = false;

  // Intercept response payload safely without altering output
  const originalSend = typeof res.send === 'function' ? res.send : null;
  const originalJson = typeof res.json === 'function' ? res.json : null;

  res.send = function (data) {
    if (responseBody === null) {
      if (typeof data === 'string') {
        try {
          responseBody = JSON.parse(data);
        } catch {
          responseBody = data;
        }
      } else {
        responseBody = data;
      }
    }
    if (originalSend) {
      return originalSend.apply(this, arguments);
    }
    return this;
  };

  res.json = function (data) {
    if (responseBody === null) {
      responseBody = data;
    }
    if (originalJson) {
      return originalJson.apply(this, arguments);
    }
    return this;
  };

  const handleFinish = () => {
    res.removeListener('finish', handleFinish);
    res.removeListener('close', handleFinish);

    if (isFinished || res._apiDebugLogged) return;
    isFinished = true;
    res._apiDebugLogged = true;

    const duration = Date.now() - startTime;
    req.executionTimeMs = duration;

    // Detect or merge API metadata
    const apiContext = detectApiContext(req);

    // 1. Record in Live Dashboard In-Memory Store & Broadcast to SSE clients
    consoleLogService.recordLog({
      req,
      res,
      responseBody,
      duration,
      apiContext,
    });

    // 2. Coordinate with central apiLogger for terminal debugging
    apiLogger.logTransaction({
      req,
      res,
      responseBody,
      duration,
      apiContext,
    });
  };

  res.on('finish', handleFinish);
  res.on('close', handleFinish);

  next();
};

export default {
  apiLoggerMiddleware,
  setApiContext,
};
