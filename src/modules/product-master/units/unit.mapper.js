/**
 * Transform database unit entity to client DTO
 * @param {Object} row - Raw PostgreSQL row
 * @returns {Object|null}
 */
export const toUnitDTO = (row) => {
  if (!row) return null;

  return {
    id: Number(row.id),
    companyId: Number(row.company_id),
    companyName: row.company_name || undefined,
    companyCode: row.company_code || undefined,
    unitCode: row.unit_code,
    unitName: row.unit_name,
    decimalPlaces: row.decimal_places !== undefined && row.decimal_places !== null ? Number(row.decimal_places) : 0,
    isActive: Boolean(row.is_active),
    createdBy: row.created_by ? Number(row.created_by) : null,
    updatedBy: row.updated_by ? Number(row.updated_by) : null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
  };
};

/**
 * Transform an array of database unit entities to client DTOs
 * @param {Array<Object>} rows - Array of PostgreSQL rows
 * @returns {Array<Object>}
 */
export const toUnitListDTO = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map(toUnitDTO).filter(Boolean);
};

export default {
  toUnitDTO,
  toUnitListDTO,
};
