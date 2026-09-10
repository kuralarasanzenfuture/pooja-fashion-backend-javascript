import * as employeeRepository from './employee.repository.js';
import { toEmployeeDTO, toEmployeeListDTO } from './employee.mapper.js';
import { generateEmployeeCode, sanitizeEmployeeCode } from './employee.utils.js';
import NotFoundError from '../../shared/errors/NotFoundError.js';
import BadRequestError from '../../shared/errors/BadRequestError.js';
import { getPaginationParams, formatPaginationMeta } from '../../shared/utils/pagination.js';
import { deleteFileByUrl } from '../../shared/utils/file.js';

/**
 * Extract photo filename/url from Multer files object
 */
const extractUploadedPhotoUrl = (files) => {
  if (!files) return null;
  const file =
    (files.photo && files.photo[0]) ||
    (files.profile_photo && files.profile_photo[0]) ||
    (files.image && files.image[0]);

  if (file?.filename) {
    return `/uploads/employees/${file.filename}`;
  }
  return null;
};

/**
 * Get paginated list of employees
 */
export const getEmployees = async (query) => {
  const { page, limit, offset, sortBy, sortOrder, search } = getPaginationParams(query);
  const companyId = query.company_id ? Number(query.company_id) : null;
  const branchId = query.branch_id ? Number(query.branch_id) : null;
  const department = query.department || null;
  const employmentStatus = query.employment_status || null;
  const employmentType = query.employment_type || null;

  const { rows, total } = await employeeRepository.findAll({
    limit,
    offset,
    search,
    companyId,
    branchId,
    department,
    employmentStatus,
    employmentType,
    sortBy: sortBy || 'id',
    sortOrder: sortOrder || 'ASC',
  });

  const meta = formatPaginationMeta(total, page, limit);
  return {
    employees: toEmployeeListDTO(rows),
    meta,
  };
};

/**
 * Get employee by ID
 */
export const getEmployeeById = async (id) => {
  const employee = await employeeRepository.findById(id);
  if (!employee) {
    throw new NotFoundError(`Employee not found with ID: ${id}`);
  }
  return toEmployeeDTO(employee);
};

/**
 * Get employee by company ID and code
 */
export const getEmployeeByCode = async (companyId, employeeCode) => {
  const employee = await employeeRepository.findByCode(companyId, employeeCode);
  if (!employee) {
    throw new NotFoundError(
      `Employee not found with code: ${employeeCode} for company ${companyId}`
    );
  }
  return toEmployeeDTO(employee);
};

/**
 * Create a new employee with intelligent code auto-generation and photo upload support
 */
export const createEmployee = async (data, files = null, createdBy = null) => {
  const company = await employeeRepository.findCompanyById(data.company_id);
  if (!company) {
    throw new NotFoundError(`Company not found with ID: ${data.company_id}`);
  }

  const existingCodes = await employeeRepository.findExistingCodes(data.company_id);

  // Auto-generate employee code if missing or empty
  if (!data.employee_code || !data.employee_code.trim()) {
    data.employee_code = generateEmployeeCode({
      company,
      department: data.department,
      existingCodes,
      useDepartmentCode: false,
    });
  } else {
    data.employee_code = sanitizeEmployeeCode(data.employee_code);
    const codeExists = existingCodes.some(
      (c) => c.toUpperCase() === data.employee_code.toUpperCase()
    );
    if (codeExists) {
      throw new BadRequestError(
        `Employee code "${data.employee_code}" already exists for this company`
      );
    }
  }

  // Check unique phone if provided
  if (data.phone) {
    const phoneExists = await employeeRepository.findByPhone(data.company_id, data.phone);
    if (phoneExists) {
      throw new BadRequestError(
        `Employee with phone "${data.phone}" already exists in this company`
      );
    }
  }

  // Check unique email if provided
  if (data.email) {
    const emailExists = await employeeRepository.findByEmail(data.company_id, data.email);
    if (emailExists) {
      throw new BadRequestError(
        `Employee with email "${data.email}" already exists in this company`
      );
    }
  }

  // Extract uploaded photo if provided via multipart form-data
  const uploadedPhotoUrl = extractUploadedPhotoUrl(files);
  if (uploadedPhotoUrl) {
    data.profile_photo_url = uploadedPhotoUrl;
  }

  data.created_by = createdBy;

  const newEmployee = await employeeRepository.create(data);
  const fullEmployee = await employeeRepository.findById(newEmployee.id);
  return toEmployeeDTO(fullEmployee);
};

/**
 * Update an existing employee
 */
export const updateEmployee = async (id, data, files = null, updatedBy = null) => {
  const existing = await employeeRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Employee not found with ID: ${id}`);
  }

  // If employee_code is changing, check uniqueness
  if (
    data.employee_code &&
    data.employee_code.trim().toUpperCase() !== existing.employee_code.toUpperCase()
  ) {
    data.employee_code = sanitizeEmployeeCode(data.employee_code);
    const existingEmployee = await employeeRepository.findByCode(
      existing.company_id,
      data.employee_code
    );
    if (existingEmployee && Number(existingEmployee.id) !== Number(id)) {
      throw new BadRequestError(
        `Employee code "${data.employee_code}" already exists for this company`
      );
    }
  }

  // If phone is changing, check uniqueness
  if (data.phone && data.phone !== existing.phone) {
    const phoneExists = await employeeRepository.findByPhone(existing.company_id, data.phone, id);
    if (phoneExists) {
      throw new BadRequestError(
        `Employee with phone "${data.phone}" already exists in this company`
      );
    }
  }

  // If email is changing, check uniqueness
  if (data.email && data.email.toLowerCase() !== (existing.email || '').toLowerCase()) {
    const emailExists = await employeeRepository.findByEmail(existing.company_id, data.email, id);
    if (emailExists) {
      throw new BadRequestError(
        `Employee with email "${data.email}" already exists in this company`
      );
    }
  }

  // Extract uploaded photo if provided
  const uploadedPhotoUrl = extractUploadedPhotoUrl(files);
  if (uploadedPhotoUrl) {
    if (existing.profile_photo_url) {
      await deleteFileByUrl(existing.profile_photo_url);
    }
    data.profile_photo_url = uploadedPhotoUrl;
  }

  await employeeRepository.update(id, data, updatedBy);
  const updatedEmployee = await employeeRepository.findById(id);
  return toEmployeeDTO(updatedEmployee);
};

/**
 * Dedicated photo upload for employee
 */
export const uploadEmployeePhoto = async (id, files) => {
  const existing = await employeeRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Employee not found with ID: ${id}`);
  }

  const uploadedPhotoUrl = extractUploadedPhotoUrl(files);
  if (!uploadedPhotoUrl) {
    throw new BadRequestError('No valid photo file was uploaded');
  }

  if (existing.profile_photo_url) {
    await deleteFileByUrl(existing.profile_photo_url);
  }

  await employeeRepository.update(id, { profile_photo_url: uploadedPhotoUrl });
  const updated = await employeeRepository.findById(id);
  return toEmployeeDTO(updated);
};

/**
 * Delete photo for employee
 */
export const deleteEmployeePhoto = async (id) => {
  const existing = await employeeRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Employee not found with ID: ${id}`);
  }

  if (existing.profile_photo_url) {
    await deleteFileByUrl(existing.profile_photo_url);
  }

  await employeeRepository.update(id, { profile_photo_url: null });
  const updated = await employeeRepository.findById(id);
  return toEmployeeDTO(updated);
};

/**
 * Update employment status
 */
export const updateEmployeeStatus = async (id, status, updatedBy = null) => {
  const existing = await employeeRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Employee not found with ID: ${id}`);
  }

  const updated = await employeeRepository.updateStatus(id, status, updatedBy);
  return toEmployeeDTO(updated);
};

/**
 * Delete employee and associated files
 */
export const deleteEmployee = async (id) => {
  const existing = await employeeRepository.findById(id);
  if (!existing) {
    throw new NotFoundError(`Employee not found with ID: ${id}`);
  }

  if (existing.profile_photo_url) {
    await deleteFileByUrl(existing.profile_photo_url);
  }

  const deleted = await employeeRepository.deleteById(id);
  return { id: Number(deleted.id) };
};

export default {
  getEmployees,
  getEmployeeById,
  getEmployeeByCode,
  createEmployee,
  updateEmployee,
  uploadEmployeePhoto,
  deleteEmployeePhoto,
  updateEmployeeStatus,
  deleteEmployee,
};
