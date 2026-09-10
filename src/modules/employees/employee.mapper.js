/**
 * Map raw employee database row to clean API response DTO
 *
 * @param {Object} employee - Raw DB row
 * @returns {Object|null}
 */
export const toEmployeeDTO = (employee) => {
  if (!employee) return null;

  return {
    id: Number(employee.id),
    companyId: Number(employee.company_id),
    branchId: employee.branch_id ? Number(employee.branch_id) : null,
    employeeCode: employee.employee_code,
    firstName: employee.first_name,
    lastName: employee.last_name || null,
    displayName:
      employee.display_name ||
      `${employee.first_name}${employee.last_name ? ` ${employee.last_name}` : ''}`.trim(),
    phone: employee.phone || null,
    alternatePhone: employee.alternate_phone || null,
    email: employee.email || null,
    dateOfBirth: employee.date_of_birth ? String(employee.date_of_birth) : null,
    gender: employee.gender || null,
    designation: employee.designation || null,
    department: employee.department || null,
    dateOfJoining: employee.date_of_joining ? String(employee.date_of_joining) : null,
    employmentType: employee.employment_type,
    employmentStatus: employee.employment_status,
    salaryType: employee.salary_type || null,
    salaryAmount: employee.salary_amount !== null ? Number(employee.salary_amount) : null,
    address: employee.address || null,
    city: employee.city || null,
    district: employee.district || null,
    state: employee.state || null,
    pincode: employee.pincode || null,
    country: employee.country || 'India',
    profilePhotoUrl: employee.profile_photo_url || null,
    emergencyContactName: employee.emergency_contact_name || null,
    emergencyContactPhone: employee.emergency_contact_phone || null,
    emergencyContactRelation: employee.emergency_contact_relation || null,
    notes: employee.notes || null,
    companyName: employee.company_name || null,
    companyCode: employee.company_code || null,
    branchName: employee.branch_name || null,
    branchCode: employee.branch_code || null,
    userId: employee.user_id ? Number(employee.user_id) : null,
    username: employee.username || null,
    createdBy: employee.created_by ? Number(employee.created_by) : null,
    updatedBy: employee.updated_by ? Number(employee.updated_by) : null,
    createdAt: employee.created_at,
    updatedAt: employee.updated_at,
  };
};

/**
 * Map array of employee rows to DTOs
 *
 * @param {Array} employees
 * @returns {Array}
 */
export const toEmployeeListDTO = (employees = []) => {
  return employees.map(toEmployeeDTO);
};

export default {
  toEmployeeDTO,
  toEmployeeListDTO,
};
