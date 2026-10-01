/**
 * Company Tax Detail Data Mapper
 * Transforms raw database records into clean client-facing response DTOs.
 * Provides both camelCase and snake_case properties.
 */

export const toCompanyTaxDetailDTO = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    companyId: Number(row.company_id),
    company_id: Number(row.company_id),
    ...(row.company_name ? { companyName: row.company_name, company_name: row.company_name } : {}),
    ...(row.company_code ? { companyCode: row.company_code, company_code: row.company_code } : {}),
    gstin: row.gstin || null,
    panNumber: row.pan_number || null,
    pan_number: row.pan_number || null,
    tanNumber: row.tan_number || null,
    tan_number: row.tan_number || null,
    gstRegistrationType: row.gst_registration_type || 'regular',
    gst_registration_type: row.gst_registration_type || 'regular',
    gstStateCode: row.gst_state_code || null,
    gst_state_code: row.gst_state_code || null,
    taxRegisteredName: row.tax_registered_name || null,
    tax_registered_name: row.tax_registered_name || null,
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

export const toCompanyTaxDetailListDTO = (rows) => {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map(toCompanyTaxDetailDTO);
};

export default {
  toCompanyTaxDetailDTO,
  toCompanyTaxDetailListDTO,
};
