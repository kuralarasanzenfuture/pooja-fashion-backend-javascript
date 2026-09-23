import { z } from 'zod';
import {
  PRICE_TYPES,
  PRODUCT_PRICE_SORT_FIELDS,
  PRODUCT_PRICE_HISTORY_SORT_FIELDS,
} from './productPrice.types.js';

const idSchema = z
  .union([z.string().regex(/^\d+$/, 'Must be a numeric string'), z.number().int().positive()])
  .transform((val) => String(val));

const optionalNumberSchema = z
  .union([z.string(), z.number()])
  .optional()
  .nullable()
  .transform((val) => {
    if (val === null || val === undefined || val === '') return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  })
  .refine((val) => val === null || val >= 0, {
    message: 'Price must be greater than or equal to 0',
  });

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

export const priceIdParamSchema = z.object({
  id: idSchema,
});

export const variantIdParamSchema = z.object({
  variantId: idSchema,
});

export const createProductPriceSchema = z
  .object({
    company_id: idSchema,
    product_id: idSchema,
    variant_id: idSchema,
    price_type: z
      .string()
      .trim()
      .min(1, 'Price type is required')
      .max(30, 'Price type must not exceed 30 characters')
      .toUpperCase(),
    purchase_price: optionalNumberSchema.default(null),
    cost_price: optionalNumberSchema.default(null),
    mrp: optionalNumberSchema.default(null),
    selling_price: optionalNumberSchema.default(null),
    min_selling_price: optionalNumberSchema.default(null),
    currency_code: z
      .string()
      .trim()
      .length(3, 'Currency code must be 3 characters')
      .toUpperCase()
      .default('INR'),
    effective_from: datetimeSchema.default(null),
    effective_to: datetimeSchema.default(null),
    is_active: z.boolean().optional().default(true),
    reason: z.string().trim().max(255).optional().nullable().default(null),
  })
  .superRefine((data, ctx) => {
    // 1. effective_to must be after effective_from
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

    // 2. selling_price cannot exceed mrp
    if (
      data.mrp !== null &&
      data.selling_price !== null &&
      data.selling_price > data.mrp
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['selling_price'],
        message: 'selling_price cannot exceed mrp',
      });
    }

    // 3. min_selling_price cannot exceed selling_price
    if (
      data.selling_price !== null &&
      data.min_selling_price !== null &&
      data.min_selling_price > data.selling_price
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['min_selling_price'],
        message: 'min_selling_price cannot exceed selling_price',
      });
    }
  });

export const updateProductPriceSchema = z
  .object({
    price_type: z
      .string()
      .trim()
      .min(1)
      .max(30)
      .toUpperCase()
      .optional(),
    purchase_price: optionalNumberSchema,
    cost_price: optionalNumberSchema,
    mrp: optionalNumberSchema,
    selling_price: optionalNumberSchema,
    min_selling_price: optionalNumberSchema,
    currency_code: z
      .string()
      .trim()
      .length(3)
      .toUpperCase()
      .optional(),
    effective_from: datetimeSchema,
    effective_to: datetimeSchema,
    is_active: z.boolean().optional(),
    reason: z.string().trim().max(255).optional().nullable(),
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
    if (
      data.mrp !== undefined &&
      data.mrp !== null &&
      data.selling_price !== undefined &&
      data.selling_price !== null &&
      data.selling_price > data.mrp
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['selling_price'],
        message: 'selling_price cannot exceed mrp',
      });
    }
    if (
      data.selling_price !== undefined &&
      data.selling_price !== null &&
      data.min_selling_price !== undefined &&
      data.min_selling_price !== null &&
      data.min_selling_price > data.selling_price
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['min_selling_price'],
        message: 'min_selling_price cannot exceed selling_price',
      });
    }
  });

export const updatePriceStatusSchema = z.object({
  is_active: z.boolean(),
  reason: z.string().trim().max(255).optional().nullable(),
});

export const getCurrentPriceQuerySchema = z.object({
  variant_id: idSchema,
  price_type: z.string().trim().toUpperCase().optional().default(PRICE_TYPES.RETAIL),
  as_of: datetimeSchema,
});

export const getProductPricesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort_by: z
    .enum(Object.values(PRODUCT_PRICE_SORT_FIELDS))
    .default(PRODUCT_PRICE_SORT_FIELDS.EFFECTIVE_FROM),
  sort_order: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('desc'),
  search: z.string().trim().optional(),
  company_id: idSchema.optional(),
  product_id: idSchema.optional(),
  variant_id: idSchema.optional(),
  price_type: z.string().trim().toUpperCase().optional(),
  is_active: z
    .enum(['true', 'false', 'TRUE', 'FALSE'])
    .transform((val) => val.toLowerCase() === 'true')
    .optional(),
  currency_code: z.string().trim().toUpperCase().optional(),
});

export const getPriceHistoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort_by: z
    .enum(Object.values(PRODUCT_PRICE_HISTORY_SORT_FIELDS))
    .default(PRODUCT_PRICE_HISTORY_SORT_FIELDS.CHANGED_AT),
  sort_order: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('desc'),
  company_id: idSchema.optional(),
  product_id: idSchema.optional(),
  variant_id: idSchema.optional(),
  product_price_id: idSchema.optional(),
  price_type: z.string().trim().toUpperCase().optional(),
  date_from: datetimeSchema,
  date_to: datetimeSchema,
});
