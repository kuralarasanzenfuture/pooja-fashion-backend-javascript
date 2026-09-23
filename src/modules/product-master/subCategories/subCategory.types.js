/**
 * Product Master: Subcategory Domain Type Definitions
 * @module modules/product-master/subCategories/types
 */

/**
 * @typedef {Object} SubcategoryEntity
 * @property {number|string} id - Unique subcategory identifier
 * @property {number|string} company_id - Associated company ID
 * @property {number|string} category_id - Associated parent category ID
 * @property {string} subcategory_code - Unique business code for subcategory
 * @property {string} subcategory_name - Display name for subcategory
 * @property {string|null} [description] - Detailed subcategory description
 * @property {string|null} [image_url] - URL to subcategory image
 * @property {string|null} [image_key] - Storage key for subcategory image
 * @property {number} [display_order] - Ordering index for catalog display (>= 0)
 * @property {boolean} [is_active] - Active status flag
 * @property {number|string|null} [created_by] - User ID who created the record
 * @property {number|string|null} [updated_by] - User ID who last modified the record
 * @property {Date|string} created_at - Timestamp of creation
 * @property {Date|string} updated_at - Timestamp of last update
 */

/**
 * @typedef {Object} CreateSubcategoryDTO
 * @property {number|string} company_id - Associated company ID
 * @property {number|string} category_id - Associated parent category ID
 * @property {string} [subcategory_code] - Unique subcategory code (auto-generated if omitted)
 * @property {string} subcategory_name - Subcategory name
 * @property {string|null} [description] - Detailed description
 * @property {string|null} [image_url] - Image URL
 * @property {string|null} [image_key] - Storage image key
 * @property {number} [display_order] - Display order (>= 0, default 0)
 * @property {boolean} [is_active] - Status flag (default true)
 * @property {number|string|null} [created_by] - Creator user ID
 */

/**
 * @typedef {Partial<CreateSubcategoryDTO>} UpdateSubcategoryDTO
 */

/**
 * @typedef {Object} SubcategoryResponseDTO
 * @property {number} id - Unique identifier
 * @property {number} companyId - Associated company ID
 * @property {string} [companyName] - Company name
 * @property {string} [companyCode] - Company code
 * @property {number} categoryId - Associated parent category ID
 * @property {string} [categoryName] - Category name
 * @property {string} [categoryCode] - Category code
 * @property {string} subcategoryCode - Subcategory business code
 * @property {string} subcategoryName - Subcategory name
 * @property {string|null} description - Subcategory description
 * @property {string|null} imageUrl - Image URL
 * @property {string|null} imageKey - Storage key
 * @property {number} displayOrder - Catalog display order
 * @property {boolean} isActive - Active status flag
 * @property {number|null} createdBy - Creator user ID
 * @property {number|null} updatedBy - Last editor user ID
 * @property {string|null} createdAt - Creation timestamp (ISO string)
 * @property {string|null} updatedAt - Update timestamp (ISO string)
 */

export default {};
