/**
 * Centralized Application Logger
 * Provides structured, environment-aware operational logging across the entire backend:
 * - Development: Colored, human-readable console outputs.
 * - Production : Clean, structured operational logs (info, warn, error, security, startup).
 * - Sensitive Data: Never exposes passwords, JWTs, secrets, or PII.
 */
import env from '../../../config/env.js';
import { sanitizePayload } from './sensitiveDataFilter.js';
import { COLORS, formatTimestamp } from './logFormatter.js';

const isProduction = () => env.NODE_ENV === 'production';
const isTest = () => env.NODE_ENV === 'test';

const formatMeta = (meta) => {
  if (!meta || Object.keys(meta).length === 0) return '';
  const sanitized = sanitizePayload(meta);
  return isProduction() ? JSON.stringify(sanitized) : JSON.stringify(sanitized, null, 2);
};

export const logger = {
  info: (message, meta = {}) => {
    if (isTest()) return;
    const time = formatTimestamp();
    if (isProduction()) {
      console.log(JSON.stringify({ level: 'INFO', time, message, ...sanitizePayload(meta) }));
    } else {
      console.log(
        `${COLORS.blue}[INFO]${COLORS.reset} ${COLORS.dim}${time}${COLORS.reset} - ${message} ${formatMeta(meta)}`
      );
    }
  },

  warn: (message, meta = {}) => {
    if (isTest()) return;
    const time = formatTimestamp();
    if (isProduction()) {
      console.warn(JSON.stringify({ level: 'WARN', time, message, ...sanitizePayload(meta) }));
    } else {
      console.warn(
        `${COLORS.yellow}[WARN]${COLORS.reset} ${COLORS.dim}${time}${COLORS.reset} - ${message} ${formatMeta(meta)}`
      );
    }
  },

  error: (message, meta = {}) => {
    // In test mode, keep quiet unless needed
    if (isTest() && !process.env.DEBUG_TESTS) return;
    const time = formatTimestamp();
    if (isProduction()) {
      // In production, do not include raw stack traces or internal secrets
      const safeMeta = sanitizePayload(meta);
      if (safeMeta && typeof safeMeta === 'object' && safeMeta.stack) {
        delete safeMeta.stack;
      }
      console.error(JSON.stringify({ level: 'ERROR', time, message, ...safeMeta }));
    } else {
      console.error(
        `${COLORS.bold}${COLORS.red}[ERROR]${COLORS.reset} ${COLORS.dim}${time}${COLORS.reset} - ${message} ${formatMeta(meta)}`
      );
    }
  },

  debug: (message, meta = {}) => {
    if (isProduction() || isTest()) return;
    const time = formatTimestamp();
    console.log(
      `${COLORS.gray}[DEBUG] ${time} - ${message}${COLORS.reset} ${formatMeta(meta)}`
    );
  },

  security: (message, meta = {}) => {
    if (isTest()) return;
    const time = formatTimestamp();
    const safeMeta = sanitizePayload(meta);
    if (isProduction()) {
      console.warn(JSON.stringify({ level: 'SECURITY', time, message, ...safeMeta }));
    } else {
      console.warn(
        `${COLORS.bold}${COLORS.magenta}[SECURITY]${COLORS.reset} ${time} - ${message} ${formatMeta(safeMeta)}`
      );
    }
  },

  startup: (message, meta = {}) => {
    if (isTest()) return;
    const time = formatTimestamp();
    console.log(
      `${COLORS.bold}${COLORS.green}[STARTUP]${COLORS.reset} ${COLORS.dim}${time}${COLORS.reset} - ${message} ${formatMeta(meta)}`
    );
  },
};

export default logger;

