import { z } from 'zod';
import { PRODUCT_VARIANT_SORT_FIELDS } from './productVariant.types.js';

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

const optionalNullableIdPreprocess = (val) => {
  if (val === null || val === undefined || val === '' || val === 'null') return null;
  return val;
};

const optionalNullableNumberPreprocess = (val) => {
  if (val === null || val === undefined || val === '' || val === 'null') return null;
  return Number(val);
};

export const createProductVariantSchema = z.object({
  company_id: z.coerce
    .number({ required_error: 'Company ID is required' })
    .int('Company ID must be an integer')
    .positive('Company ID must be a positive integer'),
  product_id: z.coerce
    .number({ required_error: 'Product ID is required' })
    .int('Product ID must be an integer')
    .positive('Product ID must be a positive integer'),
  sku: z
    .string()
    .trim()
    .min(1, 'SKU must be at least 1 character')
    .max(100, 'SKU cannot exceed 100 characters')
    .regex(/^[A-Za-z0-9_.-]+$/, 'SKU must contain only alphanumeric characters, hyphens, periods, and underscores')
    .transform((val) => val.toUpperCase())
    .optional(),
  variant_code: z.string().trim().max(100, 'Variant code cannot exceed 100 characters').nullable().optional(),
  variant_name: z.string().trim().max(255, 'Variant name cannot exceed 255 characters').nullable().optional(),
  size_group_id: z.preprocess(
    optionalNullableIdPreprocess,
    z.coerce.number().int().positive('Size group ID must be a positive integer').nullable().optional()
  ),
  size_id: z.preprocess(
    optionalNullableIdPreprocess,
    z.coerce.number().int().positive('Size ID must be a positive integer').nullable().optional()
  ),
  color_id: z.preprocess(
    optionalNullableIdPreprocess,
    z.coerce.number().int().positive('Color ID must be a positive integer').nullable().optional()
  ),
  material_id: z.preprocess(
    optionalNullableIdPreprocess,
    z.coerce.number().int().positive('Material ID must be a positive integer').nullable().optional()
  ),
  unit_id: z.preprocess(
    optionalNullableIdPreprocess,
    z.coerce.number().int().positive('Unit ID must be a positive integer').optional()
  ),
  model_no: z.string().trim().max(100, 'Model number cannot exceed 100 characters').nullable().optional(),
  style_code: z.string().trim().max(100, 'Style code cannot exceed 100 characters').nullable().optional(),
  weight: z.preprocess(
    optionalNullableNumberPreprocess,
    z.coerce.number().min(0, 'Weight must be non-negative').nullable().optional()
  ),
  track_stock: z.preprocess(booleanPreprocess, z.boolean()).default(true),
  allow_negative_stock: z.preprocess(booleanPreprocess, z.boolean()).default(false),
  is_default: z.preprocess(booleanPreprocess, z.boolean()).default(false),
  is_active: z.preprocess(booleanPreprocess, z.boolean()).default(true),
  created_by: z.coerce.number().int().positive().nullable().optional(),
});

export const updateProductVariantSchema = z.object({
  company_id: z.coerce.number().int().positive().optional(),
  product_id: z.coerce.number().int().positive().optional(),
  sku: z
    .string()
    .trim()
    .min(1, 'SKU must be at least 1 character')
    .max(100, 'SKU cannot exceed 100 characters')
    .regex(/^[A-Za-z0-9_.-]+$/, 'SKU must contain only alphanumeric characters, hyphens, periods, and underscores')
    .transform((val) => val.toUpperCase())
    .optional(),
  variant_code: z.string().trim().max(100, 'Variant code cannot exceed 100 characters').nullable().optional(),
  variant_name: z.string().trim().max(255, 'Variant name cannot exceed 255 characters').nullable().optional(),
  size_group_id: z.preprocess(
    optionalNullableIdPreprocess,
    z.coerce.number().int().positive('Size group ID must be a positive integer').nullable().optional()
  ),
  size_id: z.preprocess(
    optionalNullableIdPreprocess,
    z.coerce.number().int().positive('Size ID must be a positive integer').nullable().optional()
  ),
  color_id: z.preprocess(
    optionalNullableIdPreprocess,
    z.coerce.number().int().positive('Color ID must be a positive integer').nullable().optional()
  ),
  material_id: z.preprocess(
    optionalNullableIdPreprocess,
    z.coerce.number().int().positive('Material ID must be a positive integer').nullable().optional()
  ),
  unit_id: z.preprocess(
    optionalNullableIdPreprocess,
    z.coerce.number().int().positive('Unit ID must be a positive integer').optional()
  ),
  model_no: z.string().trim().max(100, 'Model number cannot exceed 100 characters').nullable().optional(),
  style_code: z.string().trim().max(100, 'Style code cannot exceed 100 characters').nullable().optional(),
  weight: z.preprocess(
    optionalNullableNumberPreprocess,
    z.coerce.number().min(0, 'Weight must be non-negative').nullable().optional()
  ),
  track_stock: z.preprocess(booleanPreprocess, z.boolean()).optional(),
  allow_negative_stock: z.preprocess(booleanPreprocess, z.boolean()).optional(),
  is_default: z.preprocess(booleanPreprocess, z.boolean()).optional(),
  is_active: z.preprocess(booleanPreprocess, z.boolean()).optional(),
  updated_by: z.coerce.number().int().positive().nullable().optional(),
});

export const updateStatusSchema = z.object({
  is_active: z.preprocess(
    booleanPreprocess,
    z.boolean({ required_error: 'is_active is required' })
  ),
});

export const setDefaultVariantSchema = z.object({
  is_default: z.preprocess(booleanPreprocess, z.boolean()).default(true),
});

export const variantIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Variant ID must be a positive integer'),
});

export const productIdParamSchema = z.object({
  productId: z.coerce.number().int().positive('Product ID must be a positive integer'),
});

export const skuParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
  sku: z.string().trim().min(1, 'SKU is required'),
});

export const getProductVariantsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  company_id: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  product_id: z.coerce.number().int().positive().optional(),
  productId: z.coerce.number().int().positive().optional(),
  size_group_id: z.coerce.number().int().positive().optional(),
  size_id: z.coerce.number().int().positive().optional(),
  color_id: z.coerce.number().int().positive().optional(),
  material_id: z.coerce.number().int().positive().optional(),
  unit_id: z.coerce.number().int().positive().optional(),
  is_default: z.preprocess(optionalBooleanPreprocess, z.boolean().optional()).optional(),
  track_stock: z.preprocess(optionalBooleanPreprocess, z.boolean().optional()).optional(),
  allow_negative_stock: z.preprocess(optionalBooleanPreprocess, z.boolean().optional()).optional(),
  is_active: z.preprocess(optionalBooleanPreprocess, z.boolean().optional()).optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(PRODUCT_VARIANT_SORT_FIELDS).default('sku'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('asc'),
});

export default {
  createProductVariantSchema,
  updateProductVariantSchema,
  updateStatusSchema,
  setDefaultVariantSchema,
  variantIdParamSchema,
  productIdParamSchema,
  skuParamSchema,
  getProductVariantsQuerySchema,
};
