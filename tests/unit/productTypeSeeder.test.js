import { jest } from '@jest/globals';
import {
  REALISTIC_PRODUCT_TYPES,
  seedProductTypes,
} from '../../src/database/seeders/productType.seeder.js';

describe('Product Type Seeder - Realistic Data & Multi-Company Execution', () => {
  describe('Realistic Dataset Integrity', () => {
    it('should define exactly 5 standard retail and fashion product types', () => {
      expect(Array.isArray(REALISTIC_PRODUCT_TYPES)).toBe(true);
      expect(REALISTIC_PRODUCT_TYPES.length).toBe(5);
    });

    it('should contain all 5 requested product types', () => {
      const typeCodes = REALISTIC_PRODUCT_TYPES.map((pt) => pt.type_code);
      expect(typeCodes).toContain('READY_MADE');
      expect(typeCodes).toContain('FABRIC');
      expect(typeCodes).toContain('ACCESSORY');
      expect(typeCodes).toContain('FOOTWEAR');
      expect(typeCodes).toContain('SERVICE');
    });

    it('each product type should have valid properties and boolean flags', () => {
      REALISTIC_PRODUCT_TYPES.forEach((pt) => {
        expect(pt.type_code).toMatch(/^[A-Z0-9_-]+$/);
        expect(pt.type_name.trim().length).toBeGreaterThan(0);
        expect(typeof pt.is_stock_item).toBe('boolean');
        expect(typeof pt.is_saleable).toBe('boolean');
        expect(typeof pt.is_purchasable).toBe('boolean');
        expect(pt.description.trim().length).toBeGreaterThan(0);
        expect(pt.is_active).toBe(true);
      });
    });

    it('should match the exact details for each product type', () => {
      const readyMade = REALISTIC_PRODUCT_TYPES.find((pt) => pt.type_code === 'READY_MADE');
      expect(readyMade).toEqual({
        type_code: 'READY_MADE',
        type_name: 'Ready Made Garments',
        is_stock_item: true,
        is_saleable: true,
        is_purchasable: true,
        description: 'Shirts, T-shirts, jeans, sarees, dresses',
        is_active: true,
      });

      const fabric = REALISTIC_PRODUCT_TYPES.find((pt) => pt.type_code === 'FABRIC');
      expect(fabric).toEqual({
        type_code: 'FABRIC',
        type_name: 'Fabric',
        is_stock_item: true,
        is_saleable: true,
        is_purchasable: true,
        description: 'Cotton, silk, linen, textile rolls',
        is_active: true,
      });

      const accessory = REALISTIC_PRODUCT_TYPES.find((pt) => pt.type_code === 'ACCESSORY');
      expect(accessory).toEqual({
        type_code: 'ACCESSORY',
        type_name: 'Fashion Accessories',
        is_stock_item: true,
        is_saleable: true,
        is_purchasable: true,
        description: 'Belts, bags, caps, jewellery',
        is_active: true,
      });

      const footwear = REALISTIC_PRODUCT_TYPES.find((pt) => pt.type_code === 'FOOTWEAR');
      expect(footwear).toEqual({
        type_code: 'FOOTWEAR',
        type_name: 'Footwear',
        is_stock_item: true,
        is_saleable: true,
        is_purchasable: true,
        description: 'Shoes, sandals, slippers, heels',
        is_active: true,
      });

      const service = REALISTIC_PRODUCT_TYPES.find((pt) => pt.type_code === 'SERVICE');
      expect(service).toEqual({
        type_code: 'SERVICE',
        type_name: 'Services',
        is_stock_item: false,
        is_saleable: true,
        is_purchasable: false,
        description: 'Alteration, stitching, embroidery',
        is_active: true,
      });
    });
  });

  describe('seedProductTypes Multi-Company Execution with Client Mocking', () => {
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

    it('should seed all 5 product types across ALL existing companies in the database', async () => {
      let typeIdCounter = 1;

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
        if (typeof sql === 'string' && sql.includes('SELECT 1 FROM products')) {
          return { rowCount: 0 };
        }
        if (typeof sql === 'string' && sql.includes('TRUNCATE TABLE product_types')) {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id, company_name, company_code FROM companies ORDER BY id ASC')) {
          return { rows: existingCompanies };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id FROM product_types')) {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('INSERT INTO product_types')) {
          return {
            rows: [
              {
                id: typeIdCounter++,
                company_id: params[0],
                type_code: params[1],
                type_name: params[2],
                description: params[3],
                is_stock_item: params[4],
                is_saleable: params[5],
                is_purchasable: params[6],
                is_active: params[7],
              },
            ],
          };
        }
        return { rows: [] };
      });

      const result = await seedProductTypes({ pool: mockPool });

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();

      // 2 companies seeded
      expect(result.totalCompanies).toBe(2);
      // 5 product types per company * 2 companies = 10 product types total
      expect(result.totalProductTypesSeeded).toBe(10);
      expect(result.companies.length).toBe(2);

      expect(result.companies[0].companyId).toBe(1);
      expect(result.companies[0].companyName).toBe('Pooja Fashion Shop');
      expect(result.companies[0].productTypesCount).toBe(5);

      expect(result.companies[1].companyId).toBe(2);
      expect(result.companies[1].companyName).toBe('Ethnic Trendz');
      expect(result.companies[1].productTypesCount).toBe(5);
    });

    it('should seed for a specific company when companyId is provided', async () => {
      let typeIdCounter = 1;

      mockClient.query.mockImplementation(async (sql, params) => {
        if (typeof sql === 'string' && sql === 'BEGIN') {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql === 'COMMIT') {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT 1 FROM products')) {
          return { rowCount: 0 };
        }
        if (typeof sql === 'string' && sql.includes('TRUNCATE TABLE product_types')) {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id, company_name, company_code FROM companies WHERE id = $1')) {
          return { rows: [{ id: 3, company_name: 'Metro Retail', company_code: 'MTR003' }] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id FROM product_types')) {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('INSERT INTO product_types')) {
          return {
            rows: [
              {
                id: typeIdCounter++,
                company_id: params[0],
                type_code: params[1],
                type_name: params[2],
                description: params[3],
                is_stock_item: params[4],
                is_saleable: params[5],
                is_purchasable: params[6],
                is_active: params[7],
              },
            ],
          };
        }
        return { rows: [] };
      });

      const result = await seedProductTypes({ companyId: 3, pool: mockPool });

      expect(result.totalCompanies).toBe(1);
      expect(result.totalProductTypesSeeded).toBe(5);
      expect(result.companyId).toBe(3);
      expect(result.productTypes.length).toBe(5);
    });

    it('should update existing product types on conflict without duplicating', async () => {
      mockClient.query.mockImplementation(async (sql, params) => {
        if (typeof sql === 'string' && (sql === 'BEGIN' || sql === 'COMMIT')) {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT 1 FROM products')) {
          return { rowCount: 5 }; // Rows reference, don't truncate
        }
        if (typeof sql === 'string' && sql.includes('SELECT id, company_name, company_code FROM companies ORDER BY id ASC')) {
          return { rows: [{ id: 1, company_name: 'Pooja Fashion Shop', company_code: 'PFS001' }] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id FROM product_types')) {
          // Return existing ID 10
          return { rows: [{ id: 10 }] };
        }
        if (typeof sql === 'string' && sql.includes('UPDATE product_types')) {
          return {
            rows: [
              {
                id: params[7],
                company_id: 1,
                type_code: params[0],
                type_name: params[1],
                description: params[2],
                is_stock_item: params[3],
                is_saleable: params[4],
                is_purchasable: params[5],
                is_active: params[6],
              },
            ],
          };
        }
        return { rows: [] };
      });

      const result = await seedProductTypes({ pool: mockPool });

      expect(result.totalCompanies).toBe(1);
      expect(result.totalProductTypesSeeded).toBe(5);
      expect(result.productTypes[0].id).toBe(10);
    });

    it('should rollback transaction and release connection on error', async () => {
      mockClient.query.mockImplementation(async (sql) => {
        if (typeof sql === 'string' && sql === 'BEGIN') {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id, company_name, company_code FROM companies')) {
          throw new Error('Database connection lost');
        }
        if (typeof sql === 'string' && sql === 'ROLLBACK') {
          return { rows: [] };
        }
        return { rows: [] };
      });

      await expect(seedProductTypes({ pool: mockPool })).rejects.toThrow('Database connection lost');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw an error if no companies exist in database', async () => {
      mockClient.query.mockImplementation(async (sql) => {
        if (typeof sql === 'string' && (sql === 'BEGIN' || sql === 'ROLLBACK')) {
          return { rows: [] };
        }
        if (typeof sql === 'string' && sql.includes('SELECT 1 FROM products')) {
          return { rowCount: 0 };
        }
        if (typeof sql === 'string' && sql.includes('SELECT id, company_name, company_code FROM companies')) {
          return { rows: [] };
        }
        return { rows: [] };
      });

      await expect(seedProductTypes({ pool: mockPool })).rejects.toThrow(
        'No existing companies found in database to seed product types for.'
      );
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});

