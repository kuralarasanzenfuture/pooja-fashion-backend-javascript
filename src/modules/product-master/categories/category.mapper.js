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

  const dto = {
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

  if (row.subcategories !== undefined) {
    const rawSubs = typeof row.subcategories === 'string' ? JSON.parse(row.subcategories) : row.subcategories;
    dto.subcategories = Array.isArray(rawSubs)
      ? rawSubs.map((s) => ({
          id: Number(s.id),
          companyId: s.company_id ? Number(s.company_id) : companyId,
          company_id: s.company_id ? Number(s.company_id) : companyId,
          categoryId: s.category_id ? Number(s.category_id) : id,
          category_id: s.category_id ? Number(s.category_id) : id,
          subcategoryCode: s.subcategory_code,
          subcategory_code: s.subcategory_code,
          subcategoryName: s.subcategory_name,
          subcategory_name: s.subcategory_name,
          description: s.description || null,
          imageUrl: s.image_url || null,
          image_url: s.image_url || null,
          imageKey: s.image_key || null,
          image_key: s.image_key || null,
          displayOrder: Number(s.display_order ?? 0),
          display_order: Number(s.display_order ?? 0),
          isActive: Boolean(s.is_active),
          is_active: Boolean(s.is_active),
          createdAt: s.created_at ? new Date(s.created_at).toISOString() : null,
          created_at: s.created_at ? new Date(s.created_at).toISOString() : null,
          updatedAt: s.updated_at ? new Date(s.updated_at).toISOString() : null,
          updated_at: s.updated_at ? new Date(s.updated_at).toISOString() : null,
        }))
      : [];
    dto.subcategoriesCount =
      row.subcategories_count !== undefined
        ? Number(row.subcategories_count)
        : dto.subcategories.length;
    dto.subcategories_count = dto.subcategoriesCount;
  }

  return dto;
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
