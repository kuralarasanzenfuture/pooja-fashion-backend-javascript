import { Router } from 'express';
import {
  getAll,
  getById,
  getByCode,
  getByCompanyId,
  create,
  update,
  updateStatus,
  deleteSizeGroup,
  seedDefaults,
} from './sizeGroup.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import {
  createSizeGroupSchema,
  updateSizeGroupSchema,
  updateStatusSchema,
  sizeGroupIdParamSchema,
  companyIdParamSchema,
  sizeGroupCodeParamSchema,
  getSizeGroupsQuerySchema,
} from './sizeGroup.validation.js';

const router = Router();

// GET /api/product-master/size-groups - List size groups with pagination & filters
router.get('/', validate(getSizeGroupsQuerySchema, 'query'), getAll);

// GET /api/product-master/size-groups/company/:companyId - List all size groups for a company
router.get(
  '/company/:companyId',
  validate(companyIdParamSchema, 'params'),
  getByCompanyId
);

// GET /api/product-master/size-groups/code/:companyId/:sizeGroupCode - Get by company and code
router.get(
  '/code/:companyId/:sizeGroupCode',
  validate(sizeGroupCodeParamSchema, 'params'),
  getByCode
);

// GET /api/product-master/size-groups/:id - Get size group by ID
router.get('/:id', validate(sizeGroupIdParamSchema, 'params'), getById);

// POST /api/product-master/size-groups - Create new size group
router.post('/', validate(createSizeGroupSchema, 'body'), create);

// PUT /api/product-master/size-groups/:id - Update existing size group
router.put(
  '/:id',
  validate(sizeGroupIdParamSchema, 'params'),
  validate(updateSizeGroupSchema, 'body'),
  update
);

// PATCH /api/product-master/size-groups/:id/status - Update active status
router.patch(
  '/:id/status',
  validate(sizeGroupIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// DELETE /api/product-master/size-groups/:id - Delete size group
router.delete(
  '/:id',
  validate(sizeGroupIdParamSchema, 'params'),
  deleteSizeGroup
);

// POST /api/product-master/size-groups/company/:companyId/seed-defaults - Seed standard defaults
router.post(
  '/company/:companyId/seed-defaults',
  validate(companyIdParamSchema, 'params'),
  seedDefaults
);

export default router;
