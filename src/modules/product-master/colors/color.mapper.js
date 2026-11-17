/**
 * Product Master: Color Data Mapper
 * Transforms raw database rows into client-facing response DTOs.
 */

export const toColorDTO = (row) => {
  if (!row) return null;

  return {
    id: Number(row.id),
    companyId: Number(row.company_id),
    ...(row.company_name ? { companyName: row.company_name } : {}),
    ...(row.company_code ? { companyCode: row.company_code } : {}),
    colorCode: row.color_code,
    colorName: row.color_name,
    hexCode: row.hex_code || null,
    description: row.description || null,
    displayOrder: row.display_order !== undefined && row.display_order !== null ? Number(row.display_order) : 0,
    isActive: Boolean(row.is_active),
    createdBy: row.created_by ? Number(row.created_by) : null,
    updatedBy: row.updated_by ? Number(row.updated_by) : null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
};

export const toColorListDTO = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map(toColorDTO).filter(Boolean);
};

export default {
  toColorDTO,
  toColorListDTO,
};
