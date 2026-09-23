/**
 * @fileoverview Tax Types and Constants Definition (032_taxes.sql)
 */

/**
 * Supported Tax Types
 * @readonly
 * @enum {string}
 */
export const TAX_TYPES = Object.freeze({
  GST: 'GST',
  VAT: 'VAT',
  CESS: 'CESS',
  CUSTOM: 'CUSTOM',
  EXEMPT: 'EXEMPT',
});

/**
 * Standard Indian GST Slabs
 * @readonly
 */
export const STANDARD_GST_SLABS = Object.freeze([
  {
    tax_code: 'GST_0',
    tax_name: 'GST 0%',
    tax_type: 'GST',
    rate: 0,
    cgst_rate: 0,
    sgst_rate: 0,
    igst_rate: 0,
    cess_rate: 0,
    is_inclusive: false,
  },
  {
    tax_code: 'GST_5',
    tax_name: 'GST 5%',
    tax_type: 'GST',
    rate: 5.0,
    cgst_rate: 2.5,
    sgst_rate: 2.5,
    igst_rate: 5.0,
    cess_rate: 0,
    is_inclusive: false,
  },
  {
    tax_code: 'GST_12',
    tax_name: 'GST 12%',
    tax_type: 'GST',
    rate: 12.0,
    cgst_rate: 6.0,
    sgst_rate: 6.0,
    igst_rate: 12.0,
    cess_rate: 0,
    is_inclusive: false,
  },
  {
    tax_code: 'GST_18',
    tax_name: 'GST 18%',
    tax_type: 'GST',
    rate: 18.0,
    cgst_rate: 9.0,
    sgst_rate: 9.0,
    igst_rate: 18.0,
    cess_rate: 0,
    is_inclusive: false,
  },
  {
    tax_code: 'GST_28',
    tax_name: 'GST 28%',
    tax_type: 'GST',
    rate: 28.0,
    cgst_rate: 14.0,
    sgst_rate: 14.0,
    igst_rate: 28.0,
    cess_rate: 0,
    is_inclusive: false,
  },
]);

/**
 * Valid Sort Fields for Taxes
 * @readonly
 * @enum {string}
 */
export const TAX_SORT_FIELDS = Object.freeze({
  ID: 'id',
  TAX_CODE: 'tax_code',
  TAX_NAME: 'tax_name',
  RATE: 'rate',
  CREATED_AT: 'created_at',
});

/**
 * @typedef {Object} TaxDTO
 * @property {string} id
 * @property {string} company_id
 * @property {string|null} [company_name]
 * @property {string|null} [company_code]
 * @property {string} tax_code
 * @property {string} tax_name
 * @property {string} tax_type
 * @property {number} rate
 * @property {number} cgst_rate
 * @property {number} sgst_rate
 * @property {number} igst_rate
 * @property {number} cess_rate
 * @property {boolean} is_inclusive
 * @property {boolean} is_active
 * @property {string|null} created_by
 * @property {string|null} [created_by_name]
 * @property {string|null} updated_by
 * @property {string|null} [updated_by_name]
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} TaxCalculationResult
 * @property {number} original_amount
 * @property {number} taxable_amount
 * @property {number} tax_rate
 * @property {number} tax_amount
 * @property {number} cgst_rate
 * @property {number} cgst_amount
 * @property {number} sgst_rate
 * @property {number} sgst_amount
 * @property {number} igst_rate
 * @property {number} igst_amount
 * @property {number} cess_rate
 * @property {number} cess_amount
 * @property {number} total_amount
 * @property {boolean} is_inclusive
 * @property {boolean} is_inter_state
 */
