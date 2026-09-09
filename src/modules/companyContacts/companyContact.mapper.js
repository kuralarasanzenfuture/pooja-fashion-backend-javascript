/**
 * Company Contact Data Mapper
 * Transforms raw database records into clean client-facing response DTOs.
 */

export const toCompanyContactDTO = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    companyId: Number(row.company_id),
    ...(row.company_name ? { companyName: row.company_name } : {}),
    ...(row.company_code ? { companyCode: row.company_code } : {}),
    contactType: row.contact_type,
    contactName: row.contact_name,
    designation: row.designation || null,
    email: row.email || null,
    phone: row.phone || null,
    mobile: row.mobile || null,
    isPrimary: Boolean(row.is_primary),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
};

export const toCompanyContactListDTO = (rows) => {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map(toCompanyContactDTO);
};

export default {
  toCompanyContactDTO,
  toCompanyContactListDTO,
};
