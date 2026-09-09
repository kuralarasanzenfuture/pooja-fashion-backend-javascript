/**
 * @typedef {Object} BranchContact
 * @property {number} id
 * @property {number} branch_id
 * @property {string} contact_name
 * @property {string|null} designation
 * @property {string|null} email
 * @property {string|null} phone
 * @property {string|null} mobile
 * @property {boolean} is_primary
 * @property {boolean} is_active
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef {Object} CreateBranchContactDTO
 * @property {number} branch_id
 * @property {string} contact_name
 * @property {string} [designation]
 * @property {string} [email]
 * @property {string} [phone]
 * @property {string} [mobile]
 * @property {boolean} [is_primary]
 * @property {boolean} [is_active]
 */

/**
 * @typedef {Object} UpdateBranchContactDTO
 * @property {string} [contact_name]
 * @property {string} [designation]
 * @property {string} [email]
 * @property {string} [phone]
 * @property {string} [mobile]
 * @property {boolean} [is_primary]
 * @property {boolean} [is_active]
 */

/**
 * @typedef {Object} BranchContactResponseDTO
 * @property {number} id
 * @property {number} branch_id
 * @property {string} contact_name
 * @property {string|null} designation
 * @property {string|null} email
 * @property {string|null} phone
 * @property {string|null} mobile
 * @property {boolean} is_primary
 * @property {boolean} is_active
 * @property {string} created_at
 * @property {string} updated_at
 * @property {Object} [branch]
 */

export {};
