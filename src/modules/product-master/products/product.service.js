import * as productRepository from './product.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import * as categoryRepository from '../categories/category.repository.js';
import * as subCategoryRepository from '../subCategories/subCategory.repository.js';
import * as brandRepository from '../brands/brand.repository.js';
import * as productTypeRepository from '../productTypes/productType.repository.js';
import * as unitRepository from '../units/unit.repository.js';
import { toProductDTO, toProductListDTO } from './product.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';

/**
 * Generate fallback uppercase product code from name if omitted
 * @param {string} name 
 * @returns {string}
 */
export const generateProductCode = (name) => {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 50);
};

/**
 * Helper to validate relational existence and company tenancy
 */
const validateRelations = async ({
  companyId,
  categoryId,
  subcategoryId,
  brandId,
  productTypeId,
  defaultUnitId,
}) => {
  if (companyId !== undefined) {
    const company = await companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError(`Company with ID ${companyId} not found`);
    }
  }

  if (categoryId !== undefined) {
    const category = await categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundError(`Category with ID ${categoryId} not found`);
    }
    if (companyId && Number(category.company_id) !== Number(companyId)) {
      throw new BadRequestError(`Category ${categoryId} does not belong to company ${companyId}`);
    }
  }

  if (subcategoryId !== undefined && subcategoryId !== null) {
    const subcategory = await subCategoryRepository.findById(subcategoryId);
    if (!subcategory) {
      throw new NotFoundError(`Subcategory with ID ${subcategoryId} not found`);
    }
    if (companyId && Number(subcategory.company_id) !== Number(companyId)) {
      throw new BadRequestError(`Subcategory ${subcategoryId} does not belong to company ${companyId}`);
    }
    if (categoryId && Number(subcategory.category_id) !== Number(categoryId)) {
      throw new BadRequestError(`Subcategory ${subcategoryId} does not belong to category ${categoryId}`);
    }
  }

  if (brandId !== undefined && brandId !== null) {
    const brand = await brandRepository.findById(brandId);
    if (!brand) {
      throw new NotFoundError(`Brand with ID ${brandId} not found`);
    }
    if (companyId && Number(brand.company_id) !== Number(companyId)) {
      throw new BadRequestError(`Brand ${brandId} does not belong to company ${companyId}`);
    }
  }

  if (productTypeId !== undefined && productTypeId !== null) {
    const productType = await productTypeRepository.findById(productTypeId);
    if (!productType) {
      throw new NotFoundError(`Product type with ID ${productTypeId} not found`);
    }
    if (companyId && Number(productType.company_id) !== Number(companyId)) {
      throw new BadRequestError(`Product type ${productTypeId} does not belong to company ${companyId}`);
    }
  }

  if (defaultUnitId !== undefined) {
    const unit = await unitRepository.findById(defaultUnitId);
    if (!unit) {
      throw new NotFoundError(`Unit with ID ${defaultUnitId} not found`);
    }
    if (companyId && Number(unit.company_id) !== Number(companyId)) {
      throw new BadRequestError(`Default unit ${defaultUnitId} does not belong to company ${companyId}`);
    }
  }
};

/**
 * List products with pagination, filtering, and search
 */
export const getProducts = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = query.company_id || query.companyId || null;
  const categoryId = query.category_id || null;
  const subcategoryId = query.subcategory_id || null;
  const brandId = query.brand_id || null;
  const productTypeId = query.product_type_id || null;
  const defaultUnitId = query.default_unit_id || null;
  const isVariantProduct = query.is_variant_product !== undefined ? query.is_variant_product : null;
  const trackStock = query.track_stock !== undefined ? query.track_stock : null;
  const allowNegativeStock = query.allow_negative_stock !== undefined ? query.allow_negative_stock : null;
  const isActive = query.is_active !== undefined ? query.is_active : null;

  const { rows, total } = await productRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    categoryId,
    subcategoryId,
    brandId,
    productTypeId,
    defaultUnitId,
    isVariantProduct,
    trackStock,
    allowNegativeStock,
    isActive,
    sortBy: sortBy || 'product_name',
    sortOrder: sortOrder || 'ASC',
  });

  return {
    products: toProductListDTO(rows),
    pagination: formatPaginationMeta(total, page, limit),
  };
};

/**
 * Get product by primary key ID
 */
export const getProductById = async (id) => {
  const row = await productRepository.findById(id);
  if (!row) {
    throw new NotFoundError(`Product with ID ${id} not found`);
  }
  return toProductDTO(row);
};

/**
 * Get product by company ID and product code
 */
export const getProductByCode = async (companyId, productCode) => {
  const row = await productRepository.findByCode(companyId, productCode);
  if (!row) {
    throw new NotFoundError(`Product with code '${productCode}' not found for company ${companyId}`);
  }
  return toProductDTO(row);
};

/**
 * Create a new product with relational validation and unique code check
 */
export const createProduct = async (data) => {
  await validateRelations({
    companyId: data.company_id,
    categoryId: data.category_id,
    subcategoryId: data.subcategory_id,
    brandId: data.brand_id,
    productTypeId: data.product_type_id,
    defaultUnitId: data.default_unit_id,
  });

  const productCode = data.product_code || generateProductCode(data.product_name);

  const codeExists = await productRepository.existsByCode(data.company_id, productCode);
  if (codeExists) {
    throw new BadRequestError(`Product code '${productCode}' is already in use for this company`);
  }

  const created = await productRepository.create({
    ...data,
    product_code: productCode,
  });

  return toProductDTO(created);
};

/**
 * Update an existing product with relational validation and unique code check
 */
export const updateProduct = async (id, data) => {
  const existing = await productRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Product with ID ${id} not found`);
  }

  const effectiveCompanyId = data.company_id !== undefined ? data.company_id : Number(existing.company_id);
  const effectiveCategoryId = data.category_id !== undefined ? data.category_id : Number(existing.category_id);
  const effectiveSubcategoryId =
    data.subcategory_id !== undefined
      ? data.subcategory_id
      : existing.subcategory_id
      ? Number(existing.subcategory_id)
      : null;
  const effectiveBrandId =
    data.brand_id !== undefined
      ? data.brand_id
      : existing.brand_id
      ? Number(existing.brand_id)
      : null;
  const effectiveProductTypeId =
    data.product_type_id !== undefined
      ? data.product_type_id
      : existing.product_type_id
      ? Number(existing.product_type_id)
      : null;
  const effectiveDefaultUnitId =
    data.default_unit_id !== undefined ? data.default_unit_id : Number(existing.default_unit_id);

  await validateRelations({
    companyId: effectiveCompanyId,
    categoryId: effectiveCategoryId,
    subcategoryId: effectiveSubcategoryId,
    brandId: effectiveBrandId,
    productTypeId: effectiveProductTypeId,
    defaultUnitId: effectiveDefaultUnitId,
  });

  if (data.product_code) {
    const codeExists = await productRepository.existsByCode(effectiveCompanyId, data.product_code, id);
    if (codeExists) {
      throw new BadRequestError(`Product code '${data.product_code}' is already in use for this company`);
    }
  }

  const updated = await productRepository.update(id, data);
  return toProductDTO(updated);
};

/**
 * Toggle or set product active status
 */
export const updateStatus = async (id, isActive, updatedBy = null) => {
  const existing = await productRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Product with ID ${id} not found`);
  }

  const updated = await productRepository.updateStatus(id, isActive, updatedBy);
  return toProductDTO(updated);
};

/**
 * Safely delete product, verifying dependent variants first
 */
export const deleteProduct = async (id) => {
  const existing = await productRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Product with ID ${id} not found`);
  }

  const variantCount = await productRepository.countVariants(id);
  if (variantCount > 0) {
    throw new BadRequestError(
      `Cannot delete product '${existing.product_name}' because it has ${variantCount} associated product variant(s)`
    );
  }

  const deleted = await productRepository.deleteById(id);
  return toProductDTO(deleted);
};

export default {
  generateProductCode,
  getProducts,
  getProductById,
  getProductByCode,
  createProduct,
  updateProduct,
  updateStatus,
  deleteProduct,
};
