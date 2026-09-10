import { describe, it, expect } from '@jest/globals';
import {
  getCompanyPrefix,
  getDepartmentCode,
  sanitizeEmployeeCode,
  generateEmployeeCode,
  resolvePhotoFilename,
} from '../../src/modules/employees/employee.utils.js';

describe('Employee Utils Unit Tests', () => {
  describe('getCompanyPrefix', () => {
    it('should derive prefix from company_code stripping digits', () => {
      expect(getCompanyPrefix({ company_code: 'PFS001' })).toBe('PFS');
      expect(getCompanyPrefix({ company_code: 'ABC' })).toBe('ABC');
    });

    it('should derive prefix from company_name initials if company_code missing', () => {
      expect(getCompanyPrefix({ company_name: 'Pooja Fashion Store' })).toBe('PFS');
      expect(getCompanyPrefix({ company_name: 'Zen Future Retail' })).toBe('ZFR');
    });

    it('should return default PFS if no company provided', () => {
      expect(getCompanyPrefix(null)).toBe('PFS');
    });
  });

  describe('getDepartmentCode', () => {
    it('should map known departments to standard codes', () => {
      expect(getDepartmentCode('sales')).toBe('SALES');
      expect(getDepartmentCode('Sales')).toBe('SALES');
      expect(getDepartmentCode('accounts')).toBe('ACC');
      expect(getDepartmentCode('finance')).toBe('FIN');
      expect(getDepartmentCode('inventory')).toBe('INV');
      expect(getDepartmentCode('management')).toBe('MGT');
      expect(getDepartmentCode('billing')).toBe('POS');
    });

    it('should return EMP if department is empty or unknown short string', () => {
      expect(getDepartmentCode(null)).toBe('EMP');
      expect(getDepartmentCode('')).toBe('EMP');
    });
  });

  describe('sanitizeEmployeeCode', () => {
    it('should sanitize, uppercase, and trim input codes', () => {
      expect(sanitizeEmployeeCode(' pfs-emp-001 ')).toBe('PFS-EMP-001');
      expect(sanitizeEmployeeCode('pfs@emp#002')).toBe('PFS_EMP_002');
    });

    it('should return empty string for non-string input', () => {
      expect(sanitizeEmployeeCode(null)).toBe('');
    });
  });

  describe('generateEmployeeCode', () => {
    const company = { company_code: 'PFS', company_name: 'Pooja Fashion' };

    it('should generate PFS-EMP001 when existing codes list is empty', () => {
      const code = generateEmployeeCode({ company, existingCodes: [] });
      expect(code).toBe('PFS-EMP001');
    });

    it('should increment sequence when collision exists', () => {
      const code = generateEmployeeCode({
        company,
        existingCodes: ['PFS-EMP001', 'PFS-EMP002'],
      });
      expect(code).toBe('PFS-EMP003');
    });

    it('should support department-based code generation when requested', () => {
      const code = generateEmployeeCode({
        company,
        department: 'sales',
        existingCodes: [],
        useDepartmentCode: true,
      });
      expect(code).toBe('PFS-SALES-001');
    });
  });

  describe('resolvePhotoFilename', () => {
    it('should prioritize username when available', () => {
      const filename = resolvePhotoFilename({
        username: 'kural_admin',
        employeeCode: 'PFS-EMP001',
        firstName: 'Kural',
        originalname: 'my-avatar.png',
      });
      expect(filename).toMatch(/^kural-admin-photo-\d+\.png$/);
    });

    it('should fallback to employee code when username is absent', () => {
      const filename = resolvePhotoFilename({
        employeeCode: 'PFS-EMP005',
        firstName: 'John',
        originalname: 'photo.jpg',
      });
      expect(filename).toMatch(/^pfs-emp005-photo-\d+\.jpg$/);
    });

    it('should fallback to name slug when both username and code are absent', () => {
      const filename = resolvePhotoFilename({
        firstName: 'Pooja',
        lastName: 'Sharma',
        originalname: 'selfie.webp',
      });
      expect(filename).toMatch(/^pooja-sharma-photo-\d+\.webp$/);
    });
  });
});
