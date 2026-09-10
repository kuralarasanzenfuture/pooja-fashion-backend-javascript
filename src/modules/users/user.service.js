import * as userRepository from './user.repository.js';
import * as companyRepository from '../companies/company.repository.js';
import * as branchRepository from '../branches/branches/branch.repository.js';
import * as roleRepository from '../roles/role.repository.js';
import { toUserDTO, toUserListDTO } from './user.mapper.js';
import {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  normalizeUsername,
} from './user.utils.js';
import NotFoundError from '../../shared/errors/NotFoundError.js';
import BadRequestError from '../../shared/errors/BadRequestError.js';
import { getPaginationParams, formatPaginationMeta } from '../../shared/utils/pagination.js';

/**
 * List users with pagination, multi-tenant filtering, and search
 */
export const getUsers = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = query.company_id ? Number(query.company_id) : null;
  const branchId = query.branch_id ? Number(query.branch_id) : null;
  const roleId = query.role_id ? Number(query.role_id) : null;
  const status = query.status || null;

  const { rows, total } = await userRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    branchId,
    roleId,
    status,
    sortBy: sortBy || 'id',
    sortOrder: sortOrder || 'ASC',
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    users: toUserListDTO(rows),
    meta,
  };
};

/**
 * Get user profile by primary ID
 */
export const getUserById = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new NotFoundError(`User with ID ${id} not found`);
  }
  return toUserDTO(user);
};

/**
 * Create a new user with secure password hashing and uniqueness validation
 */
export const createUser = async (data, createdBy = null) => {
  // 1. Verify company exists
  const company = await companyRepository.findById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${data.company_id} not found`);
  }

  // 2. Verify branch exists if provided
  if (data.branch_id) {
    const branch = await branchRepository.findById(data.branch_id);
    if (!branch) {
      throw new NotFoundError(`Branch with ID ${data.branch_id} not found`);
    }
    if (Number(branch.company_id) !== Number(data.company_id)) {
      throw new BadRequestError(
        `Branch ${data.branch_id} does not belong to company ${data.company_id}`
      );
    }
  }

  // 3. Verify role exists if provided
  if (data.role_id) {
    const role = await roleRepository.findById(data.role_id);
    if (!role) {
      throw new NotFoundError(`Role with ID ${data.role_id} not found`);
    }
    // If role is company-scoped, ensure it belongs to this company
    if (role.company_id !== null && Number(role.company_id) !== Number(data.company_id)) {
      throw new BadRequestError(
        `Role ${data.role_id} does not belong to company ${data.company_id}`
      );
    }
  }

  // 4. Validate username uniqueness per company
  const cleanUsername = normalizeUsername(data.username);
  const usernameExists = await userRepository.existsByUsername(data.company_id, cleanUsername);
  if (usernameExists) {
    throw new BadRequestError(`Username '${data.username}' is already taken for this company`);
  }

  // 5. Validate email uniqueness if provided
  if (data.email) {
    const emailExists = await userRepository.existsByEmail(data.email);
    if (emailExists) {
      throw new BadRequestError(`Email address '${data.email}' is already registered`);
    }
  }

  // 6. Validate phone uniqueness if provided
  if (data.phone) {
    const phoneExists = await userRepository.existsByPhone(data.company_id, data.phone);
    if (phoneExists) {
      throw new BadRequestError(`Phone number '${data.phone}' is already in use for this company`);
    }
  }

  // 7. Validate password strength and hash
  const strength = validatePasswordStrength(data.password);
  if (!strength.valid) {
    throw new BadRequestError(`Weak password: ${strength.errors.join(', ')}`);
  }

  const passwordHash = await hashPassword(data.password);

  const created = await userRepository.create({
    ...data,
    username: cleanUsername,
    password_hash: passwordHash,
    created_by: createdBy,
  });

  return toUserDTO(created);
};

/**
 * Update user details
 */
export const updateUser = async (id, data, updatedBy = null) => {
  const existing = await userRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`User with ID ${id} not found`);
  }

  // Validate username uniqueness if changed
  if (data.username && normalizeUsername(data.username) !== existing.username.toLowerCase()) {
    const cleanUsername = normalizeUsername(data.username);
    const usernameExists = await userRepository.existsByUsername(
      existing.company_id,
      cleanUsername,
      id
    );
    if (usernameExists) {
      throw new BadRequestError(`Username '${data.username}' is already in use`);
    }
    data.username = cleanUsername;
  }

  // Validate email uniqueness if changed
  if (data.email && data.email.toLowerCase() !== (existing.email || '').toLowerCase()) {
    const emailExists = await userRepository.existsByEmail(data.email, id);
    if (emailExists) {
      throw new BadRequestError(`Email address '${data.email}' is already registered`);
    }
  }

  // Validate phone uniqueness if changed
  if (data.phone && data.phone !== existing.phone) {
    const phoneExists = await userRepository.existsByPhone(existing.company_id, data.phone, id);
    if (phoneExists) {
      throw new BadRequestError(`Phone number '${data.phone}' is already in use`);
    }
  }

  // Validate branch if changed
  if (data.branch_id && data.branch_id !== existing.branch_id) {
    const branch = await branchRepository.findById(data.branch_id);
    if (!branch) {
      throw new NotFoundError(`Branch with ID ${data.branch_id} not found`);
    }
    if (Number(branch.company_id) !== Number(existing.company_id)) {
      throw new BadRequestError(`Branch does not belong to company ${existing.company_id}`);
    }
  }

  // Validate role if changed
  if (data.role_id && data.role_id !== existing.role_id) {
    const role = await roleRepository.findById(data.role_id);
    if (!role) {
      throw new NotFoundError(`Role with ID ${data.role_id} not found`);
    }
  }

  const updated = await userRepository.update(id, {
    ...data,
    updated_by: updatedBy,
  });

  return toUserDTO(updated);
};

/**
 * Change user password with security checks and token version invalidation
 */
export const changePassword = async (id, { currentPassword, newPassword }) => {
  const existing = await userRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`User with ID ${id} not found`);
  }

  // If current password is provided, verify it
  if (currentPassword) {
    const isMatch = await comparePassword(currentPassword, existing.password_hash);
    if (!isMatch) {
      throw new BadRequestError('Current password does not match');
    }
  }

  // Validate new password strength
  const strength = validatePasswordStrength(newPassword);
  if (!strength.valid) {
    throw new BadRequestError(`Weak password: ${strength.errors.join(', ')}`);
  }

  // Prevent setting identical password
  const isSame = await comparePassword(newPassword, existing.password_hash);
  if (isSame) {
    throw new BadRequestError('New password cannot be identical to the current password');
  }

  const newHash = await hashPassword(newPassword);
  await userRepository.updatePassword(id, newHash, false);

  return { message: 'Password changed successfully' };
};

/**
 * Update user account status (active, inactive, blocked, locked)
 */
export const updateUserStatus = async (id, status, lockMinutes = null) => {
  const existing = await userRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`User with ID ${id} not found`);
  }

  let lockedUntil = null;
  if (status === 'locked') {
    const duration = lockMinutes ? Number(lockMinutes) : 30;
    lockedUntil = new Date(Date.now() + duration * 60000);
  }

  const updated = await userRepository.updateStatus(id, status, lockedUntil);
  return toUserDTO(updated);
};

/**
 * Delete user record
 */
export const deleteUser = async (id) => {
  const existing = await userRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`User with ID ${id} not found`);
  }

  const deleted = await userRepository.deleteUser(id);
  return toUserDTO(deleted);
};

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  changePassword,
  updateUserStatus,
  deleteUser,
};
