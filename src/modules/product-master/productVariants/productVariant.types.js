/**
 * @typedef {Object} ProductVariantEntity
 * @property {string|number} id
 * @property {string|number} company_id
 * @property {string|number} product_id
 * @property {string} sku
 * @property {string|null} [variant_code]
 * @property {string|null} [variant_name]
 * @property {string|number|null} [size_group_id]
 * @property {string|number|null} [size_id]
 * @property {string|number|null} [color_id]
 * @property {string|number|null} [material_id]
 * @property {string|number} unit_id
 * @property {string|null} [model_no]
 * @property {string|null} [style_code]
 * @property {string|number|null} [weight]
 * @property {boolean} track_stock
 * @property {boolean} allow_negative_stock
 * @property {boolean} is_default
 * @property {boolean} is_active
 * @property {string|number|null} [created_by]
 * @property {string|number|null} [updated_by]
 * @property {Date|string} created_at
 * @property {Date|string} updated_at
 */

/**
 * @typedef {Object} ProductVariantDTO
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
 * @property {string} sku
 * @property {string|null} variant_code
 * @property {string|null} variant_name
 * @property {number|null} size_group_id
 * @property {Object|null} [size_group]
 * @property {number} size_group.id
 * @property {string} size_group.name
 * @property {string} size_group.code
 * @property {number|null} size_id
 * @property {Object|null} [size]
 * @property {number} size.id
 * @property {string} size.name
 * @property {string} size.code
 * @property {number|null} color_id
 * @property {Object|null} [color]
 * @property {number} color.id
 * @property {string} color.name
 * @property {string} color.code
 * @property {string|null} color.hex_code
 * @property {number|null} material_id
 * @property {Object|null} [material]
 * @property {number} material.id
 * @property {string} material.name
 * @property {string} material.code
 * @property {number} unit_id
 * @property {Object} [unit]
 * @property {number} unit.id
 * @property {string} unit.name
 * @property {string} unit.code
 * @property {string|null} unit.symbol
 * @property {string|null} model_no
 * @property {string|null} style_code
 * @property {number|null} weight
 * @property {boolean} track_stock
 * @property {boolean} allow_negative_stock
 * @property {boolean} is_default
 * @property {boolean} is_active
 * @property {number|null} created_by
 * @property {number|null} updated_by
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} CreateProductVariantDTO
 * @property {number} company_id
 * @property {number} product_id
 * @property {string} [sku]
 * @property {string|null} [variant_code]
 * @property {string|null} [variant_name]
 * @property {number|null} [size_group_id]
 * @property {number|null} [size_id]
 * @property {number|null} [color_id]
 * @property {number|null} [material_id]
 * @property {number} [unit_id]
 * @property {string|null} [model_no]
 * @property {string|null} [style_code]
 * @property {number|null} [weight]
 * @property {boolean} [track_stock=true]
 * @property {boolean} [allow_negative_stock=false]
 * @property {boolean} [is_default=false]
 * @property {boolean} [is_active=true]
 * @property {number|null} [created_by]
 */

/**
 * @typedef {Object} UpdateProductVariantDTO
 * @property {string} [sku]
 * @property {string|null} [variant_code]
 * @property {string|null} [variant_name]
 * @property {number|null} [size_group_id]
 * @property {number|null} [size_id]
 * @property {number|null} [color_id]
 * @property {number|null} [material_id]
 * @property {number} [unit_id]
 * @property {string|null} [model_no]
 * @property {string|null} [style_code]
 * @property {number|null} [weight]
 * @property {boolean} [track_stock]
 * @property {boolean} [allow_negative_stock]
 * @property {boolean} [is_default]
 * @property {boolean} [is_active]
 * @property {number|null} [updated_by]
 */

export const PRODUCT_VARIANT_SORT_FIELDS = [
  'id',
  'sku',
  'variant_code',
  'variant_name',
  'product_id',
  'size_group_id',
  'size_id',
  'color_id',
  'material_id',
  'unit_id',
  'weight',
  'is_default',
  'is_active',
  'created_at',
];

export default {
  PRODUCT_VARIANT_SORT_FIELDS,
};
