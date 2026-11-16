import { getDatabasePool } from '../connection.js';

/**
 * ============================================================
 * REALISTIC BRAND SEED DATA
 * ============================================================
 * 25 realistic brands with codes, names, and descriptions:
 *  1. PETER    - Peter England    - Men's formal and casual wear
 *  2. ALLEN    - Allen Solly      - Fashion and casual wear
 *  3. LOUIS    - Louis Philippe   - Premium men's clothing
 *  4. VANH     - Van Heusen       - Formal and casual wear
 *  5. LEVIS    - Levi's           - Denim and casual wear
 *  6. WRANGLER - Wrangler         - Denim and casual wear
 *  7. USPA     - U.S. Polo Assn.  - Casual clothing
 *  8. ZARA     - Zara             - Fashion clothing
 *  9. HNM      - H&M              - Fashion and casual clothing
 * 10. BIBA     - Biba             - Women's ethnic wear
 * 11. W        - W                - Women's ethnic and fusion wear
 * 12. AURELIA  - Aurelia          - Women's ethnic wear
 * 13. LIBAS    - Libas            - Women's ethnic wear
 * 14. MANYAVAR - Manyavar         - Men's ethnic wear
 * 15. MOHEY    - Mohey            - Women's ethnic wear
 * 16. MAX      - Max Fashion      - Family fashion
 * 17. FIRSTCRY - FirstCry         - Kids' products and clothing
 * 18. NIKE     - Nike             - Sportswear and footwear
 * 19. ADIDAS   - Adidas           - Sportswear and footwear
 * 20. PUMA     - Puma             - Sportswear and footwear
 * 21. CAMPUS   - Campus           - Footwear
 * 22. BATA     - Bata             - Footwear
 * 23. RELAXO   - Relaxo           - Footwear
 * 24. LOCAL001 - Local Brand      - Local clothing brand
 * 25. NO-BRAND - No Brand         - Unbranded products
 * ============================================================
 */

export const REALISTIC_BRANDS = [
  {
    brand_code: 'PETER',
    brand_name: 'Peter England',
    description: "Men's formal and casual wear",
    display_order: 1,
    is_active: true,
  },
  {
    brand_code: 'ALLEN',
    brand_name: 'Allen Solly',
    description: 'Fashion and casual wear',
    display_order: 2,
    is_active: true,
  },
  {
    brand_code: 'LOUIS',
    brand_name: 'Louis Philippe',
    description: "Premium men's clothing",
    display_order: 3,
    is_active: true,
  },
  {
    brand_code: 'VANH',
    brand_name: 'Van Heusen',
    description: 'Formal and casual wear',
    display_order: 4,
    is_active: true,
  },
  {
    brand_code: 'LEVIS',
    brand_name: "Levi's",
    description: 'Denim and casual wear',
    display_order: 5,
    is_active: true,
  },
  {
    brand_code: 'WRANGLER',
    brand_name: 'Wrangler',
    description: 'Denim and casual wear',
    display_order: 6,
    is_active: true,
  },
  {
    brand_code: 'USPA',
    brand_name: 'U.S. Polo Assn.',
    description: 'Casual clothing',
    display_order: 7,
    is_active: true,
  },
  {
    brand_code: 'ZARA',
    brand_name: 'Zara',
    description: 'Fashion clothing',
    display_order: 8,
    is_active: true,
  },
  {
    brand_code: 'HNM',
    brand_name: 'H&M',
    description: 'Fashion and casual clothing',
    display_order: 9,
    is_active: true,
  },
  {
    brand_code: 'BIBA',
    brand_name: 'Biba',
    description: "Women's ethnic wear",
    display_order: 10,
    is_active: true,
  },
  {
    brand_code: 'W',
    brand_name: 'W',
    description: "Women's ethnic and fusion wear",
    display_order: 11,
    is_active: true,
  },
  {
    brand_code: 'AURELIA',
    brand_name: 'Aurelia',
    description: "Women's ethnic wear",
    display_order: 12,
    is_active: true,
  },
  {
    brand_code: 'LIBAS',
    brand_name: 'Libas',
    description: "Women's ethnic wear",
    display_order: 13,
    is_active: true,
  },
  {
    brand_code: 'MANYAVAR',
    brand_name: 'Manyavar',
    description: "Men's ethnic wear",
    display_order: 14,
    is_active: true,
  },
  {
    brand_code: 'MOHEY',
    brand_name: 'Mohey',
    description: "Women's ethnic wear",
    display_order: 15,
    is_active: true,
  },
  {
    brand_code: 'MAX',
    brand_name: 'Max Fashion',
    description: 'Family fashion',
    display_order: 16,
    is_active: true,
  },
  {
    brand_code: 'FIRSTCRY',
    brand_name: 'FirstCry',
    description: "Kids' products and clothing",
    display_order: 17,
    is_active: true,
  },
  {
    brand_code: 'NIKE',
    brand_name: 'Nike',
    description: 'Sportswear and footwear',
    display_order: 18,
    is_active: true,
  },
  {
    brand_code: 'ADIDAS',
    brand_name: 'Adidas',
    description: 'Sportswear and footwear',
    display_order: 19,
    is_active: true,
  },
  {
    brand_code: 'PUMA',
    brand_name: 'Puma',
    description: 'Sportswear and footwear',
    display_order: 20,
    is_active: true,
  },
  {
    brand_code: 'CAMPUS',
    brand_name: 'Campus',
    description: 'Footwear',
    display_order: 21,
    is_active: true,
  },
  {
    brand_code: 'BATA',
    brand_name: 'Bata',
    description: 'Footwear',
    display_order: 22,
    is_active: true,
  },
  {
    brand_code: 'RELAXO',
    brand_name: 'Relaxo',
    description: 'Footwear',
    display_order: 23,
    is_active: true,
  },
  {
    brand_code: 'LOCAL001',
    brand_name: 'Local Brand',
    description: 'Local clothing brand',
    display_order: 24,
    is_active: true,
  },
  {
    brand_code: 'NO-BRAND',
    brand_name: 'No Brand',
    description: 'Unbranded products',
    display_order: 25,
    is_active: true,
  },
];

/**
 * Seed realistic brands idempotently across ALL existing companies (or a specified company)
 *
 * @param {Object} [options]
 * @param {number|string|null} [options.companyId] - Specific company ID (if null/omitted, seeds for ALL existing companies)
 * @param {string|null} [options.companyName] - Optional company name filter (if provided, limits to matching company)
 * @param {boolean} [options.allCompanies=false] - Explicit flag to seed for all companies
 * @param {Object|null} [options.pool] - Optional database pool instance (for dependency injection/testing)
 * @returns {Promise<{
 *   totalCompanies: number,
 *   totalBrandsSeeded: number,
 *   companies: Array<{
 *     companyId: number,
 *     companyName: string,
 *     companyCode: string,
 *     brandsCount: number,
 *     brands: Array
 *   }>,
 *   companyId: number|null,
 *   brandsCount: number,
 *   brands: Array
 * }>}
 */
export const seedBrands = async ({
  companyId = null,
  companyName = null,
  allCompanies = false,
  pool: customPool = null,
} = {}) => {
  const pool = customPool || getDatabasePool();

  if (!pool) {
    throw new Error('Database pool not initialized');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Resolve Target Companies:
    // If explicit companyId is provided (and not 'all'), resolve that single company.
    // If explicit companyName is provided (and not 'all'), resolve matching company.
    // Otherwise (default behavior requested), fetch ALL existing companies in the database!
    let targetCompanies = [];

    if (companyId && companyId !== 'all') {
      const companyRes = await client.query(
        `SELECT id, company_name, company_code FROM companies WHERE id = $1`,
        [Number(companyId)]
      );
      if (companyRes.rows.length === 0) {
        throw new Error(`Company with ID ${companyId} not found in database.`);
      }
      targetCompanies = companyRes.rows;
    } else if (companyName && companyName !== 'all') {
      const companyRes = await client.query(
        `SELECT id, company_name, company_code FROM companies 
         WHERE company_name ILIKE $1 OR company_code = $2 
         ORDER BY id ASC`,
        [`%${companyName}%`, companyName]
      );
      if (companyRes.rows.length === 0) {
        throw new Error(`Company "${companyName}" not found in database.`);
      }
      targetCompanies = companyRes.rows;
    } else {
      const allCompaniesRes = await client.query(
        `SELECT id, company_name, company_code FROM companies ORDER BY id ASC`
      );
      targetCompanies = allCompaniesRes.rows;
    }

    if (targetCompanies.length === 0) {
      throw new Error('No existing companies found in database to seed brands for.');
    }

    console.log(
      `⏳ Starting Brands Seeding across ${targetCompanies.length} existing company/companies...`
    );

    const upsertBrandQuery = `
      INSERT INTO brands (
        company_id,
        brand_code,
        brand_name,
        description,
        display_order,
        is_active,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (company_id, LOWER(brand_code))
      DO UPDATE SET
        brand_name = EXCLUDED.brand_name,
        description = EXCLUDED.description,
        display_order = EXCLUDED.display_order,
        is_active = EXCLUDED.is_active,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, company_id, brand_code, brand_name, display_order, is_active;
    `;

    let totalBrandsSeeded = 0;
    const companyResults = [];

    // Loop through every existing company in the database
    for (const company of targetCompanies) {
      const cId = Number(company.id);
      const cName = company.company_name;
      const cCode = company.company_code || `CMP-${cId}`;

      console.log(`\n🏢 [COMPANY ID ${cId}] ${cName} (${cCode})`);

      let companyBrandsCount = 0;
      const processedBrands = [];

      for (const brandData of REALISTIC_BRANDS) {
        const brandRes = await client.query(upsertBrandQuery, [
          cId,
          brandData.brand_code,
          brandData.brand_name,
          brandData.description || null,
          brandData.display_order ?? 0,
          brandData.is_active !== undefined ? brandData.is_active : true,
        ]);

        const brand = brandRes.rows[0];
        companyBrandsCount++;
        totalBrandsSeeded++;
        processedBrands.push(brand);

        console.log(
          `  ✓ Brand [ID ${brand.id}] [${brand.brand_code}] "${brand.brand_name}" (Order: ${brand.display_order})`
        );
      }

      companyResults.push({
        companyId: cId,
        companyName: cName,
        companyCode: cCode,
        brandsCount: companyBrandsCount,
        brands: processedBrands,
      });

      console.log(
        `  ✅ Company [ID ${cId}] "${cName}" complete: ${companyBrandsCount} brands seeded.`
      );
    }

    await client.query('COMMIT');

    console.log(
      `\n🎉 [SEEDER:BRANDS] Seeding Completed! (${totalBrandsSeeded} brands seeded across ${targetCompanies.length} company/companies)`
    );

    return {
      totalCompanies: targetCompanies.length,
      totalBrandsSeeded,
      companies: companyResults,

      // Compatibility fields for single-company callers
      companyId: targetCompanies[0]?.id ? Number(targetCompanies[0].id) : null,
      brandsCount: totalBrandsSeeded,
      brands: companyResults[0]?.brands || [],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding brands:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

export default {
  REALISTIC_BRANDS,
  seedBrands,
};

