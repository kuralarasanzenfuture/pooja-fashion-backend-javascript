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
 */
export const create = async (req, res, next) => {
  try {
    const bank = await bankService.createBank(req.body);
    return sendCreated(res, bank, 'Bank created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/banks/:id
 */
export const update = async (req, res, next) => {
  try {
    const bank = await bankService.updateBank(req.params.id, req.body);
    return sendSuccess(res, bank, 'Bank updated successfully');
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
  updateStatus,
  deleteBank,
};
