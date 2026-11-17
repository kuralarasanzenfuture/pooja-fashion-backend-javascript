import * as unitRepository from './unit.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import { toUnitDTO, toUnitListDTO } from './unit.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import ForbiddenError from '../../../shared/errors/ForbiddenError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';
import { recordAuditLog } from '../../auditLogs/auditLog.service.js';
import {
  generateUnitCode,
  toSlug,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
} from './utils/index.js';

export {
  generateUnitCode,
  toSlug,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
};

/**
 * Standard default units of measure for retail & apparel (30 realistic records)
 */
export const DEFAULT_UNITS = [
  { unit_code: 'PCS', unit_name: 'Pieces', decimal_places: 0 },
  { unit_code: 'PAIR', unit_name: 'Pair', decimal_places: 0 },
  { unit_code: 'SET', unit_name: 'Set', decimal_places: 0 },
  { unit_code: 'METER', unit_name: 'Meter', decimal_places: 2 },
  { unit_code: 'CM', unit_name: 'Centimeter', decimal_places: 2 },
  { unit_code: 'INCH', unit_name: 'Inch', decimal_places: 2 },
  { unit_code: 'KG', unit_name: 'Kilogram', decimal_places: 3 },
  { unit_code: 'GM', unit_name: 'Gram', decimal_places: 2 },
  { unit_code: 'BOX', unit_name: 'Box', decimal_places: 0 },
  { unit_code: 'DOZEN', unit_name: 'Dozen', decimal_places: 0 },
  { unit_code: 'PACK', unit_name: 'Pack', decimal_places: 0 },
  { unit_code: 'BUNDLE', unit_name: 'Bundle', decimal_places: 0 },
  { unit_code: 'ROLL', unit_name: 'Roll', decimal_places: 0 },
  { unit_code: 'YARD', unit_name: 'Yard', decimal_places: 2 },
  { unit_code: 'FOOT', unit_name: 'Foot', decimal_places: 2 },
  { unit_code: 'LITER', unit_name: 'Liter', decimal_places: 3 },
  { unit_code: 'ML', unit_name: 'Milliliter', decimal_places: 2 },
  { unit_code: 'TON', unit_name: 'Metric Ton', decimal_places: 3 },
  { unit_code: 'CARTON', unit_name: 'Carton', decimal_places: 0 },
  { unit_code: 'BAG', unit_name: 'Bag', decimal_places: 0 },
  { unit_code: 'BOTTLE', unit_name: 'Bottle', decimal_places: 0 },
  { unit_code: 'CONE', unit_name: 'Cone', decimal_places: 0 },
  { unit_code: 'SPOOL', unit_name: 'Spool', decimal_places: 0 },
  { unit_code: 'SQUARE-METER', unit_name: 'Square Meter', decimal_places: 2 },
  { unit_code: 'SQUARE-FOOT', unit_name: 'Square Foot', decimal_places: 2 },
  { unit_code: 'GROSS', unit_name: 'Gross', decimal_places: 0 },
  { unit_code: 'LOT', unit_name: 'Lot', decimal_places: 0 },
  { unit_code: 'PAIR-SET', unit_name: 'Pair Set', decimal_places: 0 },
  { unit_code: 'KIT', unit_name: 'Kit', decimal_places: 0 },
  { unit_code: 'DOZEN-PAIR', unit_name: 'Dozen Pair', decimal_places: 0 },
];

/**
 * List units with pagination, filtering, search, and multi-tenancy.
 */
export const getUnits = async (query, user = null) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  const isActive = query.is_active !== undefined ? query.is_active : null;

  const { rows, total } = await unitRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    isActive,
    sortBy: sortBy || 'unit_name',
    sortOrder: sortOrder || 'ASC',
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    units: toUnitListDTO(rows),
    meta,
  };
};

/**
 * Get all units for a company without pagination (for dropdowns / selectors)
 */
export const getAllUnits = async (query = {}, user = null) => {
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  const isActive = query.is_active !== undefined ? query.is_active : null;
  const search = query.search ? String(query.search).trim() : null;
  const sortBy = query.sortBy || 'unit_name';
  const sortOrder = query.sortOrder || 'ASC';

  const rows = await unitRepository.findAllByCompany(companyId, {
    isActive,
    search,
    sortBy,
    sortOrder,
  });

  return toUnitListDTO(rows);
};

/**
 * Get unit aggregate statistics for a company
 */
export const getUnitStats = async (query = {}, user = null) => {
  const companyId = resolveEffectiveCompanyId(user, query.company_id || query.companyId);
  return unitRepository.getUnitStats(companyId);
};

/**
 * Get single unit by primary ID with tenant isolation check
 */
export const getUnitById = async (id, user = null) => {
  const unit = await unitRepository.findById(id);
  if (!unit) {
    throw new NotFoundError(`Unit with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(unit.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to view units for another company');
    }
  }

  return toUnitDTO(unit);
};

/**
 * Get unit by company ID and code
 */
export const getUnitByCode = async (companyId, unitCode, user = null) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  const unit = await unitRepository.findByCode(effectiveCompanyId, unitCode);
  if (!unit) {
    throw new NotFoundError(
      `Unit with code '${unitCode}' not found for company ${effectiveCompanyId}`
    );
  }
  return toUnitDTO(unit);
};

/**
 * Get all units for a company
 */
export const getUnitsByCompanyId = async (companyId, options = {}, user = null) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  const company = await companyRepository.findById(effectiveCompanyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${effectiveCompanyId} not found`);
  }

  const rows = await unitRepository.findByCompanyId(effectiveCompanyId, options);
  return toUnitListDTO(rows);
};

/**
 * Check whether a unit name already exists for a company
 */
export const checkUnitNameExists = async ({ name, companyId = null, excludeId = null, user = null }) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  if (!effectiveCompanyId) {
    throw new BadRequestError('Company ID is required to check unit name');
  }

  const trimmedName = String(name || '').trim();
  if (!trimmedName) {
    throw new BadRequestError('Unit name is required');
  }

  const exists = await unitRepository.existsByName(effectiveCompanyId, trimmedName, excludeId);
  return {
    exists,
    message: exists
      ? `Unit name '${trimmedName}' is already taken`
      : `Unit name '${trimmedName}' is available`,
    name: trimmedName,
    companyId: effectiveCompanyId,
  };
};

/**
 * Check whether a unit code already exists for a company
 */
export const checkUnitCodeExists = async ({ code, companyId = null, excludeId = null, user = null }) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  if (!effectiveCompanyId) {
    throw new BadRequestError('Company ID is required to check unit code');
  }

  const trimmedCode = String(code || '').trim().toUpperCase();
  if (!trimmedCode) {
    throw new BadRequestError('Unit code is required');
  }

  const exists = await unitRepository.existsByCode(effectiveCompanyId, trimmedCode, excludeId);
  return {
    exists,
    message: exists
      ? `Unit code '${trimmedCode}' is already taken`
      : `Unit code '${trimmedCode}' is available`,
    code: trimmedCode,
    companyId: effectiveCompanyId,
  };
};

/**
 * Create a new unit
 */
export const createUnit = async (data, user = null, requestContext = null) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, data.company_id || data.companyId);
  if (!effectiveCompanyId) {
    throw new BadRequestError('Company ID is required to create a unit');
  }

  const company = await companyRepository.findById(effectiveCompanyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${effectiveCompanyId} not found`);
  }

  data.company_id = effectiveCompanyId;

  if (!data.unit_code || !String(data.unit_code).trim()) {
    data.unit_code = generateUnitCode(data.unit_name);
  } else {
    data.unit_code = String(data.unit_code).trim().toUpperCase();
  }

  const codeExists = await unitRepository.existsByCode(
    data.company_id,
    data.unit_code
  );
  if (codeExists) {
    throw new BadRequestError(
      `Unit code '${data.unit_code}' already exists for this company`
    );
  }

  const nameExists = await unitRepository.existsByName(
    data.company_id,
    data.unit_name
  );
  if (nameExists) {
    throw new BadRequestError(
      `Unit name '${data.unit_name}' already exists for this company`
    );
  }

  if (user?.id) {
    data.created_by = user.id;
  }

  const created = await unitRepository.create(data);
  const dto = toUnitDTO(created);

  await recordAuditLog({
    action: 'CREATE',
    module: 'units',
    entityType: 'Unit',
    entityId: created.id,
    entityName: created.unit_name,
    companyId: created.company_id,
    userId: user?.id,
    description: `Unit "${created.unit_name}" (Code: ${created.unit_code}) created`,
    oldData: null,
    newData: created,
    requestContext,
  });

  return dto;
};

/**
 * Update an existing unit
 */
export const updateUnit = async (id, data, user = null, requestContext = null) => {
  const existing = await unitRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Unit with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to update units for another company');
    }
  }

  let targetCompanyId = Number(existing.company_id);
  if (data.company_id && Number(data.company_id) !== Number(existing.company_id)) {
    if (!canUserSelectCompany(user)) {
      throw new ForbiddenError('You cannot reassign unit to another company');
    }
    const targetCompany = await companyRepository.findById(data.company_id);
    if (!targetCompany) {
      throw new NotFoundError(`Company with ID ${data.company_id} not found`);
    }
    targetCompanyId = Number(data.company_id);
  }

  if (data.unit_code) {
    data.unit_code = String(data.unit_code).trim().toUpperCase();
    const codeExists = await unitRepository.existsByCode(
      targetCompanyId,
      data.unit_code,
      id
    );
    if (codeExists) {
      throw new BadRequestError(
        `Unit code '${data.unit_code}' already exists for this company`
      );
    }
  }

  if (data.unit_name) {
    data.unit_name = String(data.unit_name).trim();
    const nameExists = await unitRepository.existsByName(
      targetCompanyId,
      data.unit_name,
      id
    );
    if (nameExists) {
      throw new BadRequestError(
        `Unit name '${data.unit_name}' already exists for this company`
      );
    }
  }

  if (user?.id) {
    data.updated_by = user.id;
  }

  const updated = await unitRepository.update(id, data);
  const dto = toUnitDTO(updated);

  await recordAuditLog({
    action: 'UPDATE',
    module: 'units',
    entityType: 'Unit',
    entityId: updated.id,
    entityName: updated.unit_name,
    companyId: updated.company_id,
    userId: user?.id,
    description: `Unit "${updated.unit_name}" (Code: ${updated.unit_code}) updated`,
    oldData: existing,
    newData: updated,
    requestContext,
  });

  return dto;
};

/**
 * Update unit active status
 */
export const updateUnitStatus = async (id, isActive, updatedBy = null, user = null, requestContext = null) => {
  const existing = await unitRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Unit with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to update unit status for another company');
    }
  }

  const finalUpdatedBy = user?.id || updatedBy || null;
  const updated = await unitRepository.updateStatus(id, isActive, finalUpdatedBy);
  const dto = toUnitDTO(updated);

  await recordAuditLog({
    action: 'STATUS_CHANGE',
    module: 'units',
    entityType: 'Unit',
    entityId: updated.id,
    entityName: updated.unit_name,
    companyId: updated.company_id,
    userId: user?.id || updatedBy,
    description: `Unit "${updated.unit_name}" status changed to ${isActive ? 'active' : 'inactive'}`,
    oldData: { is_active: existing.is_active },
    newData: { is_active: updated.is_active },
    requestContext,
  });

  return dto;
};

/**
 * Delete unit by ID with product usage check
 */
export const deleteUnit = async (id, user = null, requestContext = null) => {
  const existing = await unitRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Unit with ID ${id} not found`);
  }

  if (!canUserSelectCompany(user) && user) {
    const userCompId = user.companyId || user.company_id;
    if (userCompId && Number(existing.company_id) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to delete units for another company');
    }
  }

  const productCount = await unitRepository.countProducts(id);
  if (productCount > 0) {
    throw new BadRequestError(
      `Cannot delete unit '${existing.unit_name}' because it is assigned as the default unit to ${productCount} product(s)`
    );
  }

  await unitRepository.deleteById(id);

  await recordAuditLog({
    action: 'DELETE',
    module: 'units',
    entityType: 'Unit',
    entityId: Number(id),
    entityName: existing.unit_name,
    companyId: existing.company_id,
    userId: user?.id,
    description: `Unit "${existing.unit_name}" (Code: ${existing.unit_code}) deleted`,
    oldData: existing,
    newData: null,
    requestContext,
  });

  return {
    id: Number(id),
    deleted: true,
    message: 'Unit deleted successfully',
  };
};

/**
 * Seed default standard apparel units for a company
 */
export const seedDefaultUnits = async (companyId = null, user = null, requestContext = null) => {
  const effectiveCompanyId = resolveEffectiveCompanyId(user, companyId);
  if (!effectiveCompanyId) {
    throw new BadRequestError('Company ID is required to seed default units');
  }

  const company = await companyRepository.findById(effectiveCompanyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${effectiveCompanyId} not found`);
  }

  const seeded = [];
  for (const u of DEFAULT_UNITS) {
    const codeExists = await unitRepository.existsByCode(effectiveCompanyId, u.unit_code);
    const nameExists = await unitRepository.existsByName(effectiveCompanyId, u.unit_name);

    if (!codeExists && !nameExists) {
      const created = await unitRepository.create({
        company_id: effectiveCompanyId,
        unit_code: u.unit_code,
        unit_name: u.unit_name,
        decimal_places: u.decimal_places,
        is_active: true,
        created_by: user?.id || null,
      });
      seeded.push(toUnitDTO(created));
    }
  }

  await recordAuditLog({
    action: 'SEED',
    module: 'units',
    entityType: 'Unit',
    entityId: effectiveCompanyId,
    entityName: `Default Units (${company.company_name})`,
    companyId: effectiveCompanyId,
    userId: user?.id,
    description: `Seeded ${seeded.length} standard default units for company ${company.company_name}`,
    oldData: null,
    newData: { count: seeded.length },
    requestContext,
  });

  return seeded;
};

export default {
  DEFAULT_UNITS,
  generateUnitCode,
  toSlug,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
  getUnits,
  getAllUnits,
  getUnitStats,
  getUnitById,
  getUnitByCode,
  getUnitsByCompanyId,
  checkUnitNameExists,
  checkUnitCodeExists,
  createUnit,
  updateUnit,
  updateUnitStatus,
  deleteUnit,
  seedDefaultUnits,
};
