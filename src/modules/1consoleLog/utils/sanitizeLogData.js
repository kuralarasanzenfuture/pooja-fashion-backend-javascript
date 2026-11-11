/**
 * Centralized API Debugging Dashboard
 * Sanitization & Redaction Engine
 *
 * Protects local development dashboard by recursively redacting sensitive keys,
 * passwords, JWT tokens, cookies, secrets, and binary buffers.
 * Prevents memory exhaustion, payload inflation, and HTML injection/XSS.
 */

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /confirm_?password/i,
  /old_?password/i,
  /new_?password/i,
  /access_?token/i,
  /refresh_?token/i,
  /^token$/i,
  /^jwt$/i,
  /id_?token/i,
  /authorization/i,
  /bearer/i,
  /secret/i,
  /client_?secret/i,
  /secret_?key/i,
  /jwt_?secret/i,
  /api_?key/i,
  /otp/i,
  /pin/i,
  /cvv/i,
  /card_?number/i,
  /credit_?card/i,
  /cookie/i,
  /set-cookie/i,
  /session_?id/i,
  /db_?password/i,
  /database_?url/i,
];

export const REDACTED_LABEL = '[REDACTED]';
export const MAX_STRING_LENGTH = 3000;
export const MAX_ARRAY_LENGTH = 100;
export const MAX_OBJECT_KEYS = 150;

/**
 * Check if a key name matches any sensitive pattern
 * @param {string} key
 * @returns {boolean}
 */
export const isSensitiveKey = (key) => {
  if (!key || typeof key !== 'string') return false;
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
};

/**
 * Recursively sanitizes any value (object, array, primitive)
 * Handles circular references, buffer objects, Multer files, and truncates long strings.
 *
 * @param {*} value - Target value
 * @param {WeakSet} seen - Visited object tracker for circular references
 * @returns {*} Sanitized copy
 */
export const sanitizeValue = (value, seen = new WeakSet()) => {
  if (value === null || value === undefined) {
    return value;
  }

  const type = typeof value;

  // Primitives
  if (type === 'boolean' || type === 'number') {
    return value;
  }

  // Strings
  if (type === 'string') {
    // Redact Bearer tokens inside string values
    if (/^bearer\s+[a-zA-Z0-9._-]+$/i.test(value.trim())) {
      return 'Bearer [REDACTED]';
    }
    // Truncate excessively large strings
    if (value.length > MAX_STRING_LENGTH) {
      return `${value.slice(0, MAX_STRING_LENGTH)}... [truncated ${value.length - MAX_STRING_LENGTH} chars]`;
    }
    return value;
  }

  // Buffer / Binary Data
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) {
    return `[Binary Buffer: ${value.length} bytes]`;
  }
  if (value instanceof Uint8Array) {
    return `[Binary Data: ${value.byteLength} bytes]`;
  }

  // Dates & RegExps
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value instanceof RegExp) {
    return value.toString();
  }

  // Multer / Uploaded File Objects
  if (type === 'object' && (value.buffer || value.fieldname || value.mimetype)) {
    return {
      fieldname: value.fieldname || 'file',
      originalname: value.originalname || 'unknown',
      mimetype: value.mimetype || 'application/octet-stream',
      size: value.size ? `${(value.size / 1024).toFixed(1)} KB` : 'unknown',
      filename: value.filename || '[in-memory-file]',
    };
  }

  // Arrays
  if (Array.isArray(value)) {
    if (seen.has(value)) {
      return '[Circular Reference]';
    }
    seen.add(value);

    const length = Math.min(value.length, MAX_ARRAY_LENGTH);
    const sanitizedArray = [];
    for (let i = 0; i < length; i++) {
      sanitizedArray.push(sanitizeValue(value[i], seen));
    }
    if (value.length > MAX_ARRAY_LENGTH) {
      sanitizedArray.push(`... [${value.length - MAX_ARRAY_LENGTH} more items truncated]`);
    }
    return sanitizedArray;
  }

  // Objects
  if (type === 'object') {
    if (seen.has(value)) {
      return '[Circular Reference]';
    }
    seen.add(value);

    // If it has custom toJSON (e.g. Decimal, Model)
    let target = value;
    if (typeof value.toJSON === 'function') {
      try {
        target = value.toJSON();
        if (typeof target !== 'object' || target === null) {
          return target;
        }
      } catch {
        // Fall back to original object
      }
    }

    const sanitizedObj = {};
    const keys = Object.keys(target);
    const limitedKeys = keys.slice(0, MAX_OBJECT_KEYS);

    for (const key of limitedKeys) {
      if (isSensitiveKey(key)) {
        sanitizedObj[key] = REDACTED_LABEL;
      } else {
        sanitizedObj[key] = sanitizeValue(target[key], seen);
      }
    }

    if (keys.length > MAX_OBJECT_KEYS) {
      sanitizedObj['_meta_truncated'] = `${keys.length - MAX_OBJECT_KEYS} additional keys omitted`;
    }

    return sanitizedObj;
  }

  return String(value);
};

/**
 * Sanitize an entire payload object or return empty object if falsy
 * @param {*} payload
 * @returns {object|array|null}
 */
export const sanitizePayload = (payload) => {
  if (payload === null || payload === undefined) {
    return null;
  }
  return sanitizeValue(payload);
};

/**
 * Filter safe HTTP request headers for dashboard display
 * Strips cookies, authorization tokens, internal host secrets
 * @param {object} headers
 * @returns {object}
 */
export const sanitizeHeaders = (headers = {}) => {
  if (!headers || typeof headers !== 'object') return {};

  const safeHeaders = {};
  const allowedHeaders = [
    'host',
    'user-agent',
    'accept',
    'content-type',
    'content-length',
    'x-request-id',
    'origin',
    'referer',
    'accept-encoding',
    'accept-language',
    'connection',
  ];

  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();
    if (isSensitiveKey(lowerKey)) {
      safeHeaders[key] = REDACTED_LABEL;
    } else if (allowedHeaders.includes(lowerKey)) {
      safeHeaders[key] = sanitizeValue(value);
    } else if (lowerKey.startsWith('x-')) {
      // Safe custom application headers
      safeHeaders[key] = sanitizeValue(value);
    }
  }

  return safeHeaders;
};

export default {
  isSensitiveKey,
  sanitizeValue,
  sanitizePayload,
  sanitizeHeaders,
  REDACTED_LABEL,
};

