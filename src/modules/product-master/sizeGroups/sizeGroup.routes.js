import { Router } from 'express';
import {
  getAll,
  getAllUnpaginated,
  getTree,
  getStats,
  getById,
  getByCode,
  getByCompanyId,
  create,
  update,
  updateStatus,
  deleteSizeGroup,
  seedDefaults,
  checkSizeGroupName,
  checkSizeGroupCode,
} from './sizeGroup.controller.js';
import { validate } from '../../../middlewares/validation.middleware.js';
import { verifyToken } from '../../../middlewares/auth.middleware.js';
import { setApiContext } from '../../../middlewares/apiLogger.middleware.js';
import {
  createSizeGroupSchema,
  updateSizeGroupSchema,
  updateStatusSchema,
  sizeGroupIdParamSchema,
  companyIdParamSchema,
  sizeGroupCodeParamSchema,
  getSizeGroupsQuerySchema,
  getAllSizeGroupsQuerySchema,
  getSizeGroupStatsQuerySchema,
  getSizeGroupTreeQuerySchema,
  checkSizeGroupNameQuerySchema,
  checkSizeGroupCodeQuerySchema,
  seedDefaultSizeGroupsSchema,
} from './sizeGroup.validation.js';

const router = Router();

// GET /api/product-master/size-groups - List size groups with pagination & filters
router.get(
  '/',
  setApiContext({
    module: 'SIZE_GROUP',
    category: 'SIZE GROUP MANAGEMENT',
    subcategory: 'GET ALL SIZE GROUPS',
    controller: 'sizeGroupController.getAll',
    service: 'sizeGroupService.getSizeGroups',
    operation: 'Fetch size groups with pagination & filters',
  }),
  verifyToken,
  validate(getSizeGroupsQuerySchema, 'query'),
  getAll
);

// GET /api/product-master/size-groups/all - List all size groups without pagination (for dropdowns)
router.get(
  '/all',
  setApiContext({
    module: 'SIZE_GROUP',
    category: 'SIZE GROUP MANAGEMENT',
    subcategory: 'GET ALL SIZE GROUPS (UNPAGINATED)',
    controller: 'sizeGroupController.getAllUnpaginated',
    service: 'sizeGroupService.getAllSizeGroups',
    operation: 'Fetch all size groups for company without pagination',
  }),
  verifyToken,
  validate(getAllSizeGroupsQuerySchema, 'query'),
  getAllUnpaginated
);

// GET /api/product-master/size-groups/tree - List size groups with their nested child sizes
router.get(
  '/tree',
  setApiContext({
    module: 'SIZE_GROUP',
    category: 'SIZE GROUP MANAGEMENT',
    subcategory: 'GET SIZE GROUPS TREE',
    controller: 'sizeGroupController.getTree',
    service: 'sizeGroupService.getSizeGroupTree',
    operation: 'Fetch size groups with nested child sizes hierarchy',
  }),
  verifyToken,
  validate(getSizeGroupTreeQuerySchema, 'query'),
  getTree
);

// GET /api/product-master/size-groups/stats - Size group metrics & summary counts for user company
router.get(
  '/stats',
  setApiContext({
    module: 'SIZE_GROUP',
    category: 'SIZE GROUP MANAGEMENT',
    subcategory: 'GET SIZE GROUP STATS',
    controller: 'sizeGroupController.getStats',
    service: 'sizeGroupService.getSizeGroupStats',
    operation: 'Fetch size group statistics for company',
  }),
  verifyToken,
  validate(getSizeGroupStatsQuerySchema, 'query'),
  getStats
);

// GET /api/product-master/size-groups/check-name - Check if size group name already exists
router.get(
  '/check-name',
  setApiContext({
    module: 'SIZE_GROUP',
    category: 'SIZE GROUP MANAGEMENT',
    subcategory: 'CHECK SIZE GROUP NAME',
    controller: 'sizeGroupController.checkSizeGroupName',
    service: 'sizeGroupService.checkSizeGroupNameExists',
    operation: 'Check if size group name already exists in company scope',
  }),
  verifyToken,
  validate(checkSizeGroupNameQuerySchema, 'query'),
  checkSizeGroupName
);

// GET /api/product-master/size-groups/check-code - Check if size group code already exists
router.get(
  '/check-code',
  setApiContext({
    module: 'SIZE_GROUP',
    category: 'SIZE GROUP MANAGEMENT',
    subcategory: 'CHECK SIZE GROUP CODE',
    controller: 'sizeGroupController.checkSizeGroupCode',
    service: 'sizeGroupService.checkSizeGroupCodeExists',
    operation: 'Check if size group code already exists in company scope',
  }),
  verifyToken,
  validate(checkSizeGroupCodeQuerySchema, 'query'),
  checkSizeGroupCode
);

// POST /api/product-master/size-groups/seed-defaults - Seed standard defaults
router.post(
  '/seed-defaults',
  setApiContext({
    module: 'SIZE_GROUP',
    category: 'SIZE GROUP MANAGEMENT',
    subcategory: 'SEED DEFAULT SIZE GROUPS',
    controller: 'sizeGroupController.seedDefaults',
    service: 'sizeGroupService.seedDefaultSizeGroups',
    operation: 'Seed standard preset size groups',
  }),
  verifyToken,
  validate(seedDefaultSizeGroupsSchema, 'body'),
  seedDefaults
);

// POST /api/product-master/size-groups/company/:companyId/seed-defaults - Seed standard defaults by company ID param
router.post(
  '/company/:companyId/seed-defaults',
  setApiContext({
    module: 'SIZE_GROUP',
    category: 'SIZE GROUP MANAGEMENT',
    subcategory: 'SEED DEFAULT SIZE GROUPS BY COMPANY ID',
    controller: 'sizeGroupController.seedDefaults',
    service: 'sizeGroupService.seedDefaultSizeGroups',
    operation: 'Seed standard preset size groups for specific company',
  }),
  verifyToken,
  validate(companyIdParamSchema, 'params'),
  seedDefaults
);

// GET /api/product-master/size-groups/company/:companyId - List all size groups for a company
router.get(
  '/company/:companyId',
  setApiContext({
    module: 'SIZE_GROUP',
    category: 'SIZE GROUP MANAGEMENT',
    subcategory: 'GET SIZE GROUPS BY COMPANY ID',
    controller: 'sizeGroupController.getByCompanyId',
    service: 'sizeGroupService.getSizeGroupsByCompanyId',
    operation: 'Fetch all size groups belonging to company ID',
  }),
  verifyToken,
  validate(companyIdParamSchema, 'params'),
  getByCompanyId
);

// GET /api/product-master/size-groups/code/:companyId/:sizeGroupCode - Get by company and code
router.get(
  '/code/:companyId/:sizeGroupCode',
  setApiContext({
    module: 'SIZE_GROUP',
    category: 'SIZE GROUP MANAGEMENT',
    subcategory: 'GET SIZE GROUP BY CODE',
    controller: 'sizeGroupController.getByCode',
    service: 'sizeGroupService.getSizeGroupByCode',
    operation: 'Fetch single size group by company ID and code',
  }),
  verifyToken,
  validate(sizeGroupCodeParamSchema, 'params'),
  getByCode
);

// GET /api/product-master/size-groups/:id - Get size group by ID
router.get(
  '/:id',
  setApiContext({
    module: 'SIZE_GROUP',
    category: 'SIZE GROUP MANAGEMENT',
    subcategory: 'GET SIZE GROUP BY ID',
    controller: 'sizeGroupController.getById',
    service: 'sizeGroupService.getSizeGroupById',
    operation: 'Fetch single size group by primary ID',
  }),
  verifyToken,
  validate(sizeGroupIdParamSchema, 'params'),
  getById
);

// POST /api/product-master/size-groups - Create new size group
router.post(
  '/',
  setApiContext({
    module: 'SIZE_GROUP',
    category: 'SIZE GROUP MANAGEMENT',
    subcategory: 'CREATE SIZE GROUP',
    controller: 'sizeGroupController.create',
    service: 'sizeGroupService.createSizeGroup',
    database: 'INSERT size_group',
  }),
  verifyToken,
  validate(createSizeGroupSchema, 'body'),
  create
);

// PUT /api/product-master/size-groups/:id - Update existing size group
router.put(
  '/:id',
  setApiContext({
    module: 'SIZE_GROUP',
    category: 'SIZE GROUP MANAGEMENT',
    subcategory: 'UPDATE SIZE GROUP',
    controller: 'sizeGroupController.update',
    service: 'sizeGroupService.updateSizeGroup',
    operation: 'UPDATE size_group',
  }),
  verifyToken,
  validate(sizeGroupIdParamSchema, 'params'),
  validate(updateSizeGroupSchema, 'body'),
  update
);

// PATCH /api/product-master/size-groups/:id/status - Update size group active status
router.patch(
  '/:id/status',
  setApiContext({
    module: 'SIZE_GROUP',
    category: 'SIZE GROUP MANAGEMENT',
    subcategory: 'UPDATE SIZE GROUP STATUS',
    controller: 'sizeGroupController.updateStatus',
    service: 'sizeGroupService.updateSizeGroupStatus',
    operation: 'UPDATE STATUS size_group',
  }),
  verifyToken,
  validate(sizeGroupIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateStatus
);

// DELETE /api/product-master/size-groups/:id - Delete size group
router.delete(
  '/:id',
  setApiContext({
    module: 'SIZE_GROUP',
    category: 'SIZE GROUP MANAGEMENT',
    subcategory: 'DELETE SIZE GROUP',
    controller: 'sizeGroupController.deleteSizeGroup',
    service: 'sizeGroupService.deleteSizeGroup',
    operation: 'DELETE size_group',
  }),
  verifyToken,
  validate(sizeGroupIdParamSchema, 'params'),
  deleteSizeGroup
);

export default router;
