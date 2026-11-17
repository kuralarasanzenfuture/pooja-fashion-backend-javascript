import { getDatabasePool } from '../connection.js';

/**
 * ============================================================
 * REALISTIC MATERIAL SEED DATA (40 RECORDS)
 * ============================================================
 * Comprehensive Indian & International fashion textiles:
 *   1. COTTON           - Cotton           - Natural breathable soft cotton fabric
 *   2. POLYESTER        - Polyester        - Durable synthetic wrinkle-resistant fabric
 *   3. SILK             - Silk             - Luxurious natural silk fiber
 *   4. LINEN            - Linen            - Lightweight breathable natural flax fiber
 *   5. RAYON            - Rayon            - Soft smooth regenerated cellulose fabric
 *   6. DENIM            - Denim            - Sturdy twill-weave cotton fabric for jeans and jackets
 *   7. GEORGETTE        - Georgette        - Sheer lightweight crinkled fabric for sarees and dresses
 *   8. CHIFFON          - Chiffon          - Lightweight sheer plain-woven fabric
 *   9. VELVET           - Velvet           - Luxurious woven tufted fabric with soft dense pile
 *  10. WOOL             - Wool             - Warm natural animal fiber for winter wear
 *  11. NYLON            - Nylon            - High-strength synthetic thermoplastic polymer
 *  12. ACRYLIC          - Acrylic          - Warm lightweight synthetic wool-alternative fiber
 *  13. SPANDEX          - Spandex          - Highly elastic flexible polyurethane fiber
 *  14. LYCRA            - Lycra            - Elastic stretchable synthetic elastane fiber
 *  15. SATIN            - Satin            - Smooth glossy weave luxury fabric
 *  16. CREPE            - Crepe            - Crinkly textured woven fabric
 *  17. VOILE            - Voile            - Soft sheer lightweight woven cotton blend fabric
 *  18. ORGANZA          - Organza          - Thin plain weave sheer fabric for bridal and sarees
 *  19. NET              - Net Fabric       - Open mesh breathable fabric for ethnic and gowns
 *  20. TULLE            - Tulle            - Fine lightweight stiff netting fabric for dresses and veils
 *  21. CORDUROY         - Corduroy         - Durable ridged velvety cotton fabric
 *  22. CANVAS           - Canvas           - Heavy-duty durable plain-woven cotton fabric
 *  23. POPLIN           - Poplin           - Strong crisp plain-weave cotton fabric for shirts
 *  24. FLANNEL          - Flannel          - Soft woven fabric of various fineness for shirts and sleepwear
 *  25. JERSEY           - Jersey Knit      - Stretchy soft knit fabric for t-shirts and casuals
 *  26. KNIT             - Knit Fabric      - Interlooped yarn flexible knit fabric
 *  27. FLEECE           - Fleece           - Warm soft insulating knit fabric for hoodies and jackets
 *  28. MUSLIN           - Muslin           - Lightweight plain weave delicate cotton fabric
 *  29. KHADI            - Khadi            - Hand-spun and hand-woven natural Indian cotton fabric
 *  30. KHADI-COTTON     - Khadi Cotton     - Traditional handspun khadi cotton fabric
 *  31. BANARASI-SILK    - Banarasi Silk    - Opulent traditional woven silk from Varanasi
 *  32. KANJEEVARAM-SILK - Kanjeevaram Silk - Rich South Indian woven mulberry silk with zari
 *  33. TUSSAR-SILK      - Tussar Silk      - Natural textured wild silk with golden sheen
 *  34. CHANDERI         - Chanderi         - Traditional ethnic sheer texture with zari work
 *  35. MAHESHWARI       - Maheshwari       - Fine cotton and silk blend fabric from Maheshwar
 *  36. BROCADE          - Brocade          - Rich decorative shuttle-woven jacquard fabric
 *  37. LINEN-BLEND      - Linen Blend      - Breathable linen blend fabric for casual and formal wear
 *  38. COTTON-BLEND     - Cotton Blend     - Durable and comfortable cotton blend fabric
 *  39. POLY-COTTON      - Poly Cotton      - Wrinkle-resistant durable poly-cotton blend
 *  40. VISCOSE          - Viscose          - Semi-synthetic rayon fabric with silk-like drape
 * ============================================================
 */

export const REALISTIC_MATERIALS = [
  { material_code: 'COTTON', material_name: 'Cotton', description: 'Natural breathable soft cotton fabric', is_active: true },
  { material_code: 'POLYESTER', material_name: 'Polyester', description: 'Durable synthetic wrinkle-resistant fabric', is_active: true },
  { material_code: 'SILK', material_name: 'Silk', description: 'Luxurious natural silk fiber', is_active: true },
  { material_code: 'LINEN', material_name: 'Linen', description: 'Lightweight breathable natural flax fiber', is_active: true },
  { material_code: 'RAYON', material_name: 'Rayon', description: 'Soft smooth regenerated cellulose fabric', is_active: true },
  { material_code: 'DENIM', material_name: 'Denim', description: 'Sturdy twill-weave cotton fabric for jeans and jackets', is_active: true },
  { material_code: 'GEORGETTE', material_name: 'Georgette', description: 'Sheer lightweight crinkled fabric for sarees and dresses', is_active: true },
  { material_code: 'CHIFFON', material_name: 'Chiffon', description: 'Lightweight sheer plain-woven fabric', is_active: true },
  { material_code: 'VELVET', material_name: 'Velvet', description: 'Luxurious woven tufted fabric with soft dense pile', is_active: true },
  { material_code: 'WOOL', material_name: 'Wool', description: 'Warm natural animal fiber for winter wear', is_active: true },
  { material_code: 'NYLON', material_name: 'Nylon', description: 'High-strength synthetic thermoplastic polymer', is_active: true },
  { material_code: 'ACRYLIC', material_name: 'Acrylic', description: 'Warm lightweight synthetic wool-alternative fiber', is_active: true },
  { material_code: 'SPANDEX', material_name: 'Spandex', description: 'Highly elastic flexible polyurethane fiber', is_active: true },
  { material_code: 'LYCRA', material_name: 'Lycra', description: 'Elastic stretchable synthetic elastane fiber', is_active: true },
  { material_code: 'SATIN', material_name: 'Satin', description: 'Smooth glossy weave luxury fabric', is_active: true },
  { material_code: 'CREPE', material_name: 'Crepe', description: 'Crinkly textured woven fabric', is_active: true },
  { material_code: 'VOILE', material_name: 'Voile', description: 'Soft sheer lightweight woven cotton blend fabric', is_active: true },
  { material_code: 'ORGANZA', material_name: 'Organza', description: 'Thin plain weave sheer fabric for bridal and sarees', is_active: true },
  { material_code: 'NET', material_name: 'Net Fabric', description: 'Open mesh breathable fabric for ethnic and gowns', is_active: true },
  { material_code: 'TULLE', material_name: 'Tulle', description: 'Fine lightweight stiff netting fabric for dresses and veils', is_active: true },
  { material_code: 'CORDUROY', material_name: 'Corduroy', description: 'Durable ridged velvety cotton fabric', is_active: true },
  { material_code: 'CANVAS', material_name: 'Canvas', description: 'Heavy-duty durable plain-woven cotton fabric', is_active: true },
  { material_code: 'POPLIN', material_name: 'Poplin', description: 'Strong crisp plain-weave cotton fabric for shirts', is_active: true },
  { material_code: 'FLANNEL', material_name: 'Flannel', description: 'Soft woven fabric of various fineness for shirts and sleepwear', is_active: true },
  { material_code: 'JERSEY', material_name: 'Jersey Knit', description: 'Stretchy soft knit fabric for t-shirts and casuals', is_active: true },
  { material_code: 'KNIT', material_name: 'Knit Fabric', description: 'Interlooped yarn flexible knit fabric', is_active: true },
  { material_code: 'FLEECE', material_name: 'Fleece', description: 'Warm soft insulating knit fabric for hoodies and jackets', is_active: true },
  { material_code: 'MUSLIN', material_name: 'Muslin', description: 'Lightweight plain weave delicate cotton fabric', is_active: true },
  { material_code: 'KHADI', material_name: 'Khadi', description: 'Hand-spun and hand-woven natural Indian cotton fabric', is_active: true },
  { material_code: 'KHADI-COTTON', material_name: 'Khadi Cotton', description: 'Traditional handspun khadi cotton fabric', is_active: true },
  { material_code: 'BANARASI-SILK', material_name: 'Banarasi Silk', description: 'Opulent traditional woven silk from Varanasi', is_active: true },
  { material_code: 'KANJEEVARAM-SILK', material_name: 'Kanjeevaram Silk', description: 'Rich South Indian woven mulberry silk with zari', is_active: true },
  { material_code: 'TUSSAR-SILK', material_name: 'Tussar Silk', description: 'Natural textured wild silk with golden sheen', is_active: true },
  { material_code: 'CHANDERI', material_name: 'Chanderi', description: 'Traditional ethnic sheer texture with zari work', is_active: true },
  { material_code: 'MAHESHWARI', material_name: 'Maheshwari', description: 'Fine cotton and silk blend fabric from Maheshwar', is_active: true },
  { material_code: 'BROCADE', material_name: 'Brocade', description: 'Rich decorative shuttle-woven jacquard fabric', is_active: true },
  { material_code: 'LINEN-BLEND', material_name: 'Linen Blend', description: 'Breathable linen blend fabric for casual and formal wear', is_active: true },
  { material_code: 'COTTON-BLEND', material_name: 'Cotton Blend', description: 'Durable and comfortable cotton blend fabric', is_active: true },
  { material_code: 'POLY-COTTON', material_name: 'Poly Cotton', description: 'Wrinkle-resistant durable poly-cotton blend', is_active: true },
  { material_code: 'VISCOSE', material_name: 'Viscose', description: 'Semi-synthetic rayon fabric with silk-like drape', is_active: true },
];

/**
 * Seed realistic apparel & textile materials across all existing companies.
 * @param {Object} [options]
 * @param {number|string} [options.companyId]
 * @param {Object} [options.pool]
 * @returns {Promise<Object>}
 */
export const seedMaterials = async ({ companyId, pool: customPool } = {}) => {
  const pool = customPool || getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }

  const client = await pool.connect();

  try {
    // Check if any product_variants reference materials before starting transaction
    let canReset = false;
    try {
      const checkRes = await client.query(
        'SELECT 1 FROM product_variants WHERE material_id IS NOT NULL LIMIT 1'
      );
      canReset = checkRes.rowCount === 0;
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
      throw new Error('No existing companies found in database to seed materials for.');
    }

    if (canReset && !companyId) {
      await client.query('TRUNCATE TABLE materials RESTART IDENTITY CASCADE');
    }

    console.log(
      `⏳ Starting Materials Seeding across ${targetCompanies.length} existing company/companies (40 records each)...`
    );

    let totalMaterialsSeeded = 0;
    const companyResults = [];

    // Loop through every existing company in the database
    for (const company of targetCompanies) {
      const cId = Number(company.id);
      const cName = company.company_name;
      const cCode = company.company_code || `CMP-${cId}`;

      console.log(`\n🏢 [COMPANY ID ${cId}] ${cName} (${cCode})`);

      let companyMaterialsCount = 0;
      const processedMaterials = [];

      for (const matData of REALISTIC_MATERIALS) {
        // Match by code OR name to prevent unique constraint conflicts
        const matchRes = await client.query(
          `SELECT id FROM materials 
           WHERE company_id = $1 
             AND (LOWER(material_code) = LOWER($2) OR LOWER(material_name) = LOWER($3))
           ORDER BY id ASC
           LIMIT 1`,
          [cId, matData.material_code, matData.material_name]
        );

        let material;
        if (matchRes.rows.length > 0) {
          const existingId = matchRes.rows[0].id;
          const updateRes = await client.query(
            `UPDATE materials
             SET material_code = $1,
                 material_name = $2,
                 description = $3,
                 is_active = $4,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5
             RETURNING id, company_id, material_code, material_name, is_active`,
            [
              matData.material_code,
              matData.material_name,
              matData.description || null,
              matData.is_active !== undefined ? matData.is_active : true,
              existingId,
            ]
          );
          material = updateRes.rows[0];
        } else {
          const insertRes = await client.query(
            `INSERT INTO materials (
               company_id,
               material_code,
               material_name,
               description,
               is_active,
               created_at,
               updated_at
             )
             VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING id, company_id, material_code, material_name, is_active`,
            [
              cId,
              matData.material_code,
              matData.material_name,
              matData.description || null,
              matData.is_active !== undefined ? matData.is_active : true,
            ]
          );
          material = insertRes.rows[0];
        }

        companyMaterialsCount++;
        totalMaterialsSeeded++;
        processedMaterials.push(material);

        console.log(
          `  ✓ Material [ID ${material.id}] [${material.material_code}] "${material.material_name}"`
        );
      }

      companyResults.push({
        companyId: cId,
        companyName: cName,
        companyCode: cCode,
        materialsCount: companyMaterialsCount,
        materials: processedMaterials,
      });

      console.log(
        `  ✅ Company [ID ${cId}] "${cName}" complete: ${companyMaterialsCount} materials seeded.`
      );
    }

    await client.query('COMMIT');

    console.log(
      `\n🎉 [SEEDER:MATERIALS] Seeding Completed! (${totalMaterialsSeeded} materials seeded across ${targetCompanies.length} company/companies)`
    );

    return {
      totalCompanies: targetCompanies.length,
      totalMaterialsSeeded,
      companies: companyResults,

      // Compatibility fields for single-company callers
      companyId: targetCompanies[0]?.id ? Number(targetCompanies[0].id) : null,
      materialsCount: totalMaterialsSeeded,
      materials: companyResults[0]?.materials || [],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding materials:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

// Standalone execution support
if (process.argv[1] && process.argv[1].endsWith('material.seeder.js')) {
  import('dotenv').then((dotenv) => {
    dotenv.default.config();
    import('../connection.js').then(async ({ connectDatabase }) => {
      try {
        await connectDatabase();
        await seedMaterials();
        console.log('✅ [SEEDER:MATERIALS] Standalone material seeding complete.');
        process.exit(0);
      } catch (err) {
        console.error('❌ [SEEDER:MATERIALS] Standalone seeding failed:', err.message);
        process.exit(1);
      }
    });
  });
}

export default {
  REALISTIC_MATERIALS,
  seedMaterials,
};
