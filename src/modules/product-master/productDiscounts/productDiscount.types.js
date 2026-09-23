/**
 * @fileoverview Product Discounts Types and Constants Definition (035_product_discounts.sql)
 */

/**
 * Valid Sort Fields for Product Discounts
 * @readonly
 * @enum {string}
 */
export const PRODUCT_DISCOUNT_SORT_FIELDS = Object.freeze({
  ID: 'id',
  CREATED_AT: 'created_at',
  PRODUCT_ID: 'product_id',
  VARIANT_ID: 'variant_id',
  DISCOUNT_ID: 'discount_id',
  PRIORITY: 'priority',
});

/**
 * @typedef {Object} ProductDiscountDTO
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
 * @property {string} discount_id
 * @property {string|null} [discount_code]
 * @property {string|null} [discount_name]
 * @property {string|null} [discount_type]
 * @property {number} [discount_value]
 * @property {number|null} [minimum_quantity]
 * @property {number|null} [maximum_discount]
 * @property {number} [priority]
 * @property {boolean} [is_stackable]
 * @property {boolean} is_primary
 * @property {boolean} is_active
 * @property {string|null} created_by
 * @property {string|null} [created_by_name]
 * @property {string|null} updated_by
 * @property {string|null} [updated_by_name]
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} ResolvedDiscountDTO
 * @property {string} mapping_id
 * @property {string} company_id
 * @property {string} product_id
 * @property {string|null} [product_name]
 * @property {string|null} [product_code]
 * @property {string|null} variant_id
 * @property {string|null} [variant_sku]
 * @property {string|null} [variant_name]
 * @property {string} discount_id
 * @property {string} discount_code
 * @property {string} discount_name
 * @property {string} discount_type
 * @property {number} discount_value
 * @property {number|null} minimum_quantity
 * @property {number|null} maximum_discount
 * @property {number} priority
 * @property {boolean} is_stackable
 * @property {boolean} is_primary
 * @property {number|null} [original_amount]
 * @property {number|null} [quantity]
 * @property {number|null} [raw_discount]
 * @property {number|null} [applied_discount]
 * @property {number|null} [final_amount]
 * @property {number|null} [savings_percentage]
 * @property {boolean|null} [is_applicable]
 * @property {string|null} [reason_inapplicable]
 */
