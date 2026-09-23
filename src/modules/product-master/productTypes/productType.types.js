/**
 * @typedef {Object} ProductType
 * @property {number} id - Unique product type ID
 * @property {number} company_id - Foreign key to companies
 * @property {string} type_code - Short uppercase identifier (e.g., READY_MADE, FABRIC)
 * @property {string} type_name - Full display name (e.g., Ready Made Garments, Unstitched Fabric)
 * @property {string|null} description - Product classification description
 * @property {boolean} is_stock_item - Whether inventory quantity is tracked in stock
 * @property {boolean} is_saleable - Whether items can be sold on POS / sales orders
 * @property {boolean} is_purchasable - Whether items can be purchased on purchase orders
 * @property {boolean} is_active - Active flag for status filtering
 * @property {number|null} created_by - User ID who created the record
 * @property {number|null} updated_by - User ID who last updated the record
 * @property {Date} created_at - Timestamp of record creation
 * @property {Date} updated_at - Timestamp of last update
 */

/**
 * @typedef {Object} CreateProductTypeInput
 * @property {number} company_id - Company ID
 * @property {string} [type_code] - Short uppercase code
 * @property {string} type_name - Full product type name
 * @property {string|null} [description] - Description
 * @property {boolean} [is_stock_item] - Inventory tracked flag
 * @property {boolean} [is_saleable] - Sales flag
 * @property {boolean} [is_purchasable] - Purchase flag
 * @property {boolean} [is_active] - Active flag
 * @property {number|null} [created_by] - User ID
 */

/**
 * @typedef {Object} UpdateProductTypeInput
 * @property {number} [company_id] - Company ID
 * @property {string} [type_code] - Short uppercase code
 * @property {string} [type_name] - Full product type name
 * @property {string|null} [description] - Description
 * @property {boolean} [is_stock_item] - Inventory tracked flag
 * @property {boolean} [is_saleable] - Sales flag
 * @property {boolean} [is_purchasable] - Purchase flag
 * @property {boolean} [is_active] - Active flag
 * @property {number|null} [updated_by] - User ID
 */

/**
 * @typedef {Object} ProductTypeDTO
 * @property {number} id
 * @property {number} companyId
 * @property {string} [companyName]
 * @property {string} [companyCode]
 * @property {string} typeCode
 * @property {string} typeName
 * @property {string|null} description
 * @property {boolean} isStockItem
 * @property {boolean} isSaleable
 * @property {boolean} isPurchasable
 * @property {boolean} isActive
 * @property {number|null} createdBy
 * @property {number|null} updatedBy
 * @property {string} createdAt
 * @property {string} updatedAt
 */

export default {};
