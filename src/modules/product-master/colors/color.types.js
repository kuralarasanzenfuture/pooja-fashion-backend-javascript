/**
 * @typedef {Object} Color
 * @property {number} id - Unique color ID
 * @property {number} company_id - Foreign key to companies
 * @property {string} color_code - Short identifier for color (e.g., BLK, WHT, RED)
 * @property {string} color_name - Display name of color (e.g., Black, White, Navy Blue)
 * @property {string|null} hex_code - 6-digit hex color code (#000000 to #FFFFFF)
 * @property {string|null} description - Optional color description or tone details
 * @property {number} display_order - Sort ordering index (>= 0)
 * @property {boolean} is_active - Active flag for status filtering
 * @property {number|null} created_by - User ID who created the record
 * @property {number|null} updated_by - User ID who last updated the record
 * @property {Date} created_at - Timestamp of record creation
 * @property {Date} updated_at - Timestamp of last update
 */

/**
 * @typedef {Object} CreateColorInput
 * @property {number} company_id - Company ID
 * @property {string} [color_code] - Short uppercase code
 * @property {string} color_name - Full color name
 * @property {string|null} [hex_code] - Hex color value (e.g., #000000)
 * @property {string|null} [description] - Description of color
 * @property {number} [display_order] - Display sequence
 * @property {boolean} [is_active] - Active flag
 * @property {number|null} [created_by] - User ID
 */

/**
 * @typedef {Object} UpdateColorInput
 * @property {number} [company_id] - Company ID
 * @property {string} [color_code] - Short uppercase code
 * @property {string} [color_name] - Full color name
 * @property {string|null} [hex_code] - Hex color value
 * @property {string|null} [description] - Description
 * @property {number} [display_order] - Display sequence
 * @property {boolean} [is_active] - Active flag
 * @property {number|null} [updated_by] - User ID
 */

/**
 * @typedef {Object} ColorDTO
 * @property {number} id
 * @property {number} companyId
 * @property {string} [companyName]
 * @property {string} [companyCode]
 * @property {string} colorCode
 * @property {string} colorName
 * @property {string|null} hexCode
 * @property {string|null} description
 * @property {number} displayOrder
 * @property {boolean} isActive
 * @property {number|null} createdBy
 * @property {number|null} updatedBy
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export default {};
