/**
 * User Data Mapper
 * Transforms raw database records into clean client-facing response DTOs.
 * Securely strips all cryptographic secrets (e.g. password_hash).
 */

export const toUserDTO = (row) => {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    companyId: Number(row.company_id),
    branchId: row.branch_id ? Number(row.branch_id) : null,
    employeeId: row.employee_id ? Number(row.employee_id) : null,
    roleId: row.role_id ? Number(row.role_id) : null,
    username: row.username,
    email: row.email || null,
    phone: row.phone || null,
    profileImageUrl: row.profile_image_url || null,
    status: row.status,
    isEmailVerified: Boolean(row.is_email_verified),
    isPhoneVerified: Boolean(row.is_phone_verified),
    emailVerifiedAt: row.email_verified_at ? new Date(row.email_verified_at).toISOString() : null,
    phoneVerifiedAt: row.phone_verified_at ? new Date(row.phone_verified_at).toISOString() : null,
    failedLoginAttempts: Number(row.failed_login_attempts || 0),
    lockedUntil: row.locked_until ? new Date(row.locked_until).toISOString() : null,
    lastLoginAt: row.last_login_at ? new Date(row.last_login_at).toISOString() : null,
    mustChangePassword: Boolean(row.must_change_password),
    tokenVersion: Number(row.token_version || 1),
    twoFactorEnabled: Boolean(row.two_factor_enabled),
    roleCode: row.role_code || null,
    roleName: row.role_name || null,
    isSystemRole: row.is_system_role !== undefined ? Boolean(row.is_system_role) : null,
    companyName: row.company_name || null,
    companyCode: row.company_code || null,
    branchName: row.branch_name || null,
    branchCode: row.branch_code || null,
    createdBy: row.created_by ? Number(row.created_by) : null,
    updatedBy: row.updated_by ? Number(row.updated_by) : null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
};

export const toUserListDTO = (rows) => {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map(toUserDTO);
};

export default {
  toUserDTO,
  toUserListDTO,
};
