import * as companyTaxDetailService from './companyTaxDetail.service.js';
import { sendSuccess, sendCreated } from '../../shared/utils/response.js';

/**
 * GET /api/company-tax-details
 */
export const getAll = async (req, res, next) => {
  try {
    const { taxDetails, meta } = await companyTaxDetailService.getTaxDetails(req.query);
    return sendSuccess(
      res,
      taxDetails,
      'Company tax details retrieved successfully',
      200,
      meta
    );
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/company-tax-details/:id
 */
export const getById = async (req, res, next) => {
  try {
    const taxDetail = await companyTaxDetailService.getTaxDetailById(req.params.id);
    return sendSuccess(res, taxDetail, 'Company tax detail retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/company-tax-details/company/:companyId
 */
export const getByCompanyId = async (req, res, next) => {
  try {
    const taxDetails = await companyTaxDetailService.getTaxDetailsByCompanyId(
      req.params.companyId
    );
    return sendSuccess(res, taxDetails, 'Company tax details retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/company-tax-details
 */
export const create = async (req, res, next) => {
  try {
    const taxDetail = await companyTaxDetailService.createTaxDetail(req.body);
    return sendCreated(res, taxDetail, 'Company tax detail created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/company-tax-details/:id
 */
export const update = async (req, res, next) => {
  try {
    const taxDetail = await companyTaxDetailService.updateTaxDetail(req.params.id, req.body);
    return sendSuccess(res, taxDetail, 'Company tax detail updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/company-tax-details/:id/status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const taxDetail = await companyTaxDetailService.updateTaxDetailStatus(
      req.params.id,
      req.body.is_active
    );
    return sendSuccess(res, taxDetail, 'Company tax detail status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/company-tax-details/:id/primary
 */
export const setPrimary = async (req, res, next) => {
  try {
    const taxDetail = await companyTaxDetailService.setPrimaryTaxDetail(req.params.id);
    return sendSuccess(res, taxDetail, 'Company tax detail set as primary successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/company-tax-details/:id
 */
export const deleteTaxDetail = async (req, res, next) => {
  try {
    const deleted = await companyTaxDetailService.deleteTaxDetail(req.params.id);
    return sendSuccess(res, deleted, 'Company tax detail deleted successfully');
  } catch (error) {
    return next(error);
  }
};

export default {
  getAll,
  getById,
  getByCompanyId,
  create,
  update,
  updateStatus,
  setPrimary,
  deleteTaxDetail,
};
