/**
 * @typedef {Object} ProductImageEntity
 * @property {string|number} id
 * @property {string|number} company_id
 * @property {string|number} product_id
 * @property {string|number|null} [variant_id]
 * @property {string} image_url
 * @property {string|null} [image_key]
 * @property {string|null} [original_file_name]
 * @property {string|null} [mime_type]
 * @property {string|number|null} [file_size]
 * @property {number|null} [width]
 * @property {number|null} [height]
 * @property {string|null} [alt_text]
 * @property {number} display_order
 * @property {boolean} is_primary
 * @property {boolean} is_active
 * @property {string|number|null} [created_by]
 * @property {Date|string} created_at
 */

/**
 * @typedef {Object} ProductImageDTO
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
 * @property {number|null} variant_id
 * @property {Object|null} [variant]
 * @property {number} variant.id
 * @property {string} variant.sku
 * @property {string|null} variant.name
 * @property {string} image_url
 * @property {string|null} image_key
 * @property {string|null} original_file_name
 * @property {string|null} mime_type
 * @property {number|null} file_size
 * @property {number|null} width
 * @property {number|null} height
 * @property {string|null} alt_text
 * @property {number} display_order
 * @property {boolean} is_primary
 * @property {boolean} is_active
 * @property {number|null} created_by
 * @property {string} created_at
 */

/**
 * @typedef {Object} CreateProductImageDTO
 * @property {number} company_id
 * @property {number} product_id
 * @property {number|null} [variant_id]
 * @property {string} [image_url]
 * @property {string|null} [image_key]
 * @property {string|null} [original_file_name]
 * @property {string|null} [mime_type]
 * @property {number|null} [file_size]
 * @property {number|null} [width]
 * @property {number|null} [height]
 * @property {string|null} [alt_text]
 * @property {number} [display_order=0]
 * @property {boolean} [is_primary=false]
 * @property {boolean} [is_active=true]
 * @property {number|null} [created_by]
 */

/**
 * @typedef {Object} UpdateProductImageDTO
 * @property {string|null} [alt_text]
 * @property {number} [display_order]
 * @property {boolean} [is_primary]
 * @property {boolean} [is_active]
 */

export const PRODUCT_IMAGE_SORT_FIELDS = [
  'id',
  'display_order',
  'product_id',
  'variant_id',
  'is_primary',
  'is_active',
  'created_at',
];

export default {
  PRODUCT_IMAGE_SORT_FIELDS,
};
