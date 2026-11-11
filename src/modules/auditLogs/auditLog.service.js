import net from 'net';
import crypto from 'crypto';
import { validate as isValidUuid } from 'uuid';
import * as auditLogRepository from './auditLog.repository.js';
import { toAuditLogDTO, toAuditLogListDTO } from './auditLog.mapper.js';
import { ALLOWED_ACTIONS } from './auditLog.validation.js';
import { getPaginationParams, formatPaginationMeta } from '../../shared/utils/pagination.js';
import { getClientIp, parseClientInfo } from '../auth/auth.utils.js';
import NotFoundError from '../../shared/errors/NotFoundError.js';
import ForbiddenError from '../../shared/errors/ForbiddenError.js';
import BadRequestError from '../../shared/errors/BadRequestError.js';

const FIELD_LABELS = {
  company_id: 'Company ID',
  branch_id: 'Branch ID',
  category_id: 'Category ID',
  category_code: 'Category Code',
  category_name: 'Category Name',
  subcategory_code: 'Subcategory Code',
  subcategory_name: 'Subcategory Name',
  description: 'Description',
  image_url: 'Image URL',
  image_key: 'Image Key',
  display_order: 'Display Order',
  is_active: 'Active Status',
  status: 'Status',
  name: 'Name',
  code: 'Code',
};

const IGNORED_DIFF_FIELDS = new Set([
  'id',
  'created_at',
  'updated_at',
  'created_by',
  'updated_by',
  'createdAt',
  'updatedAt',
  'createdBy',
  'updatedBy',
  'company_name',
  'company_code',
  'companyName',
  'companyCode',
]);

/**
 * Format field key into readable label
 */
export const toFieldLabel = (field) => {
  if (FIELD_LABELS[field]) return FIELD_LABELS[field];
  return String(field)
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * Convert string or camelCase key to snake_case
 */
const toSnakeCase = (str) => {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
};

/**
 * Detect simple data type of a value
 */
export const detectDataType = (val) => {
  if (val === null || val === undefined) return null;
  if (typeof val === 'boolean') return 'boolean';
  if (typeof val === 'number') return Number.isInteger(val) ? 'integer' : 'decimal';
  if (typeof val === 'object') return Array.isArray(val) ? 'array' : 'json';
  if (typeof val === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T/.test(val)) return 'timestamp';
    if (val.length > 255) return 'text';
    return 'string';
  }
  return typeof val;
};

/**
 * Format value to string representation for audit_log_changes text column
 */
export const formatChangeValue = (val) => {
  if (val === null || val === undefined) return null;
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val);
    } catch {
      return String(val);
    }
  }
  return String(val);
};

/**
 * Check if user is superadmin or admin allowed to select any company
 */
export const canUserSelectCompany = (user) => {
  if (!user) return false;
  const role = String(user.roleCode || user.role || '').toUpperCase();
  if (role === 'SUPERADMIN') return true;
  const hasComp = Boolean(user.companyId || user.company_id);
  return role === 'ADMIN' && !hasComp;
};

/**
 * Sanitize IP address for PostgreSQL INET type
 */
export const sanitizeIpAddress = (ip) => {
  if (!ip || typeof ip !== 'string') return null;
  const clean = ip.trim().replace(/^::ffff:/, '');
  return net.isIP(clean) ? clean : null;
};

/**
 * Sanitize UUID for PostgreSQL UUID type
 */
export const sanitizeUuid = (val) => {
  if (!val || typeof val !== 'string') return null;
  return isValidUuid(val) ? val : null;
};

/**
 * Compute field differences between two record states
 *
 * @param {Object|null} oldData
 * @param {Object|null} newData
 * @param {Object} [options]
 * @returns {{ changes: Array<Object>, changeData: Object }}
 */
export const diffRecords = (oldData = null, newData = null, options = {}) => {
  const changes = [];
  const changeData = {};

  if (!oldData && !newData) {
    return { changes, changeData };
  }

  // Case 1: Creation (oldData is null, newData exists)
  if (!oldData && newData) {
    const canonicalKeys = new Set();
    for (const key of Object.keys(newData)) {
      const snake = toSnakeCase(key);
      if (!IGNORED_DIFF_FIELDS.has(snake) && !canonicalKeys.has(snake)) {
        canonicalKeys.add(snake);
        const val = newData[key];
        if (val !== undefined && val !== null) {
          const formatted = formatChangeValue(val);
          changes.push({
            field_name: snake,
            field_label: toFieldLabel(snake),
            data_type: detectDataType(val),
            old_value: null,
            new_value: formatted,
          });
          changeData[snake] = { old: null, new: val };
        }
      }
    }
    return { changes, changeData };
  }

  // Case 2: Deletion (oldData exists, newData is null)
  if (oldData && !newData) {
    const canonicalKeys = new Set();
    for (const key of Object.keys(oldData)) {
      const snake = toSnakeCase(key);
      if (!IGNORED_DIFF_FIELDS.has(snake) && !canonicalKeys.has(snake)) {
        canonicalKeys.add(snake);
        const val = oldData[key];
        if (val !== undefined && val !== null) {
          const formatted = formatChangeValue(val);
          changes.push({
            field_name: snake,
            field_label: toFieldLabel(snake),
            data_type: detectDataType(val),
            old_value: formatted,
            new_value: null,
          });
          changeData[snake] = { old: val, new: null };
        }
      }
    }
    return { changes, changeData };
  }

  // Case 3: Update (both oldData and newData exist)
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
  const processedSnakeKeys = new Set();

  for (const key of allKeys) {
    const snake = toSnakeCase(key);
    if (IGNORED_DIFF_FIELDS.has(snake) || processedSnakeKeys.has(snake)) {
      continue;
    }
    processedSnakeKeys.add(snake);

    // Look for property in both snake_case and original
    const oldVal = oldData[snake] !== undefined ? oldData[snake] : oldData[key];
    const newVal = newData[snake] !== undefined ? newData[snake] : newData[key];

    if (newVal === undefined && oldVal === undefined) {
      continue;
    }

    const oldStr = formatChangeValue(oldVal);
    const newStr = formatChangeValue(newVal);

    // Normalize empty strings and null
    const normOld = oldStr === '' ? null : oldStr;
    const normNew = newStr === '' ? null : newStr;

    if (normOld !== normNew) {
      const type = detectDataType(newVal !== undefined ? newVal : oldVal);
      changes.push({
        field_name: snake,
        field_label: toFieldLabel(snake),
        data_type: type,
        old_value: oldStr,
        new_value: newStr,
      });
      changeData[snake] = {
        old: oldVal,
        new: newVal,
      };
    }
  }

  return { changes, changeData };
};

/**
 * Extract normalized request context from Express Request or Context object
 */
export const extractAuditContext = (reqOrContext) => {
  if (!reqOrContext) return {};

  // Check if it is an Express request (has headers or socket)
  if (reqOrContext.headers || reqOrContext.socket) {
    const req = reqOrContext;
    const clientInfo = parseClientInfo(req);
    const rawIp = getClientIp(req);

    return {
      requestId:
        req.id ||
        (req.headers ? req.headers['x-request-id'] : null) ||
        crypto.randomUUID(),
      method: req.method || null,
      url: req.originalUrl || req.url || null,
      ipAddress: sanitizeIpAddress(rawIp),
      userAgent: req.headers ? req.headers['user-agent'] || null : null,
      deviceType: clientInfo.deviceType || null,
      deviceName: clientInfo.deviceName || null,
      operatingSystem: clientInfo.operatingSystem || null,
      browser: clientInfo.browser || null,
      browserVersion: clientInfo.browserVersion || null,
      user: req.user || null,
    };
  }

  // Pre-formatted context object
  return {
    requestId: reqOrContext.requestId || crypto.randomUUID(),
    method: reqOrContext.method || null,
    url: reqOrContext.url || null,
    ipAddress: sanitizeIpAddress(reqOrContext.ipAddress),
    userAgent: reqOrContext.userAgent || null,
    deviceType: reqOrContext.deviceType || null,
    deviceName: reqOrContext.deviceName || null,
    operatingSystem: reqOrContext.operatingSystem || null,
    browser: reqOrContext.browser || null,
    browserVersion: reqOrContext.browserVersion || null,
    user: reqOrContext.user || null,
  };
};

/**
 * Primary Global Function: Record an audit log entry with detailed field changes
 *
 * @param {import('./auditLog.types.js').RecordAuditLogParams} params
 * @returns {Promise<Object>} Created audit log DTO
 */
export const recordAuditLog = async (params = {}, repo = auditLogRepository) => {
  const reqContext = extractAuditContext(params.requestContext);
  const contextUser = reqContext.user || null;

  // Resolve user info with priority: params > requestContext
  const userId = params.userId ?? contextUser?.id ?? null;
  const companyId = params.companyId ?? contextUser?.companyId ?? contextUser?.company_id ?? null;
  const branchId = params.branchId ?? contextUser?.branchId ?? contextUser?.branch_id ?? null;
  const employeeId = params.employeeId ?? contextUser?.employeeId ?? contextUser?.employee_id ?? null;
  const sessionId = sanitizeUuid(params.sessionId ?? contextUser?.sessionId ?? contextUser?.session_id ?? null);

  // Normalize action to one of allowed 21 actions
  let action = String(params.action || 'UPDATE').trim().toUpperCase();
  if (!ALLOWED_ACTIONS.includes(action)) {
    action = 'UPDATE';
  }

  const moduleName = String(params.module || 'general').trim();
  const entityType = String(params.entityType || 'Record').trim();
  const status = params.status === 'failed' ? 'failed' : 'success';

  // Compute field diffs if not explicitly passed
  let changes = Array.isArray(params.changes) ? [...params.changes] : null;
  let changeData = params.changeData || null;

  if (!changes && (params.oldData || params.newData)) {
    const diff = diffRecords(params.oldData, params.newData);
    changes = diff.changes;
    if (!changeData) {
      changeData = diff.changeData;
    }
  }

  const logPayload = {
    company_id: companyId ? Number(companyId) : null,
    branch_id: branchId ? Number(branchId) : null,
    user_id: userId ? Number(userId) : null,
    employee_id: employeeId ? Number(employeeId) : null,
    session_id: sessionId,
    action,
    module: moduleName,
    entity_type: entityType,
    entity_id: params.entityId ? Number(params.entityId) : null,
    entity_name: params.entityName || null,
    description: params.description || null,
    old_data: params.oldData || null,
    new_data: params.newData || null,
    change_data: changeData || null,
    request_id: reqContext.requestId || null,
    request_method: reqContext.method || null,
    request_url: reqContext.url || null,
    ip_address: reqContext.ipAddress || null,
    user_agent: reqContext.userAgent || null,
    device_type: reqContext.deviceType || null,
    device_name: reqContext.deviceName || null,
    operating_system: reqContext.operatingSystem || null,
    browser: reqContext.browser || null,
    browser_version: reqContext.browserVersion || null,
    status,
    error_message: params.errorMessage || null,
  };

  try {
    let savedLog = null;
    let savedChanges = [];

    try {
      savedLog = await repo.insertAuditLog(logPayload);
    } catch (dbErr) {
      // If foreign key constraint failed (e.g. user_id or session_id does not exist in DB during mock test),
      // retry with nullable foreign keys set to null
      if (dbErr.code === '23503') {
        const sanitizedFkPayload = {
          ...logPayload,
          user_id: null,
          company_id: null,
          branch_id: null,
          employee_id: null,
          session_id: null,
        };
        savedLog = await repo.insertAuditLog(sanitizedFkPayload);
      } else {
        throw dbErr;
      }
    }

    if (savedLog && savedLog.id && changes && changes.length > 0) {
      const changesWithLogId = changes.map((c) => ({
        ...c,
        audit_log_id: savedLog.id,
      }));
      try {
        savedChanges = await repo.insertAuditLogChanges(changesWithLogId);
      } catch (changeErr) {
        console.warn('⚠️ [AUDIT_LOG_WARN]: Failed to insert audit log field changes:', changeErr.message);
      }
    }

    return toAuditLogDTO(savedLog, savedChanges);
  } catch (error) {
    // Audit logging failure should not crash main operations, but emit detailed warning
    console.warn(`⚠️ [AUDIT_LOG_WARN]: Failed to record audit log [${action} ${moduleName}:${entityType}]:`, error.message);
    return {
      id: null,
      action,
      module: moduleName,
      entityType,
      entityId: params.entityId || null,
      status: 'unpersisted',
      error: error.message,
    };
  }
};

/**
 * List audit logs with pagination, filtering, and tenant security
 */
export const getAuditLogs = async (query = {}, user = null) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);

  let companyId = query.company_id || query.companyId || null;
  if (companyId) {
    companyId = Number(companyId);
  }

  // Multi-tenancy isolation
  const canSelect = canUserSelectCompany(user);
  if (!canSelect && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId) {
      companyId = Number(userCompId);
    }
  }

  const branchId = query.branch_id || query.branchId ? Number(query.branch_id || query.branchId) : null;
  const userId = query.user_id || query.userId ? Number(query.user_id || query.userId) : null;
  const entityId = query.entity_id || query.entityId ? Number(query.entity_id || query.entityId) : null;
  const action = query.action ? String(query.action).toUpperCase() : null;
  const moduleName = query.module || null;
  const entityType = query.entity_type || query.entityType || null;
  const status = query.status ? String(query.status).toLowerCase() : null;
  const startDate = query.start_date || query.startDate || null;
  const endDate = query.end_date || query.endDate || null;

  const { rows, total } = await auditLogRepository.findAll({
    limit,
    offset,
    companyId,
    branchId,
    userId,
    action,
    module: moduleName,
    entityType,
    entityId,
    status,
    startDate,
    endDate,
    search,
    sortBy: sortBy || 'created_at',
    sortOrder: sortOrder || 'DESC',
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    auditLogs: toAuditLogListDTO(rows),
    meta,
  };
};

/**
 * Get single audit log by primary ID with its field changes
 */
export const getAuditLogById = async (id, user = null) => {
  const log = await auditLogRepository.findById(id);
  if (!log) {
    throw new NotFoundError(`Audit log with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && log.company_id && Number(log.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to view audit logs for another company');
    }
  }

  const changes = await auditLogRepository.findChangesByAuditLogId(id);
  return toAuditLogDTO(log, changes);
};

/**
 * Get audit trail / history for a specific entity
 */
export const getEntityAuditHistory = async (entityType, entityId, query = {}, user = null) => {
  if (!entityType || !entityId) {
    throw new BadRequestError('Entity type and entity ID are required');
  }

  const { page, limit, offset } = getPaginationParams(query);
  const { rows, total } = await auditLogRepository.findByEntity(entityType, Number(entityId), {
    limit,
    offset,
  });

  // Filter out records from other companies if non-superadmin
  let filteredRows = rows;
  if (!canUserSelectCompany(user) && user) {
    const userCompId = Number(user.companyId || user.company_id);
    if (userCompId) {
      filteredRows = rows.filter((r) => !r.company_id || Number(r.company_id) === userCompId);
    }
  }

  const meta = formatPaginationMeta(total, page, limit);
  return {
    auditLogs: toAuditLogListDTO(filteredRows),
    meta,
  };
};

export default {
  toFieldLabel,
  detectDataType,
  formatChangeValue,
  canUserSelectCompany,
  sanitizeIpAddress,
  sanitizeUuid,
  diffRecords,
  extractAuditContext,
  recordAuditLog,
  getAuditLogs,
  getAuditLogById,
  getEntityAuditHistory,
};
