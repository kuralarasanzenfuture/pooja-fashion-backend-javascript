import * as companyService from './company.service.js';
import { sendSuccess, sendCreated } from '../../shared/utils/response.js';

/**
 * GET /api/companies
 */
export const getAll = async (req, res, next) => {
  try {
    const { companies, meta } = await companyService.getCompanies(req.query);
    return sendSuccess(res, companies, 'Companies retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/companies/:id
 */
export const getById = async (req, res, next) => {
  try {
    const company = await companyService.getCompanyById(req.params.id);
    return sendSuccess(res, company, 'Company retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/companies/code/:companyCode
 */
export const getByCode = async (req, res, next) => {
  try {
    const company = await companyService.getCompanyByCode(req.params.companyCode);
    return sendSuccess(res, company, 'Company retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/companies
 */
export const create = async (req, res, next) => {
  try {
    const company = await companyService.createCompany(req.body);
    return sendCreated(res, company, 'Company created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/companies/:id
 */
export const update = async (req, res, next) => {
  try {
    const company = await companyService.updateCompany(req.params.id, req.body);
    return sendSuccess(res, company, 'Company updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/companies/:id/status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const company = await companyService.updateCompanyStatus(req.params.id, req.body.status);
    return sendSuccess(res, company, 'Company status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/companies/:id
 */
export const deleteCompany = async (req, res, next) => {
  try {
    const deleted = await companyService.deleteCompany(req.params.id);
    return sendSuccess(res, deleted, 'Company deleted successfully');
  } catch (error) {
    return next(error);
  }
};

export default {
  getAll,
  getById,
  getByCode,
  create,
  update,
  updateStatus,
  deleteCompany,
};
