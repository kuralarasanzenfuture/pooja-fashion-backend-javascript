/**
 * Map raw database row to sanitized Branch DTO
 */
export const toBranchDTO = (row) => {
  if (!row) return null;

  const dto = {
    id: parseInt(row.id, 10),
    company_id: parseInt(row.company_id, 10),
    branch_code: row.branch_code,
    branch_name: row.branch_name,
    branch_type: row.branch_type,
    email: row.email || null,
    phone: row.phone || null,
    mobile: row.mobile || null,
    manager_name: row.manager_name || null,
    opening_date: row.opening_date
      ? row.opening_date instanceof Date
        ? row.opening_date.toISOString().split('T')[0]
        : String(row.opening_date).split('T')[0]
      : null,
    is_main_branch: Boolean(row.is_main_branch),
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };

  if (row.company_name || row.company_code) {
    dto.company = {
      id: parseInt(row.company_id, 10),
      company_code: row.company_code || null,
      company_name: row.company_name || null,
    };
  }

  return dto;
};

/**
 * Map array of rows to Branch DTO list
 */
export const toBranchListDTO = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map(toBranchDTO);
};

export default {
  toBranchDTO,
  toBranchListDTO,
};
