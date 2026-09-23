/**
 * @fileoverview Data transfer object mappers for Discounts
 */

const parseNumber = (val) => {
  if (val === null || val === undefined) return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
};

/**
 * Maps database row to DiscountDTO
 * @param {Object} row
 * @returns {import('./discount.types.js').DiscountDTO|null}
 */
export const toDiscountDTO = (row) => {
  if (!row) return null;

  return {
    id: String(row.id),
    company_id: String(row.company_id),
    company_name: row.company_name || null,
    company_code: row.company_code || null,
    discount_code: row.discount_code,
    discount_name: row.discount_name,
    discount_type: row.discount_type,
    discount_value: parseNumber(row.discount_value),
    minimum_quantity: parseNumber(row.minimum_quantity),
    maximum_discount: parseNumber(row.maximum_discount),
    start_at: row.start_at ? new Date(row.start_at).toISOString() : null,
    end_at: row.end_at ? new Date(row.end_at).toISOString() : null,
    priority: parseInt(row.priority || 0, 10),
    is_stackable: Boolean(row.is_stackable),
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
 * Maps array of database rows to DiscountDTO array
 * @param {Array<Object>} rows
 * @returns {Array<import('./discount.types.js').DiscountDTO>}
 */
export const toDiscountsDTO = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map(toDiscountDTO).filter(Boolean);
};
