import { Router } from 'express';
import {
  getAll,
  getById,
  getByCode,
  getByCompanyId,
  create,
  update,
  updateStatus,
  setMain,
  deleteBranch,
} from './branch.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import {
  createBranchSchema,
  updateBranchSchema,
  updateStatusSchema,
  branchIdParamSchema,
  companyIdParamSchema,
  branchCodeParamSchema,
  getBranchesQuerySchema,
} from './branch.validation.js';

const router = Router();

// GET /api/branches - List branches with pagination & filtering
router.get('/', validate(getBranchesQuerySchema, 'query'), getAll);

// GET /api/branches/company/:companyId - List all branches for a company
router.get('/company/:companyId', validate(companyIdParamSchema, 'params'), getByCompanyId);

// GET /api/branches/code/:companyId/:branchCode - Get branch by company ID and branch code
router.get('/code/:companyId/:branchCode', validate(branchCodeParamSchema, 'params'), getByCode);

// GET /api/branches/:id - Get single branch by ID
router.get('/:id', validate(branchIdParamSchema, 'params'), getById);

// POST /api/branches - Create a new branch (with auto-generated branch code if omitted)
router.post('/', validate(createBranchSchema, 'body'), create);

// PUT /api/branches/:id - Update an existing branch
router.put(
  '/:id',
  validate(branchIdParamSchema, 'params'),
  validate(updateBranchSchema, 'body'),
  update
);

// PATCH /api/branches/:id/status - Update branch status
router.patch(
  '/:id/status',
  validate(branchIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// PATCH /api/branches/:id/main - Set branch as main branch
router.patch('/:id/main', validate(branchIdParamSchema, 'params'), setMain);

// DELETE /api/branches/:id - Delete branch
router.delete('/:id', validate(branchIdParamSchema, 'params'), deleteBranch);

export default router;
