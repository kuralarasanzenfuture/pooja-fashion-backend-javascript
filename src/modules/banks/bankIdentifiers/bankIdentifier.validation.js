import { z } from 'zod';

export const identifierTypeEnum = z.preprocess(
  (val) => (typeof val === 'string' ? val.trim().toLowerCase().replace(/[-\s]+/g, '_') : val),
  z.enum(['ifsc', 'micr', 'swift', 'bank_code', 'routing_number', 'other'], {
    errorMap: () => ({
      message: 'Invalid identifier type. Allowed: ifsc, micr, swift, bank_code, routing_number, other',
    }),
  })
);

const optionalTrimmedString = (maxLen) =>
  z.preprocess((val) => {
    if (val === undefined) return undefined;
    if (val === null) return null;
    if (typeof val === 'string') {
      const t = val.trim();
      return t.length > 0 ? t : null;
    }
    return val;
  }, z.string().max(maxLen).nullable().optional());

const booleanCoerce = (defaultValue) =>
  z.preprocess((val) => {
    if (val === undefined) return defaultValue;
    if (typeof val === 'boolean') return val;
    if (val === 'true' || val === '1' || val === 1) return true;
    if (val === 'false' || val === '0' || val === 0) return false;
    return val;
  }, defaultValue !== undefined ? z.boolean().default(defaultValue) : z.boolean().optional());

const normalizeIdentifierPayload = (data) => {
  if (!data || typeof data !== 'object') return data;
  const n = { ...data };

  if (n.bankId !== undefined && n.bank_id === undefined) n.bank_id = n.bankId;
  if (n.identifierType !== undefined && n.identifier_type === undefined) n.identifier_type = n.identifierType;
  if (n.identifierValue !== undefined && n.identifier_value === undefined) n.identifier_value = n.identifierValue;
  if (n.branchName !== undefined && n.branch_name === undefined) n.branch_name = n.branchName;
  if (n.isActive !== undefined && n.is_active === undefined) n.is_active = n.isActive;

  return n;
};

const baseCreateBankIdentifierSchema = z.object({
  bank_id: z.coerce.number().int().positive('Bank ID must be a positive integer'),
  identifier_type: identifierTypeEnum,
  identifier_value: z
    .string({ required_error: 'Identifier value is required' })
    .trim()
    .min(1, 'Identifier value is required')
    .max(100, 'Identifier value cannot exceed 100 characters')
    .transform((val) => val.toUpperCase()),
  branch_name: optionalTrimmedString(150),
  city: optionalTrimmedString(100),
  state: optionalTrimmedString(100),
  is_active: booleanCoerce(true),
});

export const createBankIdentifierSchema = z.preprocess(
  normalizeIdentifierPayload,
  baseCreateBankIdentifierSchema
);

export const updateBankIdentifierSchema = z.preprocess(
  normalizeIdentifierPayload,
  baseCreateBankIdentifierSchema.partial()
);

const normalizeStatusPayload = (data) => {
  if (!data || typeof data !== 'object') return data;
  const n = { ...data };
  if (n.isActive !== undefined && n.is_active === undefined) n.is_active = n.isActive;
  if (n.status !== undefined && n.is_active === undefined) {
    if (typeof n.status === 'string') {
      n.is_active = n.status.toLowerCase() === 'active';
    } else {
      n.is_active = Boolean(n.status);
    }
  }
  return n;
};

export const updateStatusSchema = z.preprocess(
  normalizeStatusPayload,
  z.object({
    is_active: z.preprocess((val) => {
      if (typeof val === 'boolean') return val;
      if (val === 'true' || val === '1' || val === 1) return true;
      if (val === 'false' || val === '0' || val === 0) return false;
      return val;
    }, z.boolean({ required_error: 'is_active is required' })),
  })
);

export const identifierIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Identifier ID must be a positive integer'),
});

export const bankIdParamSchema = z.object({
  bankId: z.coerce.number().int().positive('Bank ID must be a positive integer'),
});

export const identifierValueParamSchema = z.object({
  identifierValue: z.string().trim().min(1, 'Identifier value is required'),
});

const normalizeQueryPayload = (query) => {
  if (!query || typeof query !== 'object') return query;
  const n = { ...query };
  if (n.bankId !== undefined && n.bank_id === undefined) n.bank_id = n.bankId;
  if (n.identifierType !== undefined && n.identifier_type === undefined) n.identifier_type = n.identifierType;
  if (n.isActive !== undefined && n.is_active === undefined) n.is_active = n.isActive;

  ['bank_id', 'identifier_type', 'is_active', 'search'].forEach((key) => {
    if (n[key] === '') delete n[key];
  });
  return n;
};

export const getBankIdentifiersQuerySchema = z.preprocess(
  normalizeQueryPayload,
  z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    bank_id: z.coerce.number().int().positive().optional(),
    identifier_type: identifierTypeEnum.optional(),
    is_active: z
      .preprocess((val) => {
        if (typeof val === 'boolean') return val;
        if (val === 'true' || val === '1' || val === 1) return true;
        if (val === 'false' || val === '0' || val === 0) return false;
        return undefined;
      }, z.boolean().optional())
      .optional(),
    search: z.string().trim().optional(),
    sortBy: z
      .enum([
        'id',
        'bank_id',
        'bankId',
        'identifier_type',
        'identifierType',
        'identifier_value',
        'identifierValue',
        'branch_name',
        'branchName',
        'city',
        'state',
        'created_at',
        'createdAt',
        'is_active',
        'isActive',
      ])
      .default('created_at'),
    sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).default('desc'),
  })
);

export default {
  identifierTypeEnum,
  createBankIdentifierSchema,
  updateBankIdentifierSchema,
  updateStatusSchema,
  identifierIdParamSchema,
  bankIdParamSchema,
  identifierValueParamSchema,
  getBankIdentifiersQuerySchema,
};
