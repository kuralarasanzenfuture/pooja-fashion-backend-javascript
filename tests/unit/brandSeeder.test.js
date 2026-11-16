import { jest } from '@jest/globals';
import { REALISTIC_BRANDS, seedBrands } from '../../src/database/seeders/brand.seeder.js';

describe('Brand Seeder - Realistic Data & Multi-Company Execution', () => {
  describe('Realistic Dataset Integrity', () => {
    it('should define exactly 25 realistic brands', () => {
      expect(Array.isArray(REALISTIC_BRANDS)).toBe(true);
      expect(REALISTIC_BRANDS.length).toBe(25);
    });

    it('should contain all requested brand codes', () => {
      const brandCodes = REALISTIC_BRANDS.map((b) => b.brand_code);
      expect(brandCodes).toEqual([
        'PETER',
        'ALLEN',
        'LOUIS',
        'VANH',
        'LEVIS',
        'WRANGLER',
        'USPA',
        'ZARA',
        'HNM',
        'BIBA',
        'W',
        'AURELIA',
        'LIBAS',
        'MANYAVAR',
        'MOHEY',
        'MAX',
        'FIRSTCRY',
        'NIKE',
        'ADIDAS',
        'PUMA',
        'CAMPUS',
        'BATA',
        'RELAXO',
        'LOCAL001',
        'NO-BRAND',
      ]);
    });

    it('should match the exact brand names and descriptions', () => {
      const peter = REALISTIC_BRANDS.find((b) => b.brand_code === 'PETER');
      expect(peter).toEqual({
        brand_code: 'PETER',
        brand_name: 'Peter England',
        description: "Men's formal and casual wear",
        display_order: 1,
        is_active: true,
      });

      const levis = REALISTIC_BRANDS.find((b) => b.brand_code === 'LEVIS');
      expect(levis).toEqual({
        brand_code: 'LEVIS',
        brand_name: "Levi's",
        description: 'Denim and casual wear',
        display_order: 5,
        is_active: true,
      });

      const biba = REALISTIC_BRANDS.find((b) => b.brand_code === 'BIBA');
      expect(biba).toEqual({
        brand_code: 'BIBA',
        brand_name: 'Biba',
        description: "Women's ethnic wear",
        display_order: 10,
        is_active: true,
      });

      const manyavar = REALISTIC_BRANDS.find((b) => b.brand_code === 'MANYAVAR');
      expect(manyavar).toEqual({
        brand_code: 'MANYAVAR',
        brand_name: 'Manyavar',
        description: "Men's ethnic wear",
        display_order: 14,
        is_active: true,
      });

      const nike = REALISTIC_BRANDS.find((b) => b.brand_code === 'NIKE');
      expect(nike).toEqual({
        brand_code: 'NIKE',
        brand_name: 'Nike',
        description: 'Sportswear and footwear',
        display_order: 18,
        is_active: true,
      });

      const noBrand = REALISTIC_BRANDS.find((b) => b.brand_code === 'NO-BRAND');
      expect(noBrand).toEqual({
        brand_code: 'NO-BRAND',
        brand_name: 'No Brand',
        description: 'Unbranded products',
        display_order: 25,
        is_active: true,
      });
    });

    it('should assign sequential display orders from 1 to 25', () => {
      REALISTIC_BRANDS.forEach((brand, index) => {
        expect(brand.display_order).toBe(index + 1);
        expect(brand.is_active).toBe(true);
      });
    });
  });

  describe('seedBrands Multi-Company Execution with Client Mocking', () => {
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

    it('should seed all 25 brands across ALL existing companies in the database', async () => {
      let brandIdCounter = 1;

      // Mock 2 existing companies in the database
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
        if (typeof sql === 'string' && sql.includes('INSERT INTO brands')) {
          return {
            rows: [
              {
                id: brandIdCounter++,
                company_id: params[0],
                brand_code: params[1],
                brand_name: params[2],
                description: params[3],
                display_order: params[4],
                is_active: params[5],
              },
            ],
          };
        }
        return { rows: [] };
      });

      const result = await seedBrands({ pool: mockPool });

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();

      // 2 companies seeded
      expect(result.totalCompanies).toBe(2);
      // 25 brands per company * 2 companies = 50 brands total
      expect(result.totalBrandsSeeded).toBe(50);
      expect(result.companies.length).toBe(2);

      expect(result.companies[0].companyId).toBe(1);
      expect(result.companies[0].companyName).toBe('Pooja Fashion Shop');
      expect(result.companies[0].brandsCount).toBe(25);

      expect(result.companies[1].companyId).toBe(2);
      expect(result.companies[1].companyName).toBe('Ethnic Trendz');
      expect(result.companies[1].brandsCount).toBe(25);
    });

    it('should seed for a specific company when companyId is provided', async () => {
      let brandIdCounter = 1;

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
        if (typeof sql === 'string' && sql.includes('INSERT INTO brands')) {
          return {
            rows: [
              {
                id: brandIdCounter++,
                company_id: params[0],
                brand_code: params[1],
                brand_name: params[2],
                description: params[3],
                display_order: params[4],
                is_active: params[5],
              },
            ],
          };
        }
        return { rows: [] };
      });

      const result = await seedBrands({ companyId: 5, pool: mockPool });

      expect(result.totalCompanies).toBe(1);
      expect(result.companyId).toBe(5);
      expect(result.totalBrandsSeeded).toBe(25);
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

      await expect(seedBrands({ pool: mockPool })).rejects.toThrow(
        'No existing companies found in database to seed brands for.'
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
        if (sql.includes('INSERT INTO brands')) {
          throw new Error('Database constraint violation');
        }
        return { rows: [] };
      });

      await expect(seedBrands({ pool: mockPool })).rejects.toThrow('Database constraint violation');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});

