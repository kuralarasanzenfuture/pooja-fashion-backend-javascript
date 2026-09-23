/**
 * Product Master: Brand Domain Type Definitions
 * @module modules/product-master/brands/types
 */

/**
 * @typedef {Object} BrandEntity
 * @property {number|string} id - Unique brand record identifier
 * @property {number|string} company_id - Associated company identifier
 * @property {string} brand_code - Unique business code for brand
 * @property {string} brand_name - Unique brand name
 * @property {string|null} [description] - Brand description or tagline
 * @property {string|null} [logo_url] - URL to brand logo image
 * @property {string|null} [logo_key] - Storage identifier for brand logo
 * @property {string|null} [website_url] - Official brand website URL
 * @property {number} [display_order] - Ordering index for catalog display (>= 0)
 * @property {boolean} [is_active] - Active status flag
 * @property {number|string|null} [created_by] - User ID who created the record
 * @property {number|string|null} [updated_by] - User ID who last modified the record
 * @property {Date|string} created_at - Timestamp of creation
 * @property {Date|string} updated_at - Timestamp of last update
 */

/**
 * @typedef {Object} CreateBrandDTO
 * @property {number|string} company_id - Associated company ID
 * @property {string} [brand_code] - Unique brand code (auto-generated if omitted)
 * @property {string} brand_name - Brand name
 * @property {string|null} [description] - Detailed description
 * @property {string|null} [logo_url] - Logo URL
 * @property {string|null} [logo_key] - Logo storage key
 * @property {string|null} [website_url] - Website URL
 * @property {number} [display_order] - Display order (>= 0, default 0)
 * @property {boolean} [is_active] - Status flag (default true)
 * @property {number|string|null} [created_by] - Creator user ID
 */

/**
 * @typedef {Partial<CreateBrandDTO>} UpdateBrandDTO
 */

/**
 * @typedef {Object} BrandResponseDTO
 * @property {number} id - Unique identifier
 * @property {number} companyId - Associated company ID
 * @property {string} [companyName] - Company name
 * @property {string} [companyCode] - Company code
 * @property {string} brandCode - Brand business code
 * @property {string} brandName - Brand name
 * @property {string|null} description - Brand description
 * @property {string|null} logoUrl - Logo URL
 * @property {string|null} logoKey - Storage key
 * @property {string|null} websiteUrl - Brand website URL
 * @property {number} displayOrder - Catalog display order
 * @property {boolean} isActive - Active status flag
 * @property {number|null} createdBy - Creator user ID
 * @property {number|null} updatedBy - Last editor user ID
 * @property {string|null} createdAt - Creation timestamp (ISO string)
 * @property {string|null} updatedAt - Update timestamp (ISO string)
 */

export default {};
