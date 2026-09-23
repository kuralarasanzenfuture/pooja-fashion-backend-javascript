/**
 * @typedef {Object} Material
 * @property {number} id - Unique material ID
 * @property {number} company_id - Foreign key to companies
 * @property {string} material_code - Short uppercase identifier (e.g., COTTON, POLY, SILK)
 * @property {string} material_name - Full display name (e.g., 100% Pure Cotton, Raw Silk)
 * @property {string|null} description - Material composition and weave details
 * @property {boolean} is_active - Active status flag
 * @property {number|null} created_by - User ID who created the record
 * @property {number|null} updated_by - User ID who last updated the record
 * @property {Date} created_at - Timestamp of creation
 * @property {Date} updated_at - Timestamp of last update
 */

/**
 * @typedef {Object} CreateMaterialInput
 * @property {number} company_id - Company ID
 * @property {string} [material_code] - Short uppercase code
 * @property {string} material_name - Full material name
 * @property {string|null} [description] - Description
 * @property {boolean} [is_active] - Active flag
 * @property {number|null} [created_by] - User ID
 */

/**
 * @typedef {Object} UpdateMaterialInput
 * @property {number} [company_id] - Company ID
 * @property {string} [material_code] - Short uppercase code
 * @property {string} [material_name] - Full material name
 * @property {string|null} [description] - Description
 * @property {boolean} [is_active] - Active flag
 * @property {number|null} [updated_by] - User ID
 */

/**
 * @typedef {Object} MaterialDTO
 * @property {number} id
 * @property {number} companyId
 * @property {string} [companyName]
 * @property {string} [companyCode]
 * @property {string} materialCode
 * @property {string} materialName
 * @property {string|null} description
 * @property {boolean} isActive
 * @property {number|null} createdBy
 * @property {number|null} updatedBy
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export default {};
