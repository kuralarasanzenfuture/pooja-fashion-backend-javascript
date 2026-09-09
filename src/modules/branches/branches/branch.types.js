/**
 * @typedef {'head_office' | 'store' | 'warehouse' | 'office' | 'showroom' | 'other'} BranchType
 * @typedef {'active' | 'inactive' | 'closed'} BranchStatus
 */

/**
 * @typedef {Object} Branch
 * @property {number} id
 * @property {number} company_id
 * @property {string} branch_code
 * @property {string} branch_name
 * @property {BranchType} branch_type
 * @property {string|null} email
 * @property {string|null} phone
 * @property {string|null} mobile
 * @property {string|null} manager_name
 * @property {string|null} opening_date
 * @property {boolean} is_main_branch
 * @property {BranchStatus} status
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef {Object} CreateBranchDTO
 * @property {number} company_id
 * @property {string} [branch_code]
 * @property {string} branch_name
 * @property {BranchType} [branch_type]
 * @property {string} [email]
 * @property {string} [phone]
 * @property {string} [mobile]
 * @property {string} [manager_name]
 * @property {string} [opening_date]
 * @property {boolean} [is_main_branch]
 * @property {BranchStatus} [status]
 */

/**
 * @typedef {Object} UpdateBranchDTO
 * @property {string} [branch_code]
 * @property {string} [branch_name]
 * @property {BranchType} [branch_type]
 * @property {string} [email]
 * @property {string} [phone]
 * @property {string} [mobile]
 * @property {string} [manager_name]
 * @property {string} [opening_date]
 * @property {boolean} [is_main_branch]
 * @property {BranchStatus} [status]
 */

/**
 * @typedef {Object} BranchResponseDTO
 * @property {number} id
 * @property {number} company_id
 * @property {string} branch_code
 * @property {string} branch_name
 * @property {BranchType} branch_type
 * @property {string|null} email
 * @property {string|null} phone
 * @property {string|null} mobile
 * @property {string|null} manager_name
 * @property {string|null} opening_date
 * @property {boolean} is_main_branch
 * @property {BranchStatus} status
 * @property {string} created_at
 * @property {string} updated_at
 * @property {Object} [company]
 */

export {};
