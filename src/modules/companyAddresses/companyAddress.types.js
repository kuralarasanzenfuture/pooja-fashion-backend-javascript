/**
 * Company Address Domain Type Definitions
 * @module modules/companyAddresses/types
 */

/**
 * @typedef {'registered' | 'head_office' | 'billing' | 'warehouse' | 'other'} AddressType
 */

/**
 * @typedef {Object} CompanyAddressEntity
 * @property {number|string} id - Unique address identifier
 * @property {number|string} company_id - Associated company identifier
 * @property {AddressType} address_type - Purpose/type of address
 * @property {string} address_line_1 - Primary street address line
 * @property {string|null} [address_line_2] - Secondary street address line
 * @property {string|null} [city] - City or town
 * @property {string|null} [district] - District or county
 * @property {string|null} [state] - State or province
 * @property {string|null} [postal_code] - Postal/PIN code
 * @property {string} [country] - Country (default: India)
 * @property {string|null} [landmark] - Nearby landmark
 * @property {boolean} [is_primary] - Whether this is the primary address
 * @property {boolean} [is_active] - Whether this address is active
 * @property {Date|string} created_at - Timestamp of creation
 * @property {Date|string} updated_at - Timestamp of last update
 */

/**
 * @typedef {Object} CreateCompanyAddressDTO
 * @property {number} company_id - Associated company ID
 * @property {AddressType} address_type - Purpose/type of address
 * @property {string} address_line_1 - Primary street address line
 * @property {string} [address_line_2] - Secondary street address line
 * @property {string} [city] - City or town
 * @property {string} [district] - District or county
 * @property {string} [state] - State or province
 * @property {string} [postal_code] - Postal/PIN code
 * @property {string} [country] - Country (default: India)
 * @property {string} [landmark] - Nearby landmark
 * @property {boolean} [is_primary] - Whether this is the primary address
 * @property {boolean} [is_active] - Whether this address is active
 */

/**
 * @typedef {Partial<CreateCompanyAddressDTO>} UpdateCompanyAddressDTO
 */

export default {};
