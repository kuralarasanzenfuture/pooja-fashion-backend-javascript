/**
 * Maps a raw database row to a ProductBarcodeDTO
 * @param {Object} row Raw database row
 * @returns {import('./productBarcode.types.js').ProductBarcodeDTO|null} Product Barcode DTO
 */
export const toProductBarcodeDTO = (row) => {
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
          category_id: row.category_id ? Number(row.category_id) : undefined,
        }
      : undefined,
    variant_id: Number(row.variant_id),
    variant: row.variant_sku
      ? {
          id: Number(row.variant_id),
          sku: row.variant_sku,
          name: row.variant_name || null,
          code: row.variant_code || null,
          weight: row.weight !== null && row.weight !== undefined ? Number(row.weight) : null,
          track_stock: row.track_stock !== undefined ? Boolean(row.track_stock) : undefined,
          allow_negative_stock:
            row.allow_negative_stock !== undefined ? Boolean(row.allow_negative_stock) : undefined,
          size: row.size_name
            ? {
                name: row.size_name,
                code: row.size_code || null,
              }
            : null,
          color: row.color_name
            ? {
                name: row.color_name,
                code: row.color_code || null,
                hex_code: row.color_hex_code || null,
              }
            : null,
          material: row.material_name
            ? {
                name: row.material_name,
                code: row.material_code || null,
              }
            : null,
          unit: row.unit_name
            ? {
                name: row.unit_name,
                code: row.unit_code || null,
                symbol: row.unit_symbol || null,
              }
            : null,
        }
      : undefined,
    barcode: row.barcode,
    barcode_type: row.barcode_type,
    is_primary: Boolean(row.is_primary),
    is_active: Boolean(row.is_active),
    created_by: row.created_by ? Number(row.created_by) : null,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
  };
};

/**
 * Maps an array of database rows to an array of ProductBarcodeDTOs
 * @param {Array<Object>} rows Array of raw database rows
 * @returns {Array<import('./productBarcode.types.js').ProductBarcodeDTO>} Array of Product Barcode DTOs
 */
export const toProductBarcodeListDTO = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map(toProductBarcodeDTO).filter(Boolean);
};

export default {
  toProductBarcodeDTO,
  toProductBarcodeListDTO,
};
