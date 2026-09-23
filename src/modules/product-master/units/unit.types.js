/**
 * @typedef {Object} Unit
 * @property {number} id - Unique unit ID
 * @property {number} company_id - Foreign key to companies
 * @property {string} unit_code - Short identifier (e.g., PCS, MTR, KG)
 * @property {string} unit_name - Full display name (e.g., Pieces, Meters, Kilograms)
 * @property {number} decimal_places - Precision decimals (0 to 6)
 * @property {boolean} is_active - Active flag for status filtering
 * @property {number|null} created_by - User ID who created the record
 * @property {number|null} updated_by - User ID who last updated the record
 * @property {Date} created_at - Timestamp of record creation
 * @property {Date} updated_at - Timestamp of last update
 */

/**
 * @typedef {Object} CreateUnitInput
 * @property {number} company_id - Company ID
 * @property {string} [unit_code] - Short uppercase code
 * @property {string} unit_name - Full unit name
 * @property {number} [decimal_places] - Decimal precision (0-6)
 * @property {boolean} [is_active] - Active flag
 * @property {number|null} [created_by] - User ID
 */

/**
 * @typedef {Object} UpdateUnitInput
 * @property {number} [company_id] - Company ID
 * @property {string} [unit_code] - Short uppercase code
 * @property {string} [unit_name] - Full unit name
 * @property {number} [decimal_places] - Decimal precision (0-6)
 * @property {boolean} [is_active] - Active flag
 * @property {number|null} [updated_by] - User ID
 */

/**
 * @typedef {Object} UnitDTO
 * @property {number} id
 * @property {number} companyId
 * @property {string} [companyName]
 * @property {string} [companyCode]
 * @property {string} unitCode
 * @property {string} unitName
 * @property {number} decimalPlaces
 * @property {boolean} isActive
 * @property {number|null} createdBy
 * @property {number|null} updatedBy
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export default {};
