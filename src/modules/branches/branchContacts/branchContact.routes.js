import { Router } from 'express';
import {
  getAll,
  getById,
  getByBranchId,
  create,
  update,
  updateStatus,
  setPrimary,
  deleteContact,
} from './branchContact.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import {
  createBranchContactSchema,
  updateBranchContactSchema,
  updateStatusSchema,
  branchContactIdParamSchema,
  branchIdParamSchema,
  getBranchContactsQuerySchema,
} from './branchContact.validation.js';

const router = Router();

// GET /api/branch-contacts - List branch contacts
router.get('/', validate(getBranchContactsQuerySchema, 'query'), getAll);

// GET /api/branch-contacts/branch/:branchId - List all contacts for a branch
router.get('/branch/:branchId', validate(branchIdParamSchema, 'params'), getByBranchId);

// GET /api/branch-contacts/:id - Get contact by ID
router.get('/:id', validate(branchContactIdParamSchema, 'params'), getById);

// POST /api/branch-contacts - Create new contact
router.post('/', validate(createBranchContactSchema, 'body'), create);

// PUT /api/branch-contacts/:id - Update contact
router.put(
  '/:id',
  validate(branchContactIdParamSchema, 'params'),
  validate(updateBranchContactSchema, 'body'),
  update
);

// PATCH /api/branch-contacts/:id/status - Update active status
router.patch(
  '/:id/status',
  validate(branchContactIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// PATCH /api/branch-contacts/:id/primary - Set as primary contact
router.patch('/:id/primary', validate(branchContactIdParamSchema, 'params'), setPrimary);

// DELETE /api/branch-contacts/:id - Delete contact
router.delete('/:id', validate(branchContactIdParamSchema, 'params'), deleteContact);

export default router;
