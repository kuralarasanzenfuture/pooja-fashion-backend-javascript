/**
 * @typedef {'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'ACTIVATE' | 'DEACTIVATE' | 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'PASSWORD_CHANGE' | 'PASSWORD_RESET' | 'APPROVE' | 'REJECT' | 'SUBMIT' | 'CANCEL' | 'EXPORT' | 'IMPORT' | 'DOWNLOAD' | 'UPLOAD' | 'PRINT' | 'VIEW'} AuditAction
 */

/**
 * @typedef {'success' | 'failed'} AuditStatus
 */

/**
 * @typedef {Object} AuditClientInfo
 * @property {string|null} [ipAddress]
 * @property {string|null} [userAgent]
 * @property {string|null} [browser]
 * @property {string|null} [browserVersion]
 * @property {string|null} [operatingSystem]
 * @property {string|null} [osVersion]
 * @property {string|null} [deviceType]
 * @property {string|null} [deviceName]
 */

/**
 * @typedef {Object} AuditRequestContext
 * @property {string|null} [requestId]
 * @property {string|null} [method]
 * @property {string|null} [url]
 * @property {string|null} [ipAddress]
 * @property {string|null} [userAgent]
 * @property {string|null} [browser]
 * @property {string|null} [browserVersion]
 * @property {string|null} [operatingSystem]
 * @property {string|null} [deviceType]
 * @property {string|null} [deviceName]
 * @property {Object} [user]
 */

/**
 * @typedef {Object} AuditLogChangeRecord
 * @property {string} field_name
 * @property {string|null} [field_label]
 * @property {string|null} [data_type]
 * @property {string|null} [old_value]
 * @property {string|null} [new_value]
 */

/**
 * @typedef {Object} RecordAuditLogParams
 * @property {number|string|null} [companyId]
 * @property {number|string|null} [branchId]
 * @property {number|string|null} [userId]
 * @property {number|string|null} [employeeId]
 * @property {string|null} [sessionId]
 * @property {AuditAction} action
 * @property {string} module
 * @property {string} entityType
 * @property {number|string|null} [entityId]
 * @property {string|null} [entityName]
 * @property {string|null} [description]
 * @property {Object|null} [oldData]
 * @property {Object|null} [newData]
 * @property {Object|null} [changeData]
 * @property {AuditLogChangeRecord[]} [changes]
 * @property {AuditRequestContext|import('express').Request|null} [requestContext]
 * @property {AuditStatus} [status]
 * @property {string|null} [errorMessage]
 */

export default {};

