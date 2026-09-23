import { Router } from 'express';
import {
  getAll,
  getById,
  getByCode,
  getBySizeGroupId,
  getByCompanyId,
  create,
  update,
  updateStatus,
  deleteSize,
} from './size.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import {
  createSizeSchema,
  updateSizeSchema,
  updateStatusSchema,
  sizeIdParamSchema,
  companyIdParamSchema,
  sizeGroupIdParamSchema,
  sizeCodeParamSchema,
  getSizesQuerySchema,
} from './size.validation.js';

const router = Router();

// GET /api/product-master/sizes - List sizes with pagination & filters
router.get('/', validate(getSizesQuerySchema, 'query'), getAll);

// GET /api/product-master/sizes/company/:companyId - List all sizes for a company
router.get(
  '/company/:companyId',
  validate(companyIdParamSchema, 'params'),
  getByCompanyId
);

// GET /api/product-master/sizes/size-group/:sizeGroupId - List all sizes for a size group
router.get(
  '/size-group/:sizeGroupId',
  validate(sizeGroupIdParamSchema, 'params'),
  getBySizeGroupId
);

// GET /api/product-master/sizes/code/:sizeGroupId/:sizeCode - Get by size group and code
router.get(
  '/code/:sizeGroupId/:sizeCode',
  validate(sizeCodeParamSchema, 'params'),
  getByCode
);

// GET /api/product-master/sizes/:id - Get size by ID
router.get('/:id', validate(sizeIdParamSchema, 'params'), getById);

// POST /api/product-master/sizes - Create new size
router.post('/', validate(createSizeSchema, 'body'), create);

// PUT /api/product-master/sizes/:id - Update existing size
router.put(
  '/:id',
  validate(sizeIdParamSchema, 'params'),
  validate(updateSizeSchema, 'body'),
  update
);

// PATCH /api/product-master/sizes/:id/status - Update active status
router.patch(
  '/:id/status',
  validate(sizeIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// DELETE /api/product-master/sizes/:id - Delete size
router.delete(
  '/:id',
  validate(sizeIdParamSchema, 'params'),
  deleteSize
);

export default router;
