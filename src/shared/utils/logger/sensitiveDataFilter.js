/**
 * Centralized API Debugging & Logging System
 * Sensitive Data Filter
 *
 * Recursively filters sensitive fields (passwords, tokens, authorization headers,
 * secrets, cookies, API keys, OTPs, PII, credentials) across nested objects and arrays.
 * Handles circular references, truncates oversized payloads, and replaces binary/buffer data.
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
export const MAX_STRING_LENGTH = 1500;
export const MAX_ARRAY_LENGTH = 50;
export const MAX_OBJECT_KEYS = 100;

/**
 * Check if a property key matches sensitive field patterns
 * @param {string} key
 * @returns {boolean}
 */
export const isSensitiveKey = (key) => {
  if (!key || typeof key !== 'string') return false;
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
};

/**
 * Recursively sanitize value
 * @param {*} value - Value to sanitize
 * @param {WeakSet} seen - Set of visited objects to prevent circular loops
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
    // Redact bearer tokens inside strings
    if (/^bearer\s+[a-zA-Z0-9._-]+$/i.test(value.trim())) {
      return 'Bearer [REDACTED]';
    }
    // Truncate excessively long strings
    if (value.length > MAX_STRING_LENGTH) {
      return `${value.slice(0, MAX_STRING_LENGTH)}... [truncated ${value.length - MAX_STRING_LENGTH} chars]`;
    }
    return value;
  }

  // Buffer / Binary Data
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) {
    return `[Binary Data: ${value.length} bytes]`;
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

  // Multer file objects (e.g. req.file / req.files items)
  if (
    type === 'object' &&
    value.fieldname &&
    (value.originalname || value.filename) &&
    (value.mimetype || value.size !== undefined)
  ) {
    return {
      fieldname: value.fieldname,
      originalname: value.originalname || value.filename,
      mimetype: value.mimetype,
      size: value.size,
      destination: value.destination || undefined,
      path: value.path || undefined,
    };
  }

  // Circular reference detection
  if (type === 'object') {
    if (seen.has(value)) {
      return '[Circular]';
    }
    seen.add(value);
  }

  // Arrays
  if (Array.isArray(value)) {
    const sanitizedArray = value
      .slice(0, MAX_ARRAY_LENGTH)
      .map((item) => sanitizeValue(item, seen));

    if (value.length > MAX_ARRAY_LENGTH) {
      sanitizedArray.push(`... [${value.length - MAX_ARRAY_LENGTH} more items truncated]`);
    }
    return sanitizedArray;
  }

  // Plain objects
  if (type === 'object') {
    const sanitizedObj = {};
    const keys = Object.keys(value);
    const keysToProcess = keys.slice(0, MAX_OBJECT_KEYS);

    for (const key of keysToProcess) {
      if (isSensitiveKey(key)) {
        sanitizedObj[key] = REDACTED_LABEL;
      } else {
        sanitizedObj[key] = sanitizeValue(value[key], seen);
      }
    }

    if (keys.length > MAX_OBJECT_KEYS) {
      sanitizedObj['_truncated_keys_count'] = `${keys.length - MAX_OBJECT_KEYS} more keys truncated`;
    }

    return sanitizedObj;
  }

  return String(value);
};

/**
 * Safe JSON sanitizer entry point
 * @param {*} data
 * @returns {*} Sanitized payload
 */
export const sanitizePayload = (data) => {
  try {
    return sanitizeValue(data);
  } catch {
    return '[Unserializable Payload]';
  }
};

/**
 * Format sanitized data as formatted JSON string
 * @param {*} data
 * @param {number} [space=2]
 * @returns {string}
 */
export const safeFormatJson = (data, space = 2) => {
  try {
    const sanitized = sanitizePayload(data);
    return JSON.stringify(sanitized, null, space);
  } catch {
    return '[Formatting Error]';
  }
};

export default {
  REDACTED_LABEL,
  isSensitiveKey,
  sanitizeValue,
  sanitizePayload,
  safeFormatJson,
};

