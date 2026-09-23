/**
 * @fileoverview Data transfer object mappers for Taxes
 */

const parseRate = (val) => {
  if (val === null || val === undefined) return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : Number(num.toFixed(4));
};

/**
 * Maps database row to TaxDTO
 * @param {Object} row
 * @returns {import('./tax.types.js').TaxDTO|null}
 */
export const toTaxDTO = (row) => {
  if (!row) return null;

  return {
    id: String(row.id),
    company_id: String(row.company_id),
    company_name: row.company_name || null,
    company_code: row.company_code || null,
    tax_code: row.tax_code,
    tax_name: row.tax_name,
    tax_type: row.tax_type,
    rate: parseRate(row.rate),
    cgst_rate: parseRate(row.cgst_rate),
    sgst_rate: parseRate(row.sgst_rate),
    igst_rate: parseRate(row.igst_rate),
    cess_rate: parseRate(row.cess_rate),
    is_inclusive: Boolean(row.is_inclusive),
    is_active: Boolean(row.is_active),
    created_by: row.created_by ? String(row.created_by) : null,
    created_by_name: row.created_by_name || null,
    updated_by: row.updated_by ? String(row.updated_by) : null,
    updated_by_name: row.updated_by_name || null,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
};

/**
 * Maps array of database rows to TaxDTO array
 * @param {Array<Object>} rows
 * @returns {Array<import('./tax.types.js').TaxDTO>}
 */
export const toTaxesDTO = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map(toTaxDTO).filter(Boolean);
};
