/**
 * Company Data Mapper
 * Transforms raw database records into clean client-facing response DTOs.
 */

export const toCompanyDTO = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    companyCode: row.company_code,
    companyName: row.company_name,
    legalName: row.legal_name || null,
    displayName: row.display_name || null,
    businessType: row.business_type || null,
    industryType: row.industry_type || null,
    registrationNumber: row.registration_number || null,
    email: row.email || null,
    phone: row.phone || null,
    mobile: row.mobile || null,
    website: row.website || null,
    logoUrl: row.logo_url || null,
    defaultCurrency: row.default_currency || 'INR',
    countryCode: row.country_code || 'IN',
    timezone: row.timezone || 'Asia/Kolkata',
    financialYearStartMonth: Number(row.financial_year_start_month || 4),
    status: row.status,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
};

export const toCompanyListDTO = (rows) => {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map(toCompanyDTO);
};

export default {
  toCompanyDTO,
  toCompanyListDTO,
};
