/**
 * Company Bank Domain Type Definitions
 * @module modules/companyBanks/types
 */

/**
 * @typedef {'savings' | 'current' | 'cash_credit' | 'overdraft' | 'other'} BankAccountType
 */

/**
 * @typedef {Object} CompanyBankEntity
 * @property {number|string} id - Unique bank record identifier
 * @property {number|string} company_id - Associated company identifier
 * @property {string} bank_name - Name of the bank
 * @property {string|null} [branch_name] - Name of the bank branch
 * @property {string} account_holder_name - Name of account holder
 * @property {string} account_number - Bank account number
 * @property {BankAccountType} account_type - Type of account (e.g. current, savings)
 * @property {string|null} [ifsc_code] - Indian Financial System Code (IFSC)
 * @property {string|null} [micr_code] - Magnetic Ink Character Recognition (MICR) code
 * @property {string|null} [swift_code] - SWIFT/BIC code for international transfers
 * @property {string|null} [bank_code] - Internal or clearing bank code
 * @property {string|null} [branch_code] - Bank branch code
 * @property {number|string} [opening_balance] - Initial opening balance (>= 0)
 * @property {number|string} [current_balance] - Running current balance
 * @property {boolean} [is_primary] - Whether this is the company's primary bank account
 * @property {boolean} [is_active] - Whether bank account is active
 * @property {Date|string} created_at - Timestamp of creation
 * @property {Date|string} updated_at - Timestamp of last update
 */

/**
 * @typedef {Object} CreateCompanyBankDTO
 * @property {number} company_id - Associated company ID
 * @property {string} bank_name - Name of the bank
 * @property {string} [branch_name] - Name of the bank branch
 * @property {string} account_holder_name - Name of account holder
 * @property {string} account_number - Bank account number
 * @property {BankAccountType} [account_type] - Type of account (default: current)
 * @property {string} [ifsc_code] - IFSC code
 * @property {string} [micr_code] - MICR code
 * @property {string} [swift_code] - SWIFT code
 * @property {string} [bank_code] - Bank code
 * @property {string} [branch_code] - Branch code
 * @property {number} [opening_balance] - Initial opening balance (default: 0)
 * @property {number} [current_balance] - Running current balance
 * @property {boolean} [is_primary] - Whether this is the primary bank account
 * @property {boolean} [is_active] - Whether bank account is active
 */

/**
 * @typedef {Partial<CreateCompanyBankDTO>} UpdateCompanyBankDTO
 */

export default {};
