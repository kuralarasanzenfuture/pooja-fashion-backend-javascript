import * as userService from './user.service.js';
import { sendSuccess, sendCreated } from '../../shared/utils/response.js';

/**
 * GET /api/users
 */
export const getAll = async (req, res, next) => {
  try {
    const { users, meta } = await userService.getUsers(req.query);
    return sendSuccess(res, users, 'Users retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/users/:id
 */
export const getById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return sendSuccess(res, user, 'User retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/users
 */
export const create = async (req, res, next) => {
  try {
    const createdBy = req.user?.id || null;
    const user = await userService.createUser(req.body, createdBy);
    return sendCreated(res, user, 'User created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/users/:id
 */
export const update = async (req, res, next) => {
  try {
    const updatedBy = req.user?.id || null;
    const user = await userService.updateUser(req.params.id, req.body, updatedBy);
    return sendSuccess(res, user, 'User updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/users/:id/password
 */
export const changePassword = async (req, res, next) => {
  try {
    const result = await userService.changePassword(req.params.id, req.body);
    return sendSuccess(res, null, result.message);
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/users/:id/status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const user = await userService.updateUserStatus(
      req.params.id,
      req.body.status,
      req.body.lock_minutes
    );
    return sendSuccess(res, user, 'User status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/users/:id
 */
export const deleteUser = async (req, res, next) => {
  try {
    const deleted = await userService.deleteUser(req.params.id);
    return sendSuccess(res, deleted, 'User deleted successfully');
  } catch (error) {
    return next(error);
  }
};

export default {
  getAll,
  getById,
  create,
  update,
  changePassword,
  updateStatus,
  deleteUser,
};
