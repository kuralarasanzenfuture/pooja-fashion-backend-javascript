import * as employeeService from './employee.service.js';
import { sendSuccess, sendCreated } from '../../shared/utils/response.js';

/**
 * GET /api/employees
 */
export const getAll = async (req, res, next) => {
  try {
    const { employees, meta } = await employeeService.getEmployees(req.query);
    return sendSuccess(res, employees, 'Employees retrieved successfully', 200, meta);
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/employees/:id
 */
export const getById = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    return sendSuccess(res, employee, 'Employee retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/employees/code/:companyId/:employeeCode
 */
export const getByCode = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeByCode(
      req.params.companyId,
      req.params.employeeCode
    );
    return sendSuccess(res, employee, 'Employee retrieved successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/employees
 * Supports raw JSON or multipart/form-data with photo
 */
export const create = async (req, res, next) => {
  try {
    const createdBy = req.user?.id || null;
    const employee = await employeeService.createEmployee(req.body, req.files, createdBy);
    return sendCreated(res, employee, 'Employee created successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/employees/:id
 * Supports raw JSON or multipart/form-data with photo
 */
export const update = async (req, res, next) => {
  try {
    const updatedBy = req.user?.id || null;
    const employee = await employeeService.updateEmployee(
      req.params.id,
      req.body,
      req.files,
      updatedBy
    );
    return sendSuccess(res, employee, 'Employee updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/employees/:id/photo
 * Dedicated photo upload endpoint
 */
export const uploadPhoto = async (req, res, next) => {
  try {
    const employee = await employeeService.uploadEmployeePhoto(req.params.id, req.files);
    return sendSuccess(res, employee, 'Employee photo uploaded successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/employees/:id/photo
 * Dedicated photo deletion endpoint
 */
export const deletePhoto = async (req, res, next) => {
  try {
    const employee = await employeeService.deleteEmployeePhoto(req.params.id);
    return sendSuccess(res, employee, 'Employee photo deleted successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/employees/:id/status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const updatedBy = req.user?.id || null;
    const employee = await employeeService.updateEmployeeStatus(
      req.params.id,
      req.body.employment_status,
      updatedBy
    );
    return sendSuccess(res, employee, 'Employee status updated successfully');
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/employees/:id
 */
export const deleteEmployee = async (req, res, next) => {
  try {
    const deleted = await employeeService.deleteEmployee(req.params.id);
    return sendSuccess(res, deleted, 'Employee deleted successfully');
  } catch (error) {
    return next(error);
  }
};

export default {
  getAll,
  getById,
  getByCode,
  create,
  update,
  uploadPhoto,
  deletePhoto,
  updateStatus,
  deleteEmployee,
};
