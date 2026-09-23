import { z } from 'zod';
import { TAX_SORT_FIELDS, TAX_TYPES } from './tax.types.js';

const idSchema = z
  .union([z.string().regex(/^\d+$/, 'Must be a numeric string'), z.number().int().positive()])
  .transform((val) => String(val));

const rateSchema = z.coerce
  .number()
  .min(0, 'Tax rate cannot be negative')
  .max(100, 'Tax rate cannot exceed 100%');

export const taxIdParamSchema = z.object({
  id: idSchema,
});

export const companyIdParamSchema = z.object({
  companyId: idSchema,
});

export const createTaxSchema = z
  .object({
    company_id: idSchema,
    tax_code: z
      .string()
      .trim()
      .min(1, 'Tax code is required')
      .max(50, 'Tax code must not exceed 50 characters')
      .toUpperCase(),
    tax_name: z
      .string()
      .trim()
      .min(1, 'Tax name is required')
      .max(100, 'Tax name must not exceed 100 characters'),
    tax_type: z
      .string()
      .trim()
      .max(30)
      .toUpperCase()
      .default(TAX_TYPES.GST),
    rate: rateSchema,
    cgst_rate: rateSchema.optional(),
    sgst_rate: rateSchema.optional(),
    igst_rate: rateSchema.optional(),
    cess_rate: rateSchema.default(0),
    is_inclusive: z.boolean().optional().default(false),
    is_active: z.boolean().optional().default(true),
  })
  .superRefine((data, ctx) => {
    // If components are provided, ensure sum of CGST + SGST does not exceed rate
    if (data.cgst_rate !== undefined && data.sgst_rate !== undefined) {
      if (data.cgst_rate + data.sgst_rate > data.rate + 0.001) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cgst_rate'],
          message: 'Sum of CGST and SGST cannot exceed total tax rate',
        });
      }
    }
  });

export const updateTaxSchema = z
  .object({
    tax_code: z
      .string()
      .trim()
      .min(1)
      .max(50)
      .toUpperCase()
      .optional(),
    tax_name: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .optional(),
    tax_type: z
      .string()
      .trim()
      .max(30)
      .toUpperCase()
      .optional(),
    rate: rateSchema.optional(),
    cgst_rate: rateSchema.optional(),
    sgst_rate: rateSchema.optional(),
    igst_rate: rateSchema.optional(),
    cess_rate: rateSchema.optional(),
    is_inclusive: z.boolean().optional(),
    is_active: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.rate !== undefined && data.cgst_rate !== undefined && data.sgst_rate !== undefined) {
      if (data.cgst_rate + data.sgst_rate > data.rate + 0.001) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cgst_rate'],
          message: 'Sum of CGST and SGST cannot exceed total tax rate',
        });
      }
    }
  });

export const updateTaxStatusSchema = z.object({
  is_active: z.boolean(),
});

export const calculateTaxSchema = z
  .object({
    amount: z.coerce.number().positive('Amount must be greater than zero'),
    tax_id: idSchema.optional(),
    rate: rateSchema.optional(),
    is_inter_state: z.boolean().optional().default(false),
    is_inclusive: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tax_id === undefined && data.rate === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tax_id'],
        message: 'Either tax_id or rate must be provided for tax calculation',
      });
    }
  });

export const getTaxesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort_by: z
    .enum(Object.values(TAX_SORT_FIELDS))
    .default(TAX_SORT_FIELDS.RATE),
  sort_order: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('asc'),
  search: z.string().trim().optional(),
  company_id: idSchema.optional(),
  tax_type: z.string().trim().toUpperCase().optional(),
  is_active: z
    .enum(['true', 'false', 'TRUE', 'FALSE'])
    .transform((val) => val.toLowerCase() === 'true')
    .optional(),
  is_inclusive: z
    .enum(['true', 'false', 'TRUE', 'FALSE'])
    .transform((val) => val.toLowerCase() === 'true')
    .optional(),
  min_rate: rateSchema.optional(),
  max_rate: rateSchema.optional(),
});
