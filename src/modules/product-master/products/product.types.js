/**
 * @typedef {Object} ProductEntity
 * @property {string|number} id
 * @property {string|number} company_id
 * @property {string} product_code
 * @property {string} product_name
 * @property {string|number} category_id
 * @property {string|number|null} [subcategory_id]
 * @property {string|number|null} [brand_id]
 * @property {string|number|null} [product_type_id]
 * @property {string|null} [description]
 * @property {string|null} [short_description]
 * @property {string|null} [manufacturer_name]
 * @property {string|null} [manufacturer_part_no]
 * @property {string|number} default_unit_id
 * @property {boolean} is_variant_product
 * @property {boolean} track_stock
 * @property {boolean} allow_negative_stock
 * @property {boolean} is_active
 * @property {string|number|null} [created_by]
 * @property {string|number|null} [updated_by]
 * @property {Date|string} created_at
 * @property {Date|string} updated_at
 */

/**
 * @typedef {Object} ProductDTO
 * @property {number} id
 * @property {number} company_id
 * @property {Object} [company]
 * @property {number} company.id
 * @property {string} company.name
 * @property {string} company.code
 * @property {string} product_code
 * @property {string} product_name
 * @property {number} category_id
 * @property {Object} [category]
 * @property {number} category.id
 * @property {string} category.name
 * @property {string} category.code
 * @property {number|null} subcategory_id
 * @property {Object|null} [subcategory]
 * @property {number} subcategory.id
 * @property {string} subcategory.name
 * @property {string} subcategory.code
 * @property {number|null} brand_id
 * @property {Object|null} [brand]
 * @property {number} brand.id
 * @property {string} brand.name
 * @property {string} brand.code
 * @property {number|null} product_type_id
 * @property {Object|null} [product_type]
 * @property {number} product_type.id
 * @property {string} product_type.name
 * @property {string} product_type.code
 * @property {string|null} description
 * @property {string|null} short_description
 * @property {string|null} manufacturer_name
 * @property {string|null} manufacturer_part_no
 * @property {number} default_unit_id
 * @property {Object} [default_unit]
 * @property {number} default_unit.id
 * @property {string} default_unit.name
 * @property {string} default_unit.code
 * @property {string|null} default_unit.symbol
 * @property {boolean} is_variant_product
 * @property {boolean} track_stock
 * @property {boolean} allow_negative_stock
 * @property {boolean} is_active
 * @property {number|null} created_by
 * @property {number|null} updated_by
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} CreateProductDTO
 * @property {number} company_id
 * @property {string} [product_code]
 * @property {string} product_name
 * @property {number} category_id
 * @property {number|null} [subcategory_id]
 * @property {number|null} [brand_id]
 * @property {number|null} [product_type_id]
 * @property {string|null} [description]
 * @property {string|null} [short_description]
 * @property {string|null} [manufacturer_name]
 * @property {string|null} [manufacturer_part_no]
 * @property {number} default_unit_id
 * @property {boolean} [is_variant_product=true]
 * @property {boolean} [track_stock=true]
 * @property {boolean} [allow_negative_stock=false]
 * @property {boolean} [is_active=true]
 * @property {number|null} [created_by]
 */

/**
 * @typedef {Object} UpdateProductDTO
 * @property {string} [product_code]
 * @property {string} [product_name]
 * @property {number} [category_id]
 * @property {number|null} [subcategory_id]
 * @property {number|null} [brand_id]
 * @property {number|null} [product_type_id]
 * @property {string|null} [description]
 * @property {string|null} [short_description]
 * @property {string|null} [manufacturer_name]
 * @property {string|null} [manufacturer_part_no]
 * @property {number} [default_unit_id]
 * @property {boolean} [is_variant_product]
 * @property {boolean} [track_stock]
 * @property {boolean} [allow_negative_stock]
 * @property {boolean} [is_active]
 * @property {number|null} [updated_by]
 */

export const PRODUCT_SORT_FIELDS = [
  'id',
  'product_code',
  'product_name',
  'category_id',
  'subcategory_id',
  'brand_id',
  'product_type_id',
  'default_unit_id',
  'is_active',
  'created_at',
];

export default {
  PRODUCT_SORT_FIELDS,
};
