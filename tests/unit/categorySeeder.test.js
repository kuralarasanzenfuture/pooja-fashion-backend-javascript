import { jest } from '@jest/globals';
import {
  REALISTIC_CATEGORIES,
  seedCategories,
  ensureCategoryImagesOnDisk,
} from '../../src/database/seeders/category.seeder.js';

describe('Category & Subcategory Seeder - Realistic Data, Images & Multi-Company Execution', () => {
  describe('Realistic Dataset Integrity', () => {
    it('should define exactly 25 realistic categories', () => {
      expect(Array.isArray(REALISTIC_CATEGORIES)).toBe(true);
      expect(REALISTIC_CATEGORIES.length).toBe(25);
    });

    it('should contain all requested category codes in correct order', () => {
      const categoryCodes = REALISTIC_CATEGORIES.map((c) => c.category_code);
      expect(categoryCodes).toEqual([
        'MENS-WEAR',
        'WOMENS-WEAR',
        'KIDS-WEAR',
        'BOYS-WEAR',
        'GIRLS-WEAR',
        'ETHNIC-WEAR',
        'WESTERN-WEAR',
        'INNERWEAR',
        'NIGHTWEAR',
        'SPORTSWEAR',
        'WINTER-WEAR',
        'SAREES',
        'DUPATTAS',
        'DRESS-MATERIALS',
        'FABRICS',
        'FOOTWEAR',
        'BAGS',
        'ACCESSORIES',
        'JEWELLERY',
        'BELTS',
        'SOCKS',
        'CAPS',
        'UNIFORMS',
        'MATERNITY',
        'OTHER',
      ]);
    });

    it('should define exactly 130 child subcategories across all 25 categories', () => {
      const totalSubcategories = REALISTIC_CATEGORIES.reduce(
        (sum, cat) => sum + (cat.subcategories ? cat.subcategories.length : 0),
        0
      );
      expect(totalSubcategories).toBe(130);
    });

    it('should correctly map the 8 matched catalog images to their respective categories', () => {
      const categoriesWithImages = REALISTIC_CATEGORIES.filter((c) => c.image_url !== null);
      expect(categoriesWithImages.length).toBe(8);

      const expectedImageMap = {
        'MENS-WEAR': {
          file: 'Five Stylish Menswear Models Isolated.png',
          url: '/uploads/categories/mens-wear/five-stylish-menswear-models-isolated.png',
        },
        'WOMENS-WEAR': {
          file: 'Women’s Fashion Style Showcase.png',
          url: '/uploads/categories/womens-wear/womens-fashion-style-showcase.png',
        },
        'KIDS-WEAR': {
          file: 'Colorful Kids’ Fashion Catalog Group.png',
          url: '/uploads/categories/kids-wear/colorful-kids-fashion-catalog-group.png',
        },
        'BOYS-WEAR': {
          file: 'Trendy Boys’ Fashion Lineup.png',
          url: '/uploads/categories/boys-wear/trendy-boys-fashion-lineup.png',
        },
        'WINTER-WEAR': {
          file: 'Winter Wardrobe Collection.png',
          url: '/uploads/categories/winter-wear/winter-wardrobe-collection.png',
        },
        'SAREES': {
          file: 'Vibrant Silk Sarees Display.png',
          url: '/uploads/categories/sarees/vibrant-silk-sarees-display.png',
        },
        'DUPATTAS': {
          file: 'Embroidered Magenta Gold Dupatta.png',
          url: '/uploads/categories/dupattas/embroidered-magenta-gold-dupatta.png',
        },
        'FOOTWEAR': {
          file: 'Men’s and Women’s Footwear Collection.png',
          url: '/uploads/categories/footwear/mens-and-womens-footwear-collection.png',
        },
      };

      for (const [code, expected] of Object.entries(expectedImageMap)) {
        const cat = REALISTIC_CATEGORIES.find((c) => c.category_code === code);
        expect(cat).toBeDefined();
        expect(cat.image_file).toBe(expected.file);
        expect(cat.image_url).toBe(expected.url);
        expect(cat.image_key).toBe(expected.url.replace(/^\/uploads\//, ''));
      }
    });

    it('should leave all remaining 17 categories without image (blank/null)', () => {
      const categoriesWithoutImages = REALISTIC_CATEGORIES.filter((c) => c.image_url === null);
      expect(categoriesWithoutImages.length).toBe(17);

      const codesWithoutImages = [
        'GIRLS-WEAR',
        'ETHNIC-WEAR',
        'WESTERN-WEAR',
        'INNERWEAR',
        'NIGHTWEAR',
        'SPORTSWEAR',
        'DRESS-MATERIALS',
        'FABRICS',
        'BAGS',
        'ACCESSORIES',
        'JEWELLERY',
        'BELTS',
        'SOCKS',
        'CAPS',
        'UNIFORMS',
        'MATERNITY',
        'OTHER',
      ];

      for (const code of codesWithoutImages) {
        const cat = REALISTIC_CATEGORIES.find((c) => c.category_code === code);
        expect(cat).toBeDefined();
        expect(cat.image_file).toBeNull();
        expect(cat.image_url).toBeNull();
        expect(cat.image_key).toBeNull();
      }
    });

    it('should have correct subcategories and display orders for MENS-WEAR (10 subcategories)', () => {
      const mens = REALISTIC_CATEGORIES.find((c) => c.category_code === 'MENS-WEAR');
      expect(mens).toBeDefined();
      expect(mens.subcategories.length).toBe(10);
      expect(mens.subcategories).toEqual([
        { subcategory_code: 'MENS-SHIRTS', subcategory_name: 'Shirts', display_order: 1 },
        { subcategory_code: 'MENS-TSHIRTS', subcategory_name: 'T-Shirts', display_order: 2 },
        { subcategory_code: 'MENS-TROUSERS', subcategory_name: 'Trousers', display_order: 3 },
        { subcategory_code: 'MENS-JEANS', subcategory_name: 'Jeans', display_order: 4 },
        { subcategory_code: 'MENS-CASUAL', subcategory_name: 'Casual Wear', display_order: 5 },
        { subcategory_code: 'MENS-FORMAL', subcategory_name: 'Formal Wear', display_order: 6 },
        { subcategory_code: 'MENS-SHORTS', subcategory_name: 'Shorts', display_order: 7 },
        { subcategory_code: 'MENS-TRACKPANTS', subcategory_name: 'Track Pants', display_order: 8 },
        { subcategory_code: 'MENS-KURTAS', subcategory_name: 'Kurtas', display_order: 9 },
        { subcategory_code: 'MENS-WESTCOATS', subcategory_name: 'Waistcoats', display_order: 10 },
      ]);
    });

    it('should have correct subcategories and display orders for WOMENS-WEAR (12 subcategories)', () => {
      const womens = REALISTIC_CATEGORIES.find((c) => c.category_code === 'WOMENS-WEAR');
      expect(womens).toBeDefined();
      expect(womens.subcategories.length).toBe(12);
      expect(womens.subcategories[0]).toEqual({
        subcategory_code: 'WOMEN-TOPS',
        subcategory_name: 'Tops',
        display_order: 1,
      });
      expect(womens.subcategories[11]).toEqual({
        subcategory_code: 'WOMEN-SHRUGS',
        subcategory_name: 'Shrugs',
        display_order: 12,
      });
    });

    it('should have correct subcategories for SAREES (8 subcategories)', () => {
      const sarees = REALISTIC_CATEGORIES.find((c) => c.category_code === 'SAREES');
      expect(sarees).toBeDefined();
      expect(sarees.subcategories.length).toBe(8);
      expect(sarees.subcategories.map((s) => s.subcategory_code)).toEqual([
        'SAREE-COTTON',
        'SAREE-SILK',
        'SAREE-KANJEEVARAM',
        'SAREE-CHIFFON',
        'SAREE-GEORGETTE',
        'SAREE-FANCY',
        'SAREE-DAILY',
        'SAREE-PARTY',
      ]);
    });

    it('should have correct subcategory for OTHER (1 subcategory)', () => {
      const other = REALISTIC_CATEGORIES.find((c) => c.category_code === 'OTHER');
      expect(other).toBeDefined();
      expect(other.subcategories).toEqual([
        { subcategory_code: 'OTHER-FASHION', subcategory_name: 'Other Fashion Products', display_order: 1 },
      ]);
    });

    it('should assign sequential display orders 1 to 25 to categories', () => {
      REALISTIC_CATEGORIES.forEach((cat, index) => {
        expect(cat.display_order).toBe(index + 1);
        expect(cat.is_active).toBe(true);
      });
    });
  });

  describe('ensureCategoryImagesOnDisk', () => {
    it('should be a callable function that returns status and directory', async () => {
      expect(typeof ensureCategoryImagesOnDisk).toBe('function');
      const res = await ensureCategoryImagesOnDisk();
      expect(res).toBeDefined();
      expect(res.imagesCopied).toBeGreaterThanOrEqual(0);
      expect(typeof res.uploadsDir).toBe('string');
    });
  });

  describe('seedCategories Multi-Company Execution with Client Mocking', () => {
    let mockClient;
    let mockPool;

    beforeEach(() => {
      mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      mockPool = {
        connect: jest.fn().mockResolvedValue(mockClient),
      };
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should seed all 25 categories and 130 subcategories for ALL existing companies in database with images', async () => {
      let catIdCounter = 1;
      let subIdCounter = 1;

      // Mock 2 companies in the database
      const existingCompanies = [
        { id: 1, company_name: 'Pooja Fashion Shop', company_code: 'PFS001' },
        { id: 2, company_name: 'Ethnic Trendz', company_code: 'ETZ002' },
      ];

      mockClient.query.mockImplementation(async (sql, params) => {
        if (typeof sql === 'string' && sql === 'BEGIN') {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql === 'COMMIT') {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id, company_name, company_code FROM companies ORDER BY id ASC')) {
          return { rows: existingCompanies };
        }
        if (typeof sql === 'string' && sql.includes('INSERT INTO categories')) {
          return {
            rows: [
              {
                id: catIdCounter++,
                company_id: params[0],
                category_code: params[1],
                category_name: params[2],
                description: params[3],
                image_url: params[4],
                image_key: params[5],
                display_order: params[6],
                is_active: params[7],
              },
            ],
          };
        }
        if (typeof sql === 'string' && sql.includes('INSERT INTO subcategories')) {
          return {
            rows: [
              {
                id: subIdCounter++,
                company_id: params[0],
                category_id: params[1],
                subcategory_code: params[2],
                subcategory_name: params[3],
                description: params[4],
                display_order: params[5],
                is_active: params[6],
              },
            ],
          };
        }
        return { rows: [] };
      });

      const result = await seedCategories({ pool: mockPool });

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();

      // 2 companies seeded
      expect(result.totalCompanies).toBe(2);
      // 25 categories * 2 companies = 50 categories
      expect(result.totalCategoriesSeeded).toBe(50);
      // 8 images * 2 companies = 16 images
      expect(result.totalImagesSeeded).toBe(16);
      // 130 subcategories * 2 companies = 260 subcategories
      expect(result.totalSubcategoriesSeeded).toBe(260);
      expect(result.companies.length).toBe(2);

      // Verify each company details
      expect(result.companies[0].companyId).toBe(1);
      expect(result.companies[0].categoriesCount).toBe(25);
      expect(result.companies[0].subcategoriesCount).toBe(130);

      expect(result.companies[1].companyId).toBe(2);
      expect(result.companies[1].categoriesCount).toBe(25);
      expect(result.companies[1].subcategoriesCount).toBe(130);
    });

    it('should seed for a specific company when companyId is provided', async () => {
      let catIdCounter = 1;
      let subIdCounter = 1;

      mockClient.query.mockImplementation(async (sql, params) => {
        if (typeof sql === 'string' && sql === 'BEGIN') {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql === 'COMMIT') {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id, company_name, company_code FROM companies WHERE id = $1')) {
          return { rows: [{ id: 5, company_name: 'Fashion Hub', company_code: 'FHB005' }] };
        }
        if (typeof sql === 'string' && sql.includes('INSERT INTO categories')) {
          return {
            rows: [
              {
                id: catIdCounter++,
                company_id: params[0],
                category_code: params[1],
                category_name: params[2],
                description: params[3],
                image_url: params[4],
                image_key: params[5],
                display_order: params[6],
                is_active: params[7],
              },
            ],
          };
        }
        if (typeof sql === 'string' && sql.includes('INSERT INTO subcategories')) {
          return {
            rows: [
              {
                id: subIdCounter++,
                company_id: params[0],
                category_id: params[1],
                subcategory_code: params[2],
                subcategory_name: params[3],
                description: params[4],
                display_order: params[5],
                is_active: params[6],
              },
            ],
          };
        }
        return { rows: [] };
      });

      const result = await seedCategories({ companyId: 5, pool: mockPool });

      expect(result.totalCompanies).toBe(1);
      expect(result.companyId).toBe(5);
      expect(result.totalCategoriesSeeded).toBe(25);
      expect(result.totalImagesSeeded).toBe(8);
      expect(result.totalSubcategoriesSeeded).toBe(130);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw an error if no companies exist in database', async () => {
      mockClient.query.mockImplementation(async (sql) => {
        if (sql === 'BEGIN') return { rows: [] };
        if (sql === 'ROLLBACK') return { rows: [] };
        if (sql.includes('SELECT id, company_name, company_code FROM companies')) {
          return { rows: [] };
        }
        return { rows: [] };
      });

      await expect(seedCategories({ pool: mockPool })).rejects.toThrow(
        'No existing companies found in database to seed categories for.'
      );

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should rollback transaction and release client when an insertion error occurs', async () => {
      mockClient.query.mockImplementation(async (sql) => {
        if (sql === 'BEGIN') return { rows: [] };
        if (sql === 'ROLLBACK') return { rows: [] };
        if (sql.includes('SELECT id, company_name, company_code FROM companies')) {
          return { rows: [{ id: 1, company_name: 'Pooja Fashion', company_code: 'PFS001' }] };
        }
        if (sql.includes('INSERT INTO categories')) {
          throw new Error('Database constraint violation');
        }
        return { rows: [] };
      });

      await expect(seedCategories({ pool: mockPool })).rejects.toThrow('Database constraint violation');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});
