/**
 * Company Bank Account Domain Type Definitions
 * @module modules/banks/companyBanks/types
 */

/**
 * @typedef {'savings' | 'current' | 'cash_credit' | 'overdraft' | 'other'} BankAccountType
 */

/**
 * @typedef {Object} CompanyBankEntity
 * @property {number|string} id - Unique company bank identifier
 * @property {number|string} company_id - Associated company ID
 * @property {number|string} bank_id - Associated bank master ID
 * @property {string} account_name - Account holder/display name
 * @property {string} account_number - Bank account number
 * @property {BankAccountType} account_type - Type of account (e.g. current, savings)
 * @property {string|null} [branch_name] - Name of branch
 * @property {string|null} [branch_code] - Branch code
 * @property {string|null} [ifsc_code] - IFSC code
 * @property {string|null} [micr_code] - MICR code
 * @property {string|null} [swift_code] - SWIFT/BIC code
 * @property {number|string} [opening_balance] - Initial opening balance (>= 0)
 * @property {number|string} [current_balance] - Current balance (>= 0)
 * @property {boolean} [is_primary] - Whether this is the company's primary bank account
 * @property {boolean} [is_active] - Whether account is active
 * @property {string|null} [notes] - Additional remarks or instructions
 * @property {Date|string} created_at - Timestamp of creation
 * @property {Date|string} updated_at - Timestamp of last update
 */

/**
 * @typedef {Object} CreateCompanyBankDTO
 * @property {number} company_id - Associated company ID
 * @property {number} bank_id - Associated bank master ID
 * @property {string} account_name - Account holder/display name
 * @property {string} account_number - Bank account number
 * @property {BankAccountType} [account_type] - Account type (default: current)
 * @property {string} [branch_name] - Branch name
 * @property {string} [branch_code] - Branch code
 * @property {string} [ifsc_code] - IFSC code
 * @property {string} [micr_code] - MICR code
 * @property {string} [swift_code] - SWIFT code
 * @property {number} [opening_balance] - Initial opening balance (default: 0)
 * @property {number} [current_balance] - Current balance
 * @property {boolean} [is_primary] - Primary account flag (default: false)
 * @property {boolean} [is_active] - Active status (default: true)
 * @property {string} [notes] - Additional notes
 */

/**
 * @typedef {Partial<CreateCompanyBankDTO>} UpdateCompanyBankDTO
 */

export default {};
