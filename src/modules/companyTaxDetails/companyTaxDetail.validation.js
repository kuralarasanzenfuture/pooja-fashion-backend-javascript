import { z } from 'zod';

export const gstRegistrationTypeEnum = z.enum(['regular', 'composition', 'unregistered', 'other']);

export const createCompanyTaxDetailSchema = z.object({
  company_id: z.coerce.number().int().positive('Company ID must be a positive integer'),
  gstin: z
    .string()
    .trim()
    .max(20, 'GSTIN cannot exceed 20 characters')
    .transform((val) => (val ? val.toUpperCase() : val))
    .nullable()
    .optional()
    .or(z.literal('')),
  pan_number: z
    .string()
    .trim()
    .max(20, 'PAN number cannot exceed 20 characters')
    .transform((val) => (val ? val.toUpperCase() : val))
    .nullable()
    .optional()
    .or(z.literal('')),
  tan_number: z
    .string()
    .trim()
    .max(20, 'TAN number cannot exceed 20 characters')
    .transform((val) => (val ? val.toUpperCase() : val))
    .nullable()
    .optional()
    .or(z.literal('')),
  gst_registration_type: gstRegistrationTypeEnum.nullable().optional(),
  gst_state_code: z.string().trim().max(10).nullable().optional(),
  tax_registered_name: z.string().trim().max(250).nullable().optional(),
  is_primary: z.boolean().default(true),
  is_active: z.boolean().default(true),
});

export const updateCompanyTaxDetailSchema = createCompanyTaxDetailSchema.partial();

export const updateStatusSchema = z.object({
  is_active: z.boolean({ required_error: 'is_active is required' }),
});

export const taxDetailIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Tax detail ID must be a positive integer'),
});

export const companyIdParamSchema = z.object({
  companyId: z.coerce.number().int().positive('Company ID must be a positive integer'),
});

export const getCompanyTaxDetailsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  company_id: z.coerce.number().int().positive().optional(),
  gst_registration_type: gstRegistrationTypeEnum.optional(),
  is_primary: z
    .preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    }, z.boolean())
    .optional(),
  is_active: z
    .preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return val;
    }, z.boolean())
    .optional(),
  search: z.string().trim().optional(),
  sortBy: z
    .enum([
      'id',
      'company_id',
      'gstin',
      'pan_number',
      'tan_number',
      'gst_registration_type',
      'tax_registered_name',
      'created_at',
      'is_primary',
      'is_active',
    ])
    .default('created_at'),
  sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('desc'),
});

export default {
  gstRegistrationTypeEnum,
  createCompanyTaxDetailSchema,
  updateCompanyTaxDetailSchema,
  updateStatusSchema,
  taxDetailIdParamSchema,
  companyIdParamSchema,
  getCompanyTaxDetailsQuerySchema,
};
