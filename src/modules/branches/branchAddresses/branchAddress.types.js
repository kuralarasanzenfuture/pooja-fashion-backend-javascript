/**
 * @typedef {Object} BranchAddress
 * @property {number} id
 * @property {number} branch_id
 * @property {string} address_line_1
 * @property {string|null} address_line_2
 * @property {string|null} city
 * @property {string|null} district
 * @property {string|null} state
 * @property {string|null} postal_code
 * @property {string} country
 * @property {string|null} landmark
 * @property {boolean} is_primary
 * @property {boolean} is_active
 * @property {Date} created_at
 * @property {Date} updated_at
 */

/**
 * @typedef {Object} CreateBranchAddressDTO
 * @property {number} branch_id
 * @property {string} address_line_1
 * @property {string} [address_line_2]
 * @property {string} [city]
 * @property {string} [district]
 * @property {string} [state]
 * @property {string} [postal_code]
 * @property {string} [country]
 * @property {string} [landmark]
 * @property {boolean} [is_primary]
 * @property {boolean} [is_active]
 */

/**
 * @typedef {Object} UpdateBranchAddressDTO
 * @property {string} [address_line_1]
 * @property {string} [address_line_2]
 * @property {string} [city]
 * @property {string} [district]
 * @property {string} [state]
 * @property {string} [postal_code]
 * @property {string} [country]
 * @property {string} [landmark]
 * @property {boolean} [is_primary]
 * @property {boolean} [is_active]
 */

/**
 * @typedef {Object} BranchAddressResponseDTO
 * @property {number} id
 * @property {number} branch_id
 * @property {string} address_line_1
 * @property {string|null} address_line_2
 * @property {string|null} city
 * @property {string|null} district
 * @property {string|null} state
 * @property {string|null} postal_code
 * @property {string} country
 * @property {string|null} landmark
 * @property {boolean} is_primary
 * @property {boolean} is_active
 * @property {string} created_at
 * @property {string} updated_at
 * @property {Object} [branch]
 */

export {};
