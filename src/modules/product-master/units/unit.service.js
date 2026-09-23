import * as unitRepository from './unit.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import { toUnitDTO, toUnitListDTO } from './unit.mapper.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';

/**
 * Generate fallback unit code from name if omitted
 */
export const generateUnitCode = (name) => {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 30);
};

/**
 * Standard default units of measure for retail & apparel
 */
export const DEFAULT_UNITS = [
  { unit_code: 'PCS', unit_name: 'Pieces', decimal_places: 0 },
  { unit_code: 'PAIR', unit_name: 'Pairs', decimal_places: 0 },
  { unit_code: 'SET', unit_name: 'Sets', decimal_places: 0 },
  { unit_code: 'MTR', unit_name: 'Meters', decimal_places: 2 },
  { unit_code: 'KG', unit_name: 'Kilograms', decimal_places: 3 },
  { unit_code: 'BOX', unit_name: 'Boxes', decimal_places: 0 },
  { unit_code: 'DZN', unit_name: 'Dozens', decimal_places: 0 },
  { unit_code: 'ROLL', unit_name: 'Rolls', decimal_places: 0 },
];

/**
 * List units with pagination, filtering, and search
 */
export const getUnits = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = query.company_id || query.companyId || null;
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
 * Get single unit by primary ID
 */
export const getUnitById = async (id) => {
  const unit = await unitRepository.findById(id);
  if (!unit) {
    throw new NotFoundError(`Unit with ID ${id} not found`);
  }
  return toUnitDTO(unit);
};

/**
 * Get unit by company ID and code
 */
export const getUnitByCode = async (companyId, unitCode) => {
  const unit = await unitRepository.findByCode(companyId, unitCode);
  if (!unit) {
    throw new NotFoundError(
      `Unit with code '${unitCode}' not found for company ${companyId}`
    );
  }
  return toUnitDTO(unit);
};

/**
 * Get all units for a company
 */
export const getUnitsByCompanyId = async (companyId, options = {}) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const rows = await unitRepository.findByCompanyId(companyId, options);
  return toUnitListDTO(rows);
};

/**
 * Create a new unit
 */
export const createUnit = async (data) => {
  const company = await companyRepository.findById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${data.company_id} not found`);
  }

  if (!data.unit_code) {
    data.unit_code = generateUnitCode(data.unit_name);
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

  const created = await unitRepository.create(data);
  return toUnitDTO(created);
};

/**
 * Update an existing unit
 */
export const updateUnit = async (id, data) => {
  const existing = await unitRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Unit with ID ${id} not found`);
  }

  if (data.company_id && Number(data.company_id) !== Number(existing.company_id)) {
    const targetCompany = await companyRepository.findById(data.company_id);
    if (!targetCompany) {
      throw new NotFoundError(`Company with ID ${data.company_id} not found`);
    }
  }

  const companyId = data.company_id ? Number(data.company_id) : Number(existing.company_id);

  if (data.unit_code) {
    const codeExists = await unitRepository.existsByCode(
      companyId,
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
    const nameExists = await unitRepository.existsByName(
      companyId,
      data.unit_name,
      id
    );
    if (nameExists) {
      throw new BadRequestError(
        `Unit name '${data.unit_name}' already exists for this company`
      );
    }
  }

  const updated = await unitRepository.update(id, data);
  return toUnitDTO(updated);
};

/**
 * Update unit active status
 */
export const updateUnitStatus = async (id, isActive, updatedBy = null) => {
  const existing = await unitRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Unit with ID ${id} not found`);
  }

  const updated = await unitRepository.updateStatus(id, isActive, updatedBy);
  return toUnitDTO(updated);
};

/**
 * Delete unit by ID
 */
export const deleteUnit = async (id) => {
  const existing = await unitRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Unit with ID ${id} not found`);
  }

  const productCount = await unitRepository.countProducts(id);
  if (productCount > 0) {
    throw new BadRequestError(
      `Cannot delete unit '${existing.unit_name}' because it is assigned as the default unit to ${productCount} product(s)`
    );
  }

  const variantCount = await unitRepository.countVariants(id);
  if (variantCount > 0) {
    throw new BadRequestError(
      `Cannot delete unit '${existing.unit_name}' because it is assigned to ${variantCount} product variant(s)`
    );
  }

  await unitRepository.deleteById(id);

  return {
    id: Number(id),
    deleted: true,
    message: 'Unit deleted successfully',
  };
};

/**
 * Seed default standard apparel units for a company
 */
export const seedDefaultUnits = async (companyId, createdBy = null) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const seeded = [];
  for (const u of DEFAULT_UNITS) {
    const codeExists = await unitRepository.existsByCode(companyId, u.unit_code);
    const nameExists = await unitRepository.existsByName(companyId, u.unit_name);

    if (!codeExists && !nameExists) {
      const created = await unitRepository.create({
        company_id: companyId,
        unit_code: u.unit_code,
        unit_name: u.unit_name,
        decimal_places: u.decimal_places,
        is_active: true,
        created_by: createdBy,
      });
      seeded.push(toUnitDTO(created));
    }
  }

  return seeded;
};

export default {
  DEFAULT_UNITS,
  generateUnitCode,
  getUnits,
  getUnitById,
  getUnitByCode,
  getUnitsByCompanyId,
  createUnit,
  updateUnit,
  updateUnitStatus,
  deleteUnit,
  seedDefaultUnits,
};
