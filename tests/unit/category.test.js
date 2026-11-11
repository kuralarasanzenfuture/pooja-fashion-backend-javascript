import {
  generateCategoryCode,
  extractUploadedImage,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
  toSlug,
} from '../../src/modules/product-master/categories/category.service.js';
import * as categoryUtils from '../../src/modules/product-master/categories/utils/index.js';
import {
  toCategoryDTO,
  toCategoryListDTO,
} from '../../src/modules/product-master/categories/category.mapper.js';
import {
  createCategorySchema,
  updateCategorySchema,
  getCategoriesQuerySchema,
  getAllCategoriesQuerySchema,
  getCategoryTreeQuerySchema,
  reorderCategoriesSchema,
  checkCategoryNameQuerySchema,
  checkCategoryCodeQuerySchema,
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
        company_id: 1,
        companyName: 'Pooja Fashion Retail',
        company_name: 'Pooja Fashion Retail',
        companyCode: 'PF-01',
        company_code: 'PF-01',
        categoryCode: 'SAREES',
        category_code: 'SAREES',
        categoryName: 'Designer Sarees',
        category_name: 'Designer Sarees',
        description: 'Silk and cotton sarees',
        imageUrl: '/uploads/categories/designer-sarees/img.png',
        image_url: '/uploads/categories/designer-sarees/img.png',
        imageKey: 'categories/designer-sarees/img.png',
        image_key: 'categories/designer-sarees/img.png',
        displayOrder: 3,
        display_order: 3,
        isActive: true,
        is_active: true,
        createdBy: 5,
        created_by: 5,
        updatedBy: null,
        updated_by: null,
        createdAt: '2026-09-22T10:00:00.000Z',
        created_at: '2026-09-22T10:00:00.000Z',
        updatedAt: '2026-09-22T10:00:00.000Z',
        updated_at: '2026-09-22T10:00:00.000Z',
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

    it('should validate checkCategoryNameQuerySchema with category_name or name', () => {
      const parsed1 = checkCategoryNameQuerySchema.parse({
        category_name: 'Ethnic Wear',
        company_id: '1',
      });
      expect(parsed1.category_name).toBe('Ethnic Wear');
      expect(parsed1.company_id).toBe(1);

      const parsed2 = checkCategoryNameQuerySchema.parse({
        name: 'Western Wear',
        exclude_id: '10',
      });
      expect(parsed2.name).toBe('Western Wear');
      expect(parsed2.exclude_id).toBe(10);

      expect(() => checkCategoryNameQuerySchema.parse({})).toThrow();
      expect(() => checkCategoryNameQuerySchema.parse({ category_name: '   ' })).toThrow();
    });

    it('should validate checkCategoryCodeQuerySchema with category_code or code', () => {
      const parsed1 = checkCategoryCodeQuerySchema.parse({
        category_code: 'ETHNIC',
        company_id: '2',
      });
      expect(parsed1.category_code).toBe('ETHNIC');
      expect(parsed1.company_id).toBe(2);

      const parsed2 = checkCategoryCodeQuerySchema.parse({
        code: 'WESTERN',
        exclude_id: '5',
      });
      expect(parsed2.code).toBe('WESTERN');
      expect(parsed2.exclude_id).toBe(5);

      expect(() => checkCategoryCodeQuerySchema.parse({})).toThrow();
      expect(() => checkCategoryCodeQuerySchema.parse({ category_code: '' })).toThrow();
    });

    it('should validate getAllCategoriesQuerySchema with optional filters', () => {
      const parsed = getAllCategoriesQuerySchema.parse({
        company_id: '1',
        is_active: 'true',
        search: 'saree',
        sortBy: 'category_name',
        sortOrder: 'desc',
      });
      expect(parsed.company_id).toBe(1);
      expect(parsed.is_active).toBe(true);
      expect(parsed.search).toBe('saree');
      expect(parsed.sortBy).toBe('category_name');
      expect(parsed.sortOrder).toBe('desc');
    });

    it('should validate getCategoryTreeQuerySchema with optional company_id', () => {
      const parsed = getCategoryTreeQuerySchema.parse({
        company_id: '3',
        is_active: 'false',
      });
      expect(parsed.company_id).toBe(3);
      expect(parsed.is_active).toBe(false);
    });

    it('should validate reorderCategoriesSchema with valid items array', () => {
      const parsed = reorderCategoriesSchema.parse({
        items: [
          { id: 1, display_order: 0 },
          { id: 2, display_order: 1 },
        ],
      });
      expect(parsed.items).toHaveLength(2);
      expect(parsed.items[0].id).toBe(1);
      expect(parsed.items[0].display_order).toBe(0);

      expect(() => reorderCategoriesSchema.parse({ items: [] })).toThrow();
      expect(() => reorderCategoriesSchema.parse({})).toThrow();
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
      ).toThrow('You do not have permission to access categories for another company');
    });
  });

  describe('Categories Utils Module (src/modules/product-master/categories/utils)', () => {
    it('should export all category utility functions from category.utils.js and index.js', () => {
      expect(typeof categoryUtils.generateCategoryCode).toBe('function');
      expect(typeof categoryUtils.toSlug).toBe('function');
      expect(typeof categoryUtils.extractUploadedImage).toBe('function');
      expect(typeof categoryUtils.canUserSelectCompany).toBe('function');
      expect(typeof categoryUtils.resolveEffectiveCompanyId).toBe('function');
      expect(typeof categoryUtils.default).toBe('object');
    });

    it('should format URL-friendly slugs using toSlug', () => {
      expect(categoryUtils.toSlug("Women's Ethnic Wear")).toBe('womens-ethnic-wear');
      expect(categoryUtils.toSlug('Special  Offers & Deals!')).toBe('special-offers-deals');
    });
  });
});

