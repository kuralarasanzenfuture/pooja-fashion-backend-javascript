import { getDatabasePool } from '../connection.js';

/**
 * ============================================================
 * REALISTIC UNIT SEED DATA (30 RECORDS)
 * ============================================================
 * Standard units of measure for textile, apparel, and fashion retail:
 *   1. PCS          - Pieces        - 0 decimals
 *   2. PAIR         - Pair          - 0 decimals
 *   3. SET          - Set           - 0 decimals
 *   4. METER        - Meter         - 2 decimals
 *   5. CM           - Centimeter    - 2 decimals
 *   6. INCH         - Inch          - 2 decimals
 *   7. KG           - Kilogram      - 3 decimals
 *   8. GM           - Gram          - 2 decimals
 *   9. BOX          - Box           - 0 decimals
 *  10. DOZEN        - Dozen         - 0 decimals
 *  11. PACK         - Pack          - 0 decimals
 *  12. BUNDLE       - Bundle        - 0 decimals
 *  13. ROLL         - Roll          - 0 decimals
 *  14. YARD         - Yard          - 2 decimals
 *  15. FOOT         - Foot          - 2 decimals
 *  16. LITER        - Liter         - 3 decimals
 *  17. ML           - Milliliter    - 2 decimals
 *  18. TON          - Metric Ton    - 3 decimals
 *  19. CARTON       - Carton        - 0 decimals
 *  20. BAG          - Bag           - 0 decimals
 *  21. BOTTLE       - Bottle        - 0 decimals
 *  22. CONE         - Cone          - 0 decimals
 *  23. SPOOL        - Spool         - 0 decimals
 *  24. SQUARE-METER - Square Meter  - 2 decimals
 *  25. SQUARE-FOOT  - Square Foot   - 2 decimals
 *  26. GROSS        - Gross         - 0 decimals
 *  27. LOT          - Lot           - 0 decimals
 *  28. PAIR-SET     - Pair Set      - 0 decimals
 *  29. KIT          - Kit           - 0 decimals
 *  30. DOZEN-PAIR   - Dozen Pair    - 0 decimals
 * ============================================================
 */

export const REALISTIC_UNITS = [
  { unit_code: 'PCS', unit_name: 'Pieces', decimal_places: 0, is_active: true },
  { unit_code: 'PAIR', unit_name: 'Pair', decimal_places: 0, is_active: true },
  { unit_code: 'SET', unit_name: 'Set', decimal_places: 0, is_active: true },
  { unit_code: 'METER', unit_name: 'Meter', decimal_places: 2, is_active: true },
  { unit_code: 'CM', unit_name: 'Centimeter', decimal_places: 2, is_active: true },
  { unit_code: 'INCH', unit_name: 'Inch', decimal_places: 2, is_active: true },
  { unit_code: 'KG', unit_name: 'Kilogram', decimal_places: 3, is_active: true },
  { unit_code: 'GM', unit_name: 'Gram', decimal_places: 2, is_active: true },
  { unit_code: 'BOX', unit_name: 'Box', decimal_places: 0, is_active: true },
  { unit_code: 'DOZEN', unit_name: 'Dozen', decimal_places: 0, is_active: true },
  { unit_code: 'PACK', unit_name: 'Pack', decimal_places: 0, is_active: true },
  { unit_code: 'BUNDLE', unit_name: 'Bundle', decimal_places: 0, is_active: true },
  { unit_code: 'ROLL', unit_name: 'Roll', decimal_places: 0, is_active: true },
  { unit_code: 'YARD', unit_name: 'Yard', decimal_places: 2, is_active: true },
  { unit_code: 'FOOT', unit_name: 'Foot', decimal_places: 2, is_active: true },
  { unit_code: 'LITER', unit_name: 'Liter', decimal_places: 3, is_active: true },
  { unit_code: 'ML', unit_name: 'Milliliter', decimal_places: 2, is_active: true },
  { unit_code: 'TON', unit_name: 'Metric Ton', decimal_places: 3, is_active: true },
  { unit_code: 'CARTON', unit_name: 'Carton', decimal_places: 0, is_active: true },
  { unit_code: 'BAG', unit_name: 'Bag', decimal_places: 0, is_active: true },
  { unit_code: 'BOTTLE', unit_name: 'Bottle', decimal_places: 0, is_active: true },
  { unit_code: 'CONE', unit_name: 'Cone', decimal_places: 0, is_active: true },
  { unit_code: 'SPOOL', unit_name: 'Spool', decimal_places: 0, is_active: true },
  { unit_code: 'SQUARE-METER', unit_name: 'Square Meter', decimal_places: 2, is_active: true },
  { unit_code: 'SQUARE-FOOT', unit_name: 'Square Foot', decimal_places: 2, is_active: true },
  { unit_code: 'GROSS', unit_name: 'Gross', decimal_places: 0, is_active: true },
  { unit_code: 'LOT', unit_name: 'Lot', decimal_places: 0, is_active: true },
  { unit_code: 'PAIR-SET', unit_name: 'Pair Set', decimal_places: 0, is_active: true },
  { unit_code: 'KIT', unit_name: 'Kit', decimal_places: 0, is_active: true },
  { unit_code: 'DOZEN-PAIR', unit_name: 'Dozen Pair', decimal_places: 0, is_active: true },
];

/**
 * Seed realistic units of measure across all existing companies.
 * @param {Object} [options]
 * @param {number|string} [options.companyId]
 * @param {Object} [options.pool]
 * @returns {Promise<Object>}
 */
export const seedUnits = async ({ companyId, pool: customPool } = {}) => {
  const pool = customPool || getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }

  const client = await pool.connect();

  try {
    // Check if any products or variants reference units table before starting transaction
    let canReset = false;
    try {
      const prodCheck = await client.query(
        'SELECT 1 FROM products WHERE default_unit_id IS NOT NULL LIMIT 1'
      );
      const varCheck = await client.query(
        'SELECT 1 FROM product_variants WHERE unit_id IS NOT NULL LIMIT 1'
      );
      canReset = prodCheck.rowCount === 0 && varCheck.rowCount === 0;
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
      throw new Error('No existing companies found in database to seed units for.');
    }

    if (canReset && !companyId) {
      await client.query('TRUNCATE TABLE units RESTART IDENTITY CASCADE');
    }

    console.log(
      `⏳ Starting Units Seeding across ${targetCompanies.length} existing company/companies (30 records each)...`
    );

    let totalUnitsSeeded = 0;
    const companyResults = [];

    // Loop through every existing company in the database
    for (const company of targetCompanies) {
      const cId = Number(company.id);
      const cName = company.company_name;
      const cCode = company.company_code || `CMP-${cId}`;

      console.log(`\n🏢 [COMPANY ID ${cId}] ${cName} (${cCode})`);

      let companyUnitsCount = 0;
      const processedUnits = [];

      for (const unitData of REALISTIC_UNITS) {
        // Match by code OR name to prevent unique constraint conflicts
        const matchRes = await client.query(
          `SELECT id FROM units 
           WHERE company_id = $1 
             AND (LOWER(unit_code) = LOWER($2) OR LOWER(unit_name) = LOWER($3))
           ORDER BY id ASC
           LIMIT 1`,
          [cId, unitData.unit_code, unitData.unit_name]
        );

        let unit;
        if (matchRes.rows.length > 0) {
          const existingId = matchRes.rows[0].id;
          const updateRes = await client.query(
            `UPDATE units
             SET unit_code = $1,
                 unit_name = $2,
                 decimal_places = $3,
                 is_active = $4,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5
             RETURNING id, company_id, unit_code, unit_name, decimal_places, is_active`,
            [
              unitData.unit_code,
              unitData.unit_name,
              unitData.decimal_places ?? 0,
              unitData.is_active !== undefined ? unitData.is_active : true,
              existingId,
            ]
          );
          unit = updateRes.rows[0];
        } else {
          const insertRes = await client.query(
            `INSERT INTO units (
               company_id,
               unit_code,
               unit_name,
               decimal_places,
               is_active,
               created_at,
               updated_at
             )
             VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING id, company_id, unit_code, unit_name, decimal_places, is_active`,
            [
              cId,
              unitData.unit_code,
              unitData.unit_name,
              unitData.decimal_places ?? 0,
              unitData.is_active !== undefined ? unitData.is_active : true,
            ]
          );
          unit = insertRes.rows[0];
        }

        companyUnitsCount++;
        totalUnitsSeeded++;
        processedUnits.push(unit);

        console.log(
          `  ✓ Unit [ID ${unit.id}] [${unit.unit_code}] "${unit.unit_name}" (Decimals: ${unit.decimal_places})`
        );
      }

      companyResults.push({
        companyId: cId,
        companyName: cName,
        companyCode: cCode,
        unitsCount: companyUnitsCount,
        units: processedUnits,
      });

      console.log(
        `  ✅ Company [ID ${cId}] "${cName}" complete: ${companyUnitsCount} units seeded.`
      );
    }

    await client.query('COMMIT');

    console.log(
      `\n🎉 [SEEDER:UNITS] Seeding Completed! (${totalUnitsSeeded} units seeded across ${targetCompanies.length} company/companies)`
    );

    return {
      totalCompanies: targetCompanies.length,
      totalUnitsSeeded,
      companies: companyResults,

      // Compatibility fields for single-company callers
      companyId: targetCompanies[0]?.id ? Number(targetCompanies[0].id) : null,
      unitsCount: totalUnitsSeeded,
      units: companyResults[0]?.units || [],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding units:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

// Standalone execution support
if (process.argv[1] && process.argv[1].endsWith('unit.seeder.js')) {
  import('dotenv').then((dotenv) => {
    dotenv.default.config();
    import('../connection.js').then(async ({ connectDatabase }) => {
      try {
        await connectDatabase();
        await seedUnits();
        console.log('✅ [SEEDER:UNITS] Standalone unit seeding complete.');
        process.exit(0);
      } catch (err) {
        console.error('❌ [SEEDER:UNITS] Standalone seeding failed:', err.message);
        process.exit(1);
      }
    });
  });
}

export default {
  REALISTIC_UNITS,
  seedUnits,
};
