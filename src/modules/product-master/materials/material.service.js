import * as materialRepository from './material.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import { toMaterialDTO, toMaterialListDTO } from './material.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';

/**
 * Generate fallback material code from name if omitted
 */
export const generateMaterialCode = (name) => {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 50);
};

/**
 * Standard default materials and fabric blends
 */
export const DEFAULT_MATERIALS = [
  { material_code: 'COTTON', material_name: 'Cotton', description: '100% natural, breathable plant-based cotton fabric' },
  { material_code: 'POLY', material_name: 'Polyester', description: 'Durable, wrinkle-resistant synthetic polymer fabric' },
  { material_code: 'SILK', material_name: 'Silk', description: 'Luxurious, natural shimmering protein fiber fabric' },
  { material_code: 'LINEN', material_name: 'Linen', description: 'Lightweight, highly absorbent flax-based fabric' },
  { material_code: 'RAYON', material_name: 'Rayon', description: 'Semi-synthetic cellulose fiber known for silky feel and drape' },
  { material_code: 'DENIM', material_name: 'Denim', description: 'Sturdy cotton twill fabric commonly used for jeans and jackets' },
  { material_code: 'GEORGETTE', material_name: 'Georgette', description: 'Sheer, lightweight, crêpe fabric used in sarees and dresses' },
  { material_code: 'CHIFFON', material_name: 'Chiffon', description: 'Lightweight, sheer plain-woven fabric with soft luster' },
  { material_code: 'WOOL', material_name: 'Wool', description: 'Warm, insulating natural animal fleece fabric' },
  { material_code: 'SPANDEX', material_name: 'Spandex (Lycra)', description: 'Highly elastic synthetic fabric used for stretch garments' },
];

/**
 * List materials with pagination, filtering, and search
 */
export const getMaterials = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = query.company_id || query.companyId || null;
  const isActive = query.is_active !== undefined ? query.is_active : null;

  const { rows, total } = await materialRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    isActive,
    sortBy: sortBy || 'material_name',
    sortOrder: sortOrder || 'ASC',
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    materials: toMaterialListDTO(rows),
    meta,
  };
};

/**
 * Get single material by primary ID
 */
export const getMaterialById = async (id) => {
  const material = await materialRepository.findById(id);
  if (!material) {
    throw new NotFoundError(`Material with ID ${id} not found`);
  }
  return toMaterialDTO(material);
};

/**
 * Get material by company ID and code
 */
export const getMaterialByCode = async (companyId, materialCode) => {
  const material = await materialRepository.findByCode(companyId, materialCode);
  if (!material) {
    throw new NotFoundError(
      `Material with code '${materialCode}' not found for company ${companyId}`
    );
  }
  return toMaterialDTO(material);
};

/**
 * Get all materials for a company
 */
export const getMaterialsByCompanyId = async (companyId, options = {}) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const rows = await materialRepository.findByCompanyId(companyId, options);
  return toMaterialListDTO(rows);
};

/**
 * Create a new material
 */
export const createMaterial = async (data) => {
  const company = await companyRepository.findById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${data.company_id} not found`);
  }

  if (!data.material_code) {
    data.material_code = generateMaterialCode(data.material_name);
  }

  const codeExists = await materialRepository.existsByCode(
    data.company_id,
    data.material_code
  );
  if (codeExists) {
    throw new BadRequestError(
      `Material code '${data.material_code}' already exists for this company`
    );
  }

  const nameExists = await materialRepository.existsByName(
    data.company_id,
    data.material_name
  );
  if (nameExists) {
    throw new BadRequestError(
      `Material name '${data.material_name}' already exists for this company`
    );
  }

  const created = await materialRepository.create(data);
  return toMaterialDTO(created);
};

/**
 * Update an existing material
 */
export const updateMaterial = async (id, data) => {
  const existing = await materialRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Material with ID ${id} not found`);
  }

  if (data.company_id && Number(data.company_id) !== Number(existing.company_id)) {
    const targetCompany = await companyRepository.findById(data.company_id);
    if (!targetCompany) {
      throw new NotFoundError(`Company with ID ${data.company_id} not found`);
    }
  }

  const companyId = data.company_id ? Number(data.company_id) : Number(existing.company_id);

  if (data.material_code) {
    const codeExists = await materialRepository.existsByCode(
      companyId,
      data.material_code,
      id
    );
    if (codeExists) {
      throw new BadRequestError(
        `Material code '${data.material_code}' already exists for this company`
      );
    }
  }

  if (data.material_name) {
    const nameExists = await materialRepository.existsByName(
      companyId,
      data.material_name,
      id
    );
    if (nameExists) {
      throw new BadRequestError(
        `Material name '${data.material_name}' already exists for this company`
      );
    }
  }

  const updated = await materialRepository.update(id, data);
  return toMaterialDTO(updated);
};

/**
 * Update material active status
 */
export const updateMaterialStatus = async (id, isActive, updatedBy = null) => {
  const existing = await materialRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Material with ID ${id} not found`);
  }

  const updated = await materialRepository.updateStatus(id, isActive, updatedBy);
  return toMaterialDTO(updated);
};

/**
 * Delete material by ID
 */
export const deleteMaterial = async (id) => {
  const existing = await materialRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Material with ID ${id} not found`);
  }

  const variantCount = await materialRepository.countVariants(id);
  if (variantCount > 0) {
    throw new BadRequestError(
      `Cannot delete material '${existing.material_name}' because it is assigned to ${variantCount} product variant(s)`
    );
  }

  await materialRepository.deleteById(id);

  return {
    id: Number(id),
    deleted: true,
    message: 'Material deleted successfully',
  };
};

/**
 * Seed default standard apparel fabrics for a company
 */
export const seedDefaultMaterials = async (companyId, createdBy = null) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const seeded = [];
  for (const mat of DEFAULT_MATERIALS) {
    const codeExists = await materialRepository.existsByCode(companyId, mat.material_code);
    const nameExists = await materialRepository.existsByName(companyId, mat.material_name);

    if (!codeExists && !nameExists) {
      const created = await materialRepository.create({
        company_id: companyId,
        material_code: mat.material_code,
        material_name: mat.material_name,
        description: mat.description,
        is_active: true,
        created_by: createdBy,
      });
      seeded.push(toMaterialDTO(created));
    }
  }

  return seeded;
};

export default {
  DEFAULT_MATERIALS,
  generateMaterialCode,
  getMaterials,
  getMaterialById,
  getMaterialByCode,
  getMaterialsByCompanyId,
  createMaterial,
  updateMaterial,
  updateMaterialStatus,
  deleteMaterial,
  seedDefaultMaterials,
};
