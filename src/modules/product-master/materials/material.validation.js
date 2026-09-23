import { z } from 'zod';

export const createMaterialSchema = z.object({
  company_id: z.coerce
    .number()
    .int('Company ID must be an integer')
    .positive('Company ID must be a positive number'),
  material_code: z
    .string()
    .trim()
    .min(1, 'Material code must be at least 1 character')
    .max(50, 'Material code cannot exceed 50 characters')
    .regex(/^[A-Za-z0-9_.-]+$/, 'Material code must contain only letters, numbers, hyphens, periods, and underscores')
    .transform((val) => val.toUpperCase())
    .optional(),
  material_name: z
    .string()
    .trim()
    .min(1, 'Material name is required')
    .max(150, 'Material name cannot exceed 150 characters'),
  description: z.string().trim().nullable().optional(),
  is_active: z
    .preprocess((val) => {
      if (val === 'true' || val === true || val === 1 || val === '1') return true;
      if (val === 'false' || val === false || val === 0 || val === '0') return false;
      return val;
    }, z.boolean())
    .default(true),
  created_by: z.coerce.number().int().positive().nullable().optional(),
});

export const updateMaterialSchema = z.object({
  company_id: z.coerce.number().int().positive().optional(),
  material_code: z
    .string()
    .trim()
    .min(1, 'Material code must be at least 1 character')
    .max(50, 'Material code cannot exceed 50 characters')
    .regex(/^[A-Za-z0-9_.-]+$/, 'Material code must contain only letters, numbers, hyphens, periods, and underscores')
    .transform((val) => val.toUpperCase())
    .optional(),
  material_name: z
    .string()
    .trim()
    .min(1, 'Material name must be at least 1 character')
    .max(150, 'Material name cannot exceed 150 characters')
    .optional(),
  description: z.string().trim().nullable().optional(),
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

export const materialIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Material ID must be a positive integer'),
});

export const companyIdParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
});

export const materialCodeParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
  materialCode: z.string().trim().min(1, 'Material code is required'),
});

export const getMaterialsQuerySchema = z.object({
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
    .enum(['id', 'material_code', 'material_name', 'created_at', 'is_active'])
    .default('material_name'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('asc'),
});

export default {
  createMaterialSchema,
  updateMaterialSchema,
  updateStatusSchema,
  materialIdParamSchema,
  companyIdParamSchema,
  materialCodeParamSchema,
  getMaterialsQuerySchema,
};
