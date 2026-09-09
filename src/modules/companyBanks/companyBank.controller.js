import * as companyBankService from './companyBank.service.js';
import { sendSuccess, sendCreated } from '../../shared/utils/response.js';

/**
 * GET /api/company-banks
 */
export const getAll = async (req, res, next) => {
  try {
    const { banks, meta } = await companyBankService.getBanks(req.query);
    return sendSuccess(res, banks, 'Company banks retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/company-banks/:id
 */
export const getById = async (req, res, next) => {
  try {
    const bank = await companyBankService.getBankById(req.params.id);
    return sendSuccess(res, bank, 'Company bank retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/company-banks/company/:companyId
 */
export const getByCompanyId = async (req, res, next) => {
  try {
    const banks = await companyBankService.getBanksByCompanyId(req.params.companyId);
    return sendSuccess(res, banks, 'Company banks retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/company-banks
 */
export const create = async (req, res, next) => {
  try {
    const bank = await companyBankService.createBank(req.body);
    return sendCreated(res, bank, 'Company bank created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/company-banks/:id
 */
export const update = async (req, res, next) => {
  try {
    const bank = await companyBankService.updateBank(req.params.id, req.body);
    return sendSuccess(res, bank, 'Company bank updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/company-banks/:id/status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const bank = await companyBankService.updateBankStatus(req.params.id, req.body.is_active);
    return sendSuccess(res, bank, 'Company bank status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/company-banks/:id/primary
 */
export const setPrimary = async (req, res, next) => {
  try {
    const bank = await companyBankService.setPrimaryBank(req.params.id);
    return sendSuccess(res, bank, 'Company bank set as primary successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/company-banks/:id
 */
export const deleteBank = async (req, res, next) => {
  try {
    const deleted = await companyBankService.deleteBank(req.params.id);
    return sendSuccess(res, deleted, 'Company bank deleted successfully');
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
  deleteBank,
};
