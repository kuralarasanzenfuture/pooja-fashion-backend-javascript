/**
 * Product Master: Unit Data Mapper
 * Transforms raw database rows into client-facing response DTOs.
 */

export const toUnitDTO = (row) => {
  if (!row) return null;

  return {
    id: Number(row.id),
    companyId: Number(row.company_id),
    ...(row.company_name ? { companyName: row.company_name } : {}),
    ...(row.company_code ? { companyCode: row.company_code } : {}),
    unitCode: row.unit_code,
    unitName: row.unit_name,
    decimalPlaces: row.decimal_places !== undefined && row.decimal_places !== null ? Number(row.decimal_places) : 0,
    isActive: Boolean(row.is_active),
    createdBy: row.created_by ? Number(row.created_by) : null,
    updatedBy: row.updated_by ? Number(row.updated_by) : null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
};

export const toUnitListDTO = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map(toUnitDTO).filter(Boolean);
};

export default {
  toUnitDTO,
  toUnitListDTO,
};
