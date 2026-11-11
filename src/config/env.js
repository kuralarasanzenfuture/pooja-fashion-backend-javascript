import dotenv from 'dotenv';

dotenv.config();

/**
 * Parse boolean environment variables safely.
 */
const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  return ['true', '1', 'yes', 'on'].includes(
    String(value).trim().toLowerCase()
  );
};

// Environment
const NODE_ENV = process.env.NODE_ENV || 'development';

const IS_DEVELOPMENT = NODE_ENV === 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

// =====================================================
// API DEBUGGING CONFIGURATION
// =====================================================

// Master switch: API debugging is development-only (completely disabled in production).
const API_DEBUG_ENABLED = !IS_PRODUCTION;

// Default HTTP method configuration.
// Change true/false here whenever required.
// Configured for GET, POST, and PATCH only.
const defaultMethodConfig = {
  // GET: true,
  GET: false,
  POST: true,
  PUT: true,
  PATCH: true,
  DELETE: true,
  OPTIONS: false,
};

// Optional method overrides from .env
const methodConfig = Object.fromEntries(
  Object.entries(defaultMethodConfig).map(([method, defaultValue]) => {
    const envKey = `LOG_${method}`;

    return [
      method,
      parseBoolean(process.env[envKey], defaultValue),
    ];
  })
);

// Optional whitelist: LOG_METHODS=GET,POST,PATCH
const hasMethodWhitelist =
  process.env.LOG_METHODS !== undefined;

const methodWhitelist = hasMethodWhitelist
  ? process.env.LOG_METHODS
      .split(',')
      .map((method) => method.trim().toUpperCase())
      .filter(Boolean)
  : [];

// Final enabled methods
const enabledMethods = Object.keys(methodConfig).filter((method) => {
  if (!API_DEBUG_ENABLED) return false;

  if (hasMethodWhitelist) {
    return methodWhitelist.includes(method);
  }

  return methodConfig[method];
});

const env = {
  NODE_ENV,
  IS_DEVELOPMENT,
  IS_PRODUCTION,

  PORT: Number(process.env.PORT || 5000),
  DATABASE_URL: process.env.DATABASE_URL || '',

  JWT_ACCESS_SECRET:
    process.env.JWT_ACCESS_SECRET || 'local-dev-access-secret',

  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || 'local-dev-refresh-secret',

  JWT_ACCESS_EXPIRES_IN:
    process.env.JWT_ACCESS_EXPIRES_IN || '15m',

  JWT_REFRESH_EXPIRES_IN:
    process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  CORS_ORIGIN:
    process.env.CORS_ORIGIN || 'http://localhost:5173',

  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',

  MAX_FILE_SIZE: Number(
    process.env.MAX_FILE_SIZE || 5 * 1024 * 1024
  ),

  LOG_LEVEL: process.env.LOG_LEVEL || 'dev',

  // ==========================================
  // API DEBUG SETTINGS
  // ==========================================

  API_DEBUG_ENABLED,

  LOG_GET: methodConfig.GET,
  LOG_POST: methodConfig.POST,
  LOG_PUT: methodConfig.PUT,
  LOG_PATCH: methodConfig.PATCH,
  LOG_DELETE: methodConfig.DELETE,
  LOG_OPTIONS: methodConfig.OPTIONS,

  LOG_METHODS: enabledMethods.join(','),

  /**
   * Check whether API debugging is enabled
   * for the requested HTTP method.
   *
   * Production always returns false.
   */
  isMethodLoggingEnabled(method) {
    if (!method) return false;

    // Production mode ALWAYS returns false, regardless of method settings
    if (
      env.IS_PRODUCTION ||
      env.NODE_ENV === 'production' ||
      process.env.NODE_ENV === 'production' ||
      env.API_DEBUG_ENABLED === false
    ) {
      return false;
    }

    const normalizedMethod = String(method).trim().toUpperCase();

    // Check dynamic process.env.LOG_METHODS override if provided
    if (process.env.LOG_METHODS !== undefined) {
      const whitelist = String(process.env.LOG_METHODS)
        .split(',')
        .map((m) => m.trim().toUpperCase())
        .filter(Boolean);
      return whitelist.includes(normalizedMethod);
    }

    // Check dynamic process.env[LOG_<METHOD>] override if provided
    const envKey = `LOG_${normalizedMethod}`;
    if (process.env[envKey] !== undefined) {
      return parseBoolean(process.env[envKey]);
    }

    // Check if env object property was modified directly (e.g. env.LOG_PUT = true)
    if (env[envKey] !== undefined) {
      return Boolean(env[envKey]);
    }

    return Boolean(methodConfig[normalizedMethod]);
  },
};

export default env;
