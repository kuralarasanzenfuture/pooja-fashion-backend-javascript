import * as productTypeRepository from './productType.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import { toProductTypeDTO, toProductTypeListDTO } from './productType.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';

/**
 * Generate fallback product type code from name if omitted
 */
export const generateProductTypeCode = (name) => {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 50);
};

/**
 * Standard default product types for retail & apparel ERP
 */
export const DEFAULT_PRODUCT_TYPES = [
  {
    type_code: 'READY_MADE',
    type_name: 'Ready Made Garments',
    description: 'Finished apparel and ready-to-wear clothing',
    is_stock_item: true,
    is_saleable: true,
    is_purchasable: true,
  },
  {
    type_code: 'FABRIC',
    type_name: 'Fabric / Unstitched',
    description: 'Running fabric materials and unstitched dress materials',
    is_stock_item: true,
    is_saleable: true,
    is_purchasable: true,
  },
  {
    type_code: 'ACCESSORY',
    type_name: 'Accessories',
    description: 'Fashion accessories, belts, scarves, and jewelry',
    is_stock_item: true,
    is_saleable: true,
    is_purchasable: true,
  },
  {
    type_code: 'FOOTWEAR',
    type_name: 'Footwear',
    description: 'Shoes, sandals, heels, and ethnic footwear',
    is_stock_item: true,
    is_saleable: true,
    is_purchasable: true,
  },
  {
    type_code: 'SERVICE',
    type_name: 'Services & Alterations',
    description: 'Custom tailoring, alterations, and non-inventory service items',
    is_stock_item: false,
    is_saleable: true,
    is_purchasable: false,
  },
];

/**
 * List product types with pagination, filtering, and search
 */
export const getProductTypes = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = query.company_id || query.companyId || null;
  const isStockItem = query.is_stock_item !== undefined ? query.is_stock_item : null;
  const isSaleable = query.is_saleable !== undefined ? query.is_saleable : null;
  const isPurchasable = query.is_purchasable !== undefined ? query.is_purchasable : null;
  const isActive = query.is_active !== undefined ? query.is_active : null;

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
 * Get single product type by primary ID
 */
export const getProductTypeById = async (id) => {
  const productType = await productTypeRepository.findById(id);
  if (!productType) {
    throw new NotFoundError(`Product type with ID ${id} not found`);
  }
  return toProductTypeDTO(productType);
};

/**
 * Get product type by company ID and code
 */
export const getProductTypeByCode = async (companyId, typeCode) => {
  const productType = await productTypeRepository.findByCode(companyId, typeCode);
  if (!productType) {
    throw new NotFoundError(
      `Product type with code '${typeCode}' not found for company ${companyId}`
    );
  }
  return toProductTypeDTO(productType);
};

/**
 * Get all product types for a company
 */
export const getProductTypesByCompanyId = async (companyId, options = {}) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const rows = await productTypeRepository.findByCompanyId(companyId, options);
  return toProductTypeListDTO(rows);
};

/**
 * Create a new product type
 */
export const createProductType = async (data) => {
  const company = await companyRepository.findById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${data.company_id} not found`);
  }

  if (!data.type_code) {
    data.type_code = generateProductTypeCode(data.type_name);
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

  const created = await productTypeRepository.create(data);
  return toProductTypeDTO(created);
};

/**
 * Update an existing product type
 */
export const updateProductType = async (id, data) => {
  const existing = await productTypeRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Product type with ID ${id} not found`);
  }

  if (data.company_id && Number(data.company_id) !== Number(existing.company_id)) {
    const targetCompany = await companyRepository.findById(data.company_id);
    if (!targetCompany) {
      throw new NotFoundError(`Company with ID ${data.company_id} not found`);
    }
  }

  const companyId = data.company_id ? Number(data.company_id) : Number(existing.company_id);

  if (data.type_code) {
    const codeExists = await productTypeRepository.existsByCode(
      companyId,
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
    const nameExists = await productTypeRepository.existsByName(
      companyId,
      data.type_name,
      id
    );
    if (nameExists) {
      throw new BadRequestError(
        `Product type name '${data.type_name}' already exists for this company`
      );
    }
  }

  const updated = await productTypeRepository.update(id, data);
  return toProductTypeDTO(updated);
};

/**
 * Update product type active status
 */
export const updateProductTypeStatus = async (id, isActive, updatedBy = null) => {
  const existing = await productTypeRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Product type with ID ${id} not found`);
  }

  const updated = await productTypeRepository.updateStatus(id, isActive, updatedBy);
  return toProductTypeDTO(updated);
};

/**
 * Delete product type by ID
 */
export const deleteProductType = async (id) => {
  const existing = await productTypeRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Product type with ID ${id} not found`);
  }

  const productCount = await productTypeRepository.countProducts(id);
  if (productCount > 0) {
    throw new BadRequestError(
      `Cannot delete product type '${existing.type_name}' because it is assigned to ${productCount} product(s)`
    );
  }

  await productTypeRepository.deleteById(id);

  return {
    id: Number(id),
    deleted: true,
    message: 'Product type deleted successfully',
  };
};

/**
 * Seed default standard product types for a company
 */
export const seedDefaultProductTypes = async (companyId, createdBy = null) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const seeded = [];
  for (const pt of DEFAULT_PRODUCT_TYPES) {
    const codeExists = await productTypeRepository.existsByCode(companyId, pt.type_code);
    const nameExists = await productTypeRepository.existsByName(companyId, pt.type_name);

    if (!codeExists && !nameExists) {
      const created = await productTypeRepository.create({
        company_id: companyId,
        type_code: pt.type_code,
        type_name: pt.type_name,
        description: pt.description,
        is_stock_item: pt.is_stock_item,
        is_saleable: pt.is_saleable,
        is_purchasable: pt.is_purchasable,
        is_active: true,
        created_by: createdBy,
      });
      seeded.push(toProductTypeDTO(created));
    }
  }

  return seeded;
};

export default {
  DEFAULT_PRODUCT_TYPES,
  generateProductTypeCode,
  getProductTypes,
  getProductTypeById,
  getProductTypeByCode,
  getProductTypesByCompanyId,
  createProductType,
  updateProductType,
  updateProductTypeStatus,
  deleteProductType,
  seedDefaultProductTypes,
};
