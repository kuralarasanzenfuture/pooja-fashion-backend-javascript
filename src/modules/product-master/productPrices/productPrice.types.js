/**
 * @fileoverview Product Prices and Price History Type Definitions and Constants
 */

/**
 * Supported Price Types
 * @readonly
 * @enum {string}
 */
export const PRICE_TYPES = Object.freeze({
  RETAIL: 'RETAIL',
  WHOLESALE: 'WHOLESALE',
  SPECIAL: 'SPECIAL',
  ONLINE: 'ONLINE',
  MRP: 'MRP',
  PURCHASE: 'PURCHASE',
});

/**
 * Valid Sort Fields for Product Prices
 * @readonly
 * @enum {string}
 */
export const PRODUCT_PRICE_SORT_FIELDS = Object.freeze({
  ID: 'id',
  EFFECTIVE_FROM: 'effective_from',
  SELLING_PRICE: 'selling_price',
  MRP: 'mrp',
  CREATED_AT: 'created_at',
});

/**
 * Valid Sort Fields for Product Price History
 * @readonly
 * @enum {string}
 */
export const PRODUCT_PRICE_HISTORY_SORT_FIELDS = Object.freeze({
  ID: 'id',
  CHANGED_AT: 'changed_at',
  PRICE_TYPE: 'price_type',
});

/**
 * @typedef {Object} ProductPriceDTO
 * @property {string} id
 * @property {string} company_id
 * @property {string|null} [company_name]
 * @property {string} product_id
 * @property {string|null} [product_name]
 * @property {string|null} [product_item_code]
 * @property {string} variant_id
 * @property {string|null} [variant_sku]
 * @property {string|null} [variant_name]
 * @property {string} price_type
 * @property {number|null} purchase_price
 * @property {number|null} cost_price
 * @property {number|null} mrp
 * @property {number|null} selling_price
 * @property {number|null} min_selling_price
 * @property {string} currency_code
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
 * @typedef {Object} ProductPriceHistoryDTO
 * @property {string} id
 * @property {string} company_id
 * @property {string|null} [company_name]
 * @property {string} product_id
 * @property {string|null} [product_name]
 * @property {string|null} [product_item_code]
 * @property {string} variant_id
 * @property {string|null} [variant_sku]
 * @property {string|null} [variant_name]
 * @property {string|null} product_price_id
 * @property {string} price_type
 * @property {number|null} old_purchase_price
 * @property {number|null} new_purchase_price
 * @property {number|null} old_cost_price
 * @property {number|null} new_cost_price
 * @property {number|null} old_mrp
 * @property {number|null} new_mrp
 * @property {number|null} old_selling_price
 * @property {number|null} new_selling_price
 * @property {string|null} reason
 * @property {string|null} changed_by
 * @property {string|null} [changed_by_name]
 * @property {string} changed_at
 */
