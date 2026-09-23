import {
  generateBrandCode,
  extractUploadedLogo,
} from '../../src/modules/product-master/brands/brand.service.js';
import {
  toBrandDTO,
  toBrandListDTO,
} from '../../src/modules/product-master/brands/brand.mapper.js';
import {
  createBrandSchema,
  updateBrandSchema,
  getBrandsQuerySchema,
} from '../../src/modules/product-master/brands/brand.validation.js';

describe('Product Master: Brands Unit Tests', () => {
  describe('generateBrandCode', () => {
    it('should generate uppercase snake_case brand code from name', () => {
      expect(generateBrandCode('Pooja Exclusive')).toBe('POOJA_EXCLUSIVE');
      expect(generateBrandCode('Manyavar & Mohey!')).toBe('MANYAVAR_MOHEY_');
      expect(generateBrandCode('Raymond-Suits')).toBe('RAYMOND_SUITS');
    });

    it('should limit brand code length to 50 characters', () => {
      const longName = 'B'.repeat(80);
      const code = generateBrandCode(longName);
      expect(code.length).toBeLessThanOrEqual(50);
    });
  });

  describe('extractUploadedLogo', () => {
    it('should extract brand logo path when file is supplied', () => {
      const files = {
        logo: [{ filename: 'pooja-logo.svg' }],
      };
      const result = extractUploadedLogo(files, 'pooja-exclusive');
      expect(result).toEqual({
        logo_url: '/uploads/brands/pooja-exclusive/pooja-logo.svg',
        logo_key: 'brands/pooja-exclusive/pooja-logo.svg',
      });
    });

    it('should return empty object when no files are uploaded', () => {
      expect(extractUploadedLogo(null)).toEqual({});
      expect(extractUploadedLogo({})).toEqual({});
    });
  });

  describe('Brand Mapper', () => {
    it('should map database entity to client DTO format', () => {
      const dbRow = {
        id: '15',
        company_id: '1',
        company_name: 'Pooja Fashion Retail',
        company_code: 'PF-01',
        brand_code: 'ZARA',
        brand_name: 'Zara Fashion',
        description: 'Global apparel brand',
        logo_url: '/uploads/brands/zara-fashion/zara.png',
        logo_key: 'brands/zara-fashion/zara.png',
        website_url: 'https://zara.com',
        display_order: 2,
        is_active: true,
        created_by: '3',
        updated_by: null,
        created_at: '2026-09-22T10:00:00.000Z',
        updated_at: '2026-09-22T10:00:00.000Z',
      };

      const dto = toBrandDTO(dbRow);
      expect(dto).toEqual({
        id: 15,
        companyId: 1,
        companyName: 'Pooja Fashion Retail',
        companyCode: 'PF-01',
        brandCode: 'ZARA',
        brandName: 'Zara Fashion',
        description: 'Global apparel brand',
        logoUrl: '/uploads/brands/zara-fashion/zara.png',
        logoKey: 'brands/zara-fashion/zara.png',
        websiteUrl: 'https://zara.com',
        displayOrder: 2,
        isActive: true,
        createdBy: 3,
        updatedBy: null,
        createdAt: '2026-09-22T10:00:00.000Z',
        updatedAt: '2026-09-22T10:00:00.000Z',
      });
    });

    it('should return null if row is null or undefined', () => {
      expect(toBrandDTO(null)).toBeNull();
      expect(toBrandDTO(undefined)).toBeNull();
    });

    it('should map list of database rows', () => {
      const list = toBrandListDTO([
        { id: 1, company_id: 1, brand_code: 'B1', brand_name: 'Brand 1', display_order: 0, is_active: true },
        { id: 2, company_id: 1, brand_code: 'B2', brand_name: 'Brand 2', display_order: 1, is_active: false },
      ]);
      expect(list).toHaveLength(2);
      expect(list[0].brandCode).toBe('B1');
      expect(list[1].brandCode).toBe('B2');
    });

    it('should return empty array for invalid input in toBrandListDTO', () => {
      expect(toBrandListDTO(null)).toEqual([]);
      expect(toBrandListDTO(undefined)).toEqual([]);
    });
  });

  describe('Brand Validation Schemas', () => {
    it('should validate and parse valid createBrandSchema payload', () => {
      const validPayload = {
        company_id: '1',
        brand_code: 'manyavar',
        brand_name: 'Manyavar',
        description: 'Celebration wear',
        website_url: 'https://manyavar.com',
        display_order: '3',
        is_active: 'true',
      };

      const parsed = createBrandSchema.parse(validPayload);
      expect(parsed.company_id).toBe(1);
      expect(parsed.brand_code).toBe('MANYAVAR');
      expect(parsed.brand_name).toBe('Manyavar');
      expect(parsed.website_url).toBe('https://manyavar.com');
      expect(parsed.display_order).toBe(3);
      expect(parsed.is_active).toBe(true);
    });

    it('should fail validation when company_id or brand_name is missing', () => {
      expect(() => createBrandSchema.parse({})).toThrow();
      expect(() => createBrandSchema.parse({ company_id: 1 })).toThrow();
    });

    it('should validate query params with defaults in getBrandsQuerySchema', () => {
      const parsed = getBrandsQuerySchema.parse({ company_id: '2' });
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(10);
      expect(parsed.company_id).toBe(2);
      expect(parsed.sortBy).toBe('display_order');
      expect(parsed.sortOrder).toBe('asc');
    });
  });
});
