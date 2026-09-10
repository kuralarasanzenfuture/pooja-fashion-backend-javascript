import {
  generateRoleCode,
  sanitizeRoleCode,
  isSystemRole,
  DEFAULT_SYSTEM_ROLES,
} from '../../src/modules/roles/role.utils.js';

describe('Roles Utility & Auto Code Generation', () => {
  describe('DEFAULT_SYSTEM_ROLES', () => {
    it('should include SUPERADMIN and ADMIN system roles', () => {
      const roleCodes = DEFAULT_SYSTEM_ROLES.map((r) => r.role_code);
      expect(roleCodes).toContain('SUPERADMIN');
      expect(roleCodes).toContain('ADMIN');

      const superadmin = DEFAULT_SYSTEM_ROLES.find((r) => r.role_code === 'SUPERADMIN');
      expect(superadmin.is_system_role).toBe(true);

      const admin = DEFAULT_SYSTEM_ROLES.find((r) => r.role_code === 'ADMIN');
      expect(admin.is_system_role).toBe(true);
    });
  });

  describe('sanitizeRoleCode', () => {
    it('should convert strings to uppercase alphanumeric with single underscores', () => {
      expect(sanitizeRoleCode('sales-rep')).toBe('SALES_REP');
      expect(sanitizeRoleCode('store   manager!')).toBe('STORE_MANAGER');
      expect(sanitizeRoleCode('__custom__role__')).toBe('CUSTOM_ROLE');
    });
  });

  describe('generateRoleCode - Meaningful Auto Generation', () => {
    it('should map semantic role names to standard codes', () => {
      expect(generateRoleCode({ roleName: 'Super Admin' })).toBe('SUPERADMIN');
      expect(generateRoleCode({ roleName: 'Administrator' })).toBe('ADMIN');
      expect(generateRoleCode({ roleName: 'Store Manager' })).toBe('STORE_MANAGER');
      expect(generateRoleCode({ roleName: 'Branch Manager' })).toBe('BRANCH_MANAGER');
      expect(generateRoleCode({ roleName: 'Cashier' })).toBe('CASHIER');
      expect(generateRoleCode({ roleName: 'Sales Executive' })).toBe('SALES_EXECUTIVE');
      expect(generateRoleCode({ roleName: 'Inventory Manager' })).toBe('INVENTORY_MANAGER');
      expect(generateRoleCode({ roleName: 'Accountant' })).toBe('ACCOUNTANT');
    });

    it('should convert custom role names to clean uppercase snake_case', () => {
      expect(generateRoleCode({ roleName: 'Senior Fashion Designer' })).toBe(
        'SENIOR_FASHION_DESIGNER'
      );
      expect(generateRoleCode({ roleName: 'Quality Control Lead' })).toBe('QUALITY_CONTROL_LEAD');
    });

    it('should handle duplicates by appending sequential numbers', () => {
      const existing = ['CASHIER', 'CASHIER_01'];
      const generated = generateRoleCode({ roleName: 'Cashier', existingCodes: existing });
      expect(generated).toBe('CASHIER_02');
    });

    it('should throw if roleName is missing', () => {
      expect(() => generateRoleCode({ roleName: '' })).toThrow();
    });
  });

  describe('isSystemRole', () => {
    it('should correctly identify system roles', () => {
      expect(isSystemRole({ is_system_role: true })).toBe(true);
      expect(isSystemRole({ isSystemRole: true })).toBe(true);
      expect(isSystemRole({ is_system_role: false })).toBe(false);
      expect(isSystemRole({})).toBe(false);
      expect(isSystemRole(null)).toBe(false);
    });
  });
});
