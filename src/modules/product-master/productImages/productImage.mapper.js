/**
 * Maps a raw database row to a ProductImageDTO
 * @param {Object} row Raw database row
 * @returns {import('./productImage.types.js').ProductImageDTO|null} Product Image DTO
 */
export const toProductImageDTO = (row) => {
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
    variant_id: row.variant_id ? Number(row.variant_id) : null,
    variant: row.variant_id && row.variant_sku
      ? {
          id: Number(row.variant_id),
          sku: row.variant_sku,
          name: row.variant_name || null,
        }
      : null,
    image_url: row.image_url,
    image_key: row.image_key || null,
    original_file_name: row.original_file_name || null,
    mime_type: row.mime_type || null,
    file_size: row.file_size !== null && row.file_size !== undefined ? Number(row.file_size) : null,
    width: row.width ? Number(row.width) : null,
    height: row.height ? Number(row.height) : null,
    alt_text: row.alt_text || null,
    display_order: Number(row.display_order || 0),
    is_primary: Boolean(row.is_primary),
    is_active: Boolean(row.is_active),
    created_by: row.created_by ? Number(row.created_by) : null,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
  };
};

/**
 * Maps an array of database rows to an array of ProductImageDTOs
 * @param {Array<Object>} rows Array of raw database rows
 * @returns {Array<import('./productImage.types.js').ProductImageDTO>} Array of Product Image DTOs
 */
export const toProductImageListDTO = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map(toProductImageDTO).filter(Boolean);
};

export default {
  toProductImageDTO,
  toProductImageListDTO,
};
