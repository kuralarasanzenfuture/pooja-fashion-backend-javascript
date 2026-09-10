import { Router } from 'express';
import {
  getAll,
  getById,
  create,
  update,
  changePassword,
  updateStatus,
  deleteUser,
} from './user.controller.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { verifyToken, adminOnly } from '../../middlewares/auth.middleware.js';
import {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  updateUserStatusSchema,
  userIdParamSchema,
  getUsersQuerySchema,
} from './user.validation.js';

const router = Router();

// GET /api/users - List users with pagination, multi-tenant filtering, & search
router.get('/', verifyToken, adminOnly, validate(getUsersQuerySchema, 'query'), getAll);

// GET /api/users/:id - Get user profile by ID
router.get('/:id', verifyToken, validate(userIdParamSchema, 'params'), getById);

// POST /api/users - Create new user account (Admin only)
router.post('/', verifyToken, adminOnly, validate(createUserSchema, 'body'), create);

// PUT /api/users/:id - Update user account details
router.put(
  '/:id',
  verifyToken,
  validate(userIdParamSchema, 'params'),
  validate(updateUserSchema, 'body'),
  update
);

// PATCH /api/users/:id/password - Change/reset user password
router.patch(
  '/:id/password',
  verifyToken,
  validate(userIdParamSchema, 'params'),
  validate(changePasswordSchema, 'body'),
  changePassword
);

// PATCH /api/users/:id/status - Update user status (active, inactive, blocked, locked)
router.patch(
  '/:id/status',
  verifyToken,
  adminOnly,
  validate(userIdParamSchema, 'params'),
  validate(updateUserStatusSchema, 'body'),
  updateStatus
);

// DELETE /api/users/:id - Remove user account
router.delete('/:id', verifyToken, adminOnly, validate(userIdParamSchema, 'params'), deleteUser);

export default router;
