/**
 * Product Master: Category Domain Type Definitions
 * @module modules/product-master/categories/types
 */

/**
 * @typedef {Object} CategoryEntity
 * @property {number|string} id - Unique category record identifier
 * @property {number|string} company_id - Associated company identifier
 * @property {string} category_code - Unique business code for the category
 * @property {string} category_name - Unique display name for the category
 * @property {string|null} [description] - Detailed category description
 * @property {string|null} [image_url] - URL or path to category banner/thumbnail image
 * @property {string|null} [image_key] - Storage identifier/key for category image
 * @property {number} [display_order] - Numerical ordering index for catalog display (>= 0)
 * @property {boolean} [is_active] - Whether category is active and visible
 * @property {number|string|null} [created_by] - User ID who created the record
 * @property {number|string|null} [updated_by] - User ID who last modified the record
 * @property {Date|string} created_at - Timestamp of creation
 * @property {Date|string} updated_at - Timestamp of last update
 */

/**
 * @typedef {Object} CreateCategoryDTO
 * @property {number|string} company_id - Associated company ID
 * @property {string} [category_code] - Unique category code (auto-generated if omitted)
 * @property {string} category_name - Category name
 * @property {string|null} [description] - Detailed description
 * @property {string|null} [image_url] - Image URL
 * @property {string|null} [image_key] - Storage image key
 * @property {number} [display_order] - Display order (>= 0, default 0)
 * @property {boolean} [is_active] - Status flag (default true)
 * @property {number|string|null} [created_by] - Creator user ID
 */

/**
 * @typedef {Partial<CreateCategoryDTO>} UpdateCategoryDTO
 */

/**
 * @typedef {Object} CategoryResponseDTO
 * @property {number} id - Unique identifier
 * @property {number} companyId - Company ID
 * @property {string} [companyName] - Company name if joined
 * @property {string} categoryCode - Category code
 * @property {string} categoryName - Category name
 * @property {string|null} description - Category description
 * @property {string|null} imageUrl - Image URL
 * @property {string|null} imageKey - Image storage key
 * @property {number} displayOrder - Catalog display order
 * @property {boolean} isActive - Active status flag
 * @property {number|null} createdBy - Creator user ID
 * @property {number|null} updatedBy - Last editor user ID
 * @property {string|null} createdAt - Creation timestamp (ISO string)
 * @property {string|null} updatedAt - Update timestamp (ISO string)
 */

export default {};
