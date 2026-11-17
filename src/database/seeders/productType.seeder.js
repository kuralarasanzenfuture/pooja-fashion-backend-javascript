import { getDatabasePool } from '../connection.js';

/**
 * ============================================================
 * REALISTIC PRODUCT TYPES SEED DATA (5 RECORDS)
 * ============================================================
 * Standard product types for fashion, retail & apparel ERP:
 *   1. READY_MADE - Ready Made Garments   - Stock: TRUE,  Saleable: TRUE,  Purchasable: TRUE
 *   2. FABRIC     - Fabric                - Stock: TRUE,  Saleable: TRUE,  Purchasable: TRUE
 *   3. ACCESSORY  - Fashion Accessories   - Stock: TRUE,  Saleable: TRUE,  Purchasable: TRUE
 *   4. FOOTWEAR   - Footwear              - Stock: TRUE,  Saleable: TRUE,  Purchasable: TRUE
 *   5. SERVICE    - Services              - Stock: FALSE, Saleable: TRUE,  Purchasable: FALSE
 * ============================================================
 */

export const REALISTIC_PRODUCT_TYPES = [
  {
    type_code: 'READY_MADE',
    type_name: 'Ready Made Garments',
    is_stock_item: true,
    is_saleable: true,
    is_purchasable: true,
    description: 'Shirts, T-shirts, jeans, sarees, dresses',
    is_active: true,
  },
  {
    type_code: 'FABRIC',
    type_name: 'Fabric',
    is_stock_item: true,
    is_saleable: true,
    is_purchasable: true,
    description: 'Cotton, silk, linen, textile rolls',
    is_active: true,
  },
  {
    type_code: 'ACCESSORY',
    type_name: 'Fashion Accessories',
    is_stock_item: true,
    is_saleable: true,
    is_purchasable: true,
    description: 'Belts, bags, caps, jewellery',
    is_active: true,
  },
  {
    type_code: 'FOOTWEAR',
    type_name: 'Footwear',
    is_stock_item: true,
    is_saleable: true,
    is_purchasable: true,
    description: 'Shoes, sandals, slippers, heels',
    is_active: true,
  },
  {
    type_code: 'SERVICE',
    type_name: 'Services',
    is_stock_item: false,
    is_saleable: true,
    is_purchasable: false,
    description: 'Alteration, stitching, embroidery',
    is_active: true,
  },
];

/**
 * Seed realistic apparel & ERP product types across all existing companies.
 * @param {Object} [options]
 * @param {number|string} [options.companyId]
 * @param {Object} [options.pool]
 * @returns {Promise<Object>}
 */
export const seedProductTypes = async ({ companyId, pool: customPool } = {}) => {
  const pool = customPool || getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }

  const client = await pool.connect();

  try {
    // Check if any products reference product_types before starting transaction
    let canReset = false;
    try {
      const prodCheck = await client.query(
        'SELECT 1 FROM products WHERE product_type_id IS NOT NULL LIMIT 1'
      );
      canReset = prodCheck.rowCount === 0;
    } catch {
      canReset = true;
    }

    await client.query('BEGIN');

    // Determine target companies
    let targetCompanies = [];
    if (companyId) {
      const compRes = await client.query(
        'SELECT id, company_name, company_code FROM companies WHERE id = $1',
        [companyId]
      );
      if (compRes.rows.length === 0) {
        throw new Error(`Company with ID ${companyId} not found in database.`);
      }
      targetCompanies = compRes.rows;
    } else {
      const allCompRes = await client.query(
        'SELECT id, company_name, company_code FROM companies ORDER BY id ASC'
      );
      targetCompanies = allCompRes.rows;
    }

    if (targetCompanies.length === 0) {
      throw new Error('No existing companies found in database to seed product types for.');
    }

    if (canReset && !companyId) {
      await client.query('TRUNCATE TABLE product_types RESTART IDENTITY CASCADE');
    }

    console.log(
      `⏳ Starting Product Types Seeding across ${targetCompanies.length} existing company/companies (5 records each)...`
    );

    let totalProductTypesSeeded = 0;
    const companyResults = [];

    // Loop through every existing company in the database
    for (const company of targetCompanies) {
      const cId = Number(company.id);
      const cName = company.company_name;
      const cCode = company.company_code || `CMP-${cId}`;

      console.log(`\n🏢 [COMPANY ID ${cId}] ${cName} (${cCode})`);

      let companyTypesCount = 0;
      const processedTypes = [];

      for (const ptData of REALISTIC_PRODUCT_TYPES) {
        // Match by code OR name to prevent unique constraint conflicts
        const matchRes = await client.query(
          `SELECT id FROM product_types 
           WHERE company_id = $1 
             AND (LOWER(type_code) = LOWER($2) OR LOWER(type_name) = LOWER($3))
           ORDER BY id ASC
           LIMIT 1`,
          [cId, ptData.type_code, ptData.type_name]
        );

        let productType;
        if (matchRes.rows.length > 0) {
          const existingId = matchRes.rows[0].id;
          const updateRes = await client.query(
            `UPDATE product_types
             SET type_code = $1,
                 type_name = $2,
                 description = $3,
                 is_stock_item = $4,
                 is_saleable = $5,
                 is_purchasable = $6,
                 is_active = $7,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $8
             RETURNING id, company_id, type_code, type_name, description, is_stock_item, is_saleable, is_purchasable, is_active`,
            [
              ptData.type_code,
              ptData.type_name,
              ptData.description || null,
              ptData.is_stock_item !== undefined ? ptData.is_stock_item : true,
              ptData.is_saleable !== undefined ? ptData.is_saleable : true,
              ptData.is_purchasable !== undefined ? ptData.is_purchasable : true,
              ptData.is_active !== undefined ? ptData.is_active : true,
              existingId,
            ]
          );
          productType = updateRes.rows[0];
          console.log(`  ↻ Updated product type [ID ${productType.id}]: "${productType.type_name}" (${productType.type_code})`);
        } else {
          const insertRes = await client.query(
            `INSERT INTO product_types (
               company_id,
               type_code,
               type_name,
               description,
               is_stock_item,
               is_saleable,
               is_purchasable,
               is_active,
               created_at,
               updated_at
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING id, company_id, type_code, type_name, description, is_stock_item, is_saleable, is_purchasable, is_active`,
            [
              cId,
              ptData.type_code,
              ptData.type_name,
              ptData.description || null,
              ptData.is_stock_item !== undefined ? ptData.is_stock_item : true,
              ptData.is_saleable !== undefined ? ptData.is_saleable : true,
              ptData.is_purchasable !== undefined ? ptData.is_purchasable : true,
              ptData.is_active !== undefined ? ptData.is_active : true,
            ]
          );
          productType = insertRes.rows[0];
          console.log(`  ✓ Inserted product type [ID ${productType.id}]: "${productType.type_name}" (${productType.type_code})`);
        }

        processedTypes.push(productType);
        companyTypesCount++;
      }

      totalProductTypesSeeded += companyTypesCount;
      companyResults.push({
        companyId: cId,
        companyName: cName,
        companyCode: cCode,
        productTypesCount: companyTypesCount,
        productTypes: processedTypes,
      });

      console.log(`  📊 Finished company [ID ${cId}]: ${companyTypesCount} product types processed.`);
    }

    await client.query('COMMIT');
    console.log(
      `\n✅ [SEEDER:PRODUCT_TYPES] Successfully seeded ${totalProductTypesSeeded} product types across ${targetCompanies.length} company/companies.`
    );

    return {
      totalCompanies: targetCompanies.length,
      totalProductTypesSeeded,
      companies: companyResults,
      companyResults,
      // Convenience for single company callers
      companyId: targetCompanies[0]?.id ? Number(targetCompanies[0].id) : null,
      productTypesCount: totalProductTypesSeeded,
      productTypes: companyResults[0]?.productTypes || [],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding product types:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

// Standalone execution support
if (process.argv[1] && process.argv[1].endsWith('productType.seeder.js')) {
  import('dotenv').then((dotenv) => {
    dotenv.default.config();
    import('../connection.js').then(async ({ connectDatabase }) => {
      try {
        await connectDatabase();
        await seedProductTypes();
        console.log('✅ [SEEDER:PRODUCT_TYPES] Standalone product types seeding complete.');
        process.exit(0);
      } catch (err) {
        console.error('❌ [SEEDER:PRODUCT_TYPES] Standalone seeding failed:', err.message);
        process.exit(1);
      }
    });
  });
}

export default {
  REALISTIC_PRODUCT_TYPES,
  seedProductTypes,
};
