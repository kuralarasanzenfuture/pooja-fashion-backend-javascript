import { Router } from 'express';
import {
  getAll,
  getAllUnpaginated,
  getStats,
  reorder,
  getById,
  getByCode,
  getBySizeGroupId,
  getByCompanyId,
  create,
  update,
  updateStatus,
  deleteSize,
  seedDefaults,
  checkSizeName,
  checkSizeCode,
} from './size.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import { verifyToken } from '../../../middlewares/auth.middleware.js';
import { setApiContext } from '../../../middlewares/apiLogger.middleware.js';
import {
  createSizeSchema,
  updateSizeSchema,
  updateStatusSchema,
  sizeIdParamSchema,
  companyIdParamSchema,
  sizeGroupIdParamSchema,
  sizeCodeParamSchema,
  getSizesQuerySchema,
  getAllSizesQuerySchema,
  getSizeStatsQuerySchema,
  reorderSizesSchema,
  checkSizeNameQuerySchema,
  checkSizeCodeQuerySchema,
  seedDefaultSizesSchema,
} from './size.validation.js';

const router = Router();

// GET /api/product-master/sizes - List sizes with pagination & filters
router.get(
  '/',
  setApiContext({
    module: 'SIZE',
    category: 'SIZE MANAGEMENT',
    subcategory: 'GET ALL SIZES',
    controller: 'sizeController.getAll',
    service: 'sizeService.getSizes',
    operation: 'Fetch sizes with pagination & filters',
  }),
  verifyToken,
  validate(getSizesQuerySchema, 'query'),
  getAll
);

// GET /api/product-master/sizes/all - List all sizes without pagination (for dropdowns)
router.get(
  '/all',
  setApiContext({
    module: 'SIZE',
    category: 'SIZE MANAGEMENT',
    subcategory: 'GET ALL SIZES (UNPAGINATED)',
    controller: 'sizeController.getAllUnpaginated',
    service: 'sizeService.getAllSizes',
    operation: 'Fetch all sizes for company without pagination',
  }),
  verifyToken,
  validate(getAllSizesQuerySchema, 'query'),
  getAllUnpaginated
);

// GET /api/product-master/sizes/stats - Size metrics & summary counts for user company
router.get(
  '/stats',
  setApiContext({
    module: 'SIZE',
    category: 'SIZE MANAGEMENT',
    subcategory: 'GET SIZE STATS',
    controller: 'sizeController.getStats',
    service: 'sizeService.getSizeStats',
    operation: 'Fetch size statistics for company',
  }),
  verifyToken,
  validate(getSizeStatsQuerySchema, 'query'),
  getStats
);

// PATCH /api/product-master/sizes/reorder - Bulk reorder size display order
router.patch(
  '/reorder',
  setApiContext({
    module: 'SIZE',
    category: 'SIZE MANAGEMENT',
    subcategory: 'REORDER SIZES',
    controller: 'sizeController.reorder',
    service: 'sizeService.reorderSizes',
    operation: 'Bulk reorder size display positions',
  }),
  verifyToken,
  validate(reorderSizesSchema, 'body'),
  reorder
);

// GET /api/product-master/sizes/check-name - Check if size name already exists
router.get(
  '/check-name',
  setApiContext({
    module: 'SIZE',
    category: 'SIZE MANAGEMENT',
    subcategory: 'CHECK SIZE NAME',
    controller: 'sizeController.checkSizeName',
    service: 'sizeService.checkSizeNameExists',
    operation: 'Check if size name already exists in size group or company scope',
  }),
  verifyToken,
  validate(checkSizeNameQuerySchema, 'query'),
  checkSizeName
);

// GET /api/product-master/sizes/check-code - Check if size code already exists
router.get(
  '/check-code',
  setApiContext({
    module: 'SIZE',
    category: 'SIZE MANAGEMENT',
    subcategory: 'CHECK SIZE CODE',
    controller: 'sizeController.checkSizeCode',
    service: 'sizeService.checkSizeCodeExists',
    operation: 'Check if size code already exists in size group',
  }),
  verifyToken,
  validate(checkSizeCodeQuerySchema, 'query'),
  checkSizeCode
);

// POST /api/product-master/sizes/seed-defaults - Seed standard defaults for a size group
router.post(
  '/seed-defaults',
  setApiContext({
    module: 'SIZE',
    category: 'SIZE MANAGEMENT',
    subcategory: 'SEED DEFAULT SIZES',
    controller: 'sizeController.seedDefaults',
    service: 'sizeService.seedDefaultSizes',
    operation: 'Seed standard preset sizes for a size group',
  }),
  verifyToken,
  validate(seedDefaultSizesSchema, 'body'),
  seedDefaults
);

// GET /api/product-master/sizes/company/:companyId - List all sizes for a company
router.get(
  '/company/:companyId',
  setApiContext({
    module: 'SIZE',
    category: 'SIZE MANAGEMENT',
    subcategory: 'GET SIZES BY COMPANY ID',
    controller: 'sizeController.getByCompanyId',
    service: 'sizeService.getSizesByCompanyId',
    operation: 'Fetch all sizes belonging to company ID',
  }),
  verifyToken,
  validate(companyIdParamSchema, 'params'),
  getByCompanyId
);

// GET /api/product-master/sizes/size-group/:sizeGroupId - List all sizes for a size group
router.get(
  '/size-group/:sizeGroupId',
  setApiContext({
    module: 'SIZE',
    category: 'SIZE MANAGEMENT',
    subcategory: 'GET SIZES BY SIZE GROUP ID',
    controller: 'sizeController.getBySizeGroupId',
    service: 'sizeService.getSizesBySizeGroupId',
    operation: 'Fetch all sizes belonging to size group ID',
  }),
  verifyToken,
  validate(sizeGroupIdParamSchema, 'params'),
  getBySizeGroupId
);

// GET /api/product-master/sizes/code/:sizeGroupId/:sizeCode - Get by size group and code
router.get(
  '/code/:sizeGroupId/:sizeCode',
  setApiContext({
    module: 'SIZE',
    category: 'SIZE MANAGEMENT',
    subcategory: 'GET SIZE BY CODE',
    controller: 'sizeController.getByCode',
    service: 'sizeService.getSizeByCode',
    operation: 'Fetch single size by size group ID and size code',
  }),
  verifyToken,
  validate(sizeCodeParamSchema, 'params'),
  getByCode
);

// GET /api/product-master/sizes/:id - Get size by ID
router.get(
  '/:id',
  setApiContext({
    module: 'SIZE',
    category: 'SIZE MANAGEMENT',
    subcategory: 'GET SIZE BY ID',
    controller: 'sizeController.getById',
    service: 'sizeService.getSizeById',
    operation: 'Fetch single size by primary ID',
  }),
  verifyToken,
  validate(sizeIdParamSchema, 'params'),
  getById
);

// POST /api/product-master/sizes - Create new size
router.post(
  '/',
  setApiContext({
    module: 'SIZE',
    category: 'SIZE MANAGEMENT',
    subcategory: 'CREATE SIZE',
    controller: 'sizeController.create',
    service: 'sizeService.createSize',
    database: 'INSERT size',
  }),
  verifyToken,
  validate(createSizeSchema, 'body'),
  create
);

// PUT /api/product-master/sizes/:id - Update existing size
router.put(
  '/:id',
  setApiContext({
    module: 'SIZE',
    category: 'SIZE MANAGEMENT',
    subcategory: 'UPDATE SIZE',
    controller: 'sizeController.update',
    service: 'sizeService.updateSize',
    operation: 'UPDATE size',
  }),
  verifyToken,
  validate(sizeIdParamSchema, 'params'),
  validate(updateSizeSchema, 'body'),
  update
);

// PATCH /api/product-master/sizes/:id/status - Update size active status
router.patch(
  '/:id/status',
  setApiContext({
    module: 'SIZE',
    category: 'SIZE MANAGEMENT',
    subcategory: 'UPDATE SIZE STATUS',
    controller: 'sizeController.updateStatus',
    service: 'sizeService.updateSizeStatus',
    operation: 'UPDATE STATUS size',
  }),
  verifyToken,
  validate(sizeIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// DELETE /api/product-master/sizes/:id - Delete size
router.delete(
  '/:id',
  setApiContext({
    module: 'SIZE',
    category: 'SIZE MANAGEMENT',
    subcategory: 'DELETE SIZE',
    controller: 'sizeController.deleteSize',
    service: 'sizeService.deleteSize',
    operation: 'DELETE size',
  }),
  verifyToken,
  validate(sizeIdParamSchema, 'params'),
  deleteSize
);

export default router;
