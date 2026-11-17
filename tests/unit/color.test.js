import {
  generateColorCode,
  formatHexCode,
  DEFAULT_COLORS,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
  toSlug,
} from '../../src/modules/product-master/colors/color.service.js';
import * as colorUtils from '../../src/modules/product-master/colors/utils/index.js';
import {
  toColorDTO,
  toColorListDTO,
} from '../../src/modules/product-master/colors/color.mapper.js';
import {
  createColorSchema,
  updateColorSchema,
  updateStatusSchema,
  getColorsQuerySchema,
  getAllColorsQuerySchema,
  getColorStatsQuerySchema,
  reorderColorsSchema,
  checkColorNameQuerySchema,
  checkColorCodeQuerySchema,
  seedDefaultColorsSchema,
  colorIdParamSchema,
  companyIdParamSchema,
  colorCodeParamSchema,
} from '../../src/modules/product-master/colors/color.validation.js';

describe('Product Master: Colors Unit Tests', () => {
  describe('DEFAULT_COLORS', () => {
    it('should include essential standard apparel retail colors (50 colors)', () => {
      expect(DEFAULT_COLORS.length).toBe(50);
      const codes = DEFAULT_COLORS.map((c) => c.color_code);
      expect(codes).toContain('BLACK');
      expect(codes).toContain('WHITE');
      expect(codes).toContain('RED');
      expect(codes).toContain('BLUE');
      expect(codes).toContain('NAVY');
      expect(codes).toContain('GREEN');
      expect(codes).toContain('YELLOW');
      expect(codes).toContain('PINK');
      expect(codes).toContain('ORANGE');
      expect(codes).toContain('PURPLE');
      expect(codes).toContain('MULTICOLOR');
    });

    it('should have valid 7-character uppercase hex codes for all default colors (or null for MULTICOLOR)', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      DEFAULT_COLORS.forEach((color) => {
        if (color.color_code === 'MULTICOLOR') {
          expect(color.hex_code).toBeNull();
        } else {
          expect(color.hex_code).toMatch(hexRegex);
          expect(color.hex_code).toBe(color.hex_code.toUpperCase());
        }
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

    it('should handle non-string or empty input safely', () => {
      expect(generateColorCode('')).toBe('');
      expect(generateColorCode(null)).toBe('');
      expect(generateColorCode(undefined)).toBe('');
    });
  });

  describe('formatHexCode', () => {
    it('should normalize and format valid hex codes to uppercase', () => {
      expect(formatHexCode('#ffffff')).toBe('#FFFFFF');
      expect(formatHexCode('  #000080  ')).toBe('#000080');
      expect(formatHexCode('#abc123')).toBe('#ABC123');
    });

    it('should return null for null, undefined, or empty strings', () => {
      expect(formatHexCode(null)).toBeNull();
      expect(formatHexCode(undefined)).toBeNull();
      expect(formatHexCode('')).toBeNull();
      expect(formatHexCode('   ')).toBeNull();
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

    it('should allow omitting company_id in createColorSchema for token derivation', () => {
      const parsed = createColorSchema.parse({
        color_name: 'Midnight Black',
        hex_code: '#050505',
      });
      expect(parsed.color_name).toBe('Midnight Black');
      expect(parsed.hex_code).toBe('#050505');
      expect(parsed.company_id).toBeUndefined();
    });

    it('should fail createColorSchema when color_name is missing or whitespace', () => {
      expect(() => createColorSchema.parse({})).toThrow();
      expect(() => createColorSchema.parse({ company_id: 1 })).toThrow();
      expect(() => createColorSchema.parse({ color_name: '   ' })).toThrow();
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

    it('should accept null or empty string hex_code and normalize to null', () => {
      const parsed1 = createColorSchema.parse({
        company_id: 1,
        color_name: 'Multi-Color',
        hex_code: null,
      });
      expect(parsed1.hex_code).toBeNull();

      const parsed2 = createColorSchema.parse({
        company_id: 1,
        color_name: 'Transparent',
        hex_code: '',
      });
      expect(parsed2.hex_code).toBeNull();
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

    it('should validate getAllColorsQuerySchema with optional parameters', () => {
      const parsed = getAllColorsQuerySchema.parse({
        company_id: '1',
        is_active: 'true',
        search: 'Blue',
        sortBy: 'color_name',
        sortOrder: 'desc',
      });
      expect(parsed.company_id).toBe(1);
      expect(parsed.is_active).toBe(true);
      expect(parsed.search).toBe('Blue');
      expect(parsed.sortBy).toBe('color_name');
      expect(parsed.sortOrder).toBe('desc');
    });

    it('should validate getColorStatsQuerySchema with optional parameters', () => {
      const parsed = getColorStatsQuerySchema.parse({
        company_id: '3',
      });
      expect(parsed.company_id).toBe(3);
    });

    it('should validate reorderColorsSchema with items array', () => {
      const parsed = reorderColorsSchema.parse({
        items: [
          { id: 10, display_order: 0 },
          { id: 20, display_order: 1 },
        ],
      });
      expect(parsed.items).toHaveLength(2);
      expect(parsed.items[0].id).toBe(10);
      expect(parsed.items[0].display_order).toBe(0);

      expect(() => reorderColorsSchema.parse({ items: [] })).toThrow();
      expect(() => reorderColorsSchema.parse({})).toThrow();
    });

    it('should validate checkColorNameQuerySchema with name', () => {
      const parsed = checkColorNameQuerySchema.parse({
        name: 'Crimson Red',
        company_id: '1',
        excludeId: '5',
      });
      expect(parsed.name).toBe('Crimson Red');
      expect(parsed.company_id).toBe(1);
      expect(parsed.excludeId).toBe(5);

      expect(() => checkColorNameQuerySchema.parse({})).toThrow();
      expect(() => checkColorNameQuerySchema.parse({ name: '   ' })).toThrow();
    });

    it('should validate checkColorCodeQuerySchema with code', () => {
      const parsed = checkColorCodeQuerySchema.parse({
        code: 'RED',
        company_id: '1',
      });
      expect(parsed.code).toBe('RED');
      expect(parsed.company_id).toBe(1);

      expect(() => checkColorCodeQuerySchema.parse({})).toThrow();
      expect(() => checkColorCodeQuerySchema.parse({ code: '' })).toThrow();
    });

    it('should validate seedDefaultColorsSchema with company_id', () => {
      const parsed = seedDefaultColorsSchema.parse({
        company_id: '2',
      });
      expect(parsed.company_id).toBe(2);
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
      ).toThrow('You do not have permission to access colors for another company');
    });
  });

  describe('Colors Utils Module (src/modules/product-master/colors/utils)', () => {
    it('should export all color utility functions from color.utils.js and index.js', () => {
      expect(typeof colorUtils.generateColorCode).toBe('function');
      expect(typeof colorUtils.formatHexCode).toBe('function');
      expect(typeof colorUtils.toSlug).toBe('function');
      expect(typeof colorUtils.canUserSelectCompany).toBe('function');
      expect(typeof colorUtils.resolveEffectiveCompanyId).toBe('function');
      expect(typeof colorUtils.default).toBe('object');
    });

    it('should format URL-friendly slugs using toSlug', () => {
      expect(colorUtils.toSlug('Royal Navy Blue')).toBe('royal-navy-blue');
    });
  });
});
