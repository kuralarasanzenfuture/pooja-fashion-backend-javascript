/**
 * Company Address Data Mapper
 * Transforms raw database records into clean client-facing response DTOs.
 * Provides both camelCase and snake_case properties to ensure seamless frontend and API compatibility.
 */

export const toCompanyAddressDTO = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    companyId: Number(row.company_id),
    company_id: Number(row.company_id),
    ...(row.company_name ? { companyName: row.company_name, company_name: row.company_name } : {}),
    ...(row.company_code ? { companyCode: row.company_code, company_code: row.company_code } : {}),
    addressType: row.address_type,
    address_type: row.address_type,
    addressLine1: row.address_line_1,
    address_line_1: row.address_line_1,
    addressLine2: row.address_line_2 || null,
    address_line_2: row.address_line_2 || null,
    city: row.city || null,
    district: row.district || null,
    state: row.state || null,
    postalCode: row.postal_code || null,
    postal_code: row.postal_code || null,
    country: row.country || 'India',
    landmark: row.landmark || null,
    isPrimary: Boolean(row.is_primary),
    is_primary: Boolean(row.is_primary),
    isActive: Boolean(row.is_active),
    is_active: Boolean(row.is_active),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
};

export const toCompanyAddressListDTO = (rows) => {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map(toCompanyAddressDTO);
};

export default {
  toCompanyAddressDTO,
  toCompanyAddressListDTO,
};
