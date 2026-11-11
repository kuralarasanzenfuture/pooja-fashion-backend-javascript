/**
 * Product Master: Subcategory Data Mapper
 * Transforms raw database rows into client-facing response DTOs.
 * Provides both camelCase and snake_case properties for robust frontend compatibility.
 */

export const toSubcategoryDTO = (row) => {
  if (!row) {
    return null;
  }

  const companyId = row.company_id ? Number(row.company_id) : null;
  const companyName = row.company_name || null;
  const companyCode = row.company_code || null;
  const categoryId = row.category_id ? Number(row.category_id) : null;
  const categoryName = row.category_name || null;
  const categoryCode = row.category_code || null;
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
    categoryId,
    category_id: categoryId,
    categoryName,
    category_name: categoryName,
    categoryCode,
    category_code: categoryCode,
    subcategoryCode: row.subcategory_code,
    subcategory_code: row.subcategory_code,
    subcategoryName: row.subcategory_name,
    subcategory_name: row.subcategory_name,
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

export const toSubcategoryListDTO = (rows) => {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map(toSubcategoryDTO);
};

export default {
  toSubcategoryDTO,
  toSubcategoryListDTO,
};
