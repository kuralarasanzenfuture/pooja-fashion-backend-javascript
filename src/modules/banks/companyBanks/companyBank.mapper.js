/**
 * Company Bank Account Data Mapper
 * Transforms raw database records into clean client-facing response DTOs.
 */

export const toCompanyBankDTO = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    companyId: Number(row.company_id),
    bankId: Number(row.bank_id),
    ...(row.company_name ? { companyName: row.company_name } : {}),
    ...(row.company_code ? { companyCode: row.company_code } : {}),
    ...(row.bank_name ? { bankName: row.bank_name } : {}),
    ...(row.bank_code ? { bankCode: row.bank_code } : {}),
    accountName: row.account_name,
    accountNumber: row.account_number,
    accountType: row.account_type,
    branchName: row.branch_name || null,
    branchCode: row.branch_code || null,
    ifscCode: row.ifsc_code || null,
    micrCode: row.micr_code || null,
    swiftCode: row.swift_code || null,
    openingBalance: parseFloat(row.opening_balance || 0),
    currentBalance: parseFloat(row.current_balance || 0),
    isPrimary: Boolean(row.is_primary),
    isActive: Boolean(row.is_active),
    notes: row.notes || null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
};

export const toCompanyBankListDTO = (rows) => {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map(toCompanyBankDTO);
};

export default {
  toCompanyBankDTO,
  toCompanyBankListDTO,
};
