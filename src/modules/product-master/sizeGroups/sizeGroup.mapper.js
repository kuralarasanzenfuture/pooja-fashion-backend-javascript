/**
 * Product Master: Size Group Data Mapper
 * Transforms raw database rows into client-facing response DTOs.
 */

export const toSizeGroupDTO = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    companyId: Number(row.company_id),
    ...(row.company_name ? { companyName: row.company_name } : {}),
    ...(row.company_code ? { companyCode: row.company_code } : {}),
    sizeGroupCode: row.size_group_code,
    sizeGroupName: row.size_group_name,
    description: row.description || null,
    isActive: Boolean(row.is_active),
    createdBy: row.created_by ? Number(row.created_by) : null,
    updatedBy: row.updated_by ? Number(row.updated_by) : null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
};

export const toSizeGroupListDTO = (rows) => {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map(toSizeGroupDTO);
};

export default {
  toSizeGroupDTO,
  toSizeGroupListDTO,
};
