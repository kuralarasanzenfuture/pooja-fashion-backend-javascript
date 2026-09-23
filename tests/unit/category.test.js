import {
  generateCategoryCode,
  extractUploadedImage,
} from '../../src/modules/product-master/categories/category.service.js';
import {
  toCategoryDTO,
  toCategoryListDTO,
} from '../../src/modules/product-master/categories/category.mapper.js';
import {
  createCategorySchema,
  updateCategorySchema,
  getCategoriesQuerySchema,
} from '../../src/modules/product-master/categories/category.validation.js';

describe('Product Master: Categories Unit Tests', () => {
  describe('generateCategoryCode', () => {
    it('should generate uppercase snake_case category code from name', () => {
      expect(generateCategoryCode("Women's Ethnic Wear")).toBe('WOMEN_S_ETHNIC_WEAR');
      expect(generateCategoryCode('Kids   Casual & Formal!')).toBe('KIDS_CASUAL_FORMAL_');
      expect(generateCategoryCode('Winter-Jackets')).toBe('WINTER_JACKETS');
    });

    it('should limit category code length to 50 characters', () => {
      const longName = 'A'.repeat(80);
      const code = generateCategoryCode(longName);
      expect(code.length).toBeLessThanOrEqual(50);
    });
  });

  describe('extractUploadedImage', () => {
    it('should extract image path correctly when image file is supplied', () => {
      const files = {
        image: [{ filename: 'test-category.png' }],
      };
      const result = extractUploadedImage(files, 'womens-ethnic');
      expect(result).toEqual({
        image_url: '/uploads/categories/womens-ethnic/test-category.png',
        image_key: 'categories/womens-ethnic/test-category.png',
      });
    });

    it('should return empty object when no files are uploaded', () => {
      expect(extractUploadedImage(null)).toEqual({});
      expect(extractUploadedImage({})).toEqual({});
    });
  });

  describe('Category Mapper', () => {
    it('should map database entity to client DTO format', () => {
      const dbRow = {
        id: '42',
        company_id: '1',
        company_name: 'Pooja Fashion Retail',
        company_code: 'PF-01',
        category_code: 'SAREES',
        category_name: 'Designer Sarees',
        description: 'Silk and cotton sarees',
        image_url: '/uploads/categories/designer-sarees/img.png',
        image_key: 'categories/designer-sarees/img.png',
        display_order: 3,
        is_active: true,
        created_by: '5',
        updated_by: null,
        created_at: '2026-09-22T10:00:00.000Z',
        updated_at: '2026-09-22T10:00:00.000Z',
      };

      const dto = toCategoryDTO(dbRow);
      expect(dto).toEqual({
        id: 42,
        companyId: 1,
        companyName: 'Pooja Fashion Retail',
        companyCode: 'PF-01',
        categoryCode: 'SAREES',
        categoryName: 'Designer Sarees',
        description: 'Silk and cotton sarees',
        imageUrl: '/uploads/categories/designer-sarees/img.png',
        imageKey: 'categories/designer-sarees/img.png',
        displayOrder: 3,
        isActive: true,
        createdBy: 5,
        updatedBy: null,
        createdAt: '2026-09-22T10:00:00.000Z',
        updatedAt: '2026-09-22T10:00:00.000Z',
      });
    });

    it('should return null if row is null or undefined', () => {
      expect(toCategoryDTO(null)).toBeNull();
      expect(toCategoryDTO(undefined)).toBeNull();
    });

    it('should map list of database rows', () => {
      const list = toCategoryListDTO([
        { id: 1, company_id: 1, category_code: 'A', category_name: 'Cat A', display_order: 0, is_active: true },
        { id: 2, company_id: 1, category_code: 'B', category_name: 'Cat B', display_order: 1, is_active: false },
      ]);
      expect(list).toHaveLength(2);
      expect(list[0].categoryCode).toBe('A');
      expect(list[1].categoryCode).toBe('B');
    });

    it('should return empty array for invalid input in toCategoryListDTO', () => {
      expect(toCategoryListDTO(null)).toEqual([]);
      expect(toCategoryListDTO(undefined)).toEqual([]);
    });
  });

  describe('Category Validation Schemas', () => {
    it('should validate and parse valid createCategorySchema payload', () => {
      const validPayload = {
        company_id: '1',
        category_code: 'men_formal',
        category_name: "Men's Formal Wear",
        description: 'Suits and shirts',
        display_order: '2',
        is_active: 'true',
      };

      const parsed = createCategorySchema.parse(validPayload);
      expect(parsed.company_id).toBe(1);
      expect(parsed.category_code).toBe('MEN_FORMAL');
      expect(parsed.category_name).toBe("Men's Formal Wear");
      expect(parsed.display_order).toBe(2);
      expect(parsed.is_active).toBe(true);
    });

    it('should fail validation when required fields are missing', () => {
      expect(() => createCategorySchema.parse({})).toThrow();
      expect(() => createCategorySchema.parse({ company_id: 1 })).toThrow();
    });

    it('should validate query params with defaults in getCategoriesQuerySchema', () => {
      const parsed = getCategoriesQuerySchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(10);
      expect(parsed.sortBy).toBe('display_order');
      expect(parsed.sortOrder).toBe('asc');
    });
  });
});
