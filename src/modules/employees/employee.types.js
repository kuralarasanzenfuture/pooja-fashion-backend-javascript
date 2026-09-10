/**
 * Employee Type Definitions
 * Complete JSDoc typings for entity models, DTOs, and query parameters.
 */

/**
 * @typedef {'full_time' | 'part_time' | 'temporary' | 'contract' | 'intern'} EmploymentType
 */

/**
 * @typedef {'active' | 'inactive' | 'on_leave' | 'resigned' | 'terminated'} EmploymentStatus
 */

/**
 * @typedef {'monthly' | 'daily' | 'hourly'} SalaryType
 */

/**
 * @typedef {Object} Employee
 * @property {number} id
 * @property {number} company_id
 * @property {number|null} branch_id
 * @property {string} employee_code
 * @property {string} first_name
 * @property {string|null} last_name
 * @property {string|null} display_name
 * @property {string|null} phone
 * @property {string|null} alternate_phone
 * @property {string|null} email
 * @property {string|null} date_of_birth
 * @property {string|null} gender
 * @property {string|null} designation
 * @property {string|null} department
 * @property {string|null} date_of_joining
 * @property {EmploymentType} employment_type
 * @property {EmploymentStatus} employment_status
 * @property {SalaryType|null} salary_type
 * @property {number|null} salary_amount
 * @property {string|null} address
 * @property {string|null} city
 * @property {string|null} district
 * @property {string|null} state
 * @property {string|null} pincode
 * @property {string} country
 * @property {string|null} profile_photo_url
 * @property {string|null} emergency_contact_name
 * @property {string|null} emergency_contact_phone
 * @property {string|null} emergency_contact_relation
 * @property {string|null} notes
 * @property {number|null} created_by
 * @property {number|null} updated_by
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} EmployeeDTO
 * @property {number} id
 * @property {number} companyId
 * @property {number|null} branchId
 * @property {string} employeeCode
 * @property {string} firstName
 * @property {string|null} lastName
 * @property {string|null} displayName
 * @property {string|null} phone
 * @property {string|null} alternatePhone
 * @property {string|null} email
 * @property {string|null} dateOfBirth
 * @property {string|null} gender
 * @property {string|null} designation
 * @property {string|null} department
 * @property {string|null} dateOfJoining
 * @property {EmploymentType} employmentType
 * @property {EmploymentStatus} employmentStatus
 * @property {SalaryType|null} salaryType
 * @property {number|null} salaryAmount
 * @property {string|null} address
 * @property {string|null} city
 * @property {string|null} district
 * @property {string|null} state
 * @property {string|null} pincode
 * @property {string} country
 * @property {string|null} profilePhotoUrl
 * @property {string|null} emergencyContactName
 * @property {string|null} emergencyContactPhone
 * @property {string|null} emergencyContactRelation
 * @property {string|null} notes
 * @property {string|null} companyName
 * @property {string|null} branchName
 * @property {string|null} username
 * @property {string|null} createdAt
 * @property {string|null} updatedAt
 */

export {};
