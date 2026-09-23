/**
 * Product Master: Size Group Domain Type Definitions
 * @module modules/product-master/sizeGroups/types
 */

/**
 * @typedef {Object} SizeGroupEntity
 * @property {number|string} id - Unique size group identifier
 * @property {number|string} company_id - Associated company ID
 * @property {string} size_group_code - Unique business code for size group
 * @property {string} size_group_name - Display name for size group (e.g. Men, Women, Kids)
 * @property {string|null} [description] - Detailed description
 * @property {boolean} [is_active] - Active status flag
 * @property {number|string|null} [created_by] - User ID who created the record
 * @property {number|string|null} [updated_by] - User ID who last modified the record
 * @property {Date|string} created_at - Timestamp of creation
 * @property {Date|string} updated_at - Timestamp of last update
 */

/**
 * @typedef {Object} CreateSizeGroupDTO
 * @property {number|string} company_id - Associated company ID
 * @property {string} [size_group_code] - Unique size group code (auto-generated if omitted)
 * @property {string} size_group_name - Size group name
 * @property {string|null} [description] - Detailed description
 * @property {boolean} [is_active] - Status flag (default true)
 * @property {number|string|null} [created_by] - Creator user ID
 */

/**
 * @typedef {Partial<CreateSizeGroupDTO>} UpdateSizeGroupDTO
 */

/**
 * @typedef {Object} SizeGroupResponseDTO
 * @property {number} id - Unique identifier
 * @property {number} companyId - Associated company ID
 * @property {string} [companyName] - Company name
 * @property {string} [companyCode] - Company code
 * @property {string} sizeGroupCode - Size group business code
 * @property {string} sizeGroupName - Size group name
 * @property {string|null} description - Description
 * @property {boolean} isActive - Active status flag
 * @property {number|null} createdBy - Creator user ID
 * @property {number|null} updatedBy - Last editor user ID
 * @property {string|null} createdAt - Creation timestamp (ISO string)
 * @property {string|null} updatedAt - Update timestamp (ISO string)
 */

export default {};
