import * as branchRepository from './branch.repository.js';
import * as companyRepository from '../../companies/company.repository.js';
import { toBranchDTO, toBranchListDTO } from './branch.mapper.js';
import { generateBranchCode } from './branch.utils.js';
import NotFoundError from '../../../shared/errors/NotFoundError.js';
import BadRequestError from '../../../shared/errors/BadRequestError.js';
import { getPaginationParams, formatPaginationMeta } from '../../../shared/utils/pagination.js';

/**
 * List branches with pagination, filtering, and search
 */
export const getBranches = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = query.company_id || query.companyId || null;
  const branchType = query.branch_type || null;
  const status = query.status || null;
  const isMainBranch = query.is_main_branch !== undefined ? query.is_main_branch : null;

  const { rows, total } = await branchRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    branchType,
    status,
    isMainBranch,
    sortBy: sortBy || 'id',
    sortOrder: sortOrder || 'ASC',
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    branches: toBranchListDTO(rows),
    meta,
  };
};

/**
 * Get branch by primary ID
 */
export const getBranchById = async (id) => {
  const branch = await branchRepository.findById(id);
  if (!branch) {
    throw new NotFoundError(`Branch with ID ${id} not found`);
  }
  return toBranchDTO(branch);
};

/**
 * Get branch by company ID and branch code
 */
export const getBranchByCode = async (companyId, branchCode) => {
  const branch = await branchRepository.findByCode(companyId, branchCode);
  if (!branch) {
    throw new NotFoundError(`Branch with code '${branchCode}' not found for company ${companyId}`);
  }
  return toBranchDTO(branch);
};

/**
 * Get all branches for a specific company
 */
export const getBranchesByCompanyId = async (companyId) => {
  const company = await companyRepository.findById(companyId);
  if (!company) {
    throw new NotFoundError(`Company with ID ${companyId} not found`);
  }

  const rows = await branchRepository.findByCompanyId(companyId);
  return toBranchListDTO(rows);
};

/**
 * Create new branch with auto-generated professional branch code support
 */
export const createBranch = async (data) => {
  const company = await companyRepository.findById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${data.company_id} not found`);
  }

  // Handle branch_code: auto-generate if omitted, validate uniqueness if provided
  if (data.branch_code) {
    const codeExists = await branchRepository.existsByCode(data.company_id, data.branch_code);
    if (codeExists) {
      throw new BadRequestError(
        `Branch code '${data.branch_code}' already exists for company ${data.company_id}`
      );
    }
  } else {
    const existingCodes = await branchRepository.findExistingCodesByCompanyId(data.company_id);
    data.branch_code = generateBranchCode({
      company,
      branchType: data.branch_type || 'store',
      existingCodes,
    });
  }

  // If this branch is set as main, reset other main branches for this company
  if (data.is_main_branch) {
    await branchRepository.resetMainBranch(data.company_id);
  }

  const created = await branchRepository.create(data);
  return toBranchDTO(created);
};

/**
 * Update an existing branch
 */
export const updateBranch = async (id, data) => {
  const existing = await branchRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Branch with ID ${id} not found`);
  }

  if (data.branch_code && data.branch_code !== existing.branch_code) {
    const codeExists = await branchRepository.existsByCode(
      existing.company_id,
      data.branch_code,
      id
    );
    if (codeExists) {
      throw new BadRequestError(
        `Branch code '${data.branch_code}' already exists for company ${existing.company_id}`
      );
    }
  }

  if (data.is_main_branch === true) {
    await branchRepository.resetMainBranch(existing.company_id, id);
  }

  const updated = await branchRepository.update(id, data);
  return toBranchDTO(updated);
};

/**
 * Update branch status ('active', 'inactive', 'closed')
 */
export const updateBranchStatus = async (id, status) => {
  const existing = await branchRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Branch with ID ${id} not found`);
  }

  const updated = await branchRepository.updateStatus(id, status);
  return toBranchDTO(updated);
};

/**
 * Set a branch as the main branch for its company
 */
export const setMainBranch = async (id) => {
  const existing = await branchRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Branch with ID ${id} not found`);
  }

  await branchRepository.resetMainBranch(existing.company_id, id);
  const updated = await branchRepository.update(id, { is_main_branch: true });
  return toBranchDTO(updated);
};

/**
 * Delete branch by ID
 */
export const deleteBranch = async (id) => {
  const existing = await branchRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Branch with ID ${id} not found`);
  }

  const deleted = await branchRepository.deleteBranch(id);
  return toBranchDTO(deleted);
};

export default {
  getBranches,
  getBranchById,
  getBranchByCode,
  getBranchesByCompanyId,
  createBranch,
  updateBranch,
  updateBranchStatus,
  setMainBranch,
  deleteBranch,
};
