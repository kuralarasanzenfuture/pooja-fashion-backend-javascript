/**
 * @typedef {Object} Role
 * @property {number} id
 * @property {number} company_id
 * @property {string} role_code
 * @property {string} role_name
 * @property {string|null} description
 * @property {boolean} is_system_role
 * @property {boolean} is_active
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} RoleDTO
 * @property {number} id
 * @property {number} companyId
 * @property {string} roleCode
 * @property {string} roleName
 * @property {string|null} description
 * @property {boolean} isSystemRole
 * @property {boolean} isActive
 * @property {string|null} createdAt
 * @property {string|null} updatedAt
 */

/**
 * @typedef {Object} CreateRoleInput
 * @property {number} company_id
 * @property {string} [role_code]
 * @property {string} role_name
 * @property {string} [description]
 * @property {boolean} [is_system_role]
 * @property {boolean} [is_active]
 */

/**
 * @typedef {Object} UpdateRoleInput
 * @property {string} [role_code]
 * @property {string} [role_name]
 * @property {string|null} [description]
 * @property {boolean} [is_active]
 */

export {};
