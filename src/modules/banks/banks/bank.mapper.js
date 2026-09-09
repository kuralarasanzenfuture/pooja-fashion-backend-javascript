/**
 * Bank Master Data Mapper
 * Transforms raw database records into clean client-facing response DTOs.
 */

export const toBankDTO = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    bankCode: row.bank_code,
    bankName: row.bank_name,
    shortName: row.short_name || null,
    legalName: row.legal_name || null,
    bankType: row.bank_type,
    logoUrl: row.logo_url || null,
    logoLightUrl: row.logo_light_url || null,
    logoDarkUrl: row.logo_dark_url || null,
    websiteUrl: row.website_url || null,
    countryCode: row.country_code || 'IN',
    isActive: Boolean(row.is_active),
    isVerified: Boolean(row.is_verified),
    displayOrder: Number(row.display_order || 0),
    metadata: row.metadata || null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
};

export const toBankListDTO = (rows) => {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map(toBankDTO);
};

export default {
  toBankDTO,
  toBankListDTO,
};
