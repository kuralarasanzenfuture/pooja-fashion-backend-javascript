import * as companyRepository from './company.repository.js';
import { toCompanyDTO, toCompanyListDTO } from './company.mapper.js';
import { seedDefaultCompanyRoles } from '../roles/role.service.js';
import NotFoundError from '../../shared/errors/NotFoundError.js';
import BadRequestError from '../../shared/errors/BadRequestError.js';
import { getPaginationParams, formatPaginationMeta } from '../../shared/utils/pagination.js';

/**
 * List companies with pagination, filtering, and search
 */
export const getCompanies = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const status = query.status || null;

  const { rows, total } = await companyRepository.findAll({
    limit,
    offset,
    search,
    status,
    sortBy,
    sortOrder,
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    companies: toCompanyListDTO(rows),
    meta,
  };
};

/**
 * Get single company by ID
 */
export const getCompanyById = async (id) => {
  const company = await companyRepository.findById(id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${id} not found`);
  }
  return toCompanyDTO(company);
};

/**
 * Get single company by company code
 */
export const getCompanyByCode = async (companyCode) => {
  const company = await companyRepository.findByCode(companyCode);
  if (!company) {
    throw new NotFoundError(`Company with code '${companyCode}' not found`);
  }
  return toCompanyDTO(company);
};

/**
 * Create new company
 */
export const createCompany = async (data) => {
  const codeExists = await companyRepository.existsByCode(data.company_code);
  if (codeExists) {
    throw new BadRequestError(`Company code '${data.company_code}' is already in use`);
  }

  const created = await companyRepository.create(data);

  // Auto-seed default system roles (SUPERADMIN, ADMIN) for the new company
  try {
    await seedDefaultCompanyRoles(created.id);
  } catch (seedError) {
    console.warn(
      `⚠️ Could not auto-seed default roles for company ${created.id}:`,
      seedError.message
    );
  }

  return toCompanyDTO(created);
};

/**
 * Update company details
 */
export const updateCompany = async (id, data) => {
  const existing = await companyRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company with ID ${id} not found`);
  }

  if (data.company_code && data.company_code !== existing.company_code) {
    const codeExists = await companyRepository.existsByCode(data.company_code, id);
    if (codeExists) {
      throw new BadRequestError(`Company code '${data.company_code}' is already in use`);
    }
  }

  const updated = await companyRepository.update(id, data);
  return toCompanyDTO(updated);
};

/**
 * Update company active/inactive/suspended status
 */
export const updateCompanyStatus = async (id, status) => {
  const existing = await companyRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company with ID ${id} not found`);
  }

  const updated = await companyRepository.updateStatus(id, status);
  return toCompanyDTO(updated);
};

/**
 * Delete company by ID
 */
export const deleteCompany = async (id) => {
  const existing = await companyRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Company with ID ${id} not found`);
  }

  const deleted = await companyRepository.deleteCompany(id);
  return toCompanyDTO(deleted);
};

export default {
  getCompanies,
  getCompanyById,
  getCompanyByCode,
  createCompany,
  updateCompany,
  updateCompanyStatus,
  deleteCompany,
};
