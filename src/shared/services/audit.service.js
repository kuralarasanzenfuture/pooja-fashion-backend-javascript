import * as auditLogService from '../../modules/auditLogs/auditLog.service.js';

export const {
  recordAuditLog,
  diffRecords,
  extractAuditContext,
  toFieldLabel,
  detectDataType,
  formatChangeValue,
  canUserSelectCompany,
  sanitizeIpAddress,
  sanitizeUuid,
  getAuditLogs,
  getAuditLogById,
  getEntityAuditHistory,
} = auditLogService;

export default auditLogService;

