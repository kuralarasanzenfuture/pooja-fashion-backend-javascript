/**
 * Product Master: Category Data Mapper
 * Transforms raw database rows into client-facing response DTOs.
 * Provides both camelCase and snake_case properties for robust frontend compatibility.
 */

export const toCategoryDTO = (row) => {
  if (!row) {
    return null;
  }

  const companyId = row.company_id ? Number(row.company_id) : null;
  const companyName = row.company_name || null;
  const companyCode = row.company_code || null;
  const id = Number(row.id);
  const displayOrder = Number(row.display_order ?? 0);
  const isActive = Boolean(row.is_active);
  const createdBy = row.created_by ? Number(row.created_by) : null;
  const updatedBy = row.updated_by ? Number(row.updated_by) : null;
  const createdAt = row.created_at ? new Date(row.created_at).toISOString() : null;
  const updatedAt = row.updated_at ? new Date(row.updated_at).toISOString() : null;

  return {
    id,
    companyId,
    company_id: companyId,
    companyName,
    company_name: companyName,
    companyCode,
    company_code: companyCode,
    categoryCode: row.category_code,
    category_code: row.category_code,
    categoryName: row.category_name,
    category_name: row.category_name,
    description: row.description || null,
    imageUrl: row.image_url || null,
    image_url: row.image_url || null,
    imageKey: row.image_key || null,
    image_key: row.image_key || null,
    displayOrder,
    display_order: displayOrder,
    isActive,
    is_active: isActive,
    createdBy,
    created_by: createdBy,
    updatedBy,
    updated_by: updatedBy,
    createdAt,
    created_at: createdAt,
    updatedAt,
    updated_at: updatedAt,
  };
};

export const toCategoryListDTO = (rows) => {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map(toCategoryDTO);
};

export default {
  toCategoryDTO,
  toCategoryListDTO,
};
