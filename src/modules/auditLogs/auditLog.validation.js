import { z } from 'zod';

export const ALLOWED_ACTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'RESTORE',
  'ACTIVATE',
  'DEACTIVATE',
  'LOGIN',
  'LOGOUT',
  'LOGIN_FAILED',
  'PASSWORD_CHANGE',
  'PASSWORD_RESET',
  'APPROVE',
  'REJECT',
  'SUBMIT',
  'CANCEL',
  'EXPORT',
  'IMPORT',
  'DOWNLOAD',
  'UPLOAD',
  'PRINT',
  'VIEW',
];

export const getAuditLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  company_id: z.coerce.number().int().positive().optional(),
  companyId: z.coerce.number().int().positive().optional(),
  branch_id: z.coerce.number().int().positive().optional(),
  branchId: z.coerce.number().int().positive().optional(),
  user_id: z.coerce.number().int().positive().optional(),
  userId: z.coerce.number().int().positive().optional(),
  action: z
    .string()
    .trim()
    .toUpperCase()
    .refine((val) => ALLOWED_ACTIONS.includes(val), {
      message: `Action must be one of: ${ALLOWED_ACTIONS.join(', ')}`,
    })
    .optional(),
  module: z.string().trim().optional(),
  entity_type: z.string().trim().optional(),
  entityType: z.string().trim().optional(),
  entity_id: z.coerce.number().int().positive().optional(),
  entityId: z.coerce.number().int().positive().optional(),
  status: z
    .string()
    .trim()
    .toLowerCase()
    .refine((val) => ['success', 'failed'].includes(val), {
      message: "Status must be either 'success' or 'failed'",
    })
    .optional(),
  start_date: z.string().trim().optional(),
  startDate: z.string().trim().optional(),
  end_date: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  search: z.string().trim().optional(),
  sortBy: z
    .string()
    .trim()
    .refine(
      (val) =>
        ['id', 'created_at', 'action', 'module', 'entity_type', 'status', 'company_id'].includes(
          val
        ),
      {
        message: 'Invalid sortBy column',
      }
    )
    .default('created_at'),
  sortOrder: z
    .string()
    .trim()
    .toUpperCase()
    .refine((val) => ['ASC', 'DESC'].includes(val), {
      message: "sortOrder must be 'ASC' or 'DESC'",
    })
    .default('DESC'),
});

export const auditLogIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Audit log ID must be a positive integer'),
});

export const entityAuditParamsSchema = z.object({
  entityType: z.string().trim().min(1, 'Entity type is required'),
  entityId: z.coerce.number().int().positive('Entity ID must be a positive integer'),
});

export default {
  ALLOWED_ACTIONS,
  getAuditLogsQuerySchema,
  auditLogIdParamSchema,
  entityAuditParamsSchema,
};
