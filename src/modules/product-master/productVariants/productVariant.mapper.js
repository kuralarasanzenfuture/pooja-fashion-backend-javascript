/**
 * Maps a raw database row to a ProductVariantDTO
 * @param {Object} row Raw database row
 * @returns {import('./productVariant.types.js').ProductVariantDTO|null} Product Variant DTO
 */
export const toProductVariantDTO = (row) => {
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
    product_id: Number(row.product_id),
    product: row.product_name
      ? {
          id: Number(row.product_id),
          name: row.product_name,
          code: row.product_code || null,
        }
      : undefined,
    sku: row.sku,
    variant_code: row.variant_code || null,
    variant_name: row.variant_name || null,
    size_group_id: row.size_group_id ? Number(row.size_group_id) : null,
    size_group: row.size_group_id && row.size_group_name
      ? {
          id: Number(row.size_group_id),
          name: row.size_group_name,
          code: row.size_group_code || null,
        }
      : null,
    size_id: row.size_id ? Number(row.size_id) : null,
    size: row.size_id && row.size_name
      ? {
          id: Number(row.size_id),
          name: row.size_name,
          code: row.size_code || null,
        }
      : null,
    color_id: row.color_id ? Number(row.color_id) : null,
    color: row.color_id && row.color_name
      ? {
          id: Number(row.color_id),
          name: row.color_name,
          code: row.color_code || null,
          hex_code: row.color_hex_code || null,
        }
      : null,
    material_id: row.material_id ? Number(row.material_id) : null,
    material: row.material_id && row.material_name
      ? {
          id: Number(row.material_id),
          name: row.material_name,
          code: row.material_code || null,
        }
      : null,
    unit_id: Number(row.unit_id),
    unit: row.unit_name
      ? {
          id: Number(row.unit_id),
          name: row.unit_name,
          code: row.unit_code || null,
          symbol: row.unit_symbol || null,
        }
      : undefined,
    model_no: row.model_no || null,
    style_code: row.style_code || null,
    weight: row.weight !== null && row.weight !== undefined ? Number(row.weight) : null,
    track_stock: Boolean(row.track_stock),
    allow_negative_stock: Boolean(row.allow_negative_stock),
    is_default: Boolean(row.is_default),
    is_active: Boolean(row.is_active),
    created_by: row.created_by ? Number(row.created_by) : null,
    updated_by: row.updated_by ? Number(row.updated_by) : null,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
};

/**
 * Maps an array of database rows to an array of ProductVariantDTOs
 * @param {Array<Object>} rows Array of raw database rows
 * @returns {Array<import('./productVariant.types.js').ProductVariantDTO>} Array of Product Variant DTOs
 */
export const toProductVariantListDTO = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map(toProductVariantDTO).filter(Boolean);
};

export default {
  toProductVariantDTO,
  toProductVariantListDTO,
};
