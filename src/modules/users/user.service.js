import * as userRepository from './user.repository.js';
import * as companyRepository from '../companies/company.repository.js';
import * as branchRepository from '../branches/branches/branch.repository.js';
import * as roleRepository from '../roles/role.repository.js';
import * as employeeRepository from '../employees/employee.repository.js';
import { toUserDTO, toUserListDTO } from './user.mapper.js';
import {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  normalizeUsername,
} from './user.utils.js';
import NotFoundError from '../../shared/errors/NotFoundError.js';
import BadRequestError from '../../shared/errors/BadRequestError.js';
import ForbiddenError from '../../shared/errors/ForbiddenError.js';
import UnauthorizedError from '../../shared/errors/UnauthorizedError.js';
import { getPaginationParams, formatPaginationMeta } from '../../shared/utils/pagination.js';

/**
 * List users with pagination, multi-tenant filtering, and search.
 * Scoped automatically to current user company unless SUPERADMIN.
 */
export const getUsers = async (query, currentUser = null) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  let companyId = query.company_id ? Number(query.company_id) : null;

  if (currentUser && currentUser.roleCode !== 'SUPERADMIN') {
    if (currentUser.companyId) {
      companyId = Number(currentUser.companyId);
    }
  }

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
 * Get user profile by primary ID with tenant isolation
 */
export const getUserById = async (id, currentUser = null) => {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new NotFoundError(`User with ID ${id} not found`);
  }

  if (currentUser && currentUser.roleCode !== 'SUPERADMIN' && currentUser.companyId) {
    if (Number(user.company_id) !== Number(currentUser.companyId)) {
      throw new ForbiddenError('You do not have permission to view users from another company');
    }
  }

  return toUserDTO(user);
};

/**
 * Get current authenticated user profile
 */
export const getMyProfile = async (currentUser) => {
  if (!currentUser?.id) {
    throw new UnauthorizedError('Authentication token required');
  }

  const user = await userRepository.findById(currentUser.id);
  if (!user) {
    throw new NotFoundError(`User not found`);
  }

  return toUserDTO(user);
};

/**
 * Create a new user with auto-resolved company_id for Admin and SuperAdmin
 */

/**
 * Check if username is available for a company or globally
 */
export const checkUsernameAvailability = async ({ username, companyId = null, excludeId = null, user = null }) => {
  if (!username || !username.trim()) {
    return { exists: false, message: 'Username is required' };
  }

  const clean = username.trim().toLowerCase();
  const reserved = ['superadmin', 'admin', 'administrator', 'root', 'system'];
  if (reserved.includes(clean) && !excludeId) {
    return {
      exists: true,
      username: username.trim(),
      message: `'${username.trim()}' is a reserved system username and cannot be used`,
    };
  }

  let targetCompanyId = companyId ? Number(companyId) : null;
  if (!targetCompanyId && user?.companyId && user.roleCode !== 'SUPERADMIN') {
    targetCompanyId = Number(user.companyId);
  }

  const exists = await userRepository.existsByUsername(
    targetCompanyId,
    username.trim(),
    excludeId ? Number(excludeId) : null
  );

  return {
    exists,
    username: username.trim(),
    message: exists
      ? `Username '${username.trim()}' is already taken${targetCompanyId ? ' for this company' : ''}`
      : 'Username is available',
  };
};

/**
 * Check if email is available globally
 */
export const checkEmailAvailability = async ({ email, excludeId = null }) => {
  if (!email || !email.trim()) {
    return { exists: false, message: 'Email is required' };
  }

  const clean = email.trim().toLowerCase();
  const exists = await userRepository.existsByEmail(clean, excludeId ? Number(excludeId) : null);
  return {
    exists,
    email: clean,
    message: exists
      ? `Email '${clean}' is already registered`
      : 'Email is available',
  };
};

/**
 * Combined availability check for username and email
 */
export const checkAvailability = async ({ username, email, companyId = null, excludeId = null, user = null }) => {
  let usernameResult = { exists: false, message: '' };
  let emailResult = { exists: false, message: '' };

  if (username && username.trim()) {
    usernameResult = await checkUsernameAvailability({ username, companyId, excludeId, user });
  }

  if (email && email.trim()) {
    emailResult = await checkEmailAvailability({ email, excludeId });
  }

  return {
    username: usernameResult,
    email: emailResult,
  };
};

export const createUser = async (data, createdBy = null, currentUser = null) => {
  // 1. Resolve company_id
  let targetCompanyId = data.company_id ? Number(data.company_id) : null;

  if (!targetCompanyId) {
    if (currentUser?.companyId) {
      targetCompanyId = Number(currentUser.companyId);
    } else {
      // SuperAdmin or system-level fallback: find first company
      const companies = await companyRepository.findAll({ limit: 1, sortBy: 'id', sortOrder: 'ASC' });
      targetCompanyId = companies?.rows?.[0]?.id ? Number(companies.rows[0].id) : 1;
    }
  }

  // Tenant scope check for Admin
  if (currentUser && currentUser.roleCode !== 'SUPERADMIN' && currentUser.companyId) {
    if (Number(targetCompanyId) !== Number(currentUser.companyId)) {
      throw new ForbiddenError('You can only create users within your own company');
    }
  }

  data.company_id = targetCompanyId;

  // 2. Verify company exists
  const company = await companyRepository.findById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company with ID ${data.company_id} not found`);
  }

  // 3. Verify branch exists and belongs to company if provided
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

  // 4. Verify employee exists and belongs to company if provided
  if (data.employee_id) {
    const employee = await employeeRepository.findById(data.employee_id);
    if (!employee) {
      throw new NotFoundError(`Employee with ID ${data.employee_id} not found`);
    }
    if (Number(employee.company_id) !== Number(data.company_id)) {
      throw new BadRequestError(
        `Employee ${data.employee_id} does not belong to company ${data.company_id}`
      );
    }
  }

  // 5. Verify role exists and scope if provided
  if (data.role_id) {
    const role = await roleRepository.findById(data.role_id);
    if (!role) {
      throw new NotFoundError(`Role with ID ${data.role_id} not found`);
    }
    if (role.company_id !== null && Number(role.company_id) !== Number(data.company_id)) {
      throw new BadRequestError(
        `Role ${data.role_id} does not belong to company ${data.company_id}`
      );
    }
    if (role.is_active === false) {
      throw new BadRequestError(
        `Cannot assign inactive role '${role.role_name}' to user. Please select an active role.`
      );
    }

    // System role constraint: each system role (SUPERADMIN, ADMIN) can only have ONE user assigned
    const isSystemRole =
      Boolean(role.is_system_role) ||
      ['SUPERADMIN', 'ADMIN'].includes(String(role.role_code).toUpperCase());

    if (isSystemRole) {
      const scopeCompanyId =
        String(role.role_code).toUpperCase() === 'SUPERADMIN' ? null : data.company_id;
      const existingUserWithRole = await userRepository.findUserByRoleOrCode({
        roleId: role.id,
        roleCode: role.role_code,
        companyId: scopeCompanyId,
      });

      if (existingUserWithRole) {
        throw new BadRequestError(
          `System role '${role.role_name}' (${role.role_code}) can only be assigned to one user. Account '${existingUserWithRole.username}' already holds this role.`
        );
      }
    }
  }

  // 6. Validate username uniqueness per company (case-insensitive)
  const cleanUsername = normalizeUsername(data.username);
  const usernameExists = await userRepository.existsByUsername(data.company_id, cleanUsername);
  if (usernameExists) {
    throw new BadRequestError(`Username '${data.username}' is already taken for this company`);
  }

  // 7. Validate email uniqueness globally if provided
  if (data.email) {
    const emailExists = await userRepository.existsByEmail(data.email);
    if (emailExists) {
      throw new BadRequestError(`Email address '${data.email}' is already registered`);
    }
  }

  // 8. Validate phone uniqueness per company if provided
  if (data.phone) {
    const phoneExists = await userRepository.existsByPhone(data.company_id, data.phone);
    if (phoneExists) {
      throw new BadRequestError(`Phone number '${data.phone}' is already in use for this company`);
    }
  }

  // 9. Validate password strength and hash
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
    updated_by: createdBy,
  });

  return toUserDTO(created);
};

/**
 * Update user details with tenant isolation and strict field safety
 */
export const updateUser = async (id, data, updatedBy = null, currentUser = null) => {
  const existing = await userRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`User with ID ${id} not found`);
  }

  // Multi-tenant check
  if (currentUser && currentUser.roleCode !== 'SUPERADMIN' && currentUser.companyId) {
    if (Number(existing.company_id) !== Number(currentUser.companyId)) {
      throw new ForbiddenError('You do not have permission to update users from another company');
    }
  }

  const updatePayload = {
    updated_by: updatedBy,
  };

  // Support updating role_id with system role immutability and single-user constraint
  if (data.role_id !== undefined) {
    if (data.role_id === null) {
      throw new BadRequestError('User must have an assigned role');
    }

    // Rule: System role accounts cannot have their role changed / edited
    const isExistingSystemUser =
      Boolean(existing.is_system_role) ||
      ['SUPERADMIN', 'ADMIN'].includes(String(existing.role_code).toUpperCase());

    if (isExistingSystemUser && Number(data.role_id) !== Number(existing.role_id)) {
      throw new BadRequestError(
        `The role for system account '${existing.username}' (${existing.role_name || existing.role_code}) cannot be edited or modified.`
      );
    }

    const role = await roleRepository.findById(data.role_id);
    if (!role) {
      throw new NotFoundError(`Role with ID ${data.role_id} not found`);
    }
    if (role.company_id !== null && Number(role.company_id) !== Number(existing.company_id)) {
      throw new BadRequestError(
        `Role ${data.role_id} does not belong to company ${existing.company_id}`
      );
    }
    if (role.is_active === false) {
      throw new BadRequestError(
        `Cannot assign inactive role '${role.role_name}' to user. Please select an active role.`
      );
    }

    // If changing role to a system role, check that no other user holds that system role
    const isTargetSystemRole =
      Boolean(role.is_system_role) ||
      ['SUPERADMIN', 'ADMIN'].includes(String(role.role_code).toUpperCase());

    if (isTargetSystemRole && Number(data.role_id) !== Number(existing.role_id)) {
      const scopeCompanyId =
        String(role.role_code).toUpperCase() === 'SUPERADMIN' ? null : existing.company_id;
      const existingUserWithRole = await userRepository.findUserByRoleOrCode({
        roleId: role.id,
        roleCode: role.role_code,
        companyId: scopeCompanyId,
        excludeUserId: id,
      });

      if (existingUserWithRole) {
        throw new BadRequestError(
          `System role '${role.role_name}' (${role.role_code}) can only be assigned to one user. Account '${existingUserWithRole.username}' already holds this role.`
        );
      }
    }

    updatePayload.role_id = Number(data.role_id);
  }

  // Support updating branch_id
  if (data.branch_id !== undefined) {
    if (data.branch_id) {
      const branch = await branchRepository.findById(data.branch_id);
      if (!branch) {
        throw new NotFoundError(`Branch with ID ${data.branch_id} not found`);
      }
      if (Number(branch.company_id) !== Number(existing.company_id)) {
        throw new BadRequestError(`Branch ${data.branch_id} does not belong to company ${existing.company_id}`);
      }
      updatePayload.branch_id = Number(data.branch_id);
    } else {
      updatePayload.branch_id = null;
    }
  }

  // Safe email update with re-verification reset
  if (data.email !== undefined) {
    const newEmail = data.email ? data.email.toLowerCase().trim() : null;
    const oldEmail = existing.email ? existing.email.toLowerCase().trim() : null;

    if (newEmail !== oldEmail) {
      if (newEmail) {
        const emailExists = await userRepository.existsByEmail(newEmail, id);
        if (emailExists) {
          throw new BadRequestError(`Email address '${data.email}' is already registered`);
        }
      }
      updatePayload.email = newEmail;
      updatePayload.is_email_verified = false;
      updatePayload.email_verified_at = null;
    }
  }

  // Safe phone update with re-verification reset
  if (data.phone !== undefined) {
    const newPhone = data.phone ? data.phone.trim() : null;
    const oldPhone = existing.phone ? existing.phone.trim() : null;

    if (newPhone !== oldPhone) {
      if (newPhone) {
        const phoneExists = await userRepository.existsByPhone(existing.company_id, newPhone, id);
        if (phoneExists) {
          throw new BadRequestError(`Phone number '${data.phone}' is already in use`);
        }
      }
      updatePayload.phone = newPhone;
      updatePayload.is_phone_verified = false;
      updatePayload.phone_verified_at = null;
    }
  }

  // Profile image metadata fields
  if (data.profile_image_url !== undefined) updatePayload.profile_image_url = data.profile_image_url;
  if (data.profile_image_key !== undefined) updatePayload.profile_image_key = data.profile_image_key;
  if (data.profile_image_name !== undefined) updatePayload.profile_image_name = data.profile_image_name;
  if (data.profile_image_mime_type !== undefined) updatePayload.profile_image_mime_type = data.profile_image_mime_type;
  if (data.profile_image_size !== undefined) updatePayload.profile_image_size = data.profile_image_size;

  const updated = await userRepository.update(id, updatePayload);
  return toUserDTO(updated);
};

/**
 * Self-profile update
 */
export const updateMyProfile = async (data, currentUser) => {
  if (!currentUser?.id) {
    throw new UnauthorizedError('Authentication token required');
  }
  return updateUser(currentUser.id, data, currentUser.id, currentUser);
};

/**
 * Change user password with security verification and session invalidation
 */
export const changePassword = async (id, { current_password, new_password, currentPassword, newPassword }, currentUser = null) => {
  const currentPass = current_password || currentPassword;
  const newPass = new_password || newPassword;

  if (!newPass) {
    throw new BadRequestError('New password is required');
  }

  const existing = await userRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`User with ID ${id} not found`);
  }

  // Multi-tenant check
  if (currentUser && currentUser.roleCode !== 'SUPERADMIN' && currentUser.companyId) {
    if (Number(existing.company_id) !== Number(currentUser.companyId)) {
      throw new ForbiddenError('You do not have permission to change password for users in another company');
    }
  }

  // If user is resetting their own password or current_password is provided, require verification
  const isSelf = currentUser && Number(currentUser.id) === Number(id);
  if (isSelf || currentPass) {
    if (!currentPass) {
      throw new BadRequestError('Current password is required');
    }
    const isMatch = await comparePassword(currentPass, existing.password_hash);
    if (!isMatch) {
      throw new BadRequestError('Current password does not match');
    }
  }

  // Validate new password strength
  const strength = validatePasswordStrength(newPass);
  if (!strength.valid) {
    throw new BadRequestError(`Weak password: ${strength.errors.join(', ')}`);
  }

  // Prevent setting identical password
  const isSame = await comparePassword(newPass, existing.password_hash);
  if (isSame) {
    throw new BadRequestError('New password cannot be identical to the current password');
  }

  const newHash = await hashPassword(newPass);
  await userRepository.updatePassword(id, newHash);

  return { message: 'Password changed successfully' };
};

/**
 * Dedicated status operations with company isolation & self-lock protection
 */
export const activateUser = async (id, updatedBy = null, currentUser = null) => {
  const existing = await userRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`User with ID ${id} not found`);
  }

  if (currentUser && currentUser.roleCode !== 'SUPERADMIN' && currentUser.companyId) {
    if (Number(existing.company_id) !== Number(currentUser.companyId)) {
      throw new ForbiddenError('You do not have permission to modify users from another company');
    }
  }

  // Validate that assigned role is active before activating user
  if (existing.role_id) {
    const role = await roleRepository.findById(existing.role_id);
    if (role && role.is_active === false) {
      throw new BadRequestError(
        `Cannot activate user because assigned role '${role.role_name}' is inactive. Please activate the role first.`
      );
    }
  }

  const updated = await userRepository.updateStatus(id, 'active', null, updatedBy);
  return toUserDTO(updated);
};

export const deactivateUser = async (id, updatedBy = null, currentUser = null) => {
  const existing = await userRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`User with ID ${id} not found`);
  }

  if (currentUser && currentUser.roleCode !== 'SUPERADMIN' && currentUser.companyId) {
    if (Number(existing.company_id) !== Number(currentUser.companyId)) {
      throw new ForbiddenError('You do not have permission to modify users from another company');
    }
  }

  if (currentUser && Number(currentUser.id) === Number(id)) {
    throw new BadRequestError('You cannot deactivate your own account');
  }

  // Protect system role accounts from deactivation
  const isSystemUser =
    Boolean(existing.is_system_role) ||
    ['SUPERADMIN', 'ADMIN'].includes(String(existing.role_code).toUpperCase());
  if (isSystemUser) {
    throw new BadRequestError(
      `System role accounts (${existing.role_name || existing.role_code}) cannot be deactivated or deleted`
    );
  }

  const updated = await userRepository.updateStatus(id, 'inactive', null, updatedBy);
  return toUserDTO(updated);
};

export const blockUser = async (id, updatedBy = null, currentUser = null) => {
  const existing = await userRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`User with ID ${id} not found`);
  }

  if (currentUser && currentUser.roleCode !== 'SUPERADMIN' && currentUser.companyId) {
    if (Number(existing.company_id) !== Number(currentUser.companyId)) {
      throw new ForbiddenError('You do not have permission to modify users from another company');
    }
  }

  if (currentUser && Number(currentUser.id) === Number(id)) {
    throw new BadRequestError('You cannot block your own account');
  }

  // Protect system role accounts from being blocked
  const isSystemUser =
    Boolean(existing.is_system_role) ||
    ['SUPERADMIN', 'ADMIN'].includes(String(existing.role_code).toUpperCase());
  if (isSystemUser) {
    throw new BadRequestError(
      `System role accounts (${existing.role_name || existing.role_code}) cannot be blocked`
    );
  }

  const updated = await userRepository.updateStatus(id, 'blocked', null, updatedBy);
  return toUserDTO(updated);
};

export const unblockUser = async (id, updatedBy = null, currentUser = null) => {
  const existing = await userRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`User with ID ${id} not found`);
  }

  if (currentUser && currentUser.roleCode !== 'SUPERADMIN' && currentUser.companyId) {
    if (Number(existing.company_id) !== Number(currentUser.companyId)) {
      throw new ForbiddenError('You do not have permission to modify users from another company');
    }
  }

  const updated = await userRepository.updateStatus(id, 'active', null, updatedBy);
  return toUserDTO(updated);
};

/**
 * Generic status update with lock minutes support
 */
export const updateUserStatus = async (id, status, lockMinutes = null, updatedBy = null, currentUser = null) => {
  const existing = await userRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`User with ID ${id} not found`);
  }

  if (currentUser && currentUser.roleCode !== 'SUPERADMIN' && currentUser.companyId) {
    if (Number(existing.company_id) !== Number(currentUser.companyId)) {
      throw new ForbiddenError('You do not have permission to update status for users in another company');
    }
  }

  if (currentUser && Number(currentUser.id) === Number(id) && (status === 'blocked' || status === 'locked' || status === 'inactive')) {
    throw new BadRequestError('You cannot deactivate, block, or lock your own account');
  }

  // Protect system role accounts from deactivation or locking
  const isSystemUser =
    Boolean(existing.is_system_role) ||
    ['SUPERADMIN', 'ADMIN'].includes(String(existing.role_code).toUpperCase());
  if (isSystemUser && (status === 'blocked' || status === 'locked' || status === 'inactive')) {
    throw new BadRequestError(
      `System role accounts (${existing.role_name || existing.role_code}) cannot be deactivated, blocked, or locked`
    );
  }

  // If activating, verify role is active
  if (status === 'active' && existing.role_id) {
    const role = await roleRepository.findById(existing.role_id);
    if (role && role.is_active === false) {
      throw new BadRequestError(
        `Cannot activate user because assigned role '${role.role_name}' is inactive. Please activate the role first.`
      );
    }
  }

  let lockedUntil = null;
  if (status === 'locked') {
    const duration = lockMinutes ? Number(lockMinutes) : 30;
    lockedUntil = new Date(Date.now() + duration * 60000);
  }

  const updated = await userRepository.updateStatus(id, status, lockedUntil, updatedBy);
  return toUserDTO(updated);
};

/**
 * Hard delete prohibition rule:
 * Users must not be hard deleted; they should be deactivated to preserve audit history and relational integrity.
 */
export const deleteUser = async (id = null) => {
  if (id) {
    const existing = await userRepository.findById(id);
    if (existing) {
      const isSystemUser =
        Boolean(existing.is_system_role) ||
        ['SUPERADMIN', 'ADMIN'].includes(String(existing.role_code).toUpperCase());
      if (isSystemUser) {
        throw new BadRequestError(
          `System role account '${existing.username}' (${existing.role_name || existing.role_code}) cannot be deleted.`
        );
      }
    }
  }
  throw new BadRequestError(
    'Hard deletion of user accounts is prohibited to preserve audit trail and business data integrity. Please use account deactivation (PATCH /api/users/:id/deactivate) instead.'
  );
};

export default {
  checkUsernameAvailability,
  checkEmailAvailability,
  checkAvailability,
  getUsers,
  getUserById,
  getMyProfile,
  createUser,
  updateUser,
  updateMyProfile,
  changePassword,
  activateUser,
  deactivateUser,
  blockUser,
  unblockUser,
  updateUserStatus,
  deleteUser,
};
