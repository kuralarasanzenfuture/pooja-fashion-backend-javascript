/**
 * Company Tax Detail Domain Type Definitions
 * @module modules/companyTaxDetails/types
 */

/**
 * @typedef {'regular' | 'composition' | 'unregistered' | 'other'} GstRegistrationType
 */

/**
 * @typedef {Object} CompanyTaxDetailEntity
 * @property {number|string} id - Unique tax detail identifier
 * @property {number|string} company_id - Associated company identifier
 * @property {string|null} [gstin] - 15-character GSTIN
 * @property {string|null} [pan_number] - Permanent Account Number (PAN)
 * @property {string|null} [tan_number] - Tax Deduction and Collection Account Number (TAN)
 * @property {GstRegistrationType|null} [gst_registration_type] - GST scheme/registration type
 * @property {string|null} [gst_state_code] - 2-digit GST state code (e.g. 33)
 * @property {string|null} [tax_registered_name] - Legal entity name registered with tax department
 * @property {boolean} [is_primary] - Whether this is the primary tax record for the company
 * @property {boolean} [is_active] - Whether this tax record is active
 * @property {Date|string} created_at - Timestamp of creation
 * @property {Date|string} updated_at - Timestamp of last update
 */

/**
 * @typedef {Object} CreateCompanyTaxDetailDTO
 * @property {number} company_id - Associated company ID
 * @property {string} [gstin] - 15-character GSTIN
 * @property {string} [pan_number] - Permanent Account Number (PAN)
 * @property {string} [tan_number] - Tax Deduction and Collection Account Number (TAN)
 * @property {GstRegistrationType} [gst_registration_type] - GST scheme/registration type
 * @property {string} [gst_state_code] - 2-digit GST state code
 * @property {string} [tax_registered_name] - Legal entity name registered with tax department
 * @property {boolean} [is_primary] - Whether this is the primary tax record for the company
 * @property {boolean} [is_active] - Whether this tax record is active
 */

/**
 * @typedef {Partial<CreateCompanyTaxDetailDTO>} UpdateCompanyTaxDetailDTO
 */

export default {};
