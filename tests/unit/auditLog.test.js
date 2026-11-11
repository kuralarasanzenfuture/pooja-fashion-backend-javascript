import { jest } from '@jest/globals';
import {
  diffRecords,
  toFieldLabel,
  detectDataType,
  formatChangeValue,
  sanitizeIpAddress,
  sanitizeUuid,
  canUserSelectCompany,
  recordAuditLog,
} from '../../src/modules/auditLogs/auditLog.service.js';
import {
  toAuditLogDTO,
  toAuditLogListDTO,
  toAuditLogChangeDTO,
  toAuditLogChangeListDTO,
} from '../../src/modules/auditLogs/auditLog.mapper.js';
import {
  ALLOWED_ACTIONS,
  getAuditLogsQuerySchema,
  auditLogIdParamSchema,
  entityAuditParamsSchema,
} from '../../src/modules/auditLogs/auditLog.validation.js';

describe('Global Audit Logging Unit Tests', () => {
  describe('toFieldLabel & Data Type Helpers', () => {
    it('should format snake_case field names into title labels', () => {
      expect(toFieldLabel('category_name')).toBe('Category Name');
      expect(toFieldLabel('subcategory_code')).toBe('Subcategory Code');
      expect(toFieldLabel('is_active')).toBe('Active Status');
      expect(toFieldLabel('display_order')).toBe('Display Order');
      expect(toFieldLabel('custom_tax_rate')).toBe('Custom Tax Rate');
    });

    it('should detect data types accurately', () => {
      expect(detectDataType(true)).toBe('boolean');
      expect(detectDataType(false)).toBe('boolean');
      expect(detectDataType(100)).toBe('integer');
      expect(detectDataType(19.99)).toBe('decimal');
      expect(detectDataType('Short text')).toBe('string');
      expect(detectDataType('A'.repeat(300))).toBe('text');
      expect(detectDataType({ a: 1 })).toBe('json');
      expect(detectDataType([1, 2, 3])).toBe('array');
      expect(detectDataType('2026-11-11T10:00:00.000Z')).toBe('timestamp');
      expect(detectDataType(null)).toBeNull();
    });

    it('should format values to string representation for text columns', () => {
      expect(formatChangeValue(true)).toBe('true');
      expect(formatChangeValue(false)).toBe('false');
      expect(formatChangeValue(42)).toBe('42');
      expect(formatChangeValue('hello')).toBe('hello');
      expect(formatChangeValue({ key: 'val' })).toBe('{"key":"val"}');
      expect(formatChangeValue(null)).toBeNull();
      expect(formatChangeValue(undefined)).toBeNull();
    });
  });

  describe('Sanitization Helpers', () => {
    it('should validate and sanitize IPv4 and IPv6 addresses for PostgreSQL INET', () => {
      expect(sanitizeIpAddress('127.0.0.1')).toBe('127.0.0.1');
      expect(sanitizeIpAddress('192.168.1.10')).toBe('192.168.1.10');
      expect(sanitizeIpAddress('::ffff:192.168.1.10')).toBe('192.168.1.10');
      expect(sanitizeIpAddress('::1')).toBe('::1');
      expect(sanitizeIpAddress('invalid-ip')).toBeNull();
      expect(sanitizeIpAddress('999.999.999.999')).toBeNull();
      expect(sanitizeIpAddress('')).toBeNull();
      expect(sanitizeIpAddress(null)).toBeNull();
    });

    it('should validate UUIDs for PostgreSQL UUID columns', () => {
      expect(sanitizeUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(
        '550e8400-e29b-41d4-a716-446655440000'
      );
      expect(sanitizeUuid('not-a-uuid')).toBeNull();
      expect(sanitizeUuid(null)).toBeNull();
      expect(sanitizeUuid('')).toBeNull();
    });

    it('should check company selection permission based on user role', () => {
      expect(canUserSelectCompany({ roleCode: 'SUPERADMIN' })).toBe(true);
      expect(canUserSelectCompany({ role: 'admin', companyId: null })).toBe(true);
      expect(canUserSelectCompany({ role: 'admin', companyId: 5 })).toBe(false);
      expect(canUserSelectCompany({ role: 'manager', companyId: 1 })).toBe(false);
      expect(canUserSelectCompany(null)).toBe(false);
    });
  });

  describe('diffRecords Function', () => {
    it('should return empty diff when both old and new are null', () => {
      const result = diffRecords(null, null);
      expect(result.changes).toEqual([]);
      expect(result.changeData).toEqual({});
    });

    it('should detect created fields on CREATE action (oldData null, newData defined)', () => {
      const newData = {
        id: 10,
        category_code: 'SAREES',
        category_name: 'Designer Sarees',
        display_order: 1,
        is_active: true,
        created_at: '2026-11-11T00:00:00Z',
      };

      const result = diffRecords(null, newData);
      // Ignored fields like id, created_at should not be in changes
      const fieldNames = result.changes.map((c) => c.field_name);
      expect(fieldNames).toContain('category_code');
      expect(fieldNames).toContain('category_name');
      expect(fieldNames).toContain('display_order');
      expect(fieldNames).toContain('is_active');
      expect(fieldNames).not.toContain('id');
      expect(fieldNames).not.toContain('created_at');

      const nameChange = result.changes.find((c) => c.field_name === 'category_name');
      expect(nameChange).toEqual({
        field_name: 'category_name',
        field_label: 'Category Name',
        data_type: 'string',
        old_value: null,
        new_value: 'Designer Sarees',
      });
    });

    it('should detect field changes on UPDATE action (both oldData and newData defined)', () => {
      const oldData = {
        id: 10,
        category_code: 'SAREES',
        category_name: 'Old Sarees',
        display_order: 1,
        is_active: true,
        updated_at: '2026-11-10T00:00:00Z',
      };

      const newData = {
        id: 10,
        category_code: 'SAREES',
        category_name: 'New Designer Sarees',
        display_order: 5,
        is_active: false,
        updated_at: '2026-11-11T00:00:00Z',
      };

      const result = diffRecords(oldData, newData);
      const fieldNames = result.changes.map((c) => c.field_name);

      expect(fieldNames).toContain('category_name');
      expect(fieldNames).toContain('display_order');
      expect(fieldNames).toContain('is_active');
      expect(fieldNames).not.toContain('category_code'); // Unchanged
      expect(fieldNames).not.toContain('updated_at'); // Ignored metadata

      const statusChange = result.changes.find((c) => c.field_name === 'is_active');
      expect(statusChange).toEqual({
        field_name: 'is_active',
        field_label: 'Active Status',
        data_type: 'boolean',
        old_value: 'true',
        new_value: 'false',
      });

      expect(result.changeData.category_name).toEqual({
        old: 'Old Sarees',
        new: 'New Designer Sarees',
      });
      expect(result.changeData.display_order).toEqual({
        old: 1,
        new: 5,
      });
    });

    it('should avoid duplicate field changes when both camelCase and snake_case exist', () => {
      const oldData = {
        category_name: 'Old Name',
        categoryName: 'Old Name',
      };
      const newData = {
        category_name: 'New Name',
        categoryName: 'New Name',
      };

      const result = diffRecords(oldData, newData);
      expect(result.changes.length).toBe(1);
      expect(result.changes[0].field_name).toBe('category_name');
    });

    it('should detect deletion fields when newData is null', () => {
      const oldData = {
        id: 10,
        subcategory_name: 'Cotton Sarees',
        is_active: true,
      };

      const result = diffRecords(oldData, null);
      const fieldNames = result.changes.map((c) => c.field_name);
      expect(fieldNames).toContain('subcategory_name');
      expect(fieldNames).toContain('is_active');

      const nameChange = result.changes.find((c) => c.field_name === 'subcategory_name');
      expect(nameChange.old_value).toBe('Cotton Sarees');
      expect(nameChange.new_value).toBeNull();
    });
  });

  describe('Audit Log Mapper', () => {
    it('should map database row to client DTO format with camelCase and snake_case', () => {
      const dbRow = {
        id: '1',
        company_id: '2',
        company_name: 'Pooja Fashion',
        company_code: 'PF-01',
        branch_id: '3',
        branch_name: 'Main Branch',
        user_id: '4',
        user_email: 'admin@poojafashion.com',
        action: 'CREATE',
        module: 'categories',
        entity_type: 'Category',
        entity_id: '15',
        entity_name: 'Bridal Lehengas',
        description: 'Category "Bridal Lehengas" created',
        old_data: null,
        new_data: { id: 15, name: 'Bridal Lehengas' },
        change_data: { name: { old: null, new: 'Bridal Lehengas' } },
        request_id: 'req-12345',
        request_method: 'POST',
        request_url: '/api/product-master/categories',
        ip_address: '127.0.0.1',
        user_agent: 'Mozilla/5.0 Chrome/120',
        device_type: 'Desktop',
        device_name: 'Windows 11 (Chrome)',
        operating_system: 'Windows',
        browser: 'Chrome',
        browser_version: '120.0',
        status: 'success',
        error_message: null,
        created_at: '2026-11-11T10:00:00.000Z',
      };

      const changes = [
        {
          id: '101',
          audit_log_id: '1',
          field_name: 'category_name',
          field_label: 'Category Name',
          data_type: 'string',
          old_value: null,
          new_value: 'Bridal Lehengas',
          created_at: '2026-11-11T10:00:00.000Z',
        },
      ];

      const dto = toAuditLogDTO(dbRow, changes);

      expect(dto.id).toBe(1);
      expect(dto.companyId).toBe(2);
      expect(dto.company_id).toBe(2);
      expect(dto.action).toBe('CREATE');
      expect(dto.module).toBe('categories');
      expect(dto.entityType).toBe('Category');
      expect(dto.entityId).toBe(15);
      expect(dto.entityName).toBe('Bridal Lehengas');
      expect(dto.requestId).toBe('req-12345');
      expect(dto.status).toBe('success');
      expect(dto.changes).toHaveLength(1);
      expect(dto.changes[0].fieldName).toBe('category_name');
      expect(dto.changes[0].fieldLabel).toBe('Category Name');
      expect(dto.changes[0].newValue).toBe('Bridal Lehengas');
    });

    it('should map audit log list cleanly', () => {
      const rows = [
        { id: 1, action: 'CREATE', module: 'categories', entity_type: 'Category' },
        { id: 2, action: 'UPDATE', module: 'subcategories', entity_type: 'SubCategory' },
      ];
      const list = toAuditLogListDTO(rows);
      expect(list).toHaveLength(2);
      expect(list[0].id).toBe(1);
      expect(list[1].id).toBe(2);
      expect(toAuditLogListDTO(null)).toEqual([]);
    });

    it('should map audit log change row to DTO', () => {
      const row = {
        id: '5',
        audit_log_id: '12',
        field_name: 'is_active',
        field_label: 'Active Status',
        data_type: 'boolean',
        old_value: 'true',
        new_value: 'false',
        created_at: '2026-11-11T10:00:00.000Z',
      };

      const changeDTO = toAuditLogChangeDTO(row);
      expect(changeDTO).toEqual({
        id: 5,
        auditLogId: 12,
        audit_log_id: 12,
        fieldName: 'is_active',
        field_name: 'is_active',
        fieldLabel: 'Active Status',
        field_label: 'Active Status',
        dataType: 'boolean',
        data_type: 'boolean',
        oldValue: 'true',
        old_value: 'true',
        newValue: 'false',
        new_value: 'false',
        createdAt: '2026-11-11T10:00:00.000Z',
        created_at: '2026-11-11T10:00:00.000Z',
      });
      expect(toAuditLogChangeListDTO(null)).toEqual([]);
    });
  });

  describe('Validation Schemas', () => {
    it('should validate getAuditLogsQuerySchema with defaults', async () => {
      const query = {};
      const parsed = await getAuditLogsQuerySchema.parseAsync(query);
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(10);
      expect(parsed.sortBy).toBe('created_at');
      expect(parsed.sortOrder).toBe('DESC');
    });

    it('should validate query filters with action, module, status, dates', async () => {
      const query = {
        page: '2',
        limit: '25',
        company_id: '3',
        action: 'create',
        module: 'categories',
        status: 'SUCCESS',
        sortBy: 'action',
        sortOrder: 'asc',
      };
      const parsed = await getAuditLogsQuerySchema.parseAsync(query);
      expect(parsed.page).toBe(2);
      expect(parsed.limit).toBe(25);
      expect(parsed.company_id).toBe(3);
      expect(parsed.action).toBe('CREATE');
      expect(parsed.module).toBe('categories');
      expect(parsed.status).toBe('success');
      expect(parsed.sortBy).toBe('action');
      expect(parsed.sortOrder).toBe('ASC');
    });

    it('should reject invalid actions in query', async () => {
      await expect(
        getAuditLogsQuerySchema.parseAsync({ action: 'INVALID_ACTION' })
      ).rejects.toThrow();
    });

    it('should validate auditLogIdParamSchema', async () => {
      const valid = await auditLogIdParamSchema.parseAsync({ id: '42' });
      expect(valid.id).toBe(42);

      await expect(auditLogIdParamSchema.parseAsync({ id: 'abc' })).rejects.toThrow();
      await expect(auditLogIdParamSchema.parseAsync({ id: '-5' })).rejects.toThrow();
    });

    it('should validate entityAuditParamsSchema', async () => {
      const valid = await entityAuditParamsSchema.parseAsync({
        entityType: 'Category',
        entityId: '7',
      });
      expect(valid.entityType).toBe('Category');
      expect(valid.entityId).toBe(7);
    });
  });

  describe('recordAuditLog Integration Logic', () => {
    it('should successfully compute diffs and call repository insertion methods', async () => {
      const mockInsertedLog = {
        id: 99,
        company_id: 1,
        branch_id: null,
        user_id: 5,
        employee_id: null,
        session_id: null,
        action: 'UPDATE',
        module: 'categories',
        entity_type: 'Category',
        entity_id: 12,
        entity_name: 'Silk Sarees',
        description: 'Category "Silk Sarees" updated',
        old_data: { id: 12, category_name: 'Old Sarees', is_active: true },
        new_data: { id: 12, category_name: 'Silk Sarees', is_active: true },
        change_data: { category_name: { old: 'Old Sarees', new: 'Silk Sarees' } },
        request_id: 'test-req-id',
        status: 'success',
        created_at: new Date().toISOString(),
      };

      const mockRepo = {
        insertAuditLog: jest.fn().mockResolvedValue(mockInsertedLog),
        insertAuditLogChanges: jest.fn().mockResolvedValue([
          {
            id: 201,
            audit_log_id: 99,
            field_name: 'category_name',
            field_label: 'Category Name',
            data_type: 'string',
            old_value: 'Old Sarees',
            new_value: 'Silk Sarees',
            created_at: new Date().toISOString(),
          },
        ]),
      };

      const result = await recordAuditLog(
        {
          action: 'UPDATE',
          module: 'categories',
          entityType: 'Category',
          entityId: 12,
          entityName: 'Silk Sarees',
          companyId: 1,
          userId: 5,
          oldData: { category_name: 'Old Sarees', is_active: true },
          newData: { category_name: 'Silk Sarees', is_active: true },
          requestContext: {
            requestId: 'test-req-id',
            method: 'PUT',
            url: '/api/product-master/categories/12',
            ipAddress: '127.0.0.1',
          },
        },
        mockRepo
      );

      expect(mockRepo.insertAuditLog).toHaveBeenCalled();
      expect(mockRepo.insertAuditLogChanges).toHaveBeenCalled();
      expect(result.id).toBe(99);
      expect(result.action).toBe('UPDATE');
      expect(result.module).toBe('categories');
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].fieldName).toBe('category_name');
      expect(result.changes[0].newValue).toBe('Silk Sarees');
    });

    it('should gracefully handle DB failures without crashing', async () => {
      const failingRepo = {
        insertAuditLog: jest.fn().mockRejectedValue(new Error('Connection lost')),
      };

      const result = await recordAuditLog(
        {
          action: 'CREATE',
          module: 'categories',
          entityType: 'Category',
          entityId: 1,
          newData: { name: 'Test' },
        },
        failingRepo
      );

      expect(result.status).toBe('unpersisted');
      expect(result.error).toBe('Connection lost');
    });
  });
});
