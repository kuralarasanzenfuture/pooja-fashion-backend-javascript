import {
  generateSizeGroupCode,
  DEFAULT_SIZE_GROUPS,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
  toSlug,
} from '../../src/modules/product-master/sizeGroups/sizeGroup.service.js';
import * as sizeGroupUtils from '../../src/modules/product-master/sizeGroups/utils/index.js';
import {
  toSizeGroupDTO,
  toSizeGroupListDTO,
} from '../../src/modules/product-master/sizeGroups/sizeGroup.mapper.js';
import {
  createSizeGroupSchema,
  updateSizeGroupSchema,
  getSizeGroupsQuerySchema,
  getAllSizeGroupsQuerySchema,
  getSizeGroupStatsQuerySchema,
  getSizeGroupTreeQuerySchema,
  checkSizeGroupNameQuerySchema,
  checkSizeGroupCodeQuerySchema,
  seedDefaultSizeGroupsSchema,
} from '../../src/modules/product-master/sizeGroups/sizeGroup.validation.js';

describe('Product Master: Size Groups Unit Tests', () => {
  describe('DEFAULT_SIZE_GROUPS', () => {
    it('should include standard apparel sizing groups', () => {
      const names = DEFAULT_SIZE_GROUPS.map((g) => g.name);
      expect(names).toContain('Men');
      expect(names).toContain('Women');
      expect(names).toContain('Kids');
      expect(names).toContain('Infants');
      expect(names).toContain('Footwear');
    });
  });

  describe('generateSizeGroupCode', () => {
    it('should generate uppercase snake_case size group code from name', () => {
      expect(generateSizeGroupCode('Men')).toBe('MEN');
      expect(generateSizeGroupCode("Women's Ethnic & Western")).toBe('WOMEN_S_ETHNIC_WESTERN');
      expect(generateSizeGroupCode('Kids-Apparel')).toBe('KIDS_APPAREL');
    });

    it('should limit code length to 50 characters', () => {
      const longName = 'S'.repeat(80);
      const code = generateSizeGroupCode(longName);
      expect(code.length).toBeLessThanOrEqual(50);
    });

    it('should handle non-string or empty input safely', () => {
      expect(generateSizeGroupCode('')).toBe('');
      expect(generateSizeGroupCode(null)).toBe('');
      expect(generateSizeGroupCode(undefined)).toBe('');
    });
  });

  describe('Size Group Mapper', () => {
    it('should map database entity to client DTO format', () => {
      const dbRow = {
        id: '5',
        company_id: '1',
        company_name: 'Pooja Fashion Retail',
        company_code: 'PF-01',
        size_group_code: 'MEN',
        size_group_name: 'Men',
        description: 'Standard menswear sizing',
        is_active: true,
        created_by: '2',
        updated_by: null,
        created_at: '2026-09-22T10:00:00.000Z',
        updated_at: '2026-09-22T10:00:00.000Z',
      };

      const dto = toSizeGroupDTO(dbRow);
      expect(dto).toEqual({
        id: 5,
        companyId: 1,
        companyName: 'Pooja Fashion Retail',
        companyCode: 'PF-01',
        sizeGroupCode: 'MEN',
        sizeGroupName: 'Men',
        description: 'Standard menswear sizing',
        isActive: true,
        createdBy: 2,
        updatedBy: null,
        createdAt: '2026-09-22T10:00:00.000Z',
        updatedAt: '2026-09-22T10:00:00.000Z',
      });
    });

    it('should return null if row is null or undefined', () => {
      expect(toSizeGroupDTO(null)).toBeNull();
      expect(toSizeGroupDTO(undefined)).toBeNull();
    });

    it('should map list of database rows', () => {
      const list = toSizeGroupListDTO([
        { id: 1, company_id: 1, size_group_code: 'MEN', size_group_name: 'Men', is_active: true },
        { id: 2, company_id: 1, size_group_code: 'WOMEN', size_group_name: 'Women', is_active: false },
      ]);
      expect(list).toHaveLength(2);
      expect(list[0].sizeGroupCode).toBe('MEN');
      expect(list[1].sizeGroupCode).toBe('WOMEN');
    });

    it('should return empty array for invalid input in toSizeGroupListDTO', () => {
      expect(toSizeGroupListDTO(null)).toEqual([]);
      expect(toSizeGroupListDTO(undefined)).toEqual([]);
    });
  });

  describe('Size Group Validation Schemas', () => {
    it('should validate and parse valid createSizeGroupSchema payload', () => {
      const validPayload = {
        company_id: '1',
        size_group_code: 'kids',
        size_group_name: 'Kids',
        description: 'Kids sizing',
        is_active: 'true',
      };

      const parsed = createSizeGroupSchema.parse(validPayload);
      expect(parsed.company_id).toBe(1);
      expect(parsed.size_group_code).toBe('KIDS');
      expect(parsed.size_group_name).toBe('Kids');
      expect(parsed.is_active).toBe(true);
    });

    it('should allow omitting company_id in createSizeGroupSchema for token derivation', () => {
      const parsed = createSizeGroupSchema.parse({
        size_group_name: 'Accessories',
      });
      expect(parsed.size_group_name).toBe('Accessories');
      expect(parsed.company_id).toBeUndefined();
    });

    it('should fail validation when size_group_name is missing', () => {
      expect(() => createSizeGroupSchema.parse({})).toThrow();
      expect(() => createSizeGroupSchema.parse({ size_group_name: '   ' })).toThrow();
    });

    it('should validate query params with defaults in getSizeGroupsQuerySchema', () => {
      const parsed = getSizeGroupsQuerySchema.parse({ company_id: '3' });
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(10);
      expect(parsed.company_id).toBe(3);
      expect(parsed.sortBy).toBe('size_group_name');
      expect(parsed.sortOrder).toBe('asc');
    });

    it('should validate getAllSizeGroupsQuerySchema with optional parameters', () => {
      const parsed = getAllSizeGroupsQuerySchema.parse({
        company_id: '2',
        is_active: 'true',
        search: 'men',
        sortBy: 'size_group_name',
        sortOrder: 'desc',
      });
      expect(parsed.company_id).toBe(2);
      expect(parsed.is_active).toBe(true);
      expect(parsed.search).toBe('men');
      expect(parsed.sortBy).toBe('size_group_name');
      expect(parsed.sortOrder).toBe('desc');
    });

    it('should validate getSizeGroupStatsQuerySchema with optional company_id', () => {
      const parsed = getSizeGroupStatsQuerySchema.parse({
        company_id: '4',
      });
      expect(parsed.company_id).toBe(4);
    });

    it('should validate getSizeGroupTreeQuerySchema with optional company_id and is_active', () => {
      const parsed = getSizeGroupTreeQuerySchema.parse({
        company_id: '1',
        is_active: 'true',
      });
      expect(parsed.company_id).toBe(1);
      expect(parsed.is_active).toBe(true);
    });

    it('should validate checkSizeGroupNameQuerySchema with name and company_id', () => {
      const parsed = checkSizeGroupNameQuerySchema.parse({
        name: 'Men',
        company_id: '1',
        excludeId: '2',
      });
      expect(parsed.name).toBe('Men');
      expect(parsed.company_id).toBe(1);
      expect(parsed.excludeId).toBe(2);

      expect(() => checkSizeGroupNameQuerySchema.parse({})).toThrow();
      expect(() => checkSizeGroupNameQuerySchema.parse({ name: '   ' })).toThrow();
    });

    it('should validate checkSizeGroupCodeQuerySchema with code and company_id', () => {
      const parsed = checkSizeGroupCodeQuerySchema.parse({
        code: 'MEN',
        company_id: '1',
      });
      expect(parsed.code).toBe('MEN');
      expect(parsed.company_id).toBe(1);

      expect(() => checkSizeGroupCodeQuerySchema.parse({})).toThrow();
      expect(() => checkSizeGroupCodeQuerySchema.parse({ code: '' })).toThrow();
    });

    it('should validate seedDefaultSizeGroupsSchema with optional company_id', () => {
      const parsed = seedDefaultSizeGroupsSchema.parse({
        company_id: '5',
      });
      expect(parsed.company_id).toBe(5);
    });
  });

  describe('Company Isolation & Security Helpers', () => {
    it('canUserSelectCompany correctly distinguishes superadmin, admin, and tenant users', () => {
      expect(canUserSelectCompany(null)).toBe(false);
      expect(canUserSelectCompany({ role: 'SUPERADMIN' })).toBe(true);
      expect(canUserSelectCompany({ roleCode: 'SUPERADMIN' })).toBe(true);
      expect(canUserSelectCompany({ role: 'ADMIN' })).toBe(true);
      expect(canUserSelectCompany({ role: 'ADMIN', companyId: 1 })).toBe(false);
      expect(canUserSelectCompany({ role: 'BRANCH_MANAGER', companyId: 2 })).toBe(false);
      expect(canUserSelectCompany({ role: 'CASHIER', company_id: 3 })).toBe(false);
    });

    it('resolveEffectiveCompanyId locks tenant users strictly to their company_id', () => {
      // SuperAdmin can choose any company or null
      expect(resolveEffectiveCompanyId({ role: 'SUPERADMIN' }, '5')).toBe(5);
      expect(resolveEffectiveCompanyId({ role: 'SUPERADMIN' }, null)).toBeNull();

      // Tenant user with companyId 1 requesting nothing gets 1
      expect(resolveEffectiveCompanyId({ role: 'CASHIER', companyId: 1 })).toBe(1);
      expect(resolveEffectiveCompanyId({ role: 'STAFF', company_id: 2 })).toBe(2);

      // Tenant user requesting their own companyId is allowed
      expect(resolveEffectiveCompanyId({ role: 'STAFF', companyId: 1 }, '1')).toBe(1);

      // Tenant user attempting cross-tenant access to another company is blocked
      expect(() =>
        resolveEffectiveCompanyId({ role: 'CASHIER', companyId: 1 }, '2')
      ).toThrow('You do not have permission to access size groups for another company');
    });
  });

  describe('Size Groups Utils Module (src/modules/product-master/sizeGroups/utils)', () => {
    it('should export all size group utility functions from sizeGroup.utils.js and index.js', () => {
      expect(typeof sizeGroupUtils.generateSizeGroupCode).toBe('function');
      expect(typeof sizeGroupUtils.toSlug).toBe('function');
      expect(typeof sizeGroupUtils.canUserSelectCompany).toBe('function');
      expect(typeof sizeGroupUtils.resolveEffectiveCompanyId).toBe('function');
      expect(typeof sizeGroupUtils.default).toBe('object');
    });

    it('should format URL-friendly slugs using toSlug', () => {
      expect(sizeGroupUtils.toSlug("Men's Outerwear & Jackets")).toBe('mens-outerwear-jackets');
    });
  });
});
