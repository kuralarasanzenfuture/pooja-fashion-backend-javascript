/**
 * Company Tax Detail Data Mapper
 * Transforms raw database records into clean client-facing response DTOs.
 */

export const toCompanyTaxDetailDTO = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    companyId: Number(row.company_id),
    ...(row.company_name ? { companyName: row.company_name } : {}),
    ...(row.company_code ? { companyCode: row.company_code } : {}),
    gstin: row.gstin || null,
    panNumber: row.pan_number || null,
    tanNumber: row.tan_number || null,
    gstRegistrationType: row.gst_registration_type || null,
    gstStateCode: row.gst_state_code || null,
    taxRegisteredName: row.tax_registered_name || null,
    isPrimary: Boolean(row.is_primary),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
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
