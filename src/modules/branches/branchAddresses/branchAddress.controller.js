import * as branchAddressService from './branchAddress.service.js';
import { sendSuccess, sendCreated } from '../../../shared/utils/response.js';

/**
 * GET /api/branch-addresses
 */
export const getAll = async (req, res, next) => {
  try {
    const { addresses, meta } = await branchAddressService.getAddresses(req.query);
    return sendSuccess(res, addresses, 'Branch addresses retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/branch-addresses/:id
 */
export const getById = async (req, res, next) => {
  try {
    const address = await branchAddressService.getAddressById(req.params.id);
    return sendSuccess(res, address, 'Branch address retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/branch-addresses/branch/:branchId
 */
export const getByBranchId = async (req, res, next) => {
  try {
    const addresses = await branchAddressService.getAddressesByBranchId(req.params.branchId);
    return sendSuccess(res, addresses, 'Branch addresses retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/branch-addresses
 */
export const create = async (req, res, next) => {
  try {
    const address = await branchAddressService.createAddress(req.body);
    return sendCreated(res, address, 'Branch address created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/branch-addresses/:id
 */
export const update = async (req, res, next) => {
  try {
    const address = await branchAddressService.updateAddress(req.params.id, req.body);
    return sendSuccess(res, address, 'Branch address updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/branch-addresses/:id/status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const address = await branchAddressService.updateAddressStatus(
      req.params.id,
      req.body.is_active
    );
    return sendSuccess(res, address, 'Branch address status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/branch-addresses/:id/primary
 */
export const setPrimary = async (req, res, next) => {
  try {
    const address = await branchAddressService.setPrimaryAddress(req.params.id);
    return sendSuccess(res, address, 'Branch address set as primary successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/branch-addresses/:id
 */
export const deleteAddress = async (req, res, next) => {
  try {
    const deleted = await branchAddressService.deleteAddress(req.params.id);
    return sendSuccess(res, deleted, 'Branch address deleted successfully');
  } catch (error) {
    return next(error);
  }
};

export default {
  getAll,
  getById,
  getByBranchId,
  create,
  update,
  updateStatus,
  setPrimary,
  deleteAddress,
};
