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
    company_id: Number(row.company_id),
    branch_id: row.branch_id ? Number(row.branch_id) : null,
    employee_id: row.employee_id ? Number(row.employee_id) : null,
    role_id: row.role_id ? Number(row.role_id) : null,
    username: row.username,
    email: row.email || null,
    phone: row.phone || null,
    profile_image_url: row.profile_image_url || null,
    profile_image_key: row.profile_image_key || null,
    profile_image_name: row.profile_image_name || null,
    profile_image_mime_type: row.profile_image_mime_type || null,
    profile_image_size: row.profile_image_size ? Number(row.profile_image_size) : null,
    status: row.status,
    is_email_verified: Boolean(row.is_email_verified),
    is_phone_verified: Boolean(row.is_phone_verified),
    email_verified_at: row.email_verified_at ? new Date(row.email_verified_at).toISOString() : null,
    phone_verified_at: row.phone_verified_at ? new Date(row.phone_verified_at).toISOString() : null,
    failed_login_attempts: Number(row.failed_login_attempts || 0),
    locked_until: row.locked_until ? new Date(row.locked_until).toISOString() : null,
    last_login_at: row.last_login_at ? new Date(row.last_login_at).toISOString() : null,
    last_login_ip: row.last_login_ip || null,
    password_changed_at: row.password_changed_at ? new Date(row.password_changed_at).toISOString() : null,
    must_change_password: Boolean(row.must_change_password),
    token_version: Number(row.token_version || 1),
    two_factor_enabled: Boolean(row.two_factor_enabled),
    two_factor_enabled_at: row.two_factor_enabled_at ? new Date(row.two_factor_enabled_at).toISOString() : null,
    created_by: row.created_by ? Number(row.created_by) : null,
    updated_by: row.updated_by ? Number(row.updated_by) : null,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,

    // Relational details if joined
    role: row.role_code
      ? {
          id: row.role_id ? Number(row.role_id) : null,
          role_code: row.role_code,
          role_name: row.role_name,
          is_system_role: row.is_system_role !== undefined ? Boolean(row.is_system_role) : null,
        }
      : null,
    company: row.company_name || row.company_code
      ? {
          id: Number(row.company_id),
          company_code: row.company_code || null,
          company_name: row.company_name || null,
        }
      : null,
    branch: row.branch_name || row.branch_code
      ? {
          id: row.branch_id ? Number(row.branch_id) : null,
          branch_code: row.branch_code || null,
          branch_name: row.branch_name || null,
        }
      : null,
    employee: row.employee_code || row.display_name
      ? {
          id: row.employee_id ? Number(row.employee_id) : null,
          employee_code: row.employee_code || null,
          display_name: row.display_name || null,
          first_name: row.first_name || null,
          last_name: row.last_name || null,
        }
      : null,

    // CamelCase compatibility aliases for frontends that use camelCase
    companyId: row.company_id ? Number(row.company_id) : null,
    branchId: row.branch_id ? Number(row.branch_id) : null,
    employeeId: row.employee_id ? Number(row.employee_id) : null,
    roleId: row.role_id ? Number(row.role_id) : null,
    profileImageUrl: row.profile_image_url || null,
    isEmailVerified: Boolean(row.is_email_verified),
    isPhoneVerified: Boolean(row.is_phone_verified),
    roleCode: row.role_code || null,
    role_code: row.role_code || null,
    roleName: row.role_name || null,
    role_name: row.role_name || null,
    isSuperAdmin: (row.role_code || '').toUpperCase() === 'SUPERADMIN',
    isAdmin: ['SUPERADMIN', 'ADMIN'].includes((row.role_code || '').toUpperCase()),
    companyName: row.company_name || null,
    companyCode: row.company_code || null,
    branchName: row.branch_name || null,
    branchCode: row.branch_code || null,
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
