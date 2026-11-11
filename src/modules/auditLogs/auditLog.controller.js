import * as auditLogService from './auditLog.service.js';
import { sendSuccess } from '../../shared/utils/response.js';

/**
 * GET /api/audit-logs
 * List audit logs with pagination and filters
 */
export const getAll = async (req, res, next) => {
  try {
    const { auditLogs, meta } = await auditLogService.getAuditLogs(req.query, req.user);
    return sendSuccess(res, auditLogs, 'Audit logs retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/audit-logs/:id
 * Retrieve audit log details by ID including field changes
 */
export const getById = async (req, res, next) => {
  try {
    const auditLog = await auditLogService.getAuditLogById(req.params.id, req.user);
    return sendSuccess(res, auditLog, 'Audit log retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/audit-logs/entity/:entityType/:entityId
 * Retrieve audit history for a specific entity
 */
export const getByEntity = async (req, res, next) => {
  try {
    const { auditLogs, meta } = await auditLogService.getEntityAuditHistory(
      req.params.entityType,
      req.params.entityId,
      req.query,
      req.user
    );
    return sendSuccess(res, auditLogs, 'Entity audit history retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

export default {
  getAll,
  getById,
  getByEntity,
};

