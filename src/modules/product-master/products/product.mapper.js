/**
 * Maps a raw database row to a ProductDTO
 * @param {Object} row Raw database row
 * @returns {import('./product.types.js').ProductDTO|null} Product DTO
 */
export const toProductDTO = (row) => {
  if (!row) return null;

  return {
    id: Number(row.id),
    company_id: Number(row.company_id),
    company: row.company_name
      ? {
          id: Number(row.company_id),
          name: row.company_name,
          code: row.company_code || null,
        }
      : undefined,
    product_code: row.product_code,
    product_name: row.product_name,
    category_id: Number(row.category_id),
    category: row.category_name
      ? {
          id: Number(row.category_id),
          name: row.category_name,
          code: row.category_code || null,
        }
      : undefined,
    subcategory_id: row.subcategory_id ? Number(row.subcategory_id) : null,
    subcategory: row.subcategory_id && row.subcategory_name
      ? {
          id: Number(row.subcategory_id),
          name: row.subcategory_name,
          code: row.subcategory_code || null,
        }
      : null,
    brand_id: row.brand_id ? Number(row.brand_id) : null,
    brand: row.brand_id && row.brand_name
      ? {
          id: Number(row.brand_id),
          name: row.brand_name,
          code: row.brand_code || null,
        }
      : null,
    product_type_id: row.product_type_id ? Number(row.product_type_id) : null,
    product_type: row.product_type_id && row.type_name
      ? {
          id: Number(row.product_type_id),
          name: row.type_name,
          code: row.type_code || null,
        }
      : null,
    description: row.description || null,
    short_description: row.short_description || null,
    manufacturer_name: row.manufacturer_name || null,
    manufacturer_part_no: row.manufacturer_part_no || null,
    default_unit_id: Number(row.default_unit_id),
    default_unit: row.unit_name
      ? {
          id: Number(row.default_unit_id),
          name: row.unit_name,
          code: row.unit_code || null,
          symbol: row.unit_symbol || null,
        }
      : undefined,
    is_variant_product: Boolean(row.is_variant_product),
    track_stock: Boolean(row.track_stock),
    allow_negative_stock: Boolean(row.allow_negative_stock),
    is_active: Boolean(row.is_active),
    created_by: row.created_by ? Number(row.created_by) : null,
    updated_by: row.updated_by ? Number(row.updated_by) : null,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
};

/**
 * Maps an array of database rows to an array of ProductDTOs
 * @param {Array<Object>} rows Array of raw database rows
 * @returns {Array<import('./product.types.js').ProductDTO>} Array of Product DTOs
 */
export const toProductListDTO = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map(toProductDTO).filter(Boolean);
};

export default {
  toProductDTO,
  toProductListDTO,
};
