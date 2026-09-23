/**
 * Transform database material entity to client DTO
 * @param {Object} row - Raw PostgreSQL row
 * @returns {Object|null}
 */
export const toMaterialDTO = (row) => {
  if (!row) return null;

  return {
    id: Number(row.id),
    companyId: Number(row.company_id),
    companyName: row.company_name || undefined,
    companyCode: row.company_code || undefined,
    materialCode: row.material_code,
    materialName: row.material_name,
    description: row.description || null,
    isActive: Boolean(row.is_active),
    createdBy: row.created_by ? Number(row.created_by) : null,
    updatedBy: row.updated_by ? Number(row.updated_by) : null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
  };
};

/**
 * Transform an array of database material entities to client DTOs
 * @param {Array<Object>} rows - Array of PostgreSQL rows
 * @returns {Array<Object>}
 */
export const toMaterialListDTO = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map(toMaterialDTO).filter(Boolean);
};

export default {
  toMaterialDTO,
  toMaterialListDTO,
};
