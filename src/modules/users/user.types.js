/**
 * @typedef {Object} User
 * @property {number} id
 * @property {number} company_id
 * @property {number|null} branch_id
 * @property {number|null} employee_id
 * @property {number|null} role_id
 * @property {string} username
 * @property {string|null} email
 * @property {string|null} phone
 * @property {string} password_hash
 * @property {string|null} profile_image_url
 * @property {string} status - 'active' | 'inactive' | 'blocked' | 'locked'
 * @property {boolean} is_email_verified
 * @property {boolean} is_phone_verified
 * @property {number} failed_login_attempts
 * @property {string|null} locked_until
 * @property {string|null} last_login_at
 * @property {number} token_version
 * @property {boolean} two_factor_enabled
 * @property {number|null} created_by
 * @property {number|null} updated_by
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} UserDTO
 * @property {number} id
 * @property {number} companyId
 * @property {number|null} branchId
 * @property {number|null} employeeId
 * @property {number|null} roleId
 * @property {string} username
 * @property {string|null} email
 * @property {string|null} phone
 * @property {string|null} profileImageUrl
 * @property {string} status
 * @property {boolean} isEmailVerified
 * @property {boolean} isPhoneVerified
 * @property {string|null} lastLoginAt
 * @property {number} tokenVersion
 * @property {boolean} twoFactorEnabled
 * @property {string|null} roleCode
 * @property {string|null} roleName
 * @property {string|null} createdAt
 * @property {string|null} updatedAt
 */

export {};
