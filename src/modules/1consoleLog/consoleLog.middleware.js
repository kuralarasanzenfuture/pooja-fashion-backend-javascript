/**
 * Centralized API Debugging Dashboard
 * Dashboard Middleware
 *
 * Provides:
 * 1. Environment protection guard (blocks dashboard in production).
 * 2. API transaction capture middleware (intercepts request/response lifecycle).
 */
import crypto from 'crypto';
import env from '../../config/env.js';
import { consoleLogService } from './consoleLog.service.js';
import { detectApiContext } from '../../shared/utils/logger/apiDetector.js';

/**
 * Strict Environment Protection Guard
 * Ensures dashboard routes, static files, data, and SSE streams
 * are strictly inaccessible in production environments.
 */
export const ensureDevelopmentOnly = (req, res, next) => {
  if (env.IS_PRODUCTION || env.NODE_ENV === 'production') {
    return res.status(404).send('Not Found');
  }
  next();
};

/**
 * Global API Transaction Capture Middleware for Dashboard
 * Intercepts incoming requests, safely captures response bodies,
 * calculates duration, and sends sanitized logs to apiLogStore and SSE clients.
 */
export const consoleLogMiddleware = (req, res, next) => {
  // Never intercept in production
  if (env.IS_PRODUCTION || env.NODE_ENV === 'production') {
    return next();
  }

  // Prevent recursive loops: do not log requests made to the debugging dashboard itself or static assets
  const path = req.originalUrl || req.url || '';
  if (
    path.startsWith('/__dev') ||
    path.startsWith('/favicon.ico') ||
    path.startsWith('/assets') ||
    path.startsWith('/uploads')
  ) {
    return next();
  }

  // Ensure unique Request ID
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

    if (isFinished || res._dashboardLogged) return;
    isFinished = true;
    res._dashboardLogged = true;

    const duration = Date.now() - startTime;
    req.executionTimeMs = duration;

    // Detect or merge API metadata
    const apiContext = detectApiContext(req);

    // Record in Dashboard Store & Stream
    consoleLogService.recordLog({
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
  ensureDevelopmentOnly,
  consoleLogMiddleware,
};

