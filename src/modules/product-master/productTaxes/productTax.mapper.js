/**
 * @fileoverview Data transfer object mappers for Product Taxes
 */

const parseRate = (val) => {
  if (val === null || val === undefined) return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : Number(num.toFixed(4));
};

/**
 * Maps database row to ProductTaxDTO
 * @param {Object} row
 * @returns {import('./productTax.types.js').ProductTaxDTO|null}
 */
export const toProductTaxDTO = (row) => {
  if (!row) return null;

  return {
    id: String(row.id),
    company_id: String(row.company_id),
    company_name: row.company_name || null,
    company_code: row.company_code || null,
    product_id: String(row.product_id),
    product_name: row.product_name || null,
    product_code: row.product_code || null,
    variant_id: row.variant_id ? String(row.variant_id) : null,
    variant_sku: row.variant_sku || null,
    variant_name: row.variant_name || null,
    tax_id: String(row.tax_id),
    tax_code: row.tax_code || null,
    tax_name: row.tax_name || null,
    tax_type: row.tax_type || null,
    rate: parseRate(row.rate),
    cgst_rate: parseRate(row.cgst_rate),
    sgst_rate: parseRate(row.sgst_rate),
    igst_rate: parseRate(row.igst_rate),
    cess_rate: parseRate(row.cess_rate),
    is_inclusive: Boolean(row.is_inclusive),
    is_primary: Boolean(row.is_primary),
    effective_from: row.effective_from ? new Date(row.effective_from).toISOString() : null,
    effective_to: row.effective_to ? new Date(row.effective_to).toISOString() : null,
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
 * Maps array of database rows to ProductTaxDTO array
 * @param {Array<Object>} rows
 * @returns {Array<import('./productTax.types.js').ProductTaxDTO>}
 */
export const toProductTaxesDTO = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map(toProductTaxDTO).filter(Boolean);
};

/**
 * Maps resolved tax row to ResolvedTaxDTO for POS / billing checkout
 * @param {Object} row
 * @returns {import('./productTax.types.js').ResolvedTaxDTO|null}
 */
export const toResolvedTaxDTO = (row) => {
  if (!row) return null;

  return {
    id: String(row.id),
    company_id: String(row.company_id),
    product_id: String(row.product_id),
    product_name: row.product_name || null,
    product_code: row.product_code || null,
    variant_id: row.variant_id ? String(row.variant_id) : null,
    variant_sku: row.variant_sku || null,
    variant_name: row.variant_name || null,
    tax_id: String(row.tax_id),
    tax_code: row.tax_code,
    tax_name: row.tax_name,
    tax_type: row.tax_type,
    rate: parseRate(row.rate),
    cgst_rate: parseRate(row.cgst_rate),
    sgst_rate: parseRate(row.sgst_rate),
    igst_rate: parseRate(row.igst_rate),
    cess_rate: parseRate(row.cess_rate),
    is_inclusive: Boolean(row.is_inclusive),
    is_primary: Boolean(row.is_primary),
    effective_from: row.effective_from ? new Date(row.effective_from).toISOString() : null,
    effective_to: row.effective_to ? new Date(row.effective_to).toISOString() : null,
    is_active: Boolean(row.is_active),
    resolution_level: row.variant_id ? 'VARIANT' : 'PRODUCT',
  };
};
