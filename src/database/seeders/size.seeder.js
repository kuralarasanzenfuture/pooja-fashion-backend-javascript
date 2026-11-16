import { getDatabasePool } from '../connection.js';

/**
 * ============================================================
 * REALISTIC SIZE GROUPS & SIZES SEED DATA
 * ============================================================
 * 1. Size Groups:
 *    - MEN (Men's Clothing)
 *    - WOMEN (Women's Clothing)
 *    - KIDS (Kids Clothing)
 *    - FOOTWEAR (Footwear)
 *    - FREE (Free Size)
 *    - SAREE (Saree)
 *    - INNERWEAR (Innerwear)
 *
 * 2. Child Sizes (28 records total with display orders):
 *    - MEN: S (1), M (2), L (3), XL (4), XXL (5), 3XL (6)
 *    - WOMEN: XS (1), S (2), M (3), L (4), XL (5), XXL (6)
 *    - KIDS: 20 (1), 22 (2), 24 (3), 26 (4), 28 (5), 30 (6)
 *    - FOOTWEAR: 6 (1), 7 (2), 8 (3), 9 (4), 10 (5)
 *    - FREE: FREE (1)
 *    - SAREE: FREE (1)
 *    - INNERWEAR: M (1), L (2), XL (3)
 * ============================================================
 */

export const REALISTIC_SIZE_GROUPS = [
  {
    group_code: 'MEN',
    group_name: "Men's Clothing",
    description: "Standard clothing and apparel sizing for men (Shirts, T-shirts, Trousers, Kurtas, etc.)",
    is_active: true,
    sizes: [
      { size_code: 'S', size_name: 'Small', display_order: 1 },
      { size_code: 'M', size_name: 'Medium', display_order: 2 },
      { size_code: 'L', size_name: 'Large', display_order: 3 },
      { size_code: 'XL', size_name: 'Extra Large', display_order: 4 },
      { size_code: 'XXL', size_name: 'Double XL', display_order: 5 },
      { size_code: '3XL', size_name: 'Triple XL', display_order: 6 },
    ],
  },
  {
    group_code: 'WOMEN',
    group_name: "Women's Clothing",
    description: "Standard clothing and apparel sizing for women (Dresses, Tops, Kurtis, Bottoms, etc.)",
    is_active: true,
    sizes: [
      { size_code: 'XS', size_name: 'Extra Small', display_order: 1 },
      { size_code: 'S', size_name: 'Small', display_order: 2 },
      { size_code: 'M', size_name: 'Medium', display_order: 3 },
      { size_code: 'L', size_name: 'Large', display_order: 4 },
      { size_code: 'XL', size_name: 'Extra Large', display_order: 5 },
      { size_code: 'XXL', size_name: 'Double XL', display_order: 6 },
    ],
  },
  {
    group_code: 'KIDS',
    group_name: 'Kids Clothing',
    description: 'Numbered clothing and apparel sizing for kids and teenagers',
    is_active: true,
    sizes: [
      { size_code: '20', size_name: 'Size 20', display_order: 1 },
      { size_code: '22', size_name: 'Size 22', display_order: 2 },
      { size_code: '24', size_name: 'Size 24', display_order: 3 },
      { size_code: '26', size_name: 'Size 26', display_order: 4 },
      { size_code: '28', size_name: 'Size 28', display_order: 5 },
      { size_code: '30', size_name: 'Size 30', display_order: 6 },
    ],
  },
  {
    group_code: 'FOOTWEAR',
    group_name: 'Footwear',
    description: 'Standard footwear and shoe sizing (UK/India standard)',
    is_active: true,
    sizes: [
      { size_code: '6', size_name: 'UK 6', display_order: 1 },
      { size_code: '7', size_name: 'UK 7', display_order: 2 },
      { size_code: '8', size_name: 'UK 8', display_order: 3 },
      { size_code: '9', size_name: 'UK 9', display_order: 4 },
      { size_code: '10', size_name: 'UK 10', display_order: 5 },
    ],
  },
  {
    group_code: 'FREE',
    group_name: 'Free Size',
    description: 'One-size-fits-all / Free size garments (Dupattas, Shawls, Accessories)',
    is_active: true,
    sizes: [
      { size_code: 'FREE', size_name: 'Free Size', display_order: 1 },
    ],
  },
  {
    group_code: 'SAREE',
    group_name: 'Saree',
    description: 'Standard saree dimensions and sizing',
    is_active: true,
    sizes: [
      { size_code: 'FREE', size_name: 'Free Size', display_order: 1 },
    ],
  },
  {
    group_code: 'INNERWEAR',
    group_name: 'Innerwear',
    description: 'Innerwear, lingerie, and loungewear sizing',
    is_active: true,
    sizes: [
      { size_code: 'M', size_name: 'Medium', display_order: 1 },
      { size_code: 'L', size_name: 'Large', display_order: 2 },
      { size_code: 'XL', size_name: 'Extra Large', display_order: 3 },
    ],
  },
];

/**
 * Seed realistic size groups and child sizes idempotently across ALL existing companies (or a specified company)
 *
 * @param {Object} [options]
 * @param {number|string|null} [options.companyId] - Specific company ID (if null/omitted, seeds for ALL existing companies)
 * @param {string|null} [options.companyName] - Optional company name filter (if provided, limits to matching company)
 * @param {boolean} [options.allCompanies=false] - Explicit flag to seed for all companies
 * @param {Object|null} [options.pool] - Optional database pool instance (for dependency injection/testing)
 * @returns {Promise<{
 *   totalCompanies: number,
 *   totalSizeGroupsSeeded: number,
 *   totalSizesSeeded: number,
 *   companies: Array<{
 *     companyId: number,
 *     companyName: string,
 *     companyCode: string,
 *     sizeGroupsCount: number,
 *     sizesCount: number,
 *     sizeGroups: Array
 *   }>,
 *   companyId: number|null,
 *   sizeGroupsCount: number,
 *   sizesCount: number,
 *   sizeGroups: Array
 * }>}
 */
export const seedSizes = async ({
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
      throw new Error('No existing companies found in database to seed size groups and sizes for.');
    }

    console.log(
      `⏳ Starting Size Groups & Sizes Seeding across ${targetCompanies.length} existing company/companies...`
    );

    const upsertGroupQuery = `
      INSERT INTO size_groups (
        company_id,
        size_group_code,
        size_group_name,
        description,
        is_active,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (company_id, LOWER(size_group_code))
      DO UPDATE SET
        size_group_name = EXCLUDED.size_group_name,
        description = EXCLUDED.description,
        is_active = EXCLUDED.is_active,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, company_id, size_group_code, size_group_name, is_active;
    `;

    const upsertSizeQuery = `
      INSERT INTO sizes (
        company_id,
        size_group_id,
        size_code,
        size_name,
        display_order,
        is_active,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (size_group_id, LOWER(size_code))
      DO UPDATE SET
        size_name = EXCLUDED.size_name,
        display_order = EXCLUDED.display_order,
        is_active = EXCLUDED.is_active,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, company_id, size_group_id, size_code, size_name, display_order, is_active;
    `;

    let totalSizeGroupsSeeded = 0;
    let totalSizesSeeded = 0;
    const companyResults = [];

    // Loop through every existing company in the database
    for (const company of targetCompanies) {
      const cId = Number(company.id);
      const cName = company.company_name;
      const cCode = company.company_code || `CMP-${cId}`;

      console.log(`\n🏢 [COMPANY ID ${cId}] ${cName} (${cCode})`);

      let companyGroupsCount = 0;
      let companySizesCount = 0;
      const processedGroups = [];

      for (const groupData of REALISTIC_SIZE_GROUPS) {
        // Upsert Size Group for this company
        const groupRes = await client.query(upsertGroupQuery, [
          cId,
          groupData.group_code,
          groupData.group_name,
          groupData.description || null,
          groupData.is_active !== undefined ? groupData.is_active : true,
        ]);

        const group = groupRes.rows[0];
        companyGroupsCount++;
        totalSizeGroupsSeeded++;

        const processedSizes = [];

        // Upsert Child Sizes for this group & company
        for (const sizeData of groupData.sizes || []) {
          const sizeRes = await client.query(upsertSizeQuery, [
            cId,
            group.id,
            sizeData.size_code,
            sizeData.size_name,
            sizeData.display_order ?? 0,
            true,
          ]);

          const size = sizeRes.rows[0];
          companySizesCount++;
          totalSizesSeeded++;
          processedSizes.push(size);
        }

        console.log(
          `  ✓ Size Group [ID ${group.id}] [${group.size_group_code}] "${group.size_group_name}" (${processedSizes.length} sizes)`
        );

        processedGroups.push({
          ...group,
          sizes: processedSizes,
        });
      }

      companyResults.push({
        companyId: cId,
        companyName: cName,
        companyCode: cCode,
        sizeGroupsCount: companyGroupsCount,
        sizesCount: companySizesCount,
        sizeGroups: processedGroups,
      });

      console.log(
        `  ✅ Company [ID ${cId}] "${cName}" complete: ${companyGroupsCount} groups, ${companySizesCount} sizes seeded.`
      );
    }

    await client.query('COMMIT');

    console.log(
      `\n🎉 [SEEDER:SIZES] Seeding Completed! (${totalSizeGroupsSeeded} groups, ${totalSizesSeeded} sizes seeded across ${targetCompanies.length} company/companies)`
    );

    return {
      totalCompanies: targetCompanies.length,
      totalSizeGroupsSeeded,
      totalSizesSeeded,
      companies: companyResults,

      // Compatibility fields for single-company callers
      companyId: targetCompanies[0]?.id ? Number(targetCompanies[0].id) : null,
      sizeGroupsCount: totalSizeGroupsSeeded,
      sizesCount: totalSizesSeeded,
      sizeGroups: companyResults[0]?.sizeGroups || [],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding size groups and sizes:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

export default {
  REALISTIC_SIZE_GROUPS,
  seedSizes,
  seedSizeGroups: seedSizes,
};
