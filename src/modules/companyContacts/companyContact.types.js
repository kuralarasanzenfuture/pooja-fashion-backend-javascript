/**
 * Company Contact Domain Type Definitions
 * @module modules/companyContacts/types
 */

/**
 * @typedef {'owner' | 'manager' | 'accountant' | 'sales' | 'support' | 'other'} ContactType
 */

/**
 * @typedef {Object} CompanyContactEntity
 * @property {number|string} id - Unique contact identifier
 * @property {number|string} company_id - Associated company identifier
 * @property {ContactType} contact_type - Role or purpose of contact
 * @property {string} contact_name - Full name of contact person
 * @property {string|null} [designation] - Job title/role
 * @property {string|null} [email] - Contact email address
 * @property {string|null} [phone] - Landline/office phone
 * @property {string|null} [mobile] - Mobile phone
 * @property {boolean} [is_primary] - Whether this is the primary company contact
 * @property {boolean} [is_active] - Whether contact is active
 * @property {Date|string} created_at - Timestamp of creation
 * @property {Date|string} updated_at - Timestamp of last update
 */

/**
 * @typedef {Object} CreateCompanyContactDTO
 * @property {number} company_id - Associated company ID
 * @property {ContactType} contact_type - Role or purpose of contact
 * @property {string} contact_name - Full name of contact person
 * @property {string} [designation] - Job title/role
 * @property {string} [email] - Contact email address
 * @property {string} [phone] - Landline/office phone
 * @property {string} [mobile] - Mobile phone
 * @property {boolean} [is_primary] - Whether this is the primary company contact
 * @property {boolean} [is_active] - Whether contact is active
 */

/**
 * @typedef {Partial<CreateCompanyContactDTO>} UpdateCompanyContactDTO
 */

export default {};
