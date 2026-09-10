import { getDatabasePool } from '../../database/connection.js';

const getPool = () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }
  return pool;
};

/**
 * Find paginated list of roles with optional company filtering, status, and search.
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  search,
  companyId,
  isActive,
  isSystemRole,
  sortBy = 'id',
  sortOrder = 'ASC',
} = {}) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (companyId !== null && companyId !== undefined) {
    conditions.push(`company_id = $${paramIndex++}`);
    values.push(companyId);
  }

  if (isActive !== null && isActive !== undefined) {
    conditions.push(`is_active = $${paramIndex++}`);
    values.push(isActive);
  }

  if (isSystemRole !== null && isSystemRole !== undefined) {
    conditions.push(`is_system_role = $${paramIndex++}`);
    values.push(isSystemRole);
  }

  if (search) {
    conditions.push(
      `(role_name ILIKE $${paramIndex} OR role_code ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const allowedSortColumns = {
    id: 'id',
    company_id: 'company_id',
    role_code: 'role_code',
    role_name: 'role_name',
    is_system_role: 'is_system_role',
    is_active: 'is_active',
    created_at: 'created_at',
  };

  const orderColumn = allowedSortColumns[sortBy] || 'id';
  const direction = String(sortOrder).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  const countQuery = `SELECT COUNT(*) AS total FROM roles ${whereClause}`;
  const dataQuery = `
    SELECT * FROM roles
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
 * Find role by primary ID
 */
export const findById = async (id) => {
  const pool = getPool();
  const query = 'SELECT * FROM roles WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find role by company ID and role code (case-insensitive)
 */
export const findByCode = async (companyId, roleCode) => {
  const pool = getPool();
  const query = 'SELECT * FROM roles WHERE company_id = $1 AND UPPER(role_code) = UPPER($2)';
  const result = await pool.query(query, [companyId, roleCode]);
  return result.rows[0] || null;
};

/**
 * Find role by company ID and role name (case-insensitive)
 */
export const findByName = async (companyId, roleName) => {
  const pool = getPool();
  const query = 'SELECT * FROM roles WHERE company_id = $1 AND UPPER(role_name) = UPPER($2)';
  const result = await pool.query(query, [companyId, roleName]);
  return result.rows[0] || null;
};

/**
 * Find all roles belonging to a specific company
 */
export const findByCompanyId = async (companyId) => {
  const pool = getPool();
  const query = 'SELECT * FROM roles WHERE company_id = $1 ORDER BY id ASC';
  const result = await pool.query(query, [companyId]);
  return result.rows;
};

/**
 * Retrieve all existing role codes for a company
 */
export const findExistingCodesByCompanyId = async (companyId) => {
  const pool = getPool();
  const query = 'SELECT role_code FROM roles WHERE company_id = $1';
  const result = await pool.query(query, [companyId]);
  return result.rows.map((row) => row.role_code);
};

/**
 * Check if role code exists within a company
 */
export const existsByCode = async (companyId, roleCode, excludeId = null) => {
  const pool = getPool();
  let query = 'SELECT id FROM roles WHERE company_id = $1 AND UPPER(role_code) = UPPER($2)';
  const params = [companyId, roleCode];

  if (excludeId) {
    query += ' AND id != $3';
    params.push(excludeId);
  }

  const result = await pool.query(query, params);
  return result.rowCount > 0;
};

/**
 * Check if role name exists within a company
 */
export const existsByName = async (companyId, roleName, excludeId = null) => {
  const pool = getPool();
  let query = 'SELECT id FROM roles WHERE company_id = $1 AND UPPER(role_name) = UPPER($2)';
  const params = [companyId, roleName];

  if (excludeId) {
    query += ' AND id != $3';
    params.push(excludeId);
  }

  const result = await pool.query(query, params);
  return result.rowCount > 0;
};

/**
 * Insert a new role record
 */
export const create = async (data) => {
  const pool = getPool();
  const columns = [
    'company_id',
    'role_code',
    'role_name',
    'description',
    'is_system_role',
    'is_active',
  ];

  const values = [
    data.company_id,
    data.role_code.toUpperCase(),
    data.role_name,
    data.description || null,
    data.is_system_role !== undefined ? Boolean(data.is_system_role) : false,
    data.is_active !== undefined ? Boolean(data.is_active) : true,
  ];

  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  const query = `
    INSERT INTO roles (${columns.join(', ')})
    VALUES (${placeholders})
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Bulk insert roles (idempotent ON CONFLICT DO NOTHING for company_id, role_code)
 */
export const bulkCreate = async (rolesList) => {
  if (!Array.isArray(rolesList) || rolesList.length === 0) {
    return [];
  }

  const pool = getPool();
  const client = await pool.connect();
  const created = [];

  try {
    await client.query('BEGIN');
    for (const role of rolesList) {
      const query = `
        INSERT INTO roles (company_id, role_code, role_name, description, is_system_role, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (company_id, role_code) 
        DO UPDATE SET 
          role_name = EXCLUDED.role_name,
          description = COALESCE(roles.description, EXCLUDED.description),
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
      const values = [
        role.company_id,
        role.role_code.toUpperCase(),
        role.role_name,
        role.description || null,
        role.is_system_role !== undefined ? Boolean(role.is_system_role) : false,
        role.is_active !== undefined ? Boolean(role.is_active) : true,
      ];
      const res = await client.query(query, values);
      if (res.rows[0]) {
        created.push(res.rows[0]);
      }
    }
    await client.query('COMMIT');
    return created;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update an existing role record
 */
export const update = async (id, data) => {
  const pool = getPool();
  const allowedFields = ['role_code', 'role_name', 'description', 'is_active'];
  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      const val = field === 'role_code' ? data[field].toUpperCase() : data[field];
      setClauses.push(`${field} = $${paramIndex++}`);
      values.push(val);
    }
  }

  if (setClauses.length === 0) {
    return findById(id);
  }

  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const query = `
    UPDATE roles
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

/**
 * Update role active status
 */
export const updateStatus = async (id, isActive) => {
  const pool = getPool();
  const query = `
    UPDATE roles
    SET is_active = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [Boolean(isActive), id]);
  return result.rows[0] || null;
};

/**
 * Delete role by ID
 */
export const deleteRole = async (id) => {
  const pool = getPool();
  const query = 'DELETE FROM roles WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export default {
  findAll,
  findById,
  findByCode,
  findByName,
  findByCompanyId,
  findExistingCodesByCompanyId,
  existsByCode,
  existsByName,
  create,
  bulkCreate,
  update,
  updateStatus,
  deleteRole,
  delete: deleteRole,
};
