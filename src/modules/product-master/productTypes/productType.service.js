import * as productTypeRepository from './productType.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import { toProductTypeDTO, toProductTypeListDTO } from './productType.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import ForbiddenError from '../../../shared/errors/ForbiddenError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';
import { recordAuditLog } from '../../auditLogs/auditLog.service.js';
import {
  generateProductTypeCode,
  toSlug,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
} from './utils/index.js';

export {
  generateProductTypeCode,
  toSlug,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
};

/**
 * Standard default product types for retail & apparel ERP (5 records)
 */
export const DEFAULT_PRODUCT_TYPES = [
  {
    type_code: 'READY_MADE',
    type_name: 'Ready Made Garments',
    is_stock_item: true,
    is_saleable: true,
    is_purchasable: true,
    description: 'Shirts, T-shirts, jeans, sarees, dresses',
  },
  {
    type_code: 'FABRIC',
    type_name: 'Fabric',
    is_stock_item: true,
    is_saleable: true,
    is_purchasable: true,
    description: 'Cotton, silk, linen, textile rolls',
  },
  {
    type_code: 'ACCESSORY',
    type_name: 'Fashion Accessories',
    is_stock_item: true,
    is_saleable: true,
    is_purchasable: true,
    description: 'Belts, bags, caps, jewellery',
  },
  {
    type_code: 'FOOTWEAR',
    type_name: 'Footwear',
    is_stock_item: true,
    is_saleable: true,
    is_purchasable: true,
    description: 'Shoes, sandals, slippers, heels',
  },
  {
    type_code: 'SERVICE',
    type_name: 'Services',
    is_stock_item: false,
    is_saleable: true,
    is_purchasable: false,
    description: 'Alteration, stitching, embroidery',
  },
];

/**
 * List product types with pagination, filtering, search, and multi-tenancy.
 */
export const getProductTypes = async (query, user = null) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  const isActive = query.is_active !== undefined ? query.is_active : null;
  const isStockItem = query.is_stock_item !== undefined ? query.is_stock_item : null;
  const isSaleable = query.is_saleable !== undefined ? query.is_saleable : null;
  const isPurchasable = query.is_purchasable !== undefined ? query.is_purchasable : null;

  const { rows, total } = await productTypeRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    isStockItem,
    isSaleable,
    isPurchasable,
    isActive,
    sortBy: sortBy || 'type_name',
    sortOrder: sortOrder || 'ASC',
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    productTypes: toProductTypeListDTO(rows),
    meta,
  };
};

/**
 * Get all product types for a company without pagination (for dropdowns / selectors)
 */
export const getAllProductTypes = async (query = {}, user = null) => {
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  const isActive = query.is_active !== undefined ? query.is_active : null;
  const isStockItem = query.is_stock_item !== undefined ? query.is_stock_item : null;
  const isSaleable = query.is_saleable !== undefined ? query.is_saleable : null;
  const isPurchasable = query.is_purchasable !== undefined ? query.is_purchasable : null;
  const search = query.search ? String(query.search).trim() : null;
  const sortBy = query.sortBy || 'type_name';
  const sortOrder = query.sortOrder || 'ASC';

  const rows = await productTypeRepository.findAllByCompany(companyId, {
    isStockItem,
    isSaleable,
    isPurchasable,
    isActive,
    search,
    sortBy,
    sortOrder,
  });

  return toProductTypeListDTO(rows);
};

/**
 * Get product type aggregate statistics for a company
 */
export const getProductTypeStats = async (query = {}, user = null) => {
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  return productTypeRepository.getProductTypeStats(companyId);
};

/**
 * Get single product type by primary ID with tenant isolation check
 */
export const getProductTypeById = async (id, user = null) => {
  const productType = await productTypeRepository.findById(id);
  if (!productType) {
    throw new NotFoundError(`Product type with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(productType.company_id) !== Number(userCompId)) {
      throw new ForbiddenError(
        'You do not have permission to view product types for another company'
      );
    }
  }

  return toProductTypeDTO(productType);
};

/**
 * Get product type by company ID and code
 */
export const getProductTypeByCode = async (companyId, typeCode, user = null) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  const productType = await productTypeRepository.findByCode(effectiveCompanyId, typeCode);
  if (!productType) {
    throw new NotFoundError(
      `Product type with code '${typeCode}' not found for company ${effectiveCompanyId}`
    );
  }
  return toProductTypeDTO(productType);
};

/**
 * Get all product types for a company
 */
export const getProductTypesByCompanyId = async (companyId, options = {}, user = null) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  const company = await companyRepository.findById(effectiveCompanyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${effectiveCompanyId} not found`);
  }

  const rows = await productTypeRepository.findByCompanyId(effectiveCompanyId, options);
  return toProductTypeListDTO(rows);
};

/**
 * Check whether a product type name already exists for a company
 */
export const checkProductTypeNameExists = async ({ name, type_name, companyId = null, excludeId = null, user = null }) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  if (!effectiveCompanyId) {
    throw new BadRequestError('Company ID is required to check product type name');
  }

  const trimmedName = String(name || type_name || '').trim();
  if (!trimmedName) {
    throw new BadRequestError('Product type name is required');
  }

  const exists = await productTypeRepository.existsByName(effectiveCompanyId, trimmedName, excludeId);
  return {
    exists,
    message: exists
      ? `Product type name '${trimmedName}' is already taken`
      : `Product type name '${trimmedName}' is available`,
    name: trimmedName,
    companyId: effectiveCompanyId,
  };
};

/**
 * Check whether a product type code already exists for a company
 */
export const checkProductTypeCodeExists = async ({ code, type_code, companyId = null, excludeId = null, user = null }) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  if (!effectiveCompanyId) {
    throw new BadRequestError('Company ID is required to check product type code');
  }

  const trimmedCode = String(code || type_code || '').trim().toUpperCase();
  if (!trimmedCode) {
    throw new BadRequestError('Product type code is required');
  }

  const exists = await productTypeRepository.existsByCode(effectiveCompanyId, trimmedCode, excludeId);
  return {
    exists,
    message: exists
      ? `Product type code '${trimmedCode}' is already taken`
      : `Product type code '${trimmedCode}' is available`,
    code: trimmedCode,
    companyId: effectiveCompanyId,
  };
};

/**
 * Create a new product type
 */
export const createProductType = async (data, user = null, requestContext = null) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, data.company_id || data.companyId);
  if (!effectiveCompanyId) {
    throw new BadRequestError('Company ID is required to create a product type');
  }

  const company = await companyRepository.findById(effectiveCompanyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${effectiveCompanyId} not found`);
  }

  data.company_id = effectiveCompanyId;

  if (!data.type_code || !String(data.type_code).trim()) {
    data.type_code = generateProductTypeCode(data.type_name);
  } else {
    data.type_code = String(data.type_code).trim().toUpperCase();
  }

  const codeExists = await productTypeRepository.existsByCode(
    data.company_id,
    data.type_code
  );
  if (codeExists) {
    throw new BadRequestError(
      `Product type code '${data.type_code}' already exists for this company`
    );
  }

  const nameExists = await productTypeRepository.existsByName(
    data.company_id,
    data.type_name
  );
  if (nameExists) {
    throw new BadRequestError(
      `Product type name '${data.type_name}' already exists for this company`
    );
  }

  if (user?.id) {
    data.created_by = user.id;
  }

  const created = await productTypeRepository.create(data);
  const dto = toProductTypeDTO(created);

  await recordAuditLog({
    action: 'CREATE',
    module: 'product_types',
    entityType: 'ProductType',
    entityId: created.id,
    entityName: created.type_name,
    companyId: created.company_id,
    userId: user?.id,
    description: `Product type "${created.type_name}" (Code: ${created.type_code}) created`,
    oldData: null,
    newData: created,
    requestContext,
  });

  return dto;
};

/**
 * Update an existing product type
 */
export const updateProductType = async (id, data, user = null, requestContext = null) => {
  const existing = await productTypeRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Product type with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError(
        'You do not have permission to update product types for another company'
      );
    }
  }

  let targetCompanyId = Number(existing.company_id);
  if (data.company_id && Number(data.company_id) !== Number(existing.company_id)) {
    if (!canUserSelectCompany(user)) {
      throw new ForbiddenError('You cannot reassign product type to another company');
    }
    const targetCompany = await companyRepository.findById(data.company_id);
    if (!targetCompany) {
      throw new NotFoundError(`Company with ID ${data.company_id} not found`);
    }
    targetCompanyId = Number(data.company_id);
  }

  if (data.type_code) {
    data.type_code = String(data.type_code).trim().toUpperCase();
    const codeExists = await productTypeRepository.existsByCode(
      targetCompanyId,
      data.type_code,
      id
    );
    if (codeExists) {
      throw new BadRequestError(
        `Product type code '${data.type_code}' already exists for this company`
      );
    }
  }

  if (data.type_name) {
    data.type_name = String(data.type_name).trim();
    const nameExists = await productTypeRepository.existsByName(
      targetCompanyId,
      data.type_name,
      id
    );
    if (nameExists) {
      throw new BadRequestError(
        `Product type name '${data.type_name}' already exists for this company`
      );
    }
  }

  if (user?.id) {
    data.updated_by = user.id;
  }

  const updated = await productTypeRepository.update(id, data);
  const dto = toProductTypeDTO(updated);

  await recordAuditLog({
    action: 'UPDATE',
    module: 'product_types',
    entityType: 'ProductType',
    entityId: updated.id,
    entityName: updated.type_name,
    companyId: updated.company_id,
    userId: user?.id,
    description: `Product type "${updated.type_name}" (Code: ${updated.type_code}) updated`,
    oldData: existing,
    newData: updated,
    requestContext,
  });

  return dto;
};

/**
 * Update product type active status
 */
export const updateProductTypeStatus = async (id, isActive, updatedBy = null, user = null, requestContext = null) => {
  const existing = await productTypeRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Product type with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError(
        'You do not have permission to update product type status for another company'
      );
    }
  }

  const finalUpdatedBy = user?.id || updatedBy || null;
  const updated = await productTypeRepository.updateStatus(id, isActive, finalUpdatedBy);
  const dto = toProductTypeDTO(updated);

  await recordAuditLog({
    action: 'STATUS_CHANGE',
    module: 'product_types',
    entityType: 'ProductType',
    entityId: updated.id,
    entityName: updated.type_name,
    companyId: updated.company_id,
    userId: user?.id || updatedBy,
    description: `Product type "${updated.type_name}" status changed to ${isActive ? 'active' : 'inactive'}`,
    oldData: { is_active: existing.is_active },
    newData: { is_active: updated.is_active },
    requestContext,
  });

  return dto;
};

/**
 * Delete product type by ID with product usage check
 */
export const deleteProductType = async (id, user = null, requestContext = null) => {
  const existing = await productTypeRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Product type with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError(
        'You do not have permission to delete product types for another company'
      );
    }
  }

  const productCount = await productTypeRepository.countProducts(id);
  if (productCount > 0) {
    throw new BadRequestError(
      `Cannot delete product type '${existing.type_name}' because it is assigned to ${productCount} product(s)`
    );
  }

  await productTypeRepository.deleteById(id);

  await recordAuditLog({
    action: 'DELETE',
    module: 'product_types',
    entityType: 'ProductType',
    entityId: Number(id),
    entityName: existing.type_name,
    companyId: existing.company_id,
    userId: user?.id,
    description: `Product type "${existing.type_name}" (Code: ${existing.type_code}) deleted`,
    oldData: existing,
    newData: null,
    requestContext,
  });

  return {
    id: Number(id),
    deleted: true,
    message: 'Product type deleted successfully',
  };
};

/**
 * Seed default standard product types for a company
 */
export const seedDefaultProductTypes = async (companyId = null, user = null, requestContext = null) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  if (!effectiveCompanyId) {
    throw new BadRequestError('Company ID is required to seed default product types');
  }

  const company = await companyRepository.findById(effectiveCompanyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${effectiveCompanyId} not found`);
  }

  const seeded = [];
  for (const pt of DEFAULT_PRODUCT_TYPES) {
    const codeExists = await productTypeRepository.existsByCode(effectiveCompanyId, pt.type_code);
    const nameExists = await productTypeRepository.existsByName(effectiveCompanyId, pt.type_name);

    if (!codeExists && !nameExists) {
      const created = await productTypeRepository.create({
        company_id: effectiveCompanyId,
        type_code: pt.type_code,
        type_name: pt.type_name,
        description: pt.description || null,
        is_stock_item: pt.is_stock_item !== undefined ? pt.is_stock_item : true,
        is_saleable: pt.is_saleable !== undefined ? pt.is_saleable : true,
        is_purchasable: pt.is_purchasable !== undefined ? pt.is_purchasable : true,
        is_active: true,
        created_by: user?.id || null,
      });
      seeded.push(toProductTypeDTO(created));
    }
  }

  await recordAuditLog({
    action: 'SEED',
    module: 'product_types',
    entityType: 'ProductType',
    entityId: effectiveCompanyId,
    entityName: `Default Product Types (${company.company_name})`,
    companyId: effectiveCompanyId,
    userId: user?.id,
    description: `Seeded ${seeded.length} standard default product types for company ${company.company_name}`,
    oldData: null,
    newData: { count: seeded.length },
    requestContext,
  });

  return seeded;
};

export default {
  DEFAULT_PRODUCT_TYPES,
  generateProductTypeCode,
  toSlug,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
  getProductTypes,
  getAllProductTypes,
  getProductTypeStats,
  getProductTypeById,
  getProductTypeByCode,
  getProductTypesByCompanyId,
  checkProductTypeNameExists,
  checkProductTypeCodeExists,
  createProductType,
  updateProductType,
  updateProductTypeStatus,
  deleteProductType,
  seedDefaultProductTypes,
};
