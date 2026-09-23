/**
 * Product Master: Brand Data Mapper
 * Transforms raw database rows into client-facing response DTOs.
 */

export const toBrandDTO = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    companyId: Number(row.company_id),
    ...(row.company_name ? { companyName: row.company_name } : {}),
    ...(row.company_code ? { companyCode: row.company_code } : {}),
    brandCode: row.brand_code,
    brandName: row.brand_name,
    description: row.description || null,
    logoUrl: row.logo_url || null,
    logoKey: row.logo_key || null,
    websiteUrl: row.website_url || null,
    displayOrder: Number(row.display_order ?? 0),
    isActive: Boolean(row.is_active),
    createdBy: row.created_by ? Number(row.created_by) : null,
    updatedBy: row.updated_by ? Number(row.updated_by) : null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
};

export const toBrandListDTO = (rows) => {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map(toBrandDTO);
};

export default {
  toBrandDTO,
  toBrandListDTO,
};
