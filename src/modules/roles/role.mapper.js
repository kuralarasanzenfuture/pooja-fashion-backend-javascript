/**
 * Role Data Mapper
 * Transforms raw database records into clean client-facing response DTOs.
 */

export const toRoleDTO = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    companyId: Number(row.company_id),
    roleCode: row.role_code,
    roleName: row.role_name,
    description: row.description || null,
    isSystemRole: Boolean(row.is_system_role),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
};

export const toRoleListDTO = (rows) => {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map(toRoleDTO);
};

export default {
  toRoleDTO,
  toRoleListDTO,
};
