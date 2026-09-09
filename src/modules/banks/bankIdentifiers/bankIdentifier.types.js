/**
 * Bank Identifier Domain Type Definitions
 * @module modules/banks/bankIdentifiers/types
 */

/**
 * @typedef {'ifsc' | 'micr' | 'swift' | 'bank_code' | 'routing_number' | 'other'} IdentifierType
 */

/**
 * @typedef {Object} BankIdentifierEntity
 * @property {number|string} id - Unique identifier ID
 * @property {number|string} bank_id - Associated bank ID
 * @property {IdentifierType} identifier_type - Type of routing identifier
 * @property {string} identifier_value - The code (e.g. IFSC/SWIFT code)
 * @property {string|null} [branch_name] - Name of branch
 * @property {string|null} [city] - City
 * @property {string|null} [state] - State
 * @property {boolean} [is_active] - Active status
 * @property {Date|string} created_at - Timestamp of creation
 * @property {Date|string} updated_at - Timestamp of last update
 */

/**
 * @typedef {Object} CreateBankIdentifierDTO
 * @property {number} bank_id - Associated bank ID
 * @property {IdentifierType} identifier_type - Type of routing identifier
 * @property {string} identifier_value - The code value
 * @property {string} [branch_name] - Name of branch
 * @property {string} [city] - City
 * @property {string} [state] - State
 * @property {boolean} [is_active] - Active status
 */

/**
 * @typedef {Partial<CreateBankIdentifierDTO>} UpdateBankIdentifierDTO
 */

export default {};
