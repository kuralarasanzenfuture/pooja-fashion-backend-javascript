import {
  generateSizeCode,
  DEFAULT_SIZES_BY_GROUP,
} from '../../src/modules/product-master/sizes/size.service.js';
import {
  toSizeDTO,
  toSizeListDTO,
} from '../../src/modules/product-master/sizes/size.mapper.js';
import {
  createSizeSchema,
  updateSizeSchema,
  updateStatusSchema,
  getSizesQuerySchema,
  sizeIdParamSchema,
  sizeCodeParamSchema,
  sizeGroupIdParamSchema,
} from '../../src/modules/product-master/sizes/size.validation.js';

describe('Product Master: Sizes Unit Tests', () => {
  describe('DEFAULT_SIZES_BY_GROUP', () => {
    it('should have predefined sizing groups and sizes', () => {
      expect(DEFAULT_SIZES_BY_GROUP.MEN).toBeDefined();
      expect(DEFAULT_SIZES_BY_GROUP.WOMEN).toBeDefined();
      expect(DEFAULT_SIZES_BY_GROUP.KIDS).toBeDefined();
      expect(DEFAULT_SIZES_BY_GROUP.FOOTWEAR).toBeDefined();

      const menCodes = DEFAULT_SIZES_BY_GROUP.MEN.map((s) => s.size_code);
      expect(menCodes).toContain('S');
      expect(menCodes).toContain('M');
      expect(menCodes).toContain('L');
      expect(menCodes).toContain('XL');
    });
  });

  describe('generateSizeCode', () => {
    it('should generate uppercase snake_case size code from name', () => {
      expect(generateSizeCode('Small')).toBe('SMALL');
      expect(generateSizeCode('Extra Large (XL)')).toBe('EXTRA_LARGE_XL_');
      expect(generateSizeCode('UK 8 / Euro 42')).toBe('UK_8_EURO_42');
    });

    it('should limit code length to 50 characters', () => {
      const longName = 'S'.repeat(70);
      const code = generateSizeCode(longName);
      expect(code.length).toBeLessThanOrEqual(50);
    });
  });

  describe('Size Mapper', () => {
    it('should map database entity to client DTO format', () => {
      const dbRow = {
        id: '10',
        company_id: '1',
        company_name: 'Pooja Fashion Retail Ltd',
        company_code: 'PF-01',
        size_group_id: '2',
        size_group_name: 'Men',
        size_group_code: 'MEN',
        size_code: 'M',
        size_name: 'Medium',
        display_order: '2',
        is_active: true,
        created_by: '5',
        updated_by: null,
        created_at: '2026-09-22T10:00:00.000Z',
        updated_at: '2026-09-22T10:00:00.000Z',
      };

      const dto = toSizeDTO(dbRow);
      expect(dto).toEqual({
        id: 10,
        companyId: 1,
        companyName: 'Pooja Fashion Retail Ltd',
        companyCode: 'PF-01',
        sizeGroupId: 2,
        sizeGroupName: 'Men',
        sizeGroupCode: 'MEN',
        sizeCode: 'M',
        sizeName: 'Medium',
        displayOrder: 2,
        isActive: true,
        createdBy: 5,
        updatedBy: null,
        createdAt: '2026-09-22T10:00:00.000Z',
        updatedAt: '2026-09-22T10:00:00.000Z',
      });
    });

    it('should return null if row is null or undefined', () => {
      expect(toSizeDTO(null)).toBeNull();
      expect(toSizeDTO(undefined)).toBeNull();
    });

    it('should map list of database rows', () => {
      const list = toSizeListDTO([
        { id: 1, company_id: 1, size_group_id: 1, size_code: 'S', size_name: 'Small', is_active: true },
        { id: 2, company_id: 1, size_group_id: 1, size_code: 'M', size_name: 'Medium', is_active: true },
      ]);
      expect(list).toHaveLength(2);
      expect(list[0].sizeCode).toBe('S');
      expect(list[1].sizeCode).toBe('M');
    });

    it('should return empty array for invalid input in toSizeListDTO', () => {
      expect(toSizeListDTO(null)).toEqual([]);
      expect(toSizeListDTO(undefined)).toEqual([]);
    });
  });

  describe('Size Validation Schemas', () => {
    it('should validate and parse valid createSizeSchema payload', () => {
      const validPayload = {
        company_id: '1',
        size_group_id: '2',
        size_code: 'xl',
        size_name: 'Extra Large',
        display_order: '4',
        is_active: 'true',
      };

      const parsed = createSizeSchema.parse(validPayload);
      expect(parsed.company_id).toBe(1);
      expect(parsed.size_group_id).toBe(2);
      expect(parsed.size_code).toBe('XL');
      expect(parsed.size_name).toBe('Extra Large');
      expect(parsed.display_order).toBe(4);
      expect(parsed.is_active).toBe(true);
    });

    it('should fail createSizeSchema when required fields are missing', () => {
      expect(() => createSizeSchema.parse({})).toThrow();
      expect(() => createSizeSchema.parse({ company_id: 1, size_name: 'Medium' })).toThrow();
      expect(() => createSizeSchema.parse({ size_group_id: 1, size_name: 'Medium' })).toThrow();
    });

    it('should fail createSizeSchema when size_code has invalid characters', () => {
      expect(() =>
        createSizeSchema.parse({
          company_id: 1,
          size_group_id: 1,
          size_code: 'M#*',
          size_name: 'Medium',
        })
      ).toThrow();
    });

    it('should validate and parse updateSizeSchema partial payload', () => {
      const updatePayload = {
        size_name: 'Medium (Slim Fit)',
        display_order: 3,
        is_active: false,
      };

      const parsed = updateSizeSchema.parse(updatePayload);
      expect(parsed.size_name).toBe('Medium (Slim Fit)');
      expect(parsed.display_order).toBe(3);
      expect(parsed.is_active).toBe(false);
    });

    it('should validate updateStatusSchema boolean coercion', () => {
      expect(updateStatusSchema.parse({ is_active: 'true' })).toEqual({ is_active: true });
      expect(updateStatusSchema.parse({ is_active: 'false' })).toEqual({ is_active: false });
      expect(updateStatusSchema.parse({ is_active: 1 })).toEqual({ is_active: true });
      expect(updateStatusSchema.parse({ is_active: 0 })).toEqual({ is_active: false });
    });

    it('should validate params schemas', () => {
      expect(sizeIdParamSchema.parse({ id: '15' })).toEqual({ id: 15 });
      expect(sizeGroupIdParamSchema.parse({ sizeGroupId: '3' })).toEqual({ sizeGroupId: 3 });
      expect(sizeCodeParamSchema.parse({ sizeGroupId: '3', sizeCode: 'xl' })).toEqual({
        sizeGroupId: 3,
        sizeCode: 'xl',
      });
    });

    it('should parse getSizesQuerySchema with default pagination and sorting', () => {
      const parsed = getSizesQuerySchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(10);
      expect(parsed.sortBy).toBe('display_order');
      expect(parsed.sortOrder).toBe('asc');
    });
  });
});
