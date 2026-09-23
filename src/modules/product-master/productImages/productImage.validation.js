import { z } from 'zod';
import { PRODUCT_IMAGE_SORT_FIELDS } from './productImage.types.js';

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

export const createProductImageSchema = z.object({
  company_id: z.coerce
    .number({ required_error: 'Company ID is required' })
    .int('Company ID must be an integer')
    .positive('Company ID must be a positive integer'),
  product_id: z.coerce
    .number({ required_error: 'Product ID is required' })
    .int('Product ID must be an integer')
    .positive('Product ID must be a positive integer'),
  variant_id: z.preprocess(
    optionalNullableIdPreprocess,
    z.coerce.number().int().positive('Variant ID must be a positive integer').nullable().default(null)
  ),
  image_url: z.string().trim().min(1, 'Image URL must not be empty').optional(),
  alt_text: z.string().trim().max(255, 'Alt text cannot exceed 255 characters').nullable().optional(),
  display_order: z.coerce.number().int().min(0, 'Display order must be a non-negative integer').default(0),
  is_primary: z.preprocess(booleanPreprocess, z.boolean()).default(false),
  is_active: z.preprocess(booleanPreprocess, z.boolean()).default(true),
  created_by: z.coerce.number().int().positive().nullable().optional(),
});

export const updateProductImageSchema = z.object({
  alt_text: z.string().trim().max(255, 'Alt text cannot exceed 255 characters').nullable().optional(),
  display_order: z.coerce.number().int().min(0, 'Display order must be a non-negative integer').optional(),
  is_primary: z.preprocess(booleanPreprocess, z.boolean()).optional(),
  is_active: z.preprocess(booleanPreprocess, z.boolean()).optional(),
});

export const reorderImagesSchema = z.object({
  items: z.array(
    z.object({
      id: z.coerce.number().int().positive('Image ID must be a positive integer'),
      display_order: z.coerce.number().int().min(0, 'Display order must be a non-negative integer'),
    })
  ).min(1, 'At least one image item is required for reordering'),
});

export const updateStatusSchema = z.object({
  is_active: z.preprocess(
    booleanPreprocess,
    z.boolean({ required_error: 'is_active is required' })
  ),
});

export const setPrimaryImageSchema = z.object({
  is_primary: z.preprocess(booleanPreprocess, z.boolean()).default(true),
});

export const imageIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Image ID must be a positive integer'),
});

export const productIdParamSchema = z.object({
  productId: z.coerce.number().int().positive('Product ID must be a positive integer'),
});

export const getProductImagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  company_id: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  product_id: z.coerce.number().int().positive().optional(),
  productId: z.coerce.number().int().positive().optional(),
  variant_id: z.coerce.number().int().positive().optional(),
  variantId: z.coerce.number().int().positive().optional(),
  is_primary: z.preprocess(optionalBooleanPreprocess, z.boolean().optional()).optional(),
  is_active: z.preprocess(optionalBooleanPreprocess, z.boolean().optional()).optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(PRODUCT_IMAGE_SORT_FIELDS).default('id'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('asc'),
});

export default {
  createProductImageSchema,
  updateProductImageSchema,
  reorderImagesSchema,
  updateStatusSchema,
  setPrimaryImageSchema,
  imageIdParamSchema,
  productIdParamSchema,
  getProductImagesQuerySchema,
};
