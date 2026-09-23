/**
 * @typedef {Object} ProductBarcodeEntity
 * @property {string|number} id
 * @property {string|number} company_id
 * @property {string|number} product_id
 * @property {string|number} variant_id
 * @property {string} barcode
 * @property {string} barcode_type
 * @property {boolean} is_primary
 * @property {boolean} is_active
 * @property {string|number|null} [created_by]
 * @property {Date|string} created_at
 */

/**
 * @typedef {Object} ProductBarcodeDTO
 * @property {number} id
 * @property {number} company_id
 * @property {Object} [company]
 * @property {number} company.id
 * @property {string} company.name
 * @property {string} company.code
 * @property {number} product_id
 * @property {Object} [product]
 * @property {number} product.id
 * @property {string} product.name
 * @property {string} product.code
 * @property {number} variant_id
 * @property {Object} [variant]
 * @property {number} variant.id
 * @property {string} variant.sku
 * @property {string|null} variant.name
 * @property {string|null} variant.code
 * @property {Object|null} [variant.size]
 * @property {Object|null} [variant.color]
 * @property {Object|null} [variant.material]
 * @property {Object|null} [variant.unit]
 * @property {string} barcode
 * @property {string} barcode_type
 * @property {boolean} is_primary
 * @property {boolean} is_active
 * @property {number|null} created_by
 * @property {string} created_at
 */

/**
 * @typedef {Object} CreateProductBarcodeDTO
 * @property {number} company_id
 * @property {number} product_id
 * @property {number} variant_id
 * @property {string} [barcode]
 * @property {string} [barcode_type='INTERNAL']
 * @property {boolean} [is_primary=false]
 * @property {boolean} [is_active=true]
 * @property {number|null} [created_by]
 */

/**
 * @typedef {Object} UpdateProductBarcodeDTO
 * @property {string} [barcode]
 * @property {string} [barcode_type]
 * @property {boolean} [is_primary]
 * @property {boolean} [is_active]
 */

export const BARCODE_TYPES = [
  'EAN',
  'EAN13',
  'UPC',
  'UPCA',
  'CODE128',
  'CODE39',
  'QR',
  'INTERNAL',
  'CUSTOM',
];

export const PRODUCT_BARCODE_SORT_FIELDS = [
  'id',
  'barcode',
  'barcode_type',
  'product_id',
  'variant_id',
  'is_primary',
  'is_active',
  'created_at',
];

export default {
  BARCODE_TYPES,
  PRODUCT_BARCODE_SORT_FIELDS,
};
