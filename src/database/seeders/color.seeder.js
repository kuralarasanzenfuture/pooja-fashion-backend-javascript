import { getDatabasePool } from '../connection.js';

/**
 * ============================================================
 * REALISTIC COLOR SEED DATA (50 RECORDS)
 * ============================================================
 * Part 1: Standard Base Colors (Records 1 - 30)
 *  1. BLACK        - Black         - #000000
 *  2. WHITE        - White         - #FFFFFF
 *  3. RED          - Red           - #FF0000
 *  4. BLUE         - Blue          - #0000FF
 *  5. NAVY         - Navy Blue     - #000080
 *  6. GREEN        - Green         - #008000
 *  7. YELLOW       - Yellow        - #FFFF00
 *  8. PINK         - Pink          - #FFC0CB
 *  9. ORANGE       - Orange        - #FFA500
 * 10. PURPLE       - Purple        - #800080
 * 11. GREY         - Grey          - #808080
 * 12. BROWN        - Brown         - #A52A2A
 * 13. MAROON       - Maroon        - #800000
 * 14. BEIGE        - Beige         - #F5F5DC
 * 15. CREAM        - Cream         - #FFFDD0
 * 16. GOLD         - Gold          - #FFD700
 * 17. SILVER       - Silver        - #C0C0C0
 * 18. SKY-BLUE     - Sky Blue      - #87CEEB
 * 19. LIGHT-BLUE   - Light Blue    - #ADD8E6
 * 20. DARK-BLUE    - Dark Blue     - #00008B
 * 21. DARK-GREEN   - Dark Green    - #006400
 * 22. OLIVE        - Olive Green   - #808000
 * 23. LAVENDER     - Lavender      - #E6E6FA
 * 24. MAGENTA      - Magenta       - #FF00FF
 * 25. TURQUOISE    - Turquoise     - #40E0D0
 * 26. PEACH        - Peach         - #FFE5B4
 * 27. WINE         - Wine          - #722F37
 * 28. TEAL         - Teal          - #008080
 * 29. CORAL        - Coral         - #FF7F50
 * 30. MUSTARD      - Mustard       - #FFDB58
 *
 * Part 2: Additional Fashion Shade Variations (Records 31 - 50)
 * 31. RUST         - Rust          - #B7410E
 * 32. TAN          - Tan           - #D2B48C
 * 33. KHAKI        - Khaki         - #C3B091
 * 34. COFFEE       - Coffee Brown  - #6F4E37
 * 35. CHOCOLATE    - Chocolate     - #7B3F00
 * 36. CHARCOAL     - Charcoal Grey - #36454F
 * 37. OFF-WHITE    - Off White     - #FAF9F6
 * 38. IVORY        - Ivory         - #FFFFF0
 * 39. FUCHSIA      - Fuchsia       - #FF00FF
 * 40. ROSE         - Rose Pink     - #F33A6A
 * 41. BABY-PINK    - Baby Pink     - #F4C2C2
 * 42. PEACOCK-BLUE - Peacock Blue  - #005F69
 * 43. SEA-GREEN    - Sea Green     - #2E8B57
 * 44. MINT-GREEN   - Mint Green    - #98FF98
 * 45. LEMON-YELLOW - Lemon Yellow  - #FFF44F
 * 46. SKY-GREY     - Sky Grey      - #B7C9D6
 * 47. BRICK-RED    - Brick Red     - #CB4154
 * 48. ONION-PINK   - Onion Pink    - #C08081
 * 49. SANDAL       - Sandal        - #C2A078
 * 50. MULTICOLOR   - Multicolor    - NULL
 * ============================================================
 */

export const REALISTIC_COLORS = [
  // 1 - 30: Base Colors
  { color_code: 'BLACK', color_name: 'Black', hex_code: '#000000', display_order: 1, is_active: true, description: 'Classic Black' },
  { color_code: 'WHITE', color_name: 'White', hex_code: '#FFFFFF', display_order: 2, is_active: true, description: 'Classic White' },
  { color_code: 'RED', color_name: 'Red', hex_code: '#FF0000', display_order: 3, is_active: true, description: 'Classic Red' },
  { color_code: 'BLUE', color_name: 'Blue', hex_code: '#0000FF', display_order: 4, is_active: true, description: 'Classic Blue' },
  { color_code: 'NAVY', color_name: 'Navy Blue', hex_code: '#000080', display_order: 5, is_active: true, description: 'Navy Blue' },
  { color_code: 'GREEN', color_name: 'Green', hex_code: '#008000', display_order: 6, is_active: true, description: 'Classic Green' },
  { color_code: 'YELLOW', color_name: 'Yellow', hex_code: '#FFFF00', display_order: 7, is_active: true, description: 'Classic Yellow' },
  { color_code: 'PINK', color_name: 'Pink', hex_code: '#FFC0CB', display_order: 8, is_active: true, description: 'Classic Pink' },
  { color_code: 'ORANGE', color_name: 'Orange', hex_code: '#FFA500', display_order: 9, is_active: true, description: 'Classic Orange' },
  { color_code: 'PURPLE', color_name: 'Purple', hex_code: '#800080', display_order: 10, is_active: true, description: 'Classic Purple' },
  { color_code: 'GREY', color_name: 'Grey', hex_code: '#808080', display_order: 11, is_active: true, description: 'Classic Grey' },
  { color_code: 'BROWN', color_name: 'Brown', hex_code: '#A52A2A', display_order: 12, is_active: true, description: 'Classic Brown' },
  { color_code: 'MAROON', color_name: 'Maroon', hex_code: '#800000', display_order: 13, is_active: true, description: 'Classic Maroon' },
  { color_code: 'BEIGE', color_name: 'Beige', hex_code: '#F5F5DC', display_order: 14, is_active: true, description: 'Classic Beige' },
  { color_code: 'CREAM', color_name: 'Cream', hex_code: '#FFFDD0', display_order: 15, is_active: true, description: 'Classic Cream' },
  { color_code: 'GOLD', color_name: 'Gold', hex_code: '#FFD700', display_order: 16, is_active: true, description: 'Festive Gold' },
  { color_code: 'SILVER', color_name: 'Silver', hex_code: '#C0C0C0', display_order: 17, is_active: true, description: 'Metallic Silver' },
  { color_code: 'SKY-BLUE', color_name: 'Sky Blue', hex_code: '#87CEEB', display_order: 18, is_active: true, description: 'Sky Blue' },
  { color_code: 'LIGHT-BLUE', color_name: 'Light Blue', hex_code: '#ADD8E6', display_order: 19, is_active: true, description: 'Light Blue' },
  { color_code: 'DARK-BLUE', color_name: 'Dark Blue', hex_code: '#00008B', display_order: 20, is_active: true, description: 'Dark Blue' },
  { color_code: 'DARK-GREEN', color_name: 'Dark Green', hex_code: '#006400', display_order: 21, is_active: true, description: 'Dark Green' },
  { color_code: 'OLIVE', color_name: 'Olive Green', hex_code: '#808000', display_order: 22, is_active: true, description: 'Olive Green' },
  { color_code: 'LAVENDER', color_name: 'Lavender', hex_code: '#E6E6FA', display_order: 23, is_active: true, description: 'Lavender' },
  { color_code: 'MAGENTA', color_name: 'Magenta', hex_code: '#FF00FF', display_order: 24, is_active: true, description: 'Magenta' },
  { color_code: 'TURQUOISE', color_name: 'Turquoise', hex_code: '#40E0D0', display_order: 25, is_active: true, description: 'Turquoise' },
  { color_code: 'PEACH', color_name: 'Peach', hex_code: '#FFE5B4', display_order: 26, is_active: true, description: 'Peach' },
  { color_code: 'WINE', color_name: 'Wine', hex_code: '#722F37', display_order: 27, is_active: true, description: 'Wine' },
  { color_code: 'TEAL', color_name: 'Teal', hex_code: '#008080', display_order: 28, is_active: true, description: 'Teal' },
  { color_code: 'CORAL', color_name: 'Coral', hex_code: '#FF7F50', display_order: 29, is_active: true, description: 'Coral' },
  { color_code: 'MUSTARD', color_name: 'Mustard', hex_code: '#FFDB58', display_order: 30, is_active: true, description: 'Mustard' },

  // 31 - 50: Additional Fashion Variations
  { color_code: 'RUST', color_name: 'Rust', hex_code: '#B7410E', display_order: 31, is_active: true, description: 'Rust' },
  { color_code: 'TAN', color_name: 'Tan', hex_code: '#D2B48C', display_order: 32, is_active: true, description: 'Tan' },
  { color_code: 'KHAKI', color_name: 'Khaki', hex_code: '#C3B091', display_order: 33, is_active: true, description: 'Khaki' },
  { color_code: 'COFFEE', color_name: 'Coffee Brown', hex_code: '#6F4E37', display_order: 34, is_active: true, description: 'Coffee Brown' },
  { color_code: 'CHOCOLATE', color_name: 'Chocolate', hex_code: '#7B3F00', display_order: 35, is_active: true, description: 'Chocolate' },
  { color_code: 'CHARCOAL', color_name: 'Charcoal Grey', hex_code: '#36454F', display_order: 36, is_active: true, description: 'Charcoal Grey' },
  { color_code: 'OFF-WHITE', color_name: 'Off White', hex_code: '#FAF9F6', display_order: 37, is_active: true, description: 'Off White' },
  { color_code: 'IVORY', color_name: 'Ivory', hex_code: '#FFFFF0', display_order: 38, is_active: true, description: 'Ivory' },
  { color_code: 'FUCHSIA', color_name: 'Fuchsia', hex_code: '#FF00FF', display_order: 39, is_active: true, description: 'Fuchsia' },
  { color_code: 'ROSE', color_name: 'Rose Pink', hex_code: '#F33A6A', display_order: 40, is_active: true, description: 'Rose Pink' },
  { color_code: 'BABY-PINK', color_name: 'Baby Pink', hex_code: '#F4C2C2', display_order: 41, is_active: true, description: 'Baby Pink' },
  { color_code: 'PEACOCK-BLUE', color_name: 'Peacock Blue', hex_code: '#005F69', display_order: 42, is_active: true, description: 'Peacock Blue' },
  { color_code: 'SEA-GREEN', color_name: 'Sea Green', hex_code: '#2E8B57', display_order: 43, is_active: true, description: 'Sea Green' },
  { color_code: 'MINT-GREEN', color_name: 'Mint Green', hex_code: '#98FF98', display_order: 44, is_active: true, description: 'Mint Green' },
  { color_code: 'LEMON-YELLOW', color_name: 'Lemon Yellow', hex_code: '#FFF44F', display_order: 45, is_active: true, description: 'Lemon Yellow' },
  { color_code: 'SKY-GREY', color_name: 'Sky Grey', hex_code: '#B7C9D6', display_order: 46, is_active: true, description: 'Sky Grey' },
  { color_code: 'BRICK-RED', color_name: 'Brick Red', hex_code: '#CB4154', display_order: 47, is_active: true, description: 'Brick Red' },
  { color_code: 'ONION-PINK', color_name: 'Onion Pink', hex_code: '#C08081', display_order: 48, is_active: true, description: 'Onion Pink' },
  { color_code: 'SANDAL', color_name: 'Sandal', hex_code: '#C2A078', display_order: 49, is_active: true, description: 'Sandal' },
  { color_code: 'MULTICOLOR', color_name: 'Multicolor', hex_code: null, display_order: 50, is_active: true, description: 'Multicolor' },
];

/**
 * Seed realistic apparel & fashion colors across all existing companies.
 * @param {Object} [options]
 * @param {number|string} [options.companyId]
 * @param {Object} [options.pool]
 * @returns {Promise<Object>}
 */
export const seedColors = async ({ companyId, pool: customPool } = {}) => {
  const pool = customPool || getDatabasePool();
  if (!pool) {
    throw new Error('Database pool has not been initialized');
  }

  const client = await pool.connect();

  try {
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
      throw new Error('No existing companies found in database to seed colors for.');
    }

    console.log(
      `⏳ Starting Colors Seeding across ${targetCompanies.length} existing company/companies (50 records each)...`
    );

    let totalColorsSeeded = 0;
    const companyResults = [];

    // Loop through every existing company in the database
    for (const company of targetCompanies) {
      const cId = Number(company.id);
      const cName = company.company_name;
      const cCode = company.company_code || `CMP-${cId}`;

      console.log(`\n🏢 [COMPANY ID ${cId}] ${cName} (${cCode})`);

      let companyColorsCount = 0;
      const processedColors = [];

      for (const colorData of REALISTIC_COLORS) {
        // Robust match by code OR name to ensure zero unique constraint conflicts
        const matchRes = await client.query(
          `SELECT id FROM colors 
           WHERE company_id = $1 
             AND (LOWER(color_code) = LOWER($2) OR LOWER(color_name) = LOWER($3))
           ORDER BY id ASC
           LIMIT 1`,
          [cId, colorData.color_code, colorData.color_name]
        );

        let color;
        if (matchRes.rows.length > 0) {
          const existingId = matchRes.rows[0].id;
          const updateRes = await client.query(
            `UPDATE colors
             SET color_code = $1,
                 color_name = $2,
                 hex_code = $3,
                 description = $4,
                 display_order = $5,
                 is_active = $6,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $7
             RETURNING id, company_id, color_code, color_name, hex_code, display_order, is_active`,
            [
              colorData.color_code,
              colorData.color_name,
              colorData.hex_code || null,
              colorData.description || null,
              colorData.display_order ?? 0,
              colorData.is_active !== undefined ? colorData.is_active : true,
              existingId,
            ]
          );
          color = updateRes.rows[0];
        } else {
          const insertRes = await client.query(
            `INSERT INTO colors (
               company_id,
               color_code,
               color_name,
               hex_code,
               description,
               display_order,
               is_active,
               created_at,
               updated_at
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING id, company_id, color_code, color_name, hex_code, display_order, is_active`,
            [
              cId,
              colorData.color_code,
              colorData.color_name,
              colorData.hex_code || null,
              colorData.description || null,
              colorData.display_order ?? 0,
              colorData.is_active !== undefined ? colorData.is_active : true,
            ]
          );
          color = insertRes.rows[0];
        }

        companyColorsCount++;
        totalColorsSeeded++;
        processedColors.push(color);

        console.log(
          `  ✓ Color [ID ${color.id}] [${color.color_code}] "${color.color_name}" (Hex: ${color.hex_code ?? 'NULL'}, Order: ${color.display_order})`
        );
      }

      companyResults.push({
        companyId: cId,
        companyName: cName,
        companyCode: cCode,
        colorsCount: companyColorsCount,
        colors: processedColors,
      });

      console.log(
        `  ✅ Company [ID ${cId}] "${cName}" complete: ${companyColorsCount} colors seeded.`
      );
    }

    await client.query('COMMIT');

    console.log(
      `\n🎉 [SEEDER:COLORS] Seeding Completed! (${totalColorsSeeded} colors seeded across ${targetCompanies.length} company/companies)`
    );

    return {
      totalCompanies: targetCompanies.length,
      totalColorsSeeded,
      companies: companyResults,

      // Compatibility fields for single-company callers
      companyId: targetCompanies[0]?.id ? Number(targetCompanies[0].id) : null,
      colorsCount: totalColorsSeeded,
      colors: companyResults[0]?.colors || [],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding colors:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

// Standalone execution support
if (process.argv[1] && process.argv[1].endsWith('color.seeder.js')) {
  import('dotenv').then((dotenv) => {
    dotenv.default.config();
    import('../connection.js').then(async ({ connectDatabase }) => {
      try {
        await connectDatabase();
        await seedColors();
        console.log('✅ [SEEDER:COLORS] Standalone color seeding complete.');
        process.exit(0);
      } catch (err) {
        console.error('❌ [SEEDER:COLORS] Standalone seeding failed:', err.message);
        process.exit(1);
      }
    });
  });
}

export default {
  REALISTIC_COLORS,
  seedColors,
};
