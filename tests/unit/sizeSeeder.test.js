import { jest } from '@jest/globals';
import { REALISTIC_SIZE_GROUPS, seedSizes } from '../../src/database/seeders/size.seeder.js';

describe('Size Seeder - Realistic Data & Multi-Company Execution', () => {
  describe('Realistic Dataset Integrity', () => {
    it('should define exactly 7 realistic size groups', () => {
      expect(Array.isArray(REALISTIC_SIZE_GROUPS)).toBe(true);
      expect(REALISTIC_SIZE_GROUPS.length).toBe(7);

      const groupCodes = REALISTIC_SIZE_GROUPS.map((g) => g.group_code);
      expect(groupCodes).toEqual([
        'MEN',
        'WOMEN',
        'KIDS',
        'FOOTWEAR',
        'FREE',
        'SAREE',
        'INNERWEAR',
      ]);
    });

    it('should match the exact group names for Pooja Fashion', () => {
      const expectedNames = [
        "Men's Clothing",
        "Women's Clothing",
        "Kids Clothing",
        "Footwear",
        "Free Size",
        "Saree",
        "Innerwear",
      ];
      const actualNames = REALISTIC_SIZE_GROUPS.map((g) => g.group_name);
      expect(actualNames).toEqual(expectedNames);
    });

    it('should define exactly 28 sizes distributed across the 7 groups', () => {
      const totalSizes = REALISTIC_SIZE_GROUPS.reduce(
        (sum, group) => sum + (group.sizes ? group.sizes.length : 0),
        0
      );
      expect(totalSizes).toBe(28);
    });

    it('should have correct sizes and display order for MEN', () => {
      const men = REALISTIC_SIZE_GROUPS.find((g) => g.group_code === 'MEN');
      expect(men).toBeDefined();
      expect(men.sizes.length).toBe(6);
      expect(men.sizes).toEqual([
        { size_code: 'S', size_name: 'Small', display_order: 1 },
        { size_code: 'M', size_name: 'Medium', display_order: 2 },
        { size_code: 'L', size_name: 'Large', display_order: 3 },
        { size_code: 'XL', size_name: 'Extra Large', display_order: 4 },
        { size_code: 'XXL', size_name: 'Double XL', display_order: 5 },
        { size_code: '3XL', size_name: 'Triple XL', display_order: 6 },
      ]);
    });

    it('should have correct sizes and display order for WOMEN', () => {
      const women = REALISTIC_SIZE_GROUPS.find((g) => g.group_code === 'WOMEN');
      expect(women).toBeDefined();
      expect(women.sizes.length).toBe(6);
      expect(women.sizes).toEqual([
        { size_code: 'XS', size_name: 'Extra Small', display_order: 1 },
        { size_code: 'S', size_name: 'Small', display_order: 2 },
        { size_code: 'M', size_name: 'Medium', display_order: 3 },
        { size_code: 'L', size_name: 'Large', display_order: 4 },
        { size_code: 'XL', size_name: 'Extra Large', display_order: 5 },
        { size_code: 'XXL', size_name: 'Double XL', display_order: 6 },
      ]);
    });

    it('should have correct sizes and display order for KIDS', () => {
      const kids = REALISTIC_SIZE_GROUPS.find((g) => g.group_code === 'KIDS');
      expect(kids).toBeDefined();
      expect(kids.sizes.length).toBe(6);
      expect(kids.sizes).toEqual([
        { size_code: '20', size_name: 'Size 20', display_order: 1 },
        { size_code: '22', size_name: 'Size 22', display_order: 2 },
        { size_code: '24', size_name: 'Size 24', display_order: 3 },
        { size_code: '26', size_name: 'Size 26', display_order: 4 },
        { size_code: '28', size_name: 'Size 28', display_order: 5 },
        { size_code: '30', size_name: 'Size 30', display_order: 6 },
      ]);
    });

    it('should have correct sizes and display order for FOOTWEAR', () => {
      const footwear = REALISTIC_SIZE_GROUPS.find((g) => g.group_code === 'FOOTWEAR');
      expect(footwear).toBeDefined();
      expect(footwear.sizes.length).toBe(5);
      expect(footwear.sizes).toEqual([
        { size_code: '6', size_name: 'UK 6', display_order: 1 },
        { size_code: '7', size_name: 'UK 7', display_order: 2 },
        { size_code: '8', size_name: 'UK 8', display_order: 3 },
        { size_code: '9', size_name: 'UK 9', display_order: 4 },
        { size_code: '10', size_name: 'UK 10', display_order: 5 },
      ]);
    });

    it('should have correct sizes and display order for FREE and SAREE', () => {
      const free = REALISTIC_SIZE_GROUPS.find((g) => g.group_code === 'FREE');
      expect(free).toBeDefined();
      expect(free.sizes).toEqual([
        { size_code: 'FREE', size_name: 'Free Size', display_order: 1 },
      ]);

      const saree = REALISTIC_SIZE_GROUPS.find((g) => g.group_code === 'SAREE');
      expect(saree).toBeDefined();
      expect(saree.sizes).toEqual([
        { size_code: 'FREE', size_name: 'Free Size', display_order: 1 },
      ]);
    });

    it('should have correct sizes and display order for INNERWEAR', () => {
      const innerwear = REALISTIC_SIZE_GROUPS.find((g) => g.group_code === 'INNERWEAR');
      expect(innerwear).toBeDefined();
      expect(innerwear.sizes.length).toBe(3);
      expect(innerwear.sizes).toEqual([
        { size_code: 'M', size_name: 'Medium', display_order: 1 },
        { size_code: 'L', size_name: 'Large', display_order: 2 },
        { size_code: 'XL', size_name: 'Extra Large', display_order: 3 },
      ]);
    });
  });

  describe('seedSizes Multi-Company Execution with Client Mocking', () => {
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

    it('should seed all 7 size groups and 28 sizes for ALL existing companies in the database', async () => {
      let groupIdCounter = 1;
      let sizeIdCounter = 1;

      // Mock 3 existing companies in the database
      const existingCompanies = [
        { id: 1, company_name: 'Pooja Fashion Shop', company_code: 'PFS001' },
        { id: 2, company_name: 'Ethnic Trendz', company_code: 'ETZ002' },
        { id: 3, company_name: 'Royal Silks', company_code: 'RSK003' },
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
        if (typeof sql === 'string' && sql.includes('INSERT INTO size_groups')) {
          return {
            rows: [
              {
                id: groupIdCounter++,
                company_id: params[0],
                size_group_code: params[1],
                size_group_name: params[2],
                is_active: true,
              },
            ],
          };
        }
        if (typeof sql === 'string' && sql.includes('INSERT INTO sizes')) {
          return {
            rows: [
              {
                id: sizeIdCounter++,
                company_id: params[0],
                size_group_id: params[1],
                size_code: params[2],
                size_name: params[3],
                display_order: params[4],
                is_active: true,
              },
            ],
          };
        }
        return { rows: [] };
      });

      // Execute without companyId -> seeds for ALL existing companies
      const result = await seedSizes({ pool: mockPool });

      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();

      // 3 companies seeded
      expect(result.totalCompanies).toBe(3);
      // 7 size groups per company * 3 companies = 21 size groups
      expect(result.totalSizeGroupsSeeded).toBe(21);
      // 28 sizes per company * 3 companies = 84 sizes
      expect(result.totalSizesSeeded).toBe(84);
      expect(result.companies.length).toBe(3);

      // Verify each company details
      expect(result.companies[0].companyId).toBe(1);
      expect(result.companies[0].companyName).toBe('Pooja Fashion Shop');
      expect(result.companies[0].sizeGroupsCount).toBe(7);
      expect(result.companies[0].sizesCount).toBe(28);

      expect(result.companies[1].companyId).toBe(2);
      expect(result.companies[1].companyName).toBe('Ethnic Trendz');
      expect(result.companies[1].sizeGroupsCount).toBe(7);
      expect(result.companies[1].sizesCount).toBe(28);

      expect(result.companies[2].companyId).toBe(3);
      expect(result.companies[2].companyName).toBe('Royal Silks');
      expect(result.companies[2].sizeGroupsCount).toBe(7);
      expect(result.companies[2].sizesCount).toBe(28);
    });

    it('should seed for a specific company when companyId is provided', async () => {
      let groupIdCounter = 1;
      let sizeIdCounter = 1;

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
        if (typeof sql === 'string' && sql.includes('INSERT INTO size_groups')) {
          return {
            rows: [
              {
                id: groupIdCounter++,
                company_id: params[0],
                size_group_code: params[1],
                size_group_name: params[2],
                is_active: true,
              },
            ],
          };
        }
        if (typeof sql === 'string' && sql.includes('INSERT INTO sizes')) {
          return {
            rows: [
              {
                id: sizeIdCounter++,
                company_id: params[0],
                size_group_id: params[1],
                size_code: params[2],
                size_name: params[3],
                display_order: params[4],
                is_active: true,
              },
            ],
          };
        }
        return { rows: [] };
      });

      const result = await seedSizes({ companyId: 5, pool: mockPool });

      expect(result.totalCompanies).toBe(1);
      expect(result.companyId).toBe(5);
      expect(result.totalSizeGroupsSeeded).toBe(7);
      expect(result.totalSizesSeeded).toBe(28);
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

      await expect(seedSizes({ pool: mockPool })).rejects.toThrow(
        'No existing companies found in database to seed size groups and sizes for.'
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
        if (sql.includes('INSERT INTO size_groups')) {
          throw new Error('Database constraint violation');
        }
        return { rows: [] };
      });

      await expect(seedSizes({ pool: mockPool })).rejects.toThrow('Database constraint violation');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });
});
