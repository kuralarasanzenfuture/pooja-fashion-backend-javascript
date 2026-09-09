/**
 * Bank Master Domain Type Definitions
 * @module modules/banks/banks/types
 */

/**
 * @typedef {'commercial' | 'cooperative' | 'regional_rural' | 'small_finance' | 'payments' | 'foreign' | 'other'} BankType
 */

/**
 * @typedef {Object} BankEntity
 * @property {number|string} id - Unique bank identifier
 * @property {string} bank_code - Unique code (e.g. HDFC, SBIN, ICIC)
 * @property {string} bank_name - Official bank name
 * @property {string|null} [short_name] - Common or shortened bank name
 * @property {string|null} [legal_name] - Full legal entity name
 * @property {BankType} bank_type - Type/classification of bank
 * @property {string|null} [logo_url] - Primary logo URL
 * @property {string|null} [logo_light_url] - Light mode logo URL
 * @property {string|null} [logo_dark_url] - Dark mode logo URL
 * @property {string|null} [website_url] - Official website URL
 * @property {string} [country_code] - ISO 2-letter country code (default: IN)
 * @property {boolean} [is_active] - Whether bank is active
 * @property {boolean} [is_verified] - Verification status
 * @property {number} [display_order] - Ordering index for UI display
 * @property {Object|null} [metadata] - Additional JSON metadata
 * @property {Date|string} created_at - Creation timestamp
 * @property {Date|string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} CreateBankDTO
 * @property {string} bank_code - Unique bank code
 * @property {string} bank_name - Official bank name
 * @property {string} [short_name] - Shortened bank name
 * @property {string} [legal_name] - Legal entity name
 * @property {BankType} [bank_type] - Bank classification (default: commercial)
 * @property {string} [logo_url] - Logo URL
 * @property {string} [logo_light_url] - Light logo URL
 * @property {string} [logo_dark_url] - Dark logo URL
 * @property {string} [website_url] - Website URL
 * @property {string} [country_code] - ISO 2-letter country code (default: IN)
 * @property {boolean} [is_active] - Active status (default: true)
 * @property {boolean} [is_verified] - Verified status (default: false)
 * @property {number} [display_order] - Display order (default: 0)
 * @property {Object} [metadata] - Additional metadata JSON
 */

/**
 * @typedef {Partial<CreateBankDTO>} UpdateBankDTO
 */

export default {};
