import { z } from 'zod';

export const employmentTypeEnum = z.enum([
  'full_time',
  'part_time',
  'temporary',
  'contract',
  'intern',
]);

export const employmentStatusEnum = z.enum([
  'active',
  'inactive',
  'on_leave',
  'resigned',
  'terminated',
]);

export const salaryTypeEnum = z.enum(['monthly', 'daily', 'hourly']);

export const createEmployeeSchema = z.object({
  company_id: z.coerce.number().int().positive('Company ID must be a positive integer'),
  branch_id: z.coerce.number().int().positive().nullable().optional(),
  employee_code: z.string().trim().max(50).optional(),
  first_name: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(100, 'First name cannot exceed 100 characters'),
  last_name: z.string().trim().max(100).nullable().optional(),
  display_name: z.string().trim().max(200).nullable().optional(),
  phone: z.string().trim().max(20).nullable().optional(),
  alternate_phone: z.string().trim().max(20).nullable().optional(),
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(150)
    .nullable()
    .optional()
    .or(z.literal('')),
  date_of_birth: z.string().trim().nullable().optional(),
  gender: z.string().trim().max(20).nullable().optional(),
  designation: z.string().trim().max(100).nullable().optional(),
  department: z.string().trim().max(100).nullable().optional(),
  date_of_joining: z.string().trim().nullable().optional(),
  employment_type: employmentTypeEnum.default('full_time'),
  employment_status: employmentStatusEnum.default('active'),
  salary_type: salaryTypeEnum.nullable().optional(),
  salary_amount: z.coerce.number().min(0, 'Salary cannot be negative').nullable().optional(),
  address: z.string().trim().nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  district: z.string().trim().max(100).nullable().optional(),
  state: z.string().trim().max(100).nullable().optional(),
  pincode: z.string().trim().max(20).nullable().optional(),
  country: z.string().trim().max(100).default('India'),
  profile_photo_url: z.string().trim().nullable().optional(),
  username: z.string().trim().max(100).nullable().optional(),
  emergency_contact_name: z.string().trim().max(150).nullable().optional(),
  emergency_contact_phone: z.string().trim().max(20).nullable().optional(),
  emergency_contact_relation: z.string().trim().max(50).nullable().optional(),
  notes: z.string().trim().nullable().optional(),
});

export const updateEmployeeSchema = z.object({
  branch_id: z.coerce.number().int().positive().nullable().optional(),
  employee_code: z.string().trim().max(50).optional(),
  first_name: z.string().trim().min(1).max(100).optional(),
  last_name: z.string().trim().max(100).nullable().optional(),
  display_name: z.string().trim().max(200).nullable().optional(),
  phone: z.string().trim().max(20).nullable().optional(),
  alternate_phone: z.string().trim().max(20).nullable().optional(),
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(150)
    .nullable()
    .optional()
    .or(z.literal('')),
  date_of_birth: z.string().trim().nullable().optional(),
  gender: z.string().trim().max(20).nullable().optional(),
  designation: z.string().trim().max(100).nullable().optional(),
  department: z.string().trim().max(100).nullable().optional(),
  date_of_joining: z.string().trim().nullable().optional(),
  employment_type: employmentTypeEnum.optional(),
  employment_status: employmentStatusEnum.optional(),
  salary_type: salaryTypeEnum.nullable().optional(),
  salary_amount: z.coerce.number().min(0).nullable().optional(),
  address: z.string().trim().nullable().optional(),
  city: z.string().trim().max(100).nullable().optional(),
  district: z.string().trim().max(100).nullable().optional(),
  state: z.string().trim().max(100).nullable().optional(),
  pincode: z.string().trim().max(20).nullable().optional(),
  country: z.string().trim().max(100).optional(),
  profile_photo_url: z.string().trim().nullable().optional(),
  username: z.string().trim().max(100).nullable().optional(),
  emergency_contact_name: z.string().trim().max(150).nullable().optional(),
  emergency_contact_phone: z.string().trim().max(20).nullable().optional(),
  emergency_contact_relation: z.string().trim().max(50).nullable().optional(),
  notes: z.string().trim().nullable().optional(),
});

export const updateStatusSchema = z.object({
  employment_status: employmentStatusEnum,
});

export const employeeIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Employee ID must be a positive integer'),
});

export const getEmployeesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  company_id: z.coerce.number().int().positive().optional(),
  branch_id: z.coerce.number().int().positive().optional(),
  department: z.string().trim().optional(),
  employment_status: employmentStatusEnum.optional(),
  employment_type: employmentTypeEnum.optional(),
  search: z.string().trim().optional(),
  sortBy: z
    .enum([
      'id',
      'employee_code',
      'first_name',
      'last_name',
      'display_name',
      'email',
      'phone',
      'department',
      'designation',
      'employment_status',
      'employment_type',
      'date_of_joining',
      'created_at',
    ])
    .default('id'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('asc'),
});

export default {
  employmentTypeEnum,
  employmentStatusEnum,
  salaryTypeEnum,
  createEmployeeSchema,
  updateEmployeeSchema,
  updateStatusSchema,
  employeeIdParamSchema,
  getEmployeesQuerySchema,
};
