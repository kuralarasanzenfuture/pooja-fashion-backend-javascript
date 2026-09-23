import { z } from 'zod';
import { PRODUCT_DISCOUNT_SORT_FIELDS } from './productDiscount.types.js';

const idSchema = z
  .union([z.string().regex(/^\d+$/, 'Must be a numeric string'), z.number().int().positive()])
  .transform((val) => String(val));

const optionalIdSchema = z
  .union([z.string().regex(/^\d+$/, 'Must be a numeric string'), z.number().int().positive()])
  .optional()
  .nullable()
  .transform((val) => (val === null || val === undefined || val === '' ? null : String(val)));

const datetimeSchema = z
  .string()
  .optional()
  .nullable()
  .transform((val) => {
    if (val === undefined) return undefined;
    if (val === null || val === '') return null;
    return val;
  })
  .refine(
    (val) => {
      if (!val) return true;
      return !isNaN(Date.parse(val));
    },
    { message: 'Invalid datetime format' }
  );

export const productDiscountIdParamSchema = z.object({
  id: idSchema,
});

export const productIdParamSchema = z.object({
  productId: idSchema,
});

export const createProductDiscountSchema = z.object({
  company_id: idSchema,
  product_id: idSchema,
  variant_id: optionalIdSchema.default(null),
  discount_id: idSchema,
  is_primary: z.boolean().optional().default(false),
  is_active: z.boolean().optional().default(true),
});

export const updateProductDiscountSchema = z
  .object({
    discount_id: idSchema.optional(),
    is_primary: z.boolean().optional(),
    is_active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const updateProductDiscountStatusSchema = z.object({
  is_active: z.boolean(),
});

export const bulkAssignDiscountSchema = z.object({
  company_id: idSchema,
  discount_id: idSchema,
  product_ids: z
    .array(idSchema)
    .min(1, 'At least one product ID must be provided'),
  is_primary: z.boolean().optional().default(false),
});

export const resolveDiscountQuerySchema = z.object({
  company_id: idSchema,
  product_id: idSchema,
  variant_id: optionalIdSchema,
  amount: z.coerce.number().positive().optional(),
  quantity: z.coerce.number().positive().default(1),
  as_of: datetimeSchema,
});

export const getProductDiscountsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort_by: z
    .enum(Object.values(PRODUCT_DISCOUNT_SORT_FIELDS))
    .default(PRODUCT_DISCOUNT_SORT_FIELDS.ID),
  sort_order: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('desc'),
  company_id: idSchema.optional(),
  product_id: idSchema.optional(),
  variant_id: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      if (val === null || val === '' || val === 'null') return null;
      return String(val);
    }),
  discount_id: idSchema.optional(),
  is_primary: z
    .enum(['true', 'false', 'TRUE', 'FALSE'])
    .transform((val) => val.toLowerCase() === 'true')
    .optional(),
  is_active: z
    .enum(['true', 'false', 'TRUE', 'FALSE'])
    .transform((val) => val.toLowerCase() === 'true')
    .optional(),
});
