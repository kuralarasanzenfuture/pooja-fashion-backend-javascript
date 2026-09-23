import { z } from 'zod';
import { BARCODE_TYPES, PRODUCT_BARCODE_SORT_FIELDS } from './productBarcode.types.js';

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

export const createProductBarcodeSchema = z.object({
  company_id: z.coerce
    .number({ required_error: 'Company ID is required' })
    .int('Company ID must be an integer')
    .positive('Company ID must be a positive integer'),
  product_id: z.coerce
    .number({ required_error: 'Product ID is required' })
    .int('Product ID must be an integer')
    .positive('Product ID must be a positive integer'),
  variant_id: z.coerce
    .number({ required_error: 'Variant ID is required' })
    .int('Variant ID must be an integer')
    .positive('Variant ID must be a positive integer'),
  barcode: z
    .string()
    .trim()
    .min(1, 'Barcode must be at least 1 character')
    .max(100, 'Barcode cannot exceed 100 characters')
    .regex(/^[A-Za-z0-9_.-]+$/, 'Barcode must contain only alphanumeric characters, hyphens, periods, or underscores')
    .optional(),
  barcode_type: z
    .string()
    .trim()
    .toUpperCase()
    .refine((val) => BARCODE_TYPES.includes(val), {
      message: `Barcode type must be one of: ${BARCODE_TYPES.join(', ')}`,
    })
    .default('INTERNAL'),
  is_primary: z.preprocess(booleanPreprocess, z.boolean()).default(false),
  is_active: z.preprocess(booleanPreprocess, z.boolean()).default(true),
  created_by: z.coerce.number().int().positive().nullable().optional(),
});

export const updateProductBarcodeSchema = z.object({
  barcode: z
    .string()
    .trim()
    .min(1, 'Barcode must be at least 1 character')
    .max(100, 'Barcode cannot exceed 100 characters')
    .regex(/^[A-Za-z0-9_.-]+$/, 'Barcode must contain only alphanumeric characters, hyphens, periods, or underscores')
    .optional(),
  barcode_type: z
    .string()
    .trim()
    .toUpperCase()
    .refine((val) => BARCODE_TYPES.includes(val), {
      message: `Barcode type must be one of: ${BARCODE_TYPES.join(', ')}`,
    })
    .optional(),
  is_primary: z.preprocess(booleanPreprocess, z.boolean()).optional(),
  is_active: z.preprocess(booleanPreprocess, z.boolean()).optional(),
});

export const updateStatusSchema = z.object({
  is_active: z.preprocess(
    booleanPreprocess,
    z.boolean({ required_error: 'is_active is required' })
  ),
});

export const setPrimaryBarcodeSchema = z.object({
  is_primary: z.preprocess(booleanPreprocess, z.boolean()).default(true),
});

export const barcodeIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Barcode ID must be a positive integer'),
});

export const scanBarcodeParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
  barcode: z.string().trim().min(1, 'Barcode is required'),
});

export const variantIdParamSchema = z.object({
  variantId: z.coerce.number().int().positive('Variant ID must be a positive integer'),
});

export const getProductBarcodesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  company_id: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  product_id: z.coerce.number().int().positive().optional(),
  productId: z.coerce.number().int().positive().optional(),
  variant_id: z.coerce.number().int().positive().optional(),
  variantId: z.coerce.number().int().positive().optional(),
  barcode_type: z
    .string()
    .trim()
    .toUpperCase()
    .refine((val) => !val || BARCODE_TYPES.includes(val), {
      message: `Barcode type must be one of: ${BARCODE_TYPES.join(', ')}`,
    })
    .optional(),
  is_primary: z.preprocess(optionalBooleanPreprocess, z.boolean().optional()).optional(),
  is_active: z.preprocess(optionalBooleanPreprocess, z.boolean().optional()).optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(PRODUCT_BARCODE_SORT_FIELDS).default('id'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('desc'),
});

export default {
  createProductBarcodeSchema,
  updateProductBarcodeSchema,
  updateStatusSchema,
  setPrimaryBarcodeSchema,
  barcodeIdParamSchema,
  scanBarcodeParamSchema,
  variantIdParamSchema,
  getProductBarcodesQuerySchema,
};
