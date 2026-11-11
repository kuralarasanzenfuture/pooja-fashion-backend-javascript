import crypto from 'crypto';
import { extractAuditContext } from './auditLog.service.js';

/**
 * Global middleware to attach unique request ID and parsed audit context to every request
 */
export const attachAuditContext = (req, res, next) => {
  const requestId =
    req.headers['x-request-id'] ||
    req.headers['request-id'] ||
    crypto.randomUUID();

  req.id = String(requestId);
  res.setHeader('X-Request-ID', req.id);

  // Lazy or pre-extracted audit context
  Object.defineProperty(req, 'auditContext', {
    get() {
      return extractAuditContext(req);
    },
    configurable: true,
    enumerable: true,
  });

  return next();
};

export default {
  attachAuditContext,
};

