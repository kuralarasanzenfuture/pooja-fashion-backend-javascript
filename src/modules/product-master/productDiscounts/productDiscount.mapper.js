/**
 * @fileoverview Data transfer object mappers for Product Discounts
 */

const parseNumber = (val) => {
  if (val === null || val === undefined) return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
};

/**
 * Maps database row to ProductDiscountDTO
 * @param {Object} row
 * @returns {import('./productDiscount.types.js').ProductDiscountDTO|null}
 */
export const toProductDiscountDTO = (row) => {
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
    discount_id: String(row.discount_id),
    discount_code: row.discount_code || null,
    discount_name: row.discount_name || null,
    discount_type: row.discount_type || null,
    discount_value: parseNumber(row.discount_value),
    minimum_quantity: parseNumber(row.minimum_quantity),
    maximum_discount: parseNumber(row.maximum_discount),
    priority: parseInt(row.priority || 0, 10),
    is_stackable: Boolean(row.is_stackable),
    is_primary: Boolean(row.is_primary),
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
 * Maps array of database rows to ProductDiscountDTO array
 * @param {Array<Object>} rows
 * @returns {Array<import('./productDiscount.types.js').ProductDiscountDTO>}
 */
export const toProductDiscountsDTO = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map(toProductDiscountDTO).filter(Boolean);
};

/**
 * Maps resolved database row with optional calculations to ResolvedDiscountDTO
 * @param {Object} row
 * @param {Object} [calc]
 * @returns {import('./productDiscount.types.js').ResolvedDiscountDTO|null}
 */
export const toResolvedDiscountDTO = (row, calc = null) => {
  if (!row) return null;

  return {
    mapping_id: String(row.id),
    company_id: String(row.company_id),
    product_id: String(row.product_id),
    product_name: row.product_name || null,
    product_code: row.product_code || null,
    variant_id: row.variant_id ? String(row.variant_id) : null,
    variant_sku: row.variant_sku || null,
    variant_name: row.variant_name || null,
    discount_id: String(row.discount_id),
    discount_code: row.discount_code,
    discount_name: row.discount_name,
    discount_type: row.discount_type,
    discount_value: parseNumber(row.discount_value),
    minimum_quantity: parseNumber(row.minimum_quantity),
    maximum_discount: parseNumber(row.maximum_discount),
    priority: parseInt(row.priority || 0, 10),
    is_stackable: Boolean(row.is_stackable),
    is_primary: Boolean(row.is_primary),
    original_amount: calc?.original_amount ?? null,
    quantity: calc?.quantity ?? null,
    raw_discount: calc?.raw_discount ?? null,
    applied_discount: calc?.applied_discount ?? null,
    final_amount: calc?.final_amount ?? null,
    savings_percentage: calc?.savings_percentage ?? null,
    is_applicable: calc?.is_applicable ?? true,
    reason_inapplicable: calc?.reason_inapplicable ?? null,
  };
};
