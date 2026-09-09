/**
 * Map raw database row to sanitized Branch Contact DTO
 */
export const toBranchContactDTO = (row) => {
  if (!row) return null;

  const dto = {
    id: parseInt(row.id, 10),
    branch_id: parseInt(row.branch_id, 10),
    contact_name: row.contact_name,
    designation: row.designation || null,
    email: row.email || null,
    phone: row.phone || null,
    mobile: row.mobile || null,
    is_primary: Boolean(row.is_primary),
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };

  if (row.branch_code || row.branch_name) {
    dto.branch = {
      id: parseInt(row.branch_id, 10),
      branch_code: row.branch_code || null,
      branch_name: row.branch_name || null,
    };
  }

  return dto;
};

/**
 * Map array of rows to Branch Contact DTO list
 */
export const toBranchContactListDTO = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map(toBranchContactDTO);
};

export default {
  toBranchContactDTO,
  toBranchContactListDTO,
};
