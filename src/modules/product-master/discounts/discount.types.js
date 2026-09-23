/**
 * @fileoverview Discount Types and Constants Definition (034_discounts.sql)
 */

/**
 * Supported Discount Types
 * @readonly
 * @enum {string}
 */
export const DISCOUNT_TYPES = Object.freeze({
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
});

/**
 * Standard Promotional Discount Templates for Retail & Apparel
 * @readonly
 */
export const STANDARD_DISCOUNT_TEMPLATES = Object.freeze([
  {
    discount_code: 'WELCOME10',
    discount_name: 'New Customer Welcome 10%',
    discount_type: 'PERCENTAGE',
    discount_value: 10.0,
    minimum_quantity: 1,
    maximum_discount: 500.0,
    priority: 1,
    is_stackable: false,
  },
  {
    discount_code: 'FLAT500',
    discount_name: 'Flat ₹500 Off',
    discount_type: 'FIXED_AMOUNT',
    discount_value: 500.0,
    minimum_quantity: 1,
    maximum_discount: null,
    priority: 2,
    is_stackable: false,
  },
  {
    discount_code: 'SEASON20',
    discount_name: 'Seasonal Sale 20%',
    discount_type: 'PERCENTAGE',
    discount_value: 20.0,
    minimum_quantity: 1,
    maximum_discount: 1000.0,
    priority: 3,
    is_stackable: false,
  },
  {
    discount_code: 'FESTIVE25',
    discount_name: 'Festive Special 25%',
    discount_type: 'PERCENTAGE',
    discount_value: 25.0,
    minimum_quantity: 1,
    maximum_discount: 1500.0,
    priority: 4,
    is_stackable: false,
  },
  {
    discount_code: 'BULK15',
    discount_name: 'Volume Purchase 15% Off (Min 5 items)',
    discount_type: 'PERCENTAGE',
    discount_value: 15.0,
    minimum_quantity: 5,
    maximum_discount: 2500.0,
    priority: 5,
    is_stackable: true,
  },
]);

/**
 * Valid Sort Fields for Discounts
 * @readonly
 * @enum {string}
 */
export const DISCOUNT_SORT_FIELDS = Object.freeze({
  ID: 'id',
  DISCOUNT_CODE: 'discount_code',
  DISCOUNT_NAME: 'discount_name',
  DISCOUNT_VALUE: 'discount_value',
  PRIORITY: 'priority',
  START_AT: 'start_at',
  END_AT: 'end_at',
  CREATED_AT: 'created_at',
});

/**
 * @typedef {Object} DiscountDTO
 * @property {string} id
 * @property {string} company_id
 * @property {string|null} [company_name]
 * @property {string|null} [company_code]
 * @property {string} discount_code
 * @property {string} discount_name
 * @property {string} discount_type
 * @property {number} discount_value
 * @property {number|null} minimum_quantity
 * @property {number|null} maximum_discount
 * @property {string|null} start_at
 * @property {string|null} end_at
 * @property {number} priority
 * @property {boolean} is_stackable
 * @property {boolean} is_active
 * @property {string|null} created_by
 * @property {string|null} [created_by_name]
 * @property {string|null} updated_by
 * @property {string|null} [updated_by_name]
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} DiscountCalculationResult
 * @property {number} original_amount
 * @property {number} quantity
 * @property {string} discount_type
 * @property {number} discount_value
 * @property {number} raw_discount
 * @property {number} applied_discount
 * @property {number|null} maximum_discount_cap
 * @property {number} final_amount
 * @property {number} savings_percentage
 * @property {boolean} is_applicable
 * @property {string|null} [reason_inapplicable]
 */
