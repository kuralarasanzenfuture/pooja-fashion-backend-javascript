import { Router } from 'express';
import {
  getAll,
  getById,
  getByBranchId,
  create,
  update,
  updateStatus,
  setPrimary,
  deleteAddress,
} from './branchAddress.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import {
  createBranchAddressSchema,
  updateBranchAddressSchema,
  updateStatusSchema,
  branchAddressIdParamSchema,
  branchIdParamSchema,
  getBranchAddressesQuerySchema,
} from './branchAddress.validation.js';

const router = Router();

// GET /api/branch-addresses - List branch addresses
router.get('/', validate(getBranchAddressesQuerySchema, 'query'), getAll);

// GET /api/branch-addresses/branch/:branchId - List all addresses for a branch
router.get('/branch/:branchId', validate(branchIdParamSchema, 'params'), getByBranchId);

// GET /api/branch-addresses/:id - Get address by ID
router.get('/:id', validate(branchAddressIdParamSchema, 'params'), getById);

// POST /api/branch-addresses - Create new address
router.post('/', validate(createBranchAddressSchema, 'body'), create);

// PUT /api/branch-addresses/:id - Update address
router.put(
  '/:id',
  validate(branchAddressIdParamSchema, 'params'),
  validate(updateBranchAddressSchema, 'body'),
  update
);

// PATCH /api/branch-addresses/:id/status - Update active status
router.patch(
  '/:id/status',
  validate(branchAddressIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// PATCH /api/branch-addresses/:id/primary - Set as primary address
router.patch('/:id/primary', validate(branchAddressIdParamSchema, 'params'), setPrimary);

// DELETE /api/branch-addresses/:id - Delete address
router.delete('/:id', validate(branchAddressIdParamSchema, 'params'), deleteAddress);

export default router;
