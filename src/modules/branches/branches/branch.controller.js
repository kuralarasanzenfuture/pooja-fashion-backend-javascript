import * as branchService from './branch.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/branches
 */
export const getAll = async (req, res, next) => {
  try {
    const { branches, meta } = await branchService.getBranches(req.query);
    return sendSuccess(res, branches, 'Branches retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/branches/:id
 */
export const getById = async (req, res, next) => {
  try {
    const branch = await branchService.getBranchById(req.params.id);
    return sendSuccess(res, branch, 'Branch retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/branches/code/:companyId/:branchCode
 */
export const getByCode = async (req, res, next) => {
  try {
    const branch = await branchService.getBranchByCode(req.params.companyId, req.params.branchCode);
    return sendSuccess(res, branch, 'Branch retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/branches/company/:companyId
 */
export const getByCompanyId = async (req, res, next) => {
  try {
    const branches = await branchService.getBranchesByCompanyId(req.params.companyId);
    return sendSuccess(res, branches, 'Company branches retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/branches
 */
export const create = async (req, res, next) => {
  try {
    const branch = await branchService.createBranch(req.body);
    return sendCreated(res, branch, 'Branch created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/branches/:id
 */
export const update = async (req, res, next) => {
  try {
    const branch = await branchService.updateBranch(req.params.id, req.body);
    return sendSuccess(res, branch, 'Branch updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/branches/:id/status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const branch = await branchService.updateBranchStatus(req.params.id, req.body.status);
    return sendSuccess(res, branch, 'Branch status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/branches/:id/main
 */
export const setMain = async (req, res, next) => {
  try {
    const branch = await branchService.setMainBranch(req.params.id);
    return sendSuccess(res, branch, 'Branch set as main branch successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/branches/:id
 */
export const deleteBranch = async (req, res, next) => {
  try {
    const deleted = await branchService.deleteBranch(req.params.id);
    return sendSuccess(res, deleted, 'Branch deleted successfully');
  } catch (error) {
    return next(error);
  }
};

export default {
  getAll,
  getById,
  getByCode,
  getByCompanyId,
  create,
  update,
  updateStatus,
  setMain,
  deleteBranch,
};
