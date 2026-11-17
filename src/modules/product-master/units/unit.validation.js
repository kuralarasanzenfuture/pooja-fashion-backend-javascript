import { z } from 'zod';

export const createUnitSchema = z.object({
  company_id: z.coerce
    .number()
    .int('Company ID must be an integer')
    .positive('Company ID must be a positive number')
    .optional(),
  unit_code: z
    .string()
    .trim()
    .min(1, 'Unit code must be at least 1 character')
    .max(30, 'Unit code cannot exceed 30 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Unit code must contain only letters, numbers, hyphens, and underscores')
    .transform((val) => val.toUpperCase())
    .optional(),
  unit_name: z
    .string()
    .trim()
    .min(1, 'Unit name is required')
    .max(100, 'Unit name cannot exceed 100 characters'),
  decimal_places: z.coerce
    .number()
    .int('Decimal places must be an integer')
    .min(0, 'Decimal places cannot be less than 0')
    .max(6, 'Decimal places cannot exceed 6')
    .default(0),
  is_active: z
    .preprocess((val) => {
      if (val === 'true' || val === true || val === 1 || val === '1') return true;
      if (val === 'false' || val === false || val === 0 || val === '0') return false;
      return val;
    }, z.boolean())
    .default(true),
  created_by: z.coerce.number().int().positive().nullable().optional(),
});

export const updateUnitSchema = z.object({
  company_id: z.coerce.number().int().positive().optional(),
  unit_code: z
    .string()
    .trim()
    .min(1, 'Unit code must be at least 1 character')
    .max(30, 'Unit code cannot exceed 30 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Unit code must contain only letters, numbers, hyphens, and underscores')
    .transform((val) => val.toUpperCase())
    .optional(),
  unit_name: z
    .string()
    .trim()
    .min(1, 'Unit name must be at least 1 character')
    .max(100, 'Unit name cannot exceed 100 characters')
    .optional(),
  decimal_places: z.coerce
    .number()
    .int('Decimal places must be an integer')
    .min(0, 'Decimal places cannot be less than 0')
    .max(6, 'Decimal places cannot exceed 6')
    .optional(),
  is_active: z
    .preprocess((val) => {
      if (val === 'true' || val === true || val === 1 || val === '1') return true;
      if (val === 'false' || val === false || val === 0 || val === '0') return false;
      return val;
    }, z.boolean())
    .optional(),
  updated_by: z.coerce.number().int().positive().nullable().optional(),
});

export const updateStatusSchema = z.object({
  is_active: z.preprocess(
    (val) => {
      if (val === 'true' || val === true || val === 1 || val === '1') return true;
      if (val === 'false' || val === false || val === 0 || val === '0') return false;
      return val;
    },
    z.boolean({ required_error: 'is_active is required' })
  ),
});

export const unitIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Unit ID must be a positive integer'),
});

export const companyIdParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
});

export const unitCodeParamSchema = z.object({
  companyId: z.coerce.number().int().positive().optional(),
  unitCode: z.string().trim().min(1, 'Unit code is required'),
});

export const getUnitsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  company_id: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  is_active: z
    .preprocess((val) => {
      if (val === 'true' || val === true || val === 1 || val === '1') return true;
      if (val === 'false' || val === false || val === 0 || val === '0') return false;
      return undefined;
    }, z.boolean().optional())
    .optional(),
  search: z.string().trim().optional(),
  sortBy: z
    .enum(['id', 'unit_code', 'unit_name', 'decimal_places', 'created_at', 'is_active'])
    .default('unit_name'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('asc'),
});

export const getAllUnitsQuerySchema = z.object({
  company_id: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  is_active: z
    .preprocess((val) => {
      if (val === 'true' || val === true || val === 1 || val === '1') return true;
      if (val === 'false' || val === false || val === 0 || val === '0') return false;
      return undefined;
    }, z.boolean().optional())
    .optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(['id', 'unit_code', 'unit_name', 'decimal_places', 'created_at']).default('unit_name'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('asc'),
});

export const getUnitStatsQuerySchema = z.object({
  company_id: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
});

export const checkUnitNameQuerySchema = z
  .object({
    company_id: z.coerce.number().int().positive().optional(),
    companyId: z.coerce.number().int().positive().optional(),
    name: z.string().trim().optional(),
    unit_name: z.string().trim().optional(),
    excludeId: z.coerce.number().int().positive().optional(),
    exclude_id: z.coerce.number().int().positive().optional(),
  })
  .refine((data) => (data.name && data.name.length > 0) || (data.unit_name && data.unit_name.length > 0), {
    message: 'Unit name is required',
    path: ['name'],
  });

export const checkUnitCodeQuerySchema = z
  .object({
    company_id: z.coerce.number().int().positive().optional(),
    companyId: z.coerce.number().int().positive().optional(),
    code: z.string().trim().optional(),
    unit_code: z.string().trim().optional(),
    excludeId: z.coerce.number().int().positive().optional(),
    exclude_id: z.coerce.number().int().positive().optional(),
  })
  .refine((data) => (data.code && data.code.length > 0) || (data.unit_code && data.unit_code.length > 0), {
    message: 'Unit code is required',
    path: ['code'],
  });

export const seedDefaultUnitsSchema = z.object({
  company_id: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
});

export default {
  createUnitSchema,
  updateUnitSchema,
  updateStatusSchema,
  unitIdParamSchema,
  companyIdParamSchema,
  unitCodeParamSchema,
  getUnitsQuerySchema,
  getAllUnitsQuerySchema,
  getUnitStatsQuerySchema,
  checkUnitNameQuerySchema,
  checkUnitCodeQuerySchema,
  seedDefaultUnitsSchema,
};
