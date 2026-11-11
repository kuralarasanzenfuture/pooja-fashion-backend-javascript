import { getDatabasePool } from '../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

/**
 * Insert a primary audit log entry into `audit_logs`
 *
 * @param {Object} logData
 * @returns {Promise<Object|null>}
 */
export const insertAuditLog = async (logData) => {
  const pool = getPool();
  const query = `
    INSERT INTO audit_logs (
      company_id,
      branch_id,
      user_id,
      employee_id,
      session_id,
      action,
      module,
      entity_type,
      entity_id,
      entity_name,
      description,
      old_data,
      new_data,
      change_data,
      request_id,
      request_method,
      request_url,
      ip_address,
      user_agent,
      device_type,
      device_name,
      operating_system,
      browser,
      browser_version,
      status,
      error_message
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15,
      $16, $17, $18, $19, $20,
      $21, $22, $23, $24, $25,
      $26
    )
    RETURNING *
  `;

  const values = [
    logData.company_id || null,
    logData.branch_id || null,
    logData.user_id || null,
    logData.employee_id || null,
    logData.session_id || null,
    logData.action,
    logData.module,
    logData.entity_type,
    logData.entity_id || null,
    logData.entity_name || null,
    logData.description || null,
    logData.old_data ? JSON.stringify(logData.old_data) : null,
    logData.new_data ? JSON.stringify(logData.new_data) : null,
    logData.change_data ? JSON.stringify(logData.change_data) : null,
    logData.request_id || null,
    logData.request_method || null,
    logData.request_url || null,
    logData.ip_address || null,
    logData.user_agent || null,
    logData.device_type || null,
    logData.device_name || null,
    logData.operating_system || null,
    logData.browser || null,
    logData.browser_version || null,
    logData.status || 'success',
    logData.error_message || null,
  ];

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

/**
 * Bulk insert field changes into `audit_log_changes`
 *
 * @param {Array<{audit_log_id: number|string, field_name: string, field_label?: string, data_type?: string, old_value?: string, new_value?: string}>} changes
 * @returns {Promise<Array<Object>>}
 */
export const insertAuditLogChanges = async (changes = []) => {
  if (!Array.isArray(changes) || changes.length === 0) {
    return [];
  }

  const pool = getPool();
  const valueRows = [];
  const flatValues = [];
  let paramIndex = 1;

  for (const item of changes) {
    valueRows.push(
      `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
    );
    flatValues.push(
      item.audit_log_id,
      item.field_name,
      item.field_label || null,
      item.data_type || null,
      item.old_value !== undefined && item.old_value !== null ? String(item.old_value) : null,
      item.new_value !== undefined && item.new_value !== null ? String(item.new_value) : null
    );
  }

  const query = `
    INSERT INTO audit_log_changes (
      audit_log_id,
      field_name,
      field_label,
      data_type,
      old_value,
      new_value
    ) VALUES ${valueRows.join(', ')}
    RETURNING *
  `;

  const result = await pool.query(query, flatValues);
  return result.rows;
};

/**
 * Find paginated list of audit logs with multi-tenancy and filters
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  companyId = null,
  branchId = null,
  userId = null,
  action = null,
  module = null,
  entityType = null,
  entityId = null,
  status = null,
  startDate = null,
  endDate = null,
  search = null,
  sortBy = 'created_at',
  sortOrder = 'DESC',
} = {}) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (companyId !== null && companyId !== undefined) {
    conditions.push(`al.company_id = $${paramIndex++}`);
    values.push(companyId);
  }

  if (branchId !== null && branchId !== undefined) {
    conditions.push(`al.branch_id = $${paramIndex++}`);
    values.push(branchId);
  }

  if (userId !== null && userId !== undefined) {
    conditions.push(`al.user_id = $${paramIndex++}`);
    values.push(userId);
  }

  if (action) {
    conditions.push(`al.action = $${paramIndex++}`);
    values.push(String(action).toUpperCase());
  }

  if (module) {
    conditions.push(`LOWER(al.module) = LOWER($${paramIndex++})`);
    values.push(module);
  }

  if (entityType) {
    conditions.push(`LOWER(al.entity_type) = LOWER($${paramIndex++})`);
    values.push(entityType);
  }

  if (entityId !== null && entityId !== undefined) {
    conditions.push(`al.entity_id = $${paramIndex++}`);
    values.push(entityId);
  }

  if (status) {
    conditions.push(`al.status = $${paramIndex++}`);
    values.push(String(status).toLowerCase());
  }

  if (startDate) {
    conditions.push(`al.created_at >= $${paramIndex++}`);
    values.push(startDate);
  }

  if (endDate) {
    conditions.push(`al.created_at <= $${paramIndex++}`);
    values.push(endDate);
  }

  if (search) {
    conditions.push(
      `(al.entity_name ILIKE $${paramIndex} OR al.description ILIKE $${paramIndex} OR al.module ILIKE $${paramIndex} OR al.request_url ILIKE $${paramIndex} OR al.request_id ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'al.id',
    created_at: 'al.created_at',
    action: 'al.action',
    module: 'al.module',
    entity_type: 'al.entity_type',
    status: 'al.status',
    company_id: 'al.company_id',
  };

  const orderColumn = allowedSortColumns[sortBy] || 'al.created_at';
  const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM audit_logs al
    ${whereClause}
  `;

  const dataQuery = `
    SELECT 
      al.*,
      c.company_name,
      c.company_code,
      b.branch_name,
      b.branch_code,
      u.email AS user_email
    FROM audit_logs al
    LEFT JOIN companies c ON c.id = al.company_id
    LEFT JOIN branches b ON b.id = al.branch_id
    LEFT JOIN users u ON u.id = al.user_id
    ${whereClause}
    ORDER BY ${orderColumn} ${direction}
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;

  const [countResult, dataResult] = await Promise.all([
    pool.query(countQuery, values),
    pool.query(dataQuery, [...values, limit, offset]),
  ]);

  const total = parseInt(countResult.rows[0]?.total || 0, 10);
  return { rows: dataResult.rows, total };
};

/**
 * Find single audit log by primary ID
 */
export const findById = async (id) => {
  const pool = getPool();
  const query = `
    SELECT 
      al.*,
      c.company_name,
      c.company_code,
      b.branch_name,
      b.branch_code,
      u.email AS user_email
    FROM audit_logs al
    LEFT JOIN companies c ON c.id = al.company_id
    LEFT JOIN branches b ON b.id = al.branch_id
    LEFT JOIN users u ON u.id = al.user_id
    WHERE al.id = $1
    LIMIT 1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find all detailed field changes associated with an audit log ID
 */
export const findChangesByAuditLogId = async (auditLogId) => {
  const pool = getPool();
  const query = `
    SELECT *
    FROM audit_log_changes
    WHERE audit_log_id = $1
    ORDER BY id ASC
  `;
  const result = await pool.query(query, [auditLogId]);
  return result.rows;
};

/**
 * Find audit log history for a specific entity
 */
export const findByEntity = async (entityType, entityId, { limit = 50, offset = 0 } = {}) => {
  const pool = getPool();
  const query = `
    SELECT 
      al.*,
      c.company_name,
      c.company_code,
      u.email AS user_email
    FROM audit_logs al
    LEFT JOIN companies c ON c.id = al.company_id
    LEFT JOIN users u ON u.id = al.user_id
    WHERE LOWER(al.entity_type) = LOWER($1) AND al.entity_id = $2
    ORDER BY al.created_at DESC
    LIMIT $3 OFFSET $4
  `;
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM audit_logs
    WHERE LOWER(entity_type) = LOWER($1) AND entity_id = $2
  `;

  const [countResult, dataResult] = await Promise.all([
    pool.query(countQuery, [entityType, entityId]),
    pool.query(query, [entityType, entityId, limit, offset]),
  ]);

  const total = parseInt(countResult.rows[0]?.total || 0, 10);
  return { rows: dataResult.rows, total };
};

export default {
  insertAuditLog,
  insertAuditLogChanges,
  findAll,
  findById,
  findChangesByAuditLogId,
  findByEntity,
};

