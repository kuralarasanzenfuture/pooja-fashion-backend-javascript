import {
  generateColorCode,
  DEFAULT_COLORS,
} from '../../src/modules/product-master/colors/color.service.js';
import {
  toColorDTO,
  toColorListDTO,
} from '../../src/modules/product-master/colors/color.mapper.js';
import {
  createColorSchema,
  updateColorSchema,
  updateStatusSchema,
  getColorsQuerySchema,
  colorIdParamSchema,
  companyIdParamSchema,
  colorCodeParamSchema,
} from '../../src/modules/product-master/colors/color.validation.js';

describe('Product Master: Colors Unit Tests', () => {
  describe('DEFAULT_COLORS', () => {
    it('should include essential standard apparel retail colors', () => {
      expect(DEFAULT_COLORS.length).toBeGreaterThanOrEqual(10);
      const codes = DEFAULT_COLORS.map((c) => c.color_code);
      expect(codes).toContain('BLK');
      expect(codes).toContain('WHT');
      expect(codes).toContain('NVY');
      expect(codes).toContain('RED');
      expect(codes).toContain('MRN');
    });

    it('should have valid 7-character hex codes for all default colors', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      DEFAULT_COLORS.forEach((color) => {
        expect(color.hex_code).toMatch(hexRegex);
      });
    });
  });

  describe('generateColorCode', () => {
    it('should generate uppercase snake_case color code from name', () => {
      expect(generateColorCode('Navy Blue')).toBe('NAVY_BLUE');
      expect(generateColorCode('Olive & Military Green')).toBe('OLIVE_MILITARY_GREEN');
      expect(generateColorCode('Rose-Gold')).toBe('ROSE_GOLD');
    });

    it('should limit code length to 50 characters', () => {
      const longName = 'C'.repeat(75);
      const code = generateColorCode(longName);
      expect(code.length).toBeLessThanOrEqual(50);
    });
  });

  describe('Color Mapper', () => {
    it('should map database entity to client DTO format', () => {
      const dbRow = {
        id: '12',
        company_id: '1',
        company_name: 'Pooja Fashion Retail Ltd',
        company_code: 'PF-CORP',
        color_code: 'BLK',
        color_name: 'Jet Black',
        hex_code: '#000000',
        description: 'Deep black fabric shade',
        display_order: '1',
        is_active: true,
        created_by: '2',
        updated_by: null,
        created_at: '2026-09-22T10:00:00.000Z',
        updated_at: '2026-09-22T10:00:00.000Z',
      };

      const dto = toColorDTO(dbRow);
      expect(dto).toEqual({
        id: 12,
        companyId: 1,
        companyName: 'Pooja Fashion Retail Ltd',
        companyCode: 'PF-CORP',
        colorCode: 'BLK',
        colorName: 'Jet Black',
        hexCode: '#000000',
        description: 'Deep black fabric shade',
        displayOrder: 1,
        isActive: true,
        createdBy: 2,
        updatedBy: null,
        createdAt: '2026-09-22T10:00:00.000Z',
        updatedAt: '2026-09-22T10:00:00.000Z',
      });
    });

    it('should return null if row is null or undefined', () => {
      expect(toColorDTO(null)).toBeNull();
      expect(toColorDTO(undefined)).toBeNull();
    });

    it('should map list of database rows', () => {
      const list = toColorListDTO([
        { id: 1, company_id: 1, color_code: 'BLK', color_name: 'Black', is_active: true },
        { id: 2, company_id: 1, color_code: 'WHT', color_name: 'White', is_active: true },
      ]);
      expect(list).toHaveLength(2);
      expect(list[0].colorCode).toBe('BLK');
      expect(list[1].colorCode).toBe('WHT');
    });

    it('should return empty array for invalid input in toColorListDTO', () => {
      expect(toColorListDTO(null)).toEqual([]);
      expect(toColorListDTO(undefined)).toEqual([]);
    });
  });

  describe('Color Validation Schemas', () => {
    it('should validate and parse valid createColorSchema payload', () => {
      const validPayload = {
        company_id: '1',
        color_code: 'nvy',
        color_name: 'Navy Blue',
        hex_code: '#000080',
        description: 'Formal suit navy shade',
        display_order: '3',
        is_active: 'true',
      };

      const parsed = createColorSchema.parse(validPayload);
      expect(parsed.company_id).toBe(1);
      expect(parsed.color_code).toBe('NVY');
      expect(parsed.color_name).toBe('Navy Blue');
      expect(parsed.hex_code).toBe('#000080');
      expect(parsed.display_order).toBe(3);
      expect(parsed.is_active).toBe(true);
    });

    it('should fail createColorSchema when required fields are missing', () => {
      expect(() => createColorSchema.parse({})).toThrow();
      expect(() => createColorSchema.parse({ company_id: 1 })).toThrow();
      expect(() => createColorSchema.parse({ color_name: 'Red' })).toThrow();
    });

    it('should fail createColorSchema when hex_code is invalid', () => {
      expect(() =>
        createColorSchema.parse({
          company_id: 1,
          color_name: 'Red',
          hex_code: '#FFF', // Must be 6 digits
        })
      ).toThrow();

      expect(() =>
        createColorSchema.parse({
          company_id: 1,
          color_name: 'Red',
          hex_code: 'FF0000', // Missing #
        })
      ).toThrow();

      expect(() =>
        createColorSchema.parse({
          company_id: 1,
          color_name: 'Red',
          hex_code: '#GGGGGG', // Invalid hex digits
        })
      ).toThrow();
    });

    it('should accept null hex_code', () => {
      const parsed = createColorSchema.parse({
        company_id: 1,
        color_name: 'Multi-Color',
        hex_code: null,
      });
      expect(parsed.hex_code).toBeNull();
    });

    it('should validate and parse updateColorSchema partial payload', () => {
      const updatePayload = {
        color_name: 'Midnight Black',
        hex_code: '#050505',
        display_order: 2,
        is_active: false,
      };

      const parsed = updateColorSchema.parse(updatePayload);
      expect(parsed.color_name).toBe('Midnight Black');
      expect(parsed.hex_code).toBe('#050505');
      expect(parsed.display_order).toBe(2);
      expect(parsed.is_active).toBe(false);
    });

    it('should validate updateStatusSchema boolean coercion', () => {
      expect(updateStatusSchema.parse({ is_active: 'true' })).toEqual({ is_active: true });
      expect(updateStatusSchema.parse({ is_active: 'false' })).toEqual({ is_active: false });
      expect(updateStatusSchema.parse({ is_active: 1 })).toEqual({ is_active: true });
      expect(updateStatusSchema.parse({ is_active: 0 })).toEqual({ is_active: false });
    });

    it('should validate params schemas', () => {
      expect(colorIdParamSchema.parse({ id: '20' })).toEqual({ id: 20 });
      expect(companyIdParamSchema.parse({ companyId: '4' })).toEqual({ companyId: 4 });
      expect(colorCodeParamSchema.parse({ companyId: '4', colorCode: 'blk' })).toEqual({
        companyId: 4,
        colorCode: 'blk',
      });
    });

    it('should parse getColorsQuerySchema with default pagination and sorting', () => {
      const parsed = getColorsQuerySchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(10);
      expect(parsed.sortBy).toBe('display_order');
      expect(parsed.sortOrder).toBe('asc');
    });
  });
});
