import * as companyTaxDetailService from './companyTaxDetail.service.js';
import { sendSuccess, sendCreated } from '../../shared/utils/response.js';

export const getAll = async (req, res, next) => {
  try {
    const { taxDetails, meta } = await companyTaxDetailService.getTaxDetails(req.query);
    return sendSuccess(res, taxDetails, 'Company tax details retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const taxDetail = await companyTaxDetailService.getTaxDetailById(req.params.id);
    return sendSuccess(res, taxDetail, 'Company tax detail retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

export const getByCompanyId = async (req, res, next) => {
  try {
    const taxDetails = await companyTaxDetailService.getTaxDetailsByCompanyId(req.params.companyId);
    return sendSuccess(res, taxDetails, 'Company tax details retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

export const getPrimaryByCompanyId = async (req, res, next) => {
  try {
    const taxDetail = await companyTaxDetailService.getPrimaryTaxDetailByCompanyId(req.params.companyId);
    return sendSuccess(res, taxDetail, 'Primary company tax detail retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const taxDetail = await companyTaxDetailService.createTaxDetail(req.body);
    return sendCreated(res, taxDetail, 'Company tax detail created successfully');
  } catch (error) {
    return next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const taxDetail = await companyTaxDetailService.updateTaxDetail(req.params.id, req.body);
    return sendSuccess(res, taxDetail, 'Company tax detail updated successfully');
  } catch (error) {
    return next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const isActive = req.body.is_active !== undefined ? req.body.is_active : req.body.isActive;
    const taxDetail = await companyTaxDetailService.updateTaxDetailStatus(
      req.params.id,
      isActive
    );
    return sendSuccess(res, taxDetail, 'Company tax detail status updated successfully');
  } catch (error) {
    return next(error);
  }
};

export const setPrimary = async (req, res, next) => {
  try {
    const taxDetail = await companyTaxDetailService.setPrimaryTaxDetail(req.params.id);
    return sendSuccess(res, taxDetail, 'Company tax detail set as primary successfully');
  } catch (error) {
    return next(error);
  }
};

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
  getPrimaryByCompanyId,
  create,
  update,
  updateStatus,
  setPrimary,
  deleteTaxDetail,
};
