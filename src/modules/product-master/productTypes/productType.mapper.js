/**
 * Transform database product type entity to client DTO
 * @param {Object} row - Raw PostgreSQL row
 * @returns {Object|null}
 */
export const toProductTypeDTO = (row) => {
  if (!row) return null;

  return {
    id: Number(row.id),
    companyId: Number(row.company_id),
    companyName: row.company_name || undefined,
    companyCode: row.company_code || undefined,
    typeCode: row.type_code,
    typeName: row.type_name,
    description: row.description || null,
    isStockItem: Boolean(row.is_stock_item),
    isSaleable: Boolean(row.is_saleable),
    isPurchasable: Boolean(row.is_purchasable),
    isActive: Boolean(row.is_active),
    createdBy: row.created_by ? Number(row.created_by) : null,
    updatedBy: row.updated_by ? Number(row.updated_by) : null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
  };
};

/**
 * Transform an array of database product type entities to client DTOs
 * @param {Array<Object>} rows - Array of PostgreSQL rows
 * @returns {Array<Object>}
 */
export const toProductTypeListDTO = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map(toProductTypeDTO).filter(Boolean);
};

export default {
  toProductTypeDTO,
  toProductTypeListDTO,
};
