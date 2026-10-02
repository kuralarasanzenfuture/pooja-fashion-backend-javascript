import * as userService from './user.service.js';
import { sendSuccess, sendCreated } from '../../shared/utils/response.js';

/**
 * GET /api/users
 * List users with pagination, multi-tenant filtering, and search.
 */
export const getAll = async (req, res, next) => {
  try {
    const { users, meta } = await userService.getUsers(req.query, req.user);
    return sendSuccess(res, users, 'Users retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/users/me
 * Retrieve current authenticated user's profile.
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await userService.getMyProfile(req.user);
    return sendSuccess(res, user, 'Profile retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/users/:id
 * Retrieve single user by ID with tenant isolation.
 */
export const getById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id, req.user);
    return sendSuccess(res, user, 'User retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/users
 * Create new user account (Admin / SuperAdmin).
 */
export const create = async (req, res, next) => {
  try {
    const createdBy = req.user?.id || null;
    const user = await userService.createUser(req.body, createdBy, req.user);
    return sendCreated(res, user, 'User created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/users/me
 * Update current user's own profile.
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const user = await userService.updateMyProfile(req.body, req.user);
    return sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/users/:id
 * Update user account details (Admin / SuperAdmin).
 */
export const update = async (req, res, next) => {
  try {
    const updatedBy = req.user?.id || null;
    const user = await userService.updateUser(req.params.id, req.body, updatedBy, req.user);
    return sendSuccess(res, user, 'User updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/users/me/password
 * Change current user password.
 */
export const changeMyPassword = async (req, res, next) => {
  try {
    const result = await userService.changePassword(req.user.id, req.body, req.user);
    return sendSuccess(res, null, result.message);
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/users/:id/password
 * Change / reset user password (Admin / SuperAdmin or authorized).
 */
export const changePassword = async (req, res, next) => {
  try {
    const result = await userService.changePassword(req.params.id, req.body, req.user);
    return sendSuccess(res, null, result.message);
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/users/:id/activate
 * Dedicated endpoint to activate user account.
 */
export const activateUser = async (req, res, next) => {
  try {
    const updatedBy = req.user?.id || null;
    const user = await userService.activateUser(req.params.id, updatedBy, req.user);
    return sendSuccess(res, user, 'User account activated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/users/:id/deactivate
 * Dedicated endpoint to deactivate user account.
 */
export const deactivateUser = async (req, res, next) => {
  try {
    const updatedBy = req.user?.id || null;
    const user = await userService.deactivateUser(req.params.id, updatedBy, req.user);
    return sendSuccess(res, user, 'User account deactivated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/users/:id/block
 * Dedicated endpoint to block user account.
 */
export const blockUser = async (req, res, next) => {
  try {
    const updatedBy = req.user?.id || null;
    const user = await userService.blockUser(req.params.id, updatedBy, req.user);
    return sendSuccess(res, user, 'User account blocked successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/users/:id/unblock
 * Dedicated endpoint to unblock user account.
 */
export const unblockUser = async (req, res, next) => {
  try {
    const updatedBy = req.user?.id || null;
    const user = await userService.unblockUser(req.params.id, updatedBy, req.user);
    return sendSuccess(res, user, 'User account unblocked successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/users/:id/status
 * Dedicated status endpoint supporting active/inactive/blocked/locked.
 */
export const updateStatus = async (req, res, next) => {
  try {
    const updatedBy = req.user?.id || null;
    const user = await userService.updateUserStatus(
      req.params.id,
      req.body.status,
      req.body.lock_minutes,
      updatedBy,
      req.user
    );
    return sendSuccess(res, user, 'User status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/users/:id
 * Hard deletion guard: Explains account deactivation must be used.
 */
export const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id, req.user);
  } catch (error) {
    return next(error);
  }
};


/**
 * GET /api/users/check-username
 * Check if a username is available or taken.
 */
export const checkUsername = async (req, res, next) => {
  try {
    const username = req.query.username;
    const companyId = req.query.company_id ? Number(req.query.company_id) : null;
    const excludeId = req.query.exclude_id ? Number(req.query.exclude_id) : null;

    const result = await userService.checkUsernameAvailability({
      username,
      companyId,
      excludeId,
      user: req.user,
    });
    return sendSuccess(res, result, result.message);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/users/check-email
 * Check if an email is available or already registered.
 */
export const checkEmail = async (req, res, next) => {
  try {
    const email = req.query.email;
    const excludeId = req.query.exclude_id ? Number(req.query.exclude_id) : null;

    const result = await userService.checkEmailAvailability({
      email,
      excludeId,
    });
    return sendSuccess(res, result, result.message);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/users/check-availability
 * Check both username and email availability in a single call.
 */
export const checkAvailability = async (req, res, next) => {
  try {
    const { username, email, company_id, exclude_id } = req.query;

    const result = await userService.checkAvailability({
      username,
      email,
      companyId: company_id ? Number(company_id) : null,
      excludeId: exclude_id ? Number(exclude_id) : null,
      user: req.user,
    });
    return sendSuccess(res, result, 'Availability check completed');
  } catch (error) {
    return next(error);
  }
};

export default {
  checkUsername,
  checkEmail,
  checkAvailability,
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
};
