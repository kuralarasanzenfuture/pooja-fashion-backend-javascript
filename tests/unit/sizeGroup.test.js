import {
  generateSizeGroupCode,
  DEFAULT_SIZE_GROUPS,
} from '../../src/modules/product-master/sizeGroups/sizeGroup.service.js';
import {
  toSizeGroupDTO,
  toSizeGroupListDTO,
} from '../../src/modules/product-master/sizeGroups/sizeGroup.mapper.js';
import {
  createSizeGroupSchema,
  updateSizeGroupSchema,
  getSizeGroupsQuerySchema,
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

    it('should fail validation when company_id or size_group_name is missing', () => {
      expect(() => createSizeGroupSchema.parse({})).toThrow();
      expect(() => createSizeGroupSchema.parse({ company_id: 1 })).toThrow();
    });

    it('should validate query params with defaults in getSizeGroupsQuerySchema', () => {
      const parsed = getSizeGroupsQuerySchema.parse({ company_id: '3' });
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(10);
      expect(parsed.company_id).toBe(3);
      expect(parsed.sortBy).toBe('size_group_name');
      expect(parsed.sortOrder).toBe('asc');
    });
  });
});
