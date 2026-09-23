/**
 * @fileoverview Product Taxes Types and Constants Definition (033_product_taxes.sql)
 */

/**
 * Valid Sort Fields for Product Taxes
 * @readonly
 * @enum {string}
 */
export const PRODUCT_TAX_SORT_FIELDS = Object.freeze({
  ID: 'id',
  EFFECTIVE_FROM: 'effective_from',
  CREATED_AT: 'created_at',
  PRODUCT_ID: 'product_id',
  VARIANT_ID: 'variant_id',
  TAX_ID: 'tax_id',
});

/**
 * @typedef {Object} ProductTaxDTO
 * @property {string} id
 * @property {string} company_id
 * @property {string|null} [company_name]
 * @property {string|null} [company_code]
 * @property {string} product_id
 * @property {string|null} [product_name]
 * @property {string|null} [product_code]
 * @property {string|null} variant_id
 * @property {string|null} [variant_sku]
 * @property {string|null} [variant_name]
 * @property {string} tax_id
 * @property {string|null} [tax_code]
 * @property {string|null} [tax_name]
 * @property {string|null} [tax_type]
 * @property {number} [rate]
 * @property {number} [cgst_rate]
 * @property {number} [sgst_rate]
 * @property {number} [igst_rate]
 * @property {number} [cess_rate]
 * @property {boolean} [is_inclusive]
 * @property {boolean} is_primary
 * @property {string} effective_from
 * @property {string|null} effective_to
 * @property {boolean} is_active
 * @property {string|null} created_by
 * @property {string|null} [created_by_name]
 * @property {string|null} updated_by
 * @property {string|null} [updated_by_name]
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} ResolvedTaxDTO
 * @property {string} id
 * @property {string} company_id
 * @property {string} product_id
 * @property {string|null} [product_name]
 * @property {string|null} [product_code]
 * @property {string|null} variant_id
 * @property {string|null} [variant_sku]
 * @property {string|null} [variant_name]
 * @property {string} tax_id
 * @property {string} tax_code
 * @property {string} tax_name
 * @property {string} tax_type
 * @property {number} rate
 * @property {number} cgst_rate
 * @property {number} sgst_rate
 * @property {number} igst_rate
 * @property {number} cess_rate
 * @property {boolean} is_inclusive
 * @property {boolean} is_primary
 * @property {string} effective_from
 * @property {string|null} effective_to
 * @property {boolean} is_active
 * @property {string} resolution_level - 'VARIANT' | 'PRODUCT'
 */
