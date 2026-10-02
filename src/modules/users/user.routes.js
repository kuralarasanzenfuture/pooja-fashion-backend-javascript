import { Router } from 'express';
import {
  getAll,
  getMyProfile,
  getById,
  create,
  updateMyProfile,
  update,
  changeMyPassword,
  changePassword,
  activateUser,
  deactivateUser,
  blockUser,
  unblockUser,
  updateStatus,
  deleteUser,
} from './user.controller.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { verifyToken, adminOnly } from '../../middlewares/auth.middleware.js';
import {
  createUserSchema,
  updateUserSchema,
  updateMyProfileSchema,
  changePasswordSchema,
  updateUserStatusSchema,
  userIdParamSchema,
  getUsersQuerySchema,
} from './user.validation.js';

const router = Router();

// =========================================================================
// CURRENT AUTHENTICATED USER ROUTES (/me) - MUST BE DEFINED BEFORE /:id
// =========================================================================

// GET /api/users/me - Get current user's profile
router.get('/me', verifyToken, getMyProfile);

// PATCH /api/users/me - Update current user's safe profile info
router.patch('/me', verifyToken, validate(updateMyProfileSchema, 'body'), updateMyProfile);

// PATCH /api/users/me/password - Change current user's password
router.patch('/me/password', verifyToken, validate(changePasswordSchema, 'body'), changeMyPassword);

// =========================================================================
// USER COLLECTION & ADMIN ROUTES
// =========================================================================

// GET /api/users - List users with pagination, multi-tenant isolation, & search (Admin only)
router.get('/', verifyToken, adminOnly, validate(getUsersQuerySchema, 'query'), getAll);

// POST /api/users - Create new user account (Admin only)
router.post('/', verifyToken, adminOnly, validate(createUserSchema, 'body'), create);

// =========================================================================
// SPECIFIC USER BY ID ROUTES (/:id)
// =========================================================================

// GET /api/users/:id - Get user profile by ID
router.get('/:id', verifyToken, validate(userIdParamSchema, 'params'), getById);

// PATCH /api/users/:id - Update user account details (Admin only, immutable fields rejected)
router.patch(
  '/:id',
  verifyToken,
  adminOnly,
  validate(userIdParamSchema, 'params'),
  validate(updateUserSchema, 'body'),
  update
);

// PUT /api/users/:id - Update user account details (Admin only, alias for PATCH)
router.put(
  '/:id',
  verifyToken,
  adminOnly,
  validate(userIdParamSchema, 'params'),
  validate(updateUserSchema, 'body'),
  update
);

// PATCH /api/users/:id/password - Change / reset user password
router.patch(
  '/:id/password',
  verifyToken,
  validate(userIdParamSchema, 'params'),
  validate(changePasswordSchema, 'body'),
  changePassword
);

// =========================================================================
// DEDICATED ACCOUNT STATUS ENDPOINTS (Admin only)
// =========================================================================

// PATCH /api/users/:id/activate - Activate account
router.patch(
  '/:id/activate',
  verifyToken,
  adminOnly,
  validate(userIdParamSchema, 'params'),
  activateUser
);

// PATCH /api/users/:id/deactivate - Deactivate account (Preferred over delete)
router.patch(
  '/:id/deactivate',
  verifyToken,
  adminOnly,
  validate(userIdParamSchema, 'params'),
  deactivateUser
);

// PATCH /api/users/:id/block - Block account
router.patch(
  '/:id/block',
  verifyToken,
  adminOnly,
  validate(userIdParamSchema, 'params'),
  blockUser
);

// PATCH /api/users/:id/unblock - Unblock account
router.patch(
  '/:id/unblock',
  verifyToken,
  adminOnly,
  validate(userIdParamSchema, 'params'),
  unblockUser
);

// PATCH /api/users/:id/status - Dedicated status change endpoint with lock minutes support
router.patch(
  '/:id/status',
  verifyToken,
  adminOnly,
  validate(userIdParamSchema, 'params'),
  validate(updateUserStatusSchema, 'body'),
  updateStatus
);

// =========================================================================
// DELETE GUARD (Hard deletion prohibited)
// =========================================================================

// DELETE /api/users/:id - Prohibited guard (Informs client to deactivate instead)
router.delete('/:id', verifyToken, adminOnly, validate(userIdParamSchema, 'params'), deleteUser);

export default router;
