import * as materialRepository from './material.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import { toMaterialDTO, toMaterialListDTO } from './material.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import ForbiddenError from '../../../shared/errors/ForbiddenError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';
import { recordAuditLog } from '../../auditLogs/auditLog.service.js';
import {
  generateMaterialCode,
  toSlug,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
} from './utils/index.js';

export {
  generateMaterialCode,
  toSlug,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
};

/**
 * Standard default materials for textile & apparel retail (40 realistic records)
 */
export const DEFAULT_MATERIALS = [
  { material_code: 'COTTON', material_name: 'Cotton', description: 'Natural breathable soft cotton fabric' },
  { material_code: 'POLYESTER', material_name: 'Polyester', description: 'Durable synthetic wrinkle-resistant fabric' },
  { material_code: 'SILK', material_name: 'Silk', description: 'Luxurious natural silk fiber' },
  { material_code: 'LINEN', material_name: 'Linen', description: 'Lightweight breathable natural flax fiber' },
  { material_code: 'RAYON', material_name: 'Rayon', description: 'Soft smooth regenerated cellulose fabric' },
  { material_code: 'DENIM', material_name: 'Denim', description: 'Sturdy twill-weave cotton fabric for jeans and jackets' },
  { material_code: 'GEORGETTE', material_name: 'Georgette', description: 'Sheer lightweight crinkled fabric for sarees and dresses' },
  { material_code: 'CHIFFON', material_name: 'Chiffon', description: 'Lightweight sheer plain-woven fabric' },
  { material_code: 'VELVET', material_name: 'Velvet', description: 'Luxurious woven tufted fabric with soft dense pile' },
  { material_code: 'WOOL', material_name: 'Wool', description: 'Warm natural animal fiber for winter wear' },
  { material_code: 'NYLON', material_name: 'Nylon', description: 'High-strength synthetic thermoplastic polymer' },
  { material_code: 'ACRYLIC', material_name: 'Acrylic', description: 'Warm lightweight synthetic wool-alternative fiber' },
  { material_code: 'SPANDEX', material_name: 'Spandex', description: 'Highly elastic flexible polyurethane fiber' },
  { material_code: 'LYCRA', material_name: 'Lycra', description: 'Elastic stretchable synthetic elastane fiber' },
  { material_code: 'SATIN', material_name: 'Satin', description: 'Smooth glossy weave luxury fabric' },
  { material_code: 'CREPE', material_name: 'Crepe', description: 'Crinkly textured woven fabric' },
  { material_code: 'VOILE', material_name: 'Voile', description: 'Soft sheer lightweight woven cotton blend fabric' },
  { material_code: 'ORGANZA', material_name: 'Organza', description: 'Thin plain weave sheer fabric for bridal and sarees' },
  { material_code: 'NET', material_name: 'Net Fabric', description: 'Open mesh breathable fabric for ethnic and gowns' },
  { material_code: 'TULLE', material_name: 'Tulle', description: 'Fine lightweight stiff netting fabric for dresses and veils' },
  { material_code: 'CORDUROY', material_name: 'Corduroy', description: 'Durable ridged velvety cotton fabric' },
  { material_code: 'CANVAS', material_name: 'Canvas', description: 'Heavy-duty durable plain-woven cotton fabric' },
  { material_code: 'POPLIN', material_name: 'Poplin', description: 'Strong crisp plain-weave cotton fabric for shirts' },
  { material_code: 'FLANNEL', material_name: 'Flannel', description: 'Soft woven fabric of various fineness for shirts and sleepwear' },
  { material_code: 'JERSEY', material_name: 'Jersey Knit', description: 'Stretchy soft knit fabric for t-shirts and casuals' },
  { material_code: 'KNIT', material_name: 'Knit Fabric', description: 'Interlooped yarn flexible knit fabric' },
  { material_code: 'FLEECE', material_name: 'Fleece', description: 'Warm soft insulating knit fabric for hoodies and jackets' },
  { material_code: 'MUSLIN', material_name: 'Muslin', description: 'Lightweight plain weave delicate cotton fabric' },
  { material_code: 'KHADI', material_name: 'Khadi', description: 'Hand-spun and hand-woven natural Indian cotton fabric' },
  { material_code: 'KHADI-COTTON', material_name: 'Khadi Cotton', description: 'Traditional handspun khadi cotton fabric' },
  { material_code: 'BANARASI-SILK', material_name: 'Banarasi Silk', description: 'Opulent traditional woven silk from Varanasi' },
  { material_code: 'KANJEEVARAM-SILK', material_name: 'Kanjeevaram Silk', description: 'Rich South Indian woven mulberry silk with zari' },
  { material_code: 'TUSSAR-SILK', material_name: 'Tussar Silk', description: 'Natural textured wild silk with golden sheen' },
  { material_code: 'CHANDERI', material_name: 'Chanderi', description: 'Traditional ethnic sheer texture with zari work' },
  { material_code: 'MAHESHWARI', material_name: 'Maheshwari', description: 'Fine cotton and silk blend fabric from Maheshwar' },
  { material_code: 'BROCADE', material_name: 'Brocade', description: 'Rich decorative shuttle-woven jacquard fabric' },
  { material_code: 'LINEN-BLEND', material_name: 'Linen Blend', description: 'Breathable linen blend fabric for casual and formal wear' },
  { material_code: 'COTTON-BLEND', material_name: 'Cotton Blend', description: 'Durable and comfortable cotton blend fabric' },
  { material_code: 'POLY-COTTON', material_name: 'Poly Cotton', description: 'Wrinkle-resistant durable poly-cotton blend' },
  { material_code: 'VISCOSE', material_name: 'Viscose', description: 'Semi-synthetic rayon fabric with silk-like drape' },
];

/**
 * List materials with pagination, filtering, search, and multi-tenancy.
 */
export const getMaterials = async (query, user = null) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
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
 * Get all materials for a company without pagination (for dropdowns / selectors)
 */
export const getAllMaterials = async (query = {}, user = null) => {
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  const isActive = query.is_active !== undefined ? query.is_active : null;
  const search = query.search ? String(query.search).trim() : null;
  const sortBy = query.sortBy || 'material_name';
  const sortOrder = query.sortOrder || 'ASC';

  const rows = await materialRepository.findAllByCompany(companyId, {
    isActive,
    search,
    sortBy,
    sortOrder,
  });

  return toMaterialListDTO(rows);
};

/**
 * Get material aggregate statistics for a company
 */
export const getMaterialStats = async (query = {}, user = null) => {
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  return materialRepository.getMaterialStats(companyId);
};

/**
 * Get single material by primary ID with tenant isolation check
 */
export const getMaterialById = async (id, user = null) => {
  const material = await materialRepository.findById(id);
  if (!material) {
    throw new NotFoundError(`Material with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(material.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to view materials for another company');
    }
  }

  return toMaterialDTO(material);
};

/**
 * Get material by company ID and code
 */
export const getMaterialByCode = async (companyId, materialCode, user = null) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  const material = await materialRepository.findByCode(effectiveCompanyId, materialCode);
  if (!material) {
    throw new NotFoundError(
      `Material with code '${materialCode}' not found for company ${effectiveCompanyId}`
    );
  }
  return toMaterialDTO(material);
};

/**
 * Get all materials for a company
 */
export const getMaterialsByCompanyId = async (companyId, options = {}, user = null) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  const company = await companyRepository.findById(effectiveCompanyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${effectiveCompanyId} not found`);
  }

  const rows = await materialRepository.findByCompanyId(effectiveCompanyId, options);
  return toMaterialListDTO(rows);
};

/**
 * Check whether a material name already exists for a company
 */
export const checkMaterialNameExists = async ({ name, companyId = null, excludeId = null, user = null }) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  if (!effectiveCompanyId) {
    throw new BadRequestError('Company ID is required to check material name');
  }

  const trimmedName = String(name || '').trim();
  if (!trimmedName) {
    throw new BadRequestError('Material name is required');
  }

  const exists = await materialRepository.existsByName(effectiveCompanyId, trimmedName, excludeId);
  return {
    exists,
    message: exists
      ? `Material name '${trimmedName}' is already taken`
      : `Material name '${trimmedName}' is available`,
    name: trimmedName,
    companyId: effectiveCompanyId,
  };
};

/**
 * Check whether a material code already exists for a company
 */
export const checkMaterialCodeExists = async ({ code, companyId = null, excludeId = null, user = null }) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  if (!effectiveCompanyId) {
    throw new BadRequestError('Company ID is required to check material code');
  }

  const trimmedCode = String(code || '').trim().toUpperCase();
  if (!trimmedCode) {
    throw new BadRequestError('Material code is required');
  }

  const exists = await materialRepository.existsByCode(effectiveCompanyId, trimmedCode, excludeId);
  return {
    exists,
    message: exists
      ? `Material code '${trimmedCode}' is already taken`
      : `Material code '${trimmedCode}' is available`,
    code: trimmedCode,
    companyId: effectiveCompanyId,
  };
};

/**
 * Create a new material
 */
export const createMaterial = async (data, user = null, requestContext = null) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, data.company_id || data.companyId);
  if (!effectiveCompanyId) {
    throw new BadRequestError('Company ID is required to create a material');
  }

  const company = await companyRepository.findById(effectiveCompanyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${effectiveCompanyId} not found`);
  }

  data.company_id = effectiveCompanyId;

  if (!data.material_code || !String(data.material_code).trim()) {
    data.material_code = generateMaterialCode(data.material_name);
  } else {
    data.material_code = String(data.material_code).trim().toUpperCase();
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

  if (user?.id) {
    data.created_by = user.id;
  }

  const created = await materialRepository.create(data);
  const dto = toMaterialDTO(created);

  await recordAuditLog({
    action: 'CREATE',
    module: 'materials',
    entityType: 'Material',
    entityId: created.id,
    entityName: created.material_name,
    companyId: created.company_id,
    userId: user?.id,
    description: `Material "${created.material_name}" (Code: ${created.material_code}) created`,
    oldData: null,
    newData: created,
    requestContext,
  });

  return dto;
};

/**
 * Update an existing material
 */
export const updateMaterial = async (id, data, user = null, requestContext = null) => {
  const existing = await materialRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Material with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to update materials for another company');
    }
  }

  let targetCompanyId = Number(existing.company_id);
  if (data.company_id && Number(data.company_id) !== Number(existing.company_id)) {
    if (!canUserSelectCompany(user)) {
      throw new ForbiddenError('You cannot reassign material to another company');
    }
    const targetCompany = await companyRepository.findById(data.company_id);
    if (!targetCompany) {
      throw new NotFoundError(`Company with ID ${data.company_id} not found`);
    }
    targetCompanyId = Number(data.company_id);
  }

  if (data.material_code) {
    data.material_code = String(data.material_code).trim().toUpperCase();
    const codeExists = await materialRepository.existsByCode(
      targetCompanyId,
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
    data.material_name = String(data.material_name).trim();
    const nameExists = await materialRepository.existsByName(
      targetCompanyId,
      data.material_name,
      id
    );
    if (nameExists) {
      throw new BadRequestError(
        `Material name '${data.material_name}' already exists for this company`
      );
    }
  }

  if (user?.id) {
    data.updated_by = user.id;
  }

  const updated = await materialRepository.update(id, data);
  const dto = toMaterialDTO(updated);

  await recordAuditLog({
    action: 'UPDATE',
    module: 'materials',
    entityType: 'Material',
    entityId: updated.id,
    entityName: updated.material_name,
    companyId: updated.company_id,
    userId: user?.id,
    description: `Material "${updated.material_name}" (Code: ${updated.material_code}) updated`,
    oldData: existing,
    newData: updated,
    requestContext,
  });

  return dto;
};

/**
 * Update material active status
 */
export const updateMaterialStatus = async (id, isActive, updatedBy = null, user = null, requestContext = null) => {
  const existing = await materialRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Material with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to update material status for another company');
    }
  }

  const finalUpdatedBy = user?.id || updatedBy || null;
  const updated = await materialRepository.updateStatus(id, isActive, finalUpdatedBy);
  const dto = toMaterialDTO(updated);

  await recordAuditLog({
    action: 'STATUS_CHANGE',
    module: 'materials',
    entityType: 'Material',
    entityId: updated.id,
    entityName: updated.material_name,
    companyId: updated.company_id,
    userId: user?.id || updatedBy,
    description: `Material "${updated.material_name}" status changed to ${isActive ? 'active' : 'inactive'}`,
    oldData: { is_active: existing.is_active },
    newData: { is_active: updated.is_active },
    requestContext,
  });

  return dto;
};

/**
 * Delete material by ID with product usage check
 */
export const deleteMaterial = async (id, user = null, requestContext = null) => {
  const existing = await materialRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Material with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to delete materials for another company');
    }
  }

  const productCount = await materialRepository.countProducts(id);
  if (productCount > 0) {
    throw new BadRequestError(
      `Cannot delete material '${existing.material_name}' because it is assigned to ${productCount} product variant(s)`
    );
  }

  await materialRepository.deleteById(id);

  await recordAuditLog({
    action: 'DELETE',
    module: 'materials',
    entityType: 'Material',
    entityId: Number(id),
    entityName: existing.material_name,
    companyId: existing.company_id,
    userId: user?.id,
    description: `Material "${existing.material_name}" (Code: ${existing.material_code}) deleted`,
    oldData: existing,
    newData: null,
    requestContext,
  });

  return {
    id: Number(id),
    deleted: true,
    message: 'Material deleted successfully',
  };
};

/**
 * Seed default standard materials for a company
 */
export const seedDefaultMaterials = async (companyId = null, user = null, requestContext = null) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  if (!effectiveCompanyId) {
    throw new BadRequestError('Company ID is required to seed default materials');
  }

  const company = await companyRepository.findById(effectiveCompanyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${effectiveCompanyId} not found`);
  }

  const seeded = [];
  for (const mat of DEFAULT_MATERIALS) {
    const codeExists = await materialRepository.existsByCode(effectiveCompanyId, mat.material_code);
    const nameExists = await materialRepository.existsByName(effectiveCompanyId, mat.material_name);

    if (!codeExists && !nameExists) {
      const created = await materialRepository.create({
        company_id: effectiveCompanyId,
        material_code: mat.material_code,
        material_name: mat.material_name,
        description: mat.description || null,
        is_active: true,
        created_by: user?.id || null,
      });
      seeded.push(toMaterialDTO(created));
    }
  }

  await recordAuditLog({
    action: 'SEED',
    module: 'materials',
    entityType: 'Material',
    entityId: effectiveCompanyId,
    entityName: `Default Materials (${company.company_name})`,
    companyId: effectiveCompanyId,
    userId: user?.id,
    description: `Seeded ${seeded.length} standard default materials for company ${company.company_name}`,
    oldData: null,
    newData: { count: seeded.length },
    requestContext,
  });

  return seeded;
};

export default {
  DEFAULT_MATERIALS,
  generateMaterialCode,
  toSlug,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
  getMaterials,
  getAllMaterials,
  getMaterialStats,
  getMaterialById,
  getMaterialByCode,
  getMaterialsByCompanyId,
  checkMaterialNameExists,
  checkMaterialCodeExists,
  createMaterial,
  updateMaterial,
  updateMaterialStatus,
  deleteMaterial,
  seedDefaultMaterials,
};
