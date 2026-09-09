/**
 * Map raw database row to sanitized Branch Address DTO
 */
export const toBranchAddressDTO = (row) => {
  if (!row) return null;

  const dto = {
    id: parseInt(row.id, 10),
    branch_id: parseInt(row.branch_id, 10),
    address_line_1: row.address_line_1,
    address_line_2: row.address_line_2 || null,
    city: row.city || null,
    district: row.district || null,
    state: row.state || null,
    postal_code: row.postal_code || null,
    country: row.country || 'India',
    landmark: row.landmark || null,
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
 * Map array of rows to Branch Address DTO list
 */
export const toBranchAddressListDTO = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map(toBranchAddressDTO);
};

export default {
  toBranchAddressDTO,
  toBranchAddressListDTO,
};
