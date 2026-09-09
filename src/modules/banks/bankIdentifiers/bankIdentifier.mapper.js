/**
 * Bank Identifier Data Mapper
 * Transforms raw database records into clean client-facing response DTOs.
 */

export const toBankIdentifierDTO = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    bankId: Number(row.bank_id),
    ...(row.bank_name ? { bankName: row.bank_name } : {}),
    ...(row.bank_code ? { bankCode: row.bank_code } : {}),
    identifierType: row.identifier_type,
    identifierValue: row.identifier_value,
    branchName: row.branch_name || null,
    city: row.city || null,
    state: row.state || null,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
};

export const toBankIdentifierListDTO = (rows) => {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map(toBankIdentifierDTO);
};

export default {
  toBankIdentifierDTO,
  toBankIdentifierListDTO,
};
