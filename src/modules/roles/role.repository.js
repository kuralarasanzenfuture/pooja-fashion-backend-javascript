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
 * Supports multi-tenant role inheritance (company roles + global system roles).
 */
export const findAll = async ({
  limit = 10,
  offset = 0,
  search,
  companyId,
  isActive,
  isSystemRole,
  includeGlobal = true,
  sortBy = 'id',
  sortOrder = 'ASC',
} = {}) => {
  const pool = getPool();
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  // 1. System Role Scope filtering:
  const isSysBool = isSystemRole === true || isSystemRole === 'true' || isSystemRole === 1 || isSystemRole === '1';
  const isCustomBool = isSystemRole === false || isSystemRole === 'false' || isSystemRole === 0 || isSystemRole === '0';

  if (isSystemRole !== null && isSystemRole !== undefined && isSysBool) {
    conditions.push('roles.is_system_role = TRUE');
  } else if (isSystemRole !== null && isSystemRole !== undefined && isCustomBool) {
    conditions.push('roles.is_system_role = FALSE');
    if (companyId !== null && companyId !== undefined) {
      conditions.push(`roles.company_id = $${paramIndex++}`);
      values.push(companyId);
    }
  } else if (companyId !== null && companyId !== undefined) {
    if (includeGlobal) {
      conditions.push(
        `(roles.company_id = $${paramIndex++} OR (roles.is_system_role = TRUE AND roles.company_id IS NULL))`
      );
      values.push(companyId);
    } else {
      conditions.push(`roles.company_id = $${paramIndex++}`);
      values.push(companyId);
    }
  }

  // 2. Active status filtering:
  if (isActive !== null && isActive !== undefined && isActive !== '') {
    const activeBool = isActive === true || isActive === 'true' || isActive === 1 || isActive === '1';
    conditions.push(`roles.is_active = $${paramIndex++}`);
    values.push(activeBool);
  }

  // 3. Search query:
  if (search) {
    conditions.push(
      `(roles.role_name ILIKE $${paramIndex} OR roles.role_code ILIKE $${paramIndex} OR roles.description ILIKE $${paramIndex} OR companies.company_name ILIKE $${paramIndex})`
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

  const countQuery = `
    SELECT COUNT(*) AS total 
    FROM roles 
    LEFT JOIN companies ON roles.company_id = companies.id
    ${whereClause}
  `;
  const dataQuery = `
    SELECT roles.*, companies.company_name AS company_name 
    FROM roles 
    LEFT JOIN companies ON roles.company_id = companies.id
    ${whereClause}
    ORDER BY roles.${orderColumn} ${direction}
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
  const query = `
    SELECT roles.*, companies.company_name AS company_name 
    FROM roles 
    LEFT JOIN companies ON roles.company_id = companies.id 
    WHERE roles.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

/**
 * Find role by company ID and role code
 * If companyId is supplied, searches company-specific role first, then falls back to global system role.
 */
export const findByCode = async (companyId, roleCode) => {
  const pool = getPool();
  if (companyId) {
    const query = `
      SELECT * FROM roles 
      WHERE (company_id = $1 OR (is_system_role = TRUE AND company_id IS NULL))
        AND LOWER(role_code) = LOWER($2)
      ORDER BY company_id ASC NULLS LAST
      LIMIT 1
    `;
    const result = await pool.query(query, [companyId, roleCode]);
    return result.rows[0] || null;
  }

  const query = 'SELECT * FROM roles WHERE company_id IS NULL AND LOWER(role_code) = LOWER($1)';
  const result = await pool.query(query, [roleCode]);
  return result.rows[0] || null;
};

/**
 * Find role by company ID and role name
 */
export const findByName = async (companyId, roleName) => {
  const pool = getPool();
  if (companyId) {
    const query = `
      SELECT * FROM roles 
      WHERE (company_id = $1 OR (is_system_role = TRUE AND company_id IS NULL))
        AND LOWER(role_name) = LOWER($2)
      ORDER BY company_id ASC NULLS LAST
      LIMIT 1
    `;
    const result = await pool.query(query, [companyId, roleName]);
    return result.rows[0] || null;
  }

  const query = 'SELECT * FROM roles WHERE company_id IS NULL AND LOWER(role_name) = LOWER($1)';
  const result = await pool.query(query, [roleName]);
  return result.rows[0] || null;
};

/**
 * Find all roles belonging to or accessible by a specific company (includes global system roles)
 */
export const findByCompanyId = async (companyId, includeGlobal = true) => {
  const pool = getPool();
  let query;
  let params;

  if (includeGlobal) {
    query = `
      SELECT roles.*, companies.company_name AS company_name 
      FROM roles 
      LEFT JOIN companies ON roles.company_id = companies.id 
      WHERE roles.company_id = $1 OR (roles.is_system_role = TRUE AND roles.company_id IS NULL)
      ORDER BY roles.is_system_role DESC, roles.id ASC
    `;
    params = [companyId];
  } else {
    query = `
      SELECT roles.*, companies.company_name AS company_name 
      FROM roles 
      LEFT JOIN companies ON roles.company_id = companies.id 
      WHERE roles.company_id = $1 
      ORDER BY roles.id ASC
    `;
    params = [companyId];
  }

  const result = await pool.query(query, params);
  return result.rows;
};

/**
 * Retrieve all existing role codes for a company (including global role codes) to avoid collisions
 */
export const findExistingCodesByCompanyId = async (companyId) => {
  const pool = getPool();
  const query = 'SELECT role_code FROM roles WHERE company_id = $1 OR company_id IS NULL';
  const result = await pool.query(query, [companyId]);
  return result.rows.map((row) => row.role_code);
};

/**
 * Check if role code exists within a company (or globally if companyId is null)
 */
export const existsByCode = async (companyId, roleCode, excludeId = null) => {
  const pool = getPool();
  let query;
  const params = [];

  if (companyId === null || companyId === undefined) {
    query = 'SELECT id FROM roles WHERE company_id IS NULL AND LOWER(role_code) = LOWER($1)';
    params.push(roleCode);
  } else {
    query = 'SELECT id FROM roles WHERE (company_id = $1 OR (is_system_role = TRUE AND company_id IS NULL)) AND LOWER(role_code) = LOWER($2)';
    params.push(companyId, roleCode);
  }

  if (excludeId) {
    query += ` AND id != $${params.length + 1}`;
    params.push(excludeId);
  }

  const result = await pool.query(query, params);
  return result.rowCount > 0;
};

/**
 * Check if role name exists within a company (or globally if companyId is null)
 */
export const existsByName = async (companyId, roleName, excludeId = null) => {
  const pool = getPool();
  let query;
  const params = [];

  if (companyId === null || companyId === undefined) {
    query = 'SELECT id FROM roles WHERE company_id IS NULL AND LOWER(role_name) = LOWER($1)';
    params.push(roleName);
  } else {
    query = 'SELECT id FROM roles WHERE (company_id = $1 OR (is_system_role = TRUE AND company_id IS NULL)) AND LOWER(role_name) = LOWER($2)';
    params.push(companyId, roleName);
  }

  if (excludeId) {
    query += ` AND id != $${params.length + 1}`;
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
  const isSystem = data.is_system_role !== undefined ? Boolean(data.is_system_role) : false;
  // chk_roles_system_scope constraint enforcement:
  // if system role => company_id must be null
  // if custom role => company_id must be provided
  const companyId = isSystem ? null : data.company_id || null;

  const columns = [
    'company_id',
    'role_code',
    'role_name',
    'description',
    'is_system_role',
    'is_active',
    'created_by',
    'updated_by',
  ];

  const values = [
    companyId,
    data.role_code.toUpperCase(),
    data.role_name,
    data.description || null,
    isSystem,
    data.is_active !== undefined ? Boolean(data.is_active) : true,
    data.created_by || null,
    data.updated_by || null,
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
 * Update an existing role record
 */
export const update = async (id, data) => {
  const pool = getPool();
  const allowedFields = ['role_code', 'role_name', 'description', 'is_active', 'updated_by'];
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
    RETURNING roles.*, (SELECT company_name FROM companies WHERE companies.id = roles.company_id) AS company_name
  `;
  const result = await pool.query(query, [Boolean(isActive), id]);
  return result.rows[0] || null;
};

/**
 * Cascade: Deactivate all users assigned to a given role and revoke their active tokens
 */
export const deactivateUsersByRoleId = async (roleId, updatedBy = null) => {
  const pool = getPool();
  const query = `
    UPDATE users
    SET status = 'inactive',
        token_version = token_version + 1,
        updated_at = CURRENT_TIMESTAMP,
        updated_by = COALESCE($2, updated_by)
    WHERE role_id = $1 AND status != 'inactive'
    RETURNING id
  `;
  const result = await pool.query(query, [roleId, updatedBy]);

  if (result.rowCount > 0) {
    const userIds = result.rows.map((row) => row.id);
    await pool.query(
      'DELETE FROM user_refresh_tokens WHERE user_id = ANY($1::bigint[])',
      [userIds]
    );
  }

  return result.rowCount;
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
  update,
  updateStatus,
  deleteRole,
  delete: deleteRole,
};
