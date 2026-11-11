import {
  generateSubcategoryCode,
  extractUploadedImage,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
  toSlug,
} from '../../src/modules/product-master/subCategories/subCategory.service.js';
import * as subCategoryUtils from '../../src/modules/product-master/subCategories/utils/index.js';
import {
  toSubcategoryDTO,
  toSubcategoryListDTO,
} from '../../src/modules/product-master/subCategories/subCategory.mapper.js';
import {
  createSubcategorySchema,
  updateSubcategorySchema,
  getSubcategoriesQuerySchema,
  getAllSubcategoriesQuerySchema,
  getSubcategoryStatsQuerySchema,
  reorderSubcategoriesSchema,
  checkSubcategoryNameQuerySchema,
  checkSubcategoryCodeQuerySchema,
} from '../../src/modules/product-master/subCategories/subCategory.validation.js';

describe('Product Master: Subcategories Unit Tests', () => {
  describe('generateSubcategoryCode', () => {
    it('should generate uppercase snake_case subcategory code from name', () => {
      expect(generateSubcategoryCode('Silk Sarees')).toBe('SILK_SAREES');
      expect(generateSubcategoryCode('Printed & Embroidered Kurtis!')).toBe(
        'PRINTED_EMBROIDERED_KURTIS_'
      );
      expect(generateSubcategoryCode('Party-Wear-Gowns')).toBe('PARTY_WEAR_GOWNS');
    });

    it('should limit subcategory code length to 50 characters', () => {
      const longName = 'S'.repeat(80);
      const code = generateSubcategoryCode(longName);
      expect(code.length).toBeLessThanOrEqual(50);
    });
  });

  describe('extractUploadedImage', () => {
    it('should extract subcategory image path when file is supplied', () => {
      const files = {
        image: [{ filename: 'silk-sarees.webp' }],
      };
      const result = extractUploadedImage(files, 'silk-sarees');
      expect(result).toEqual({
        image_url: '/uploads/subcategories/silk-sarees/silk-sarees.webp',
        image_key: 'subcategories/silk-sarees/silk-sarees.webp',
      });
    });

    it('should return empty object when no files are uploaded', () => {
      expect(extractUploadedImage(null)).toEqual({});
      expect(extractUploadedImage({})).toEqual({});
    });
  });

  describe('Subcategory Mapper', () => {
    it('should map database entity to client DTO format', () => {
      const dbRow = {
        id: '10',
        company_id: '1',
        company_name: 'Pooja Fashion Retail',
        company_code: 'PF-01',
        category_id: '2',
        category_name: "Women's Ethnic Wear",
        category_code: 'WOMENS_ETHNIC',
        subcategory_code: 'BANARASI_SAREES',
        subcategory_name: 'Banarasi Sarees',
        description: 'Traditional brocade silk sarees',
        image_url: '/uploads/subcategories/banarasi-sarees/banarasi.png',
        image_key: 'subcategories/banarasi-sarees/banarasi.png',
        display_order: 1,
        is_active: true,
        created_by: '3',
        updated_by: null,
        created_at: '2026-09-22T10:00:00.000Z',
        updated_at: '2026-09-22T10:00:00.000Z',
      };

      const dto = toSubcategoryDTO(dbRow);
      expect(dto).toEqual({
        id: 10,
        companyId: 1,
        company_id: 1,
        companyName: 'Pooja Fashion Retail',
        company_name: 'Pooja Fashion Retail',
        companyCode: 'PF-01',
        company_code: 'PF-01',
        categoryId: 2,
        category_id: 2,
        categoryName: "Women's Ethnic Wear",
        category_name: "Women's Ethnic Wear",
        categoryCode: 'WOMENS_ETHNIC',
        category_code: 'WOMENS_ETHNIC',
        subcategoryCode: 'BANARASI_SAREES',
        subcategory_code: 'BANARASI_SAREES',
        subcategoryName: 'Banarasi Sarees',
        subcategory_name: 'Banarasi Sarees',
        description: 'Traditional brocade silk sarees',
        imageUrl: '/uploads/subcategories/banarasi-sarees/banarasi.png',
        image_url: '/uploads/subcategories/banarasi-sarees/banarasi.png',
        imageKey: 'subcategories/banarasi-sarees/banarasi.png',
        image_key: 'subcategories/banarasi-sarees/banarasi.png',
        displayOrder: 1,
        display_order: 1,
        isActive: true,
        is_active: true,
        createdBy: 3,
        created_by: 3,
        updatedBy: null,
        updated_by: null,
        createdAt: '2026-09-22T10:00:00.000Z',
        created_at: '2026-09-22T10:00:00.000Z',
        updatedAt: '2026-09-22T10:00:00.000Z',
        updated_at: '2026-09-22T10:00:00.000Z',
      });
    });

    it('should return null if row is null or undefined', () => {
      expect(toSubcategoryDTO(null)).toBeNull();
      expect(toSubcategoryDTO(undefined)).toBeNull();
    });

    it('should map list of database rows', () => {
      const list = toSubcategoryListDTO([
        { id: 1, company_id: 1, category_id: 2, subcategory_code: 'SUB1', subcategory_name: 'Sub 1', display_order: 0, is_active: true },
        { id: 2, company_id: 1, category_id: 2, subcategory_code: 'SUB2', subcategory_name: 'Sub 2', display_order: 1, is_active: false },
      ]);
      expect(list).toHaveLength(2);
      expect(list[0].subcategoryCode).toBe('SUB1');
      expect(list[1].subcategoryCode).toBe('SUB2');
    });

    it('should return empty array for invalid input in toSubcategoryListDTO', () => {
      expect(toSubcategoryListDTO(null)).toEqual([]);
      expect(toSubcategoryListDTO(undefined)).toEqual([]);
    });
  });

  describe('Subcategory Validation Schemas', () => {
    it('should validate and parse valid createSubcategorySchema payload', () => {
      const validPayload = {
        company_id: '1',
        category_id: '2',
        subcategory_code: 'silk_sarees',
        subcategory_name: 'Silk Sarees',
        description: 'Pure silk sarees',
        display_order: '1',
        is_active: 'true',
      };

      const parsed = createSubcategorySchema.parse(validPayload);
      expect(parsed.company_id).toBe(1);
      expect(parsed.category_id).toBe(2);
      expect(parsed.subcategory_code).toBe('SILK_SAREES');
      expect(parsed.subcategory_name).toBe('Silk Sarees');
      expect(parsed.display_order).toBe(1);
      expect(parsed.is_active).toBe(true);
    });

    it('should fail validation when company_id or category_id or name is missing', () => {
      expect(() => createSubcategorySchema.parse({})).toThrow();
      expect(() => createSubcategorySchema.parse({ company_id: 1 })).toThrow();
      expect(() => createSubcategorySchema.parse({ company_id: 1, category_id: 2 })).toThrow();
    });

    it('should validate query params with defaults in getSubcategoriesQuerySchema', () => {
      const parsed = getSubcategoriesQuerySchema.parse({ category_id: '5' });
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(10);
      expect(parsed.category_id).toBe(5);
      expect(parsed.sortBy).toBe('display_order');
      expect(parsed.sortOrder).toBe('asc');
    });

    it('should validate checkSubcategoryNameQuerySchema with subcategory_name or name', () => {
      const parsed1 = checkSubcategoryNameQuerySchema.parse({
        subcategory_name: 'Banarasi Sarees',
        category_id: '2',
      });
      expect(parsed1.subcategory_name).toBe('Banarasi Sarees');
      expect(parsed1.category_id).toBe(2);

      const parsed2 = checkSubcategoryNameQuerySchema.parse({
        name: 'Chanderi Sarees',
        company_id: '1',
        exclude_id: '10',
      });
      expect(parsed2.name).toBe('Chanderi Sarees');
      expect(parsed2.company_id).toBe(1);
      expect(parsed2.exclude_id).toBe(10);

      expect(() => checkSubcategoryNameQuerySchema.parse({})).toThrow();
      expect(() => checkSubcategoryNameQuerySchema.parse({ subcategory_name: '   ' })).toThrow();
    });

    it('should validate checkSubcategoryCodeQuerySchema with subcategory_code or code', () => {
      const parsed1 = checkSubcategoryCodeQuerySchema.parse({
        subcategory_code: 'BANARASI',
        company_id: '1',
      });
      expect(parsed1.subcategory_code).toBe('BANARASI');
      expect(parsed1.company_id).toBe(1);

      const parsed2 = checkSubcategoryCodeQuerySchema.parse({
        code: 'CHANDERI',
        exclude_id: '5',
      });
      expect(parsed2.code).toBe('CHANDERI');
      expect(parsed2.exclude_id).toBe(5);

      expect(() => checkSubcategoryCodeQuerySchema.parse({})).toThrow();
      expect(() => checkSubcategoryCodeQuerySchema.parse({ subcategory_code: '' })).toThrow();
    });

    it('should validate getAllSubcategoriesQuerySchema with optional parameters', () => {
      const parsed = getAllSubcategoriesQuerySchema.parse({
        company_id: '1',
        category_id: '2',
        is_active: 'true',
        search: 'saree',
        sortBy: 'subcategory_name',
        sortOrder: 'desc',
      });
      expect(parsed.company_id).toBe(1);
      expect(parsed.category_id).toBe(2);
      expect(parsed.is_active).toBe(true);
      expect(parsed.search).toBe('saree');
      expect(parsed.sortBy).toBe('subcategory_name');
      expect(parsed.sortOrder).toBe('desc');
    });

    it('should validate getSubcategoryStatsQuerySchema with optional parameters', () => {
      const parsed = getSubcategoryStatsQuerySchema.parse({
        company_id: '4',
        category_id: '8',
      });
      expect(parsed.company_id).toBe(4);
      expect(parsed.category_id).toBe(8);
    });

    it('should validate reorderSubcategoriesSchema with items array', () => {
      const parsed = reorderSubcategoriesSchema.parse({
        items: [
          { id: 10, display_order: 0 },
          { id: 20, display_order: 1 },
        ],
      });
      expect(parsed.items).toHaveLength(2);
      expect(parsed.items[0].id).toBe(10);
      expect(parsed.items[0].display_order).toBe(0);

      expect(() => reorderSubcategoriesSchema.parse({ items: [] })).toThrow();
      expect(() => reorderSubcategoriesSchema.parse({})).toThrow();
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
      ).toThrow('You do not have permission to access subcategories for another company');
    });
  });

  describe('Subcategories Utils Module (src/modules/product-master/subCategories/utils)', () => {
    it('should export all subcategory utility functions from subCategory.utils.js and index.js', () => {
      expect(typeof subCategoryUtils.generateSubcategoryCode).toBe('function');
      expect(typeof subCategoryUtils.toSlug).toBe('function');
      expect(typeof subCategoryUtils.extractUploadedImage).toBe('function');
      expect(typeof subCategoryUtils.canUserSelectCompany).toBe('function');
      expect(typeof subCategoryUtils.resolveEffectiveCompanyId).toBe('function');
      expect(typeof subCategoryUtils.default).toBe('object');
    });

    it('should format URL-friendly slugs using toSlug', () => {
      expect(subCategoryUtils.toSlug('Silk & Banarasi Sarees')).toBe('silk-banarasi-sarees');
    });
  });
});
