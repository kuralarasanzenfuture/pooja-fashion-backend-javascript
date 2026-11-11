/**
 * Map database audit_log_changes row to client DTO format
 *
 * @param {Object} row
 * @returns {Object|null}
 */
export const toAuditLogChangeDTO = (row) => {
  if (!row) return null;

  return {
    id: Number(row.id),
    auditLogId: Number(row.audit_log_id),
    audit_log_id: Number(row.audit_log_id),
    fieldName: row.field_name,
    field_name: row.field_name,
    fieldLabel: row.field_label || null,
    field_label: row.field_label || null,
    dataType: row.data_type || null,
    data_type: row.data_type || null,
    oldValue: row.old_value !== undefined ? row.old_value : null,
    old_value: row.old_value !== undefined ? row.old_value : null,
    newValue: row.new_value !== undefined ? row.new_value : null,
    new_value: row.new_value !== undefined ? row.new_value : null,
    createdAt: row.created_at,
    created_at: row.created_at,
  };
};

/**
 * Map list of audit_log_changes rows
 *
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
export const toAuditLogChangeListDTO = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map(toAuditLogChangeDTO).filter(Boolean);
};

/**
 * Parse JSON safely if column returned as string
 */
const safeParseJson = (val) => {
  if (!val) return null;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
};

/**
 * Map database audit_logs row to client DTO format
 *
 * @param {Object} row
 * @param {Array<Object>} [changes]
 * @returns {Object|null}
 */
export const toAuditLogDTO = (row, changes = null) => {
  if (!row) return null;

  const dto = {
    id: Number(row.id),
    companyId: row.company_id ? Number(row.company_id) : null,
    company_id: row.company_id ? Number(row.company_id) : null,
    companyName: row.company_name || null,
    company_name: row.company_name || null,
    companyCode: row.company_code || null,
    company_code: row.company_code || null,
    branchId: row.branch_id ? Number(row.branch_id) : null,
    branch_id: row.branch_id ? Number(row.branch_id) : null,
    branchName: row.branch_name || null,
    branch_name: row.branch_name || null,
    userId: row.user_id ? Number(row.user_id) : null,
    user_id: row.user_id ? Number(row.user_id) : null,
    userEmail: row.user_email || null,
    user_email: row.user_email || null,
    employeeId: row.employee_id ? Number(row.employee_id) : null,
    employee_id: row.employee_id ? Number(row.employee_id) : null,
    sessionId: row.session_id || null,
    session_id: row.session_id || null,
    action: row.action,
    module: row.module,
    entityType: row.entity_type,
    entity_type: row.entity_type,
    entityId: row.entity_id ? Number(row.entity_id) : null,
    entity_id: row.entity_id ? Number(row.entity_id) : null,
    entityName: row.entity_name || null,
    entity_name: row.entity_name || null,
    description: row.description || null,
    oldData: safeParseJson(row.old_data),
    old_data: safeParseJson(row.old_data),
    newData: safeParseJson(row.new_data),
    new_data: safeParseJson(row.new_data),
    changeData: safeParseJson(row.change_data),
    change_data: safeParseJson(row.change_data),
    requestId: row.request_id || null,
    request_id: row.request_id || null,
    requestMethod: row.request_method || null,
    request_method: row.request_method || null,
    requestUrl: row.request_url || null,
    request_url: row.request_url || null,
    ipAddress: row.ip_address || null,
    ip_address: row.ip_address || null,
    userAgent: row.user_agent || null,
    user_agent: row.user_agent || null,
    deviceType: row.device_type || null,
    device_type: row.device_type || null,
    deviceName: row.device_name || null,
    device_name: row.device_name || null,
    operatingSystem: row.operating_system || null,
    operating_system: row.operating_system || null,
    browser: row.browser || null,
    browserVersion: row.browser_version || null,
    browser_version: row.browser_version || null,
    status: row.status || 'success',
    errorMessage: row.error_message || null,
    error_message: row.error_message || null,
    createdAt: row.created_at,
    created_at: row.created_at,
  };

  if (changes && Array.isArray(changes)) {
    dto.changes = toAuditLogChangeListDTO(changes);
  }

  return dto;
};

/**
 * Map list of audit_logs rows
 *
 * @param {Array<Object>} rows
 * @returns {Array<Object>}
 */
export const toAuditLogListDTO = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => toAuditLogDTO(r)).filter(Boolean);
};

export default {
  toAuditLogChangeDTO,
  toAuditLogChangeListDTO,
  toAuditLogDTO,
  toAuditLogListDTO,
};

