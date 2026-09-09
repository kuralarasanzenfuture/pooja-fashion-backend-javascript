import * as bankService from './bank.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/banks
 */
export const getAll = async (req, res, next) => {
  try {
    const { banks, meta } = await bankService.getBanks(req.query);
    return sendSuccess(res, banks, 'Banks retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/banks/:id
 */
export const getById = async (req, res, next) => {
  try {
    const bank = await bankService.getBankById(req.params.id);
    return sendSuccess(res, bank, 'Bank retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/banks/code/:bankCode
 */
export const getByCode = async (req, res, next) => {
  try {
    const bank = await bankService.getBankByCode(req.params.bankCode);
    return sendSuccess(res, bank, 'Bank retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/banks
 * Supports JSON or multipart/form-data with logo files
 */
export const create = async (req, res, next) => {
  try {
    const bank = await bankService.createBank(req.body, req.files, req.bankUploadSlug);
    return sendCreated(res, bank, 'Bank created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/banks/:id
 * Supports JSON or multipart/form-data with logo replacement files
 */
export const update = async (req, res, next) => {
  try {
    const bank = await bankService.updateBank(req.params.id, req.body, req.files, req.bankUploadSlug);
    return sendSuccess(res, bank, 'Bank updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/banks/:id/logo
 * Dedicated endpoint for uploading or updating bank logos
 */
export const uploadLogo = async (req, res, next) => {
  try {
    const bank = await bankService.uploadBankLogo(req.params.id, req.files, req.bankUploadSlug);
    return sendSuccess(res, bank, 'Bank logo uploaded successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/banks/:id/logo
 * Dedicated endpoint for removing bank logos from disk and database
 */
export const deleteLogo = async (req, res, next) => {
  try {
    const type = req.query.type || 'all';
    const bank = await bankService.deleteBankLogo(req.params.id, type);
    return sendSuccess(res, bank, 'Bank logo deleted successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/banks/:id/status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const bank = await bankService.updateBankStatus(req.params.id, req.body.is_active);
    return sendSuccess(res, bank, 'Bank status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/banks/:id
 */
export const deleteBank = async (req, res, next) => {
  try {
    const deleted = await bankService.deleteBank(req.params.id);
    return sendSuccess(res, deleted, 'Bank deleted successfully');
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
  uploadLogo,
  deleteLogo,
  updateStatus,
  deleteBank,
};
