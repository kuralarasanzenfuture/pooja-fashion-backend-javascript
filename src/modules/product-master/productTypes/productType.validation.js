import { z } from 'zod';

const booleanPreprocess = (val) => {
  if (val === 'true' || val === true || val === 1 || val === '1') return true;
  if (val === 'false' || val === false || val === 0 || val === '0') return false;
  return val;
};

const optionalBooleanPreprocess = (val) => {
  if (val === 'true' || val === true || val === 1 || val === '1') return true;
  if (val === 'false' || val === false || val === 0 || val === '0') return false;
  return undefined;
};

export const createProductTypeSchema = z.object({
  company_id: z.coerce
    .number()
    .int('Company ID must be an integer')
    .positive('Company ID must be a positive number'),
  type_code: z
    .string()
    .trim()
    .min(1, 'Type code must be at least 1 character')
    .max(50, 'Type code cannot exceed 50 characters')
    .regex(/^[A-Za-z0-9_.-]+$/, 'Type code must contain only letters, numbers, hyphens, periods, and underscores')
    .transform((val) => val.toUpperCase())
    .optional(),
  type_name: z
    .string()
    .trim()
    .min(1, 'Type name is required')
    .max(100, 'Type name cannot exceed 100 characters'),
  description: z.string().trim().nullable().optional(),
  is_stock_item: z.preprocess(booleanPreprocess, z.boolean()).default(true),
  is_saleable: z.preprocess(booleanPreprocess, z.boolean()).default(true),
  is_purchasable: z.preprocess(booleanPreprocess, z.boolean()).default(true),
  is_active: z.preprocess(booleanPreprocess, z.boolean()).default(true),
  created_by: z.coerce.number().int().positive().nullable().optional(),
});

export const updateProductTypeSchema = z.object({
  company_id: z.coerce.number().int().positive().optional(),
  type_code: z
    .string()
    .trim()
    .min(1, 'Type code must be at least 1 character')
    .max(50, 'Type code cannot exceed 50 characters')
    .regex(/^[A-Za-z0-9_.-]+$/, 'Type code must contain only letters, numbers, hyphens, periods, and underscores')
    .transform((val) => val.toUpperCase())
    .optional(),
  type_name: z
    .string()
    .trim()
    .min(1, 'Type name must be at least 1 character')
    .max(100, 'Type name cannot exceed 100 characters')
    .optional(),
  description: z.string().trim().nullable().optional(),
  is_stock_item: z.preprocess(booleanPreprocess, z.boolean()).optional(),
  is_saleable: z.preprocess(booleanPreprocess, z.boolean()).optional(),
  is_purchasable: z.preprocess(booleanPreprocess, z.boolean()).optional(),
  is_active: z.preprocess(booleanPreprocess, z.boolean()).optional(),
  updated_by: z.coerce.number().int().positive().nullable().optional(),
});

export const updateStatusSchema = z.object({
  is_active: z.preprocess(
    booleanPreprocess,
    z.boolean({ required_error: 'is_active is required' })
  ),
});

export const productTypeIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Product Type ID must be a positive integer'),
});

export const companyIdParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
});

export const typeCodeParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
  typeCode: z.string().trim().min(1, 'Type code is required'),
});

export const getProductTypesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  company_id: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  is_stock_item: z.preprocess(optionalBooleanPreprocess, z.boolean().optional()).optional(),
  is_saleable: z.preprocess(optionalBooleanPreprocess, z.boolean().optional()).optional(),
  is_purchasable: z.preprocess(optionalBooleanPreprocess, z.boolean().optional()).optional(),
  is_active: z.preprocess(optionalBooleanPreprocess, z.boolean().optional()).optional(),
  search: z.string().trim().optional(),
  sortBy: z
    .enum(['id', 'type_code', 'type_name', 'created_at', 'is_active'])
    .default('type_name'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('asc'),
});

export default {
  createProductTypeSchema,
  updateProductTypeSchema,
  updateStatusSchema,
  productTypeIdParamSchema,
  companyIdParamSchema,
  typeCodeParamSchema,
  getProductTypesQuerySchema,
};
