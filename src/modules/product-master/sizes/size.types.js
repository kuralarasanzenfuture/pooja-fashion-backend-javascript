/**
 * Product Master: Size Domain Type Definitions
 * @module modules/product-master/sizes/types
 */

/**
 * @typedef {Object} SizeEntity
 * @property {number|string} id - Unique size identifier
 * @property {number|string} company_id - Associated company ID
 * @property {number|string} size_group_id - Associated parent size group ID
 * @property {string} size_code - Unique size code within the size group (e.g. S, M, L, XL, 38, 40)
 * @property {string} size_name - Display name for size
 * @property {number} [display_order] - Ordering index for display (>= 0)
 * @property {boolean} [is_active] - Active status flag
 * @property {number|string|null} [created_by] - User ID who created the record
 * @property {number|string|null} [updated_by] - User ID who last modified the record
 * @property {Date|string} created_at - Timestamp of creation
 * @property {Date|string} updated_at - Timestamp of last update
 */

/**
 * @typedef {Object} CreateSizeDTO
 * @property {number|string} company_id - Associated company ID
 * @property {number|string} size_group_id - Associated parent size group ID
 * @property {string} [size_code] - Unique size code within group (auto-generated if omitted)
 * @property {string} size_name - Size display name
 * @property {number} [display_order] - Display order (>= 0, default 0)
 * @property {boolean} [is_active] - Status flag (default true)
 * @property {number|string|null} [created_by] - Creator user ID
 */

/**
 * @typedef {Partial<CreateSizeDTO>} UpdateSizeDTO
 */

/**
 * @typedef {Object} SizeResponseDTO
 * @property {number} id - Unique identifier
 * @property {number} companyId - Associated company ID
 * @property {string} [companyName] - Company name
 * @property {string} [companyCode] - Company code
 * @property {number} sizeGroupId - Parent size group ID
 * @property {string} [sizeGroupName] - Size group name
 * @property {string} [sizeGroupCode] - Size group code
 * @property {string} sizeCode - Size code
 * @property {string} sizeName - Size name
 * @property {number} displayOrder - Ordering index
 * @property {boolean} isActive - Active status flag
 * @property {number|null} createdBy - Creator user ID
 * @property {number|null} updatedBy - Last editor user ID
 * @property {string|null} createdAt - Creation timestamp (ISO string)
 * @property {string|null} updatedAt - Update timestamp (ISO string)
 */

export default {};
