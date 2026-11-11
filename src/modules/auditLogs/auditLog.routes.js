import { Router } from 'express';
import { getAll, getById, getByEntity } from './auditLog.controller.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';
import {
  getAuditLogsQuerySchema,
  auditLogIdParamSchema,
  entityAuditParamsSchema,
} from './auditLog.validation.js';

const router = Router();

// GET /api/audit-logs - List audit logs with pagination and filters
router.get('/', verifyToken, validate(getAuditLogsQuerySchema, 'query'), getAll);

// GET /api/audit-logs/:id - Get specific audit log by ID with field-level changes
router.get('/:id', verifyToken, validate(auditLogIdParamSchema, 'params'), getById);

// GET /api/audit-logs/entity/:entityType/:entityId - Get audit trail for a specific entity
router.get(
  '/entity/:entityType/:entityId',
  verifyToken,
  validate(entityAuditParamsSchema, 'params'),
  getByEntity
);

export default router;

