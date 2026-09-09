/**
 * Company Domain Type Definitions
 * @module modules/companies/types
 */

/**
 * @typedef {'active' | 'inactive' | 'suspended'} CompanyStatus
 */

/**
 * @typedef {Object} CompanyEntity
 * @property {number|string} id - Unique identifier
 * @property {string} company_code - Unique code (e.g. PFS001)
 * @property {string} company_name - Registered legal or trade company name
 * @property {string|null} [legal_name] - Formal corporate name
 * @property {string|null} [display_name] - Name displayed on receipts/POS
 * @property {string|null} [business_type] - e.g. Retail, Wholesale, Manufacturing
 * @property {string|null} [industry_type] - e.g. Fashion & Garments
 * @property {string|null} [registration_number] - CIN/LLPIN/Business registration
 * @property {string|null} [email] - Official email
 * @property {string|null} [phone] - Landline/office phone
 * @property {string|null} [mobile] - Mobile phone
 * @property {string|null} [website] - Official website URL
 * @property {string|null} [logo_url] - Logo asset URL or relative path
 * @property {string} [default_currency] - ISO 4217 Currency Code (default: INR)
 * @property {string} [country_code] - ISO 3166-1 alpha-2 code (default: IN)
 * @property {string} [timezone] - IANA Timezone (default: Asia/Kolkata)
 * @property {number} [financial_year_start_month] - 1 to 12 (default: 4 for April)
 * @property {CompanyStatus} [status] - Company status
 * @property {Date|string} created_at - Timestamp of creation
 * @property {Date|string} updated_at - Timestamp of last update
 */

/**
 * @typedef {Object} CreateCompanyDTO
 * @property {string} company_code
 * @property {string} company_name
 * @property {string} [legal_name]
 * @property {string} [display_name]
 * @property {string} [business_type]
 * @property {string} [industry_type]
 * @property {string} [registration_number]
 * @property {string} [email]
 * @property {string} [phone]
 * @property {string} [mobile]
 * @property {string} [website]
 * @property {string} [logo_url]
 * @property {string} [default_currency]
 * @property {string} [country_code]
 * @property {string} [timezone]
 * @property {number} [financial_year_start_month]
 * @property {CompanyStatus} [status]
 */

/**
 * @typedef {Partial<CreateCompanyDTO>} UpdateCompanyDTO
 */

export default {};
