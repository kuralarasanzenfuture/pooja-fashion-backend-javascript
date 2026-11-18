import { getDatabasePool } from '../connection.js';

/**
 * ============================================================
 * STANDARD GST TAX SLABS SEED DATA (5 ESSENTIAL SLABS)
 * ============================================================
 * Standard Indian Goods & Services Tax (GST) slabs:
 *   1. GST_0  - GST 0%   - Rate:  0%, CGST: 0%,   SGST: 0%,   IGST: 0%   - Active: Yes
 *   2. GST_5  - GST 5%   - Rate:  5%, CGST: 2.5%, SGST: 2.5%, IGST: 5%   - Active: Yes
 *   3. GST_12 - GST 12%  - Rate: 12%, CGST: 6%,   SGST: 6%,   IGST: 12%  - Active: Yes
 *   4. GST_18 - GST 18%  - Rate: 18%, CGST: 9%,   SGST: 9%,   IGST: 18%  - Active: Yes
 *   5. GST_28 - GST 28%  - Rate: 28%, CGST: 14%,  SGST: 14%,  IGST: 28%  - Active: Yes
 * ============================================================
 */

export const REALISTIC_TAXES = [
  {
    tax_code: 'GST_0',
    tax_name: 'GST 0%',
    tax_type: 'GST',
    rate: 0.0,
    cgst_rate: 0.0,
    sgst_rate: 0.0,
    igst_rate: 0.0,
    cess_rate: 0.0,
    is_inclusive: false,
    is_active: true,
  },
  {
    tax_code: 'GST_5',
    tax_name: 'GST 5%',
    tax_type: 'GST',
    rate: 5.0,
    cgst_rate: 2.5,
    sgst_rate: 2.5,
    igst_rate: 5.0,
    cess_rate: 0.0,
    is_inclusive: false,
    is_active: true,
  },
  {
    tax_code: 'GST_12',
    tax_name: 'GST 12%',
    tax_type: 'GST',
    rate: 12.0,
    cgst_rate: 6.0,
    sgst_rate: 6.0,
    igst_rate: 12.0,
    cess_rate: 0.0,
    is_inclusive: false,
    is_active: true,
  },
  {
    tax_code: 'GST_18',
    tax_name: 'GST 18%',
    tax_type: 'GST',
    rate: 18.0,
    cgst_rate: 9.0,
    sgst_rate: 9.0,
    igst_rate: 18.0,
    cess_rate: 0.0,
    is_inclusive: false,
    is_active: true,
  },
  {
    tax_code: 'GST_28',
    tax_name: 'GST 28%',
    tax_type: 'GST',
    rate: 28.0,
    cgst_rate: 14.0,
    sgst_rate: 14.0,
    igst_rate: 28.0,
    cess_rate: 0.0,
    is_inclusive: false,
    is_active: true,
  },
];

/**
 * Seed realistic standard GST tax slabs across all existing companies.
 * @param {Object} [options]
 * @param {number|string} [options.companyId]
 * @param {Object} [options.pool]
 * @returns {Promise<Object>}
 */
export const seedTaxes = async ({ companyId, pool: customPool } = {}) => {
  const pool = customPool || getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }

  const client = await pool.connect();

  try {
    // Check if any product taxes reference taxes table before attempting reset
    let canReset = false;
    try {
      const prodTaxCheck = await client.query(
        'SELECT 1 FROM product_taxes WHERE tax_id IS NOT NULL LIMIT 1'
      );
      canReset = prodTaxCheck.rowCount === 0;
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
      throw new Error('No existing companies found in database to seed taxes for.');
    }

    if (canReset && !companyId) {
      await client.query('TRUNCATE TABLE taxes RESTART IDENTITY CASCADE');
    }

    console.log(
      `⏳ Starting Taxes Seeding across ${targetCompanies.length} existing company/companies (5 GST slabs each)...`
    );

    let totalTaxesSeeded = 0;
    const companyResults = [];

    // Loop through every existing company in the database
    for (const company of targetCompanies) {
      const cId = Number(company.id);
      const cName = company.company_name;
      const cCode = company.company_code || `CMP-${cId}`;

      console.log(`\n🏢 [COMPANY ID ${cId}] ${cName} (${cCode})`);

      let companyTaxesCount = 0;
      const processedTaxes = [];

      for (const taxData of REALISTIC_TAXES) {
        // Match by code OR name to prevent unique constraint conflicts
        const matchRes = await client.query(
          `SELECT id FROM taxes 
           WHERE company_id = $1 
             AND (LOWER(tax_code) = LOWER($2) OR LOWER(tax_name) = LOWER($3))
           ORDER BY id ASC
           LIMIT 1`,
          [cId, taxData.tax_code, taxData.tax_name]
        );

        let tax;
        if (matchRes.rows.length > 0) {
          const existingId = matchRes.rows[0].id;
          const updateRes = await client.query(
            `UPDATE taxes
             SET tax_code = $1,
                 tax_name = $2,
                 tax_type = $3,
                 rate = $4,
                 cgst_rate = $5,
                 sgst_rate = $6,
                 igst_rate = $7,
                 cess_rate = $8,
                 is_inclusive = $9,
                 is_active = $10,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $11
             RETURNING id, company_id, tax_code, tax_name, tax_type, rate, cgst_rate, sgst_rate, igst_rate, cess_rate, is_inclusive, is_active`,
            [
              taxData.tax_code,
              taxData.tax_name,
              taxData.tax_type || 'GST',
              taxData.rate,
              taxData.cgst_rate ?? 0,
              taxData.sgst_rate ?? 0,
              taxData.igst_rate ?? taxData.rate,
              taxData.cess_rate ?? 0,
              taxData.is_inclusive ?? false,
              taxData.is_active !== undefined ? taxData.is_active : true,
              existingId,
            ]
          );
          tax = updateRes.rows[0];
        } else {
          const insertRes = await client.query(
            `INSERT INTO taxes (
               company_id,
               tax_code,
               tax_name,
               tax_type,
               rate,
               cgst_rate,
               sgst_rate,
               igst_rate,
               cess_rate,
               is_inclusive,
               is_active,
               created_at,
               updated_at
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING id, company_id, tax_code, tax_name, tax_type, rate, cgst_rate, sgst_rate, igst_rate, cess_rate, is_inclusive, is_active`,
            [
              cId,
              taxData.tax_code,
              taxData.tax_name,
              taxData.tax_type || 'GST',
              taxData.rate,
              taxData.cgst_rate ?? 0,
              taxData.sgst_rate ?? 0,
              taxData.igst_rate ?? taxData.rate,
              taxData.cess_rate ?? 0,
              taxData.is_inclusive ?? false,
              taxData.is_active !== undefined ? taxData.is_active : true,
            ]
          );
          tax = insertRes.rows[0];
        }

        companyTaxesCount++;
        totalTaxesSeeded++;
        processedTaxes.push(tax);

        console.log(
          `  ✓ Tax [ID ${tax.id}] [${tax.tax_code}] "${tax.tax_name}" (Rate: ${tax.rate}%, CGST: ${tax.cgst_rate}%, SGST: ${tax.sgst_rate}%, IGST: ${tax.igst_rate}%)`
        );
      }

      companyResults.push({
        companyId: cId,
        companyName: cName,
        companyCode: cCode,
        taxesCount: companyTaxesCount,
        taxes: processedTaxes,
      });

      console.log(
        `  ✅ Company [ID ${cId}] "${cName}" complete: ${companyTaxesCount} taxes seeded.`
      );
    }

    await client.query('COMMIT');

    console.log(
      `\n🎉 [SEEDER:TAXES] Seeding Completed! (${totalTaxesSeeded} taxes seeded across ${targetCompanies.length} company/companies)`
    );

    return {
      totalCompanies: targetCompanies.length,
      totalTaxesSeeded,
      companies: companyResults,

      // Compatibility fields for single-company callers
      companyId: targetCompanies[0]?.id ? Number(targetCompanies[0].id) : null,
      taxesCount: totalTaxesSeeded,
      taxes: companyResults[0]?.taxes || [],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding taxes:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

// Standalone execution support
if (process.argv[1] && process.argv[1].endsWith('tax.seeder.js')) {
  import('dotenv').then((dotenv) => {
    dotenv.default.config();
    import('../connection.js').then(async ({ connectDatabase }) => {
      try {
        await connectDatabase();
        await seedTaxes();
        console.log('✅ [SEEDER:TAXES] Standalone tax seeding complete.');
        process.exit(0);
      } catch (err) {
        console.error('❌ [SEEDER:TAXES] Standalone seeding failed:', err.message);
        process.exit(1);
      }
    });
  });
}

export default {
  REALISTIC_TAXES,
  seedTaxes,
};

