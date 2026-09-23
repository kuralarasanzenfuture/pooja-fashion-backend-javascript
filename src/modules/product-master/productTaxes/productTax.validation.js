import { z } from 'zod';
import { PRODUCT_TAX_SORT_FIELDS } from './productTax.types.js';

const idSchema = z
  .union([z.string().regex(/^\d+$/, 'Must be a numeric string'), z.number().int().positive()])
  .transform((val) => String(val));

const optionalIdSchema = z
  .union([z.string().regex(/^\d+$/, 'Must be a numeric string'), z.number().int().positive()])
  .optional()
  .nullable()
  .transform((val) => (val ? String(val) : null));

const datetimeSchema = z
  .string()
  .optional()
  .nullable()
  .refine(
    (val) => {
      if (!val) return true;
      return !isNaN(Date.parse(val));
    },
    { message: 'Invalid datetime format' }
  );

export const productTaxIdParamSchema = z.object({
  id: idSchema,
});

export const productIdParamSchema = z.object({
  productId: idSchema,
});

export const createProductTaxSchema = z
  .object({
    company_id: idSchema,
    product_id: idSchema,
    variant_id: optionalIdSchema.default(null),
    tax_id: idSchema,
    is_primary: z.boolean().optional().default(false),
    effective_from: datetimeSchema.default(null),
    effective_to: datetimeSchema.default(null),
    is_active: z.boolean().optional().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.effective_from && data.effective_to) {
      const fromTime = new Date(data.effective_from).getTime();
      const toTime = new Date(data.effective_to).getTime();
      if (toTime <= fromTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['effective_to'],
          message: 'effective_to must be after effective_from',
        });
      }
    }
  });

export const updateProductTaxSchema = z
  .object({
    tax_id: idSchema.optional(),
    is_primary: z.boolean().optional(),
    effective_from: datetimeSchema,
    effective_to: datetimeSchema,
    is_active: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.effective_from && data.effective_to) {
      const fromTime = new Date(data.effective_from).getTime();
      const toTime = new Date(data.effective_to).getTime();
      if (toTime <= fromTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['effective_to'],
          message: 'effective_to must be after effective_from',
        });
      }
    }
  });

export const updateProductTaxStatusSchema = z.object({
  is_active: z.boolean(),
});

export const resolveTaxQuerySchema = z.object({
  company_id: idSchema,
  product_id: idSchema,
  variant_id: optionalIdSchema,
  as_of: datetimeSchema,
});

export const bulkAssignTaxSchema = z.object({
  company_id: idSchema,
  tax_id: idSchema,
  product_ids: z.array(idSchema).min(1, 'At least one product_id is required'),
  is_primary: z.boolean().optional().default(false),
});

export const getProductTaxesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort_by: z
    .enum(Object.values(PRODUCT_TAX_SORT_FIELDS))
    .default(PRODUCT_TAX_SORT_FIELDS.ID),
  sort_order: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('desc'),
  company_id: idSchema.optional(),
  product_id: idSchema.optional(),
  variant_id: idSchema.optional(),
  tax_id: idSchema.optional(),
  is_primary: z
    .enum(['true', 'false', 'TRUE', 'FALSE'])
    .transform((val) => val.toLowerCase() === 'true')
    .optional(),
  is_active: z
    .enum(['true', 'false', 'TRUE', 'FALSE'])
    .transform((val) => val.toLowerCase() === 'true')
    .optional(),
});
