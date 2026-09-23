/**
 * @fileoverview Data transfer object mappers for Product Prices and Price History
 */

const parseNumber = (val) => {
  if (val === null || val === undefined) return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
};

/**
 * Maps database row to ProductPriceDTO
 * @param {Object} row
 * @returns {import('./productPrice.types.js').ProductPriceDTO|null}
 */
export const toProductPriceDTO = (row) => {
  if (!row) return null;

  return {
    id: String(row.id),
    company_id: String(row.company_id),
    company_name: row.company_name || null,
    company_code: row.company_code || null,
    product_id: String(row.product_id),
    product_name: row.product_name || null,
    product_code: row.product_code || null,
    variant_id: String(row.variant_id),
    variant_sku: row.variant_sku || null,
    variant_name: row.variant_name || null,
    price_type: row.price_type,
    purchase_price: parseNumber(row.purchase_price),
    cost_price: parseNumber(row.cost_price),
    mrp: parseNumber(row.mrp),
    selling_price: parseNumber(row.selling_price),
    min_selling_price: parseNumber(row.min_selling_price),
    currency_code: row.currency_code,
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
 * Maps array of database rows to ProductPriceDTO array
 * @param {Array<Object>} rows
 * @returns {Array<import('./productPrice.types.js').ProductPriceDTO>}
 */
export const toProductPricesDTO = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map(toProductPriceDTO).filter(Boolean);
};

/**
 * Maps database row to ProductPriceHistoryDTO
 * @param {Object} row
 * @returns {import('./productPrice.types.js').ProductPriceHistoryDTO|null}
 */
export const toProductPriceHistoryDTO = (row) => {
  if (!row) return null;

  return {
    id: String(row.id),
    company_id: String(row.company_id),
    company_name: row.company_name || null,
    company_code: row.company_code || null,
    product_id: String(row.product_id),
    product_name: row.product_name || null,
    product_code: row.product_code || null,
    variant_id: String(row.variant_id),
    variant_sku: row.variant_sku || null,
    variant_name: row.variant_name || null,
    product_price_id: row.product_price_id ? String(row.product_price_id) : null,
    price_type: row.price_type,
    old_purchase_price: parseNumber(row.old_purchase_price),
    new_purchase_price: parseNumber(row.new_purchase_price),
    old_cost_price: parseNumber(row.old_cost_price),
    new_cost_price: parseNumber(row.new_cost_price),
    old_mrp: parseNumber(row.old_mrp),
    new_mrp: parseNumber(row.new_mrp),
    old_selling_price: parseNumber(row.old_selling_price),
    new_selling_price: parseNumber(row.new_selling_price),
    reason: row.reason || null,
    changed_by: row.changed_by ? String(row.changed_by) : null,
    changed_by_name: row.changed_by_name || null,
    changed_at: row.changed_at ? new Date(row.changed_at).toISOString() : null,
  };
};

/**
 * Maps array of database rows to ProductPriceHistoryDTO array
 * @param {Array<Object>} rows
 * @returns {Array<import('./productPrice.types.js').ProductPriceHistoryDTO>}
 */
export const toProductPriceHistoriesDTO = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map(toProductPriceHistoryDTO).filter(Boolean);
};
