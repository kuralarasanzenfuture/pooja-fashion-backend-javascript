import { z } from 'zod';
import { PRODUCT_SORT_FIELDS } from './product.types.js';

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

export const createProductSchema = z.object({
  company_id: z.coerce
    .number({ required_error: 'Company ID is required' })
    .int('Company ID must be an integer')
    .positive('Company ID must be a positive integer'),
  product_code: z
    .string()
    .trim()
    .min(1, 'Product code must be at least 1 character')
    .max(50, 'Product code cannot exceed 50 characters')
    .regex(/^[A-Za-z0-9_.-]+$/, 'Product code must contain only letters, numbers, hyphens, periods, and underscores')
    .transform((val) => val.toUpperCase())
    .optional(),
  product_name: z
    .string({ required_error: 'Product name is required' })
    .trim()
    .min(1, 'Product name is required')
    .max(255, 'Product name cannot exceed 255 characters'),
  category_id: z.coerce
    .number({ required_error: 'Category ID is required' })
    .int('Category ID must be an integer')
    .positive('Category ID must be a positive integer'),
  subcategory_id: z.preprocess(
    optionalNullableIdPreprocess,
    z.coerce.number().int().positive('Subcategory ID must be a positive integer').nullable().optional()
  ),
  brand_id: z.preprocess(
    optionalNullableIdPreprocess,
    z.coerce.number().int().positive('Brand ID must be a positive integer').nullable().optional()
  ),
  product_type_id: z.preprocess(
    optionalNullableIdPreprocess,
    z.coerce.number().int().positive('Product type ID must be a positive integer').nullable().optional()
  ),
  description: z.string().trim().nullable().optional(),
  short_description: z.string().trim().max(500, 'Short description cannot exceed 500 characters').nullable().optional(),
  manufacturer_name: z.string().trim().max(150, 'Manufacturer name cannot exceed 150 characters').nullable().optional(),
  manufacturer_part_no: z.string().trim().max(100, 'Manufacturer part no cannot exceed 100 characters').nullable().optional(),
  default_unit_id: z.coerce
    .number({ required_error: 'Default unit ID is required' })
    .int('Default unit ID must be an integer')
    .positive('Default unit ID must be a positive integer'),
  is_variant_product: z.preprocess(booleanPreprocess, z.boolean()).default(true),
  track_stock: z.preprocess(booleanPreprocess, z.boolean()).default(true),
  allow_negative_stock: z.preprocess(booleanPreprocess, z.boolean()).default(false),
  is_active: z.preprocess(booleanPreprocess, z.boolean()).default(true),
  created_by: z.coerce.number().int().positive().nullable().optional(),
});

export const updateProductSchema = z.object({
  company_id: z.coerce.number().int().positive().optional(),
  product_code: z
    .string()
    .trim()
    .min(1, 'Product code must be at least 1 character')
    .max(50, 'Product code cannot exceed 50 characters')
    .regex(/^[A-Za-z0-9_.-]+$/, 'Product code must contain only letters, numbers, hyphens, periods, and underscores')
    .transform((val) => val.toUpperCase())
    .optional(),
  product_name: z
    .string()
    .trim()
    .min(1, 'Product name must be at least 1 character')
    .max(255, 'Product name cannot exceed 255 characters')
    .optional(),
  category_id: z.coerce
    .number()
    .int('Category ID must be an integer')
    .positive('Category ID must be a positive integer')
    .optional(),
  subcategory_id: z.preprocess(
    optionalNullableIdPreprocess,
    z.coerce.number().int().positive('Subcategory ID must be a positive integer').nullable().optional()
  ),
  brand_id: z.preprocess(
    optionalNullableIdPreprocess,
    z.coerce.number().int().positive('Brand ID must be a positive integer').nullable().optional()
  ),
  product_type_id: z.preprocess(
    optionalNullableIdPreprocess,
    z.coerce.number().int().positive('Product type ID must be a positive integer').nullable().optional()
  ),
  description: z.string().trim().nullable().optional(),
  short_description: z.string().trim().max(500, 'Short description cannot exceed 500 characters').nullable().optional(),
  manufacturer_name: z.string().trim().max(150, 'Manufacturer name cannot exceed 150 characters').nullable().optional(),
  manufacturer_part_no: z.string().trim().max(100, 'Manufacturer part no cannot exceed 100 characters').nullable().optional(),
  default_unit_id: z.coerce
    .number()
    .int('Default unit ID must be an integer')
    .positive('Default unit ID must be a positive integer')
    .optional(),
  is_variant_product: z.preprocess(booleanPreprocess, z.boolean()).optional(),
  track_stock: z.preprocess(booleanPreprocess, z.boolean()).optional(),
  allow_negative_stock: z.preprocess(booleanPreprocess, z.boolean()).optional(),
  is_active: z.preprocess(booleanPreprocess, z.boolean()).optional(),
  updated_by: z.coerce.number().int().positive().nullable().optional(),
});

export const updateStatusSchema = z.object({
  is_active: z.preprocess(
    booleanPreprocess,
    z.boolean({ required_error: 'is_active is required' })
  ),
});

export const productIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Product ID must be a positive integer'),
});

export const companyIdParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
});

export const productCodeParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
  productCode: z.string().trim().min(1, 'Product code is required'),
});

export const getProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  company_id: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  category_id: z.coerce.number().int().positive().optional(),
  subcategory_id: z.coerce.number().int().positive().optional(),
  brand_id: z.coerce.number().int().positive().optional(),
  product_type_id: z.coerce.number().int().positive().optional(),
  default_unit_id: z.coerce.number().int().positive().optional(),
  is_variant_product: z.preprocess(optionalBooleanPreprocess, z.boolean().optional()).optional(),
  track_stock: z.preprocess(optionalBooleanPreprocess, z.boolean().optional()).optional(),
  allow_negative_stock: z.preprocess(optionalBooleanPreprocess, z.boolean().optional()).optional(),
  is_active: z.preprocess(optionalBooleanPreprocess, z.boolean().optional()).optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(PRODUCT_SORT_FIELDS).default('product_name'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('asc'),
});

export default {
  createProductSchema,
  updateProductSchema,
  updateStatusSchema,
  productIdParamSchema,
  companyIdParamSchema,
  productCodeParamSchema,
  getProductsQuerySchema,
};
