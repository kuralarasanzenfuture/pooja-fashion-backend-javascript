/**
 * Centralized API Debugging Dashboard
 * Log Formatter
 *
 * Normalizes raw Express request/response transactions into clean,
 * structured, and sanitized log entries for storage, streaming, and UI display.
 */
import crypto from 'crypto';
import { sanitizePayload, sanitizeHeaders } from './sanitizeLogData.js';

/**
 * Format timestamp as YYYY-MM-DD HH:mm:ss
 * @param {Date} date
 * @returns {string}
 */
export const formatTime = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
};

/**
 * Standard HTTP Status Text Mapping
 */
export const getStatusText = (status) => {
  const STATUS_TEXT_MAP = {
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    204: 'No Content',
    301: 'Moved Permanently',
    302: 'Found',
    304: 'Not Modified',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };
  return STATUS_TEXT_MAP[status] || (status >= 400 ? 'Error' : 'Success');
};

/**
 * Build a normalized log entry object
 *
 * @param {object} options
 * @param {object} options.req - Express request object
 * @param {object} options.res - Express response object
 * @param {*} options.responseBody - Parsed response payload
 * @param {number} options.duration - Execution time in ms
 * @param {object} [options.apiContext] - Explicit or auto-detected API metadata
 * @param {Error|null} [options.error] - Caught error object if applicable
 * @returns {object} Normalized log entry
 */
export const formatLogEntry = ({
  req,
  res,
  responseBody = null,
  duration = 0,
  apiContext = {},
  error = null,
}) => {
  const now = new Date();
  const status = res?.statusCode || 200;
  const isSuccess = status >= 200 && status < 400;
  const activeError = error || req?.apiError || null;

  const method = String(req?.method || 'GET').toUpperCase();
  const endpoint = req?.originalUrl || req?.url || '/';
  const requestId = String(req?.id || req?.requestId || req?.headers?.['x-request-id'] || crypto.randomUUID());

  // Resolve API categorization
  const moduleName = String(apiContext?.module || req?.apiContext?.module || 'API').toUpperCase();
  const categoryName = String(
    apiContext?.category || req?.apiContext?.category || `${moduleName} MANAGEMENT`
  ).toUpperCase();
  const subcategoryName = String(
    apiContext?.subcategory || req?.apiContext?.subcategory || `${method} ${endpoint}`
  ).toUpperCase();

  // Error details if applicable
  let errorDetails = null;
  if (!isSuccess || activeError) {
    errorDetails = {
      errorType: activeError?.name || (status === 400 ? 'VALIDATION_ERROR' : status === 404 ? 'NOT_FOUND_ERROR' : 'API_ERROR'),
      errorMessage: activeError?.message || responseBody?.message || (status === 404 ? 'Resource not found' : 'Request failed'),
      status,
      location: apiContext?.controller || req?.apiContext?.controller || null,
      service: apiContext?.service || req?.apiContext?.service || null,
    };
  }

  return {
    id: `log-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    requestId,
    timestamp: now.toISOString(),
    timeFormatted: formatTime(now),
    method,
    endpoint,
    module: moduleName,
    category: categoryName,
    subcategory: subcategoryName,
    controller: apiContext?.controller || req?.apiContext?.controller || null,
    service: apiContext?.service || req?.apiContext?.service || null,
    database: apiContext?.database || req?.apiContext?.database || null,
    params: sanitizePayload(req?.params || {}),
    query: sanitizePayload(req?.query || {}),
    headers: sanitizeHeaders(req?.headers || {}),
    requestBody: sanitizePayload(req?.body || null),
    status,
    statusText: getStatusText(status),
    responseBody: sanitizePayload(responseBody),
    duration: Math.max(0, Number(duration) || 0),
    success: isSuccess,
    error: errorDetails,
    ip: req?.ip || req?.socket?.remoteAddress || '127.0.0.1',
  };
};

export default {
  formatTime,
  getStatusText,
  formatLogEntry,
};

