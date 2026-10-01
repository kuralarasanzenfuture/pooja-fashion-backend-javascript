import { getDatabasePool } from '../connection.js';

/**
 * Seed default company details for Pooja Fashion Shop idempotently.
 * Creates/ensures:
 * 1. Primary Company (PFS001 - Pooja Fashion Shop)
 * 2. Company Address (Head Office)
 * 3. Company Primary Contact (Owner)
 * 4. Company Tax Details (GSTIN, PAN)
 * 5. Business Settings (Prefixes, policies, currency)
 * 6. Branches (PFS-HO Head Office, PFS-B01 Hosur Branch) with addresses and contacts
 *
 * @returns {Promise<{ company: Object, branches: Array }>}
 */
export const seedCompanies = async () => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool not initialized');
  }

  // 1. Primary Company Record
  const companyCode = 'PFS001';
  let company;

  const existingCompanyRes = await pool.query(
    'SELECT * FROM companies WHERE company_code = $1 LIMIT 1',
    [companyCode]
  );

  if (existingCompanyRes.rowCount === 0) {
    const insertCompanyQuery = `
      INSERT INTO companies (
        company_code,
        company_name,
        legal_name,
        display_name,
        business_type,
        industry_type,
        registration_number,
        email,
        phone,
        mobile,
        website,
        default_currency,
        country_code,
        timezone,
        financial_year_start_month,
        status
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      )
      RETURNING *;
    `;
    const res = await pool.query(insertCompanyQuery, [
      companyCode,
      'Pooja Fashion Shop',
      'Pooja Fashion Shop Private Limited',
      'Pooja Fashion',
      'Retail',
      'Fashion & Garments',
      'REG-PFS-2026-001',
      'contact@poojafashion.com',
      '+91 98765 43210',
      '+91 98765 43210',
      'https://poojafashion.com',
      'INR',
      'IN',
      'Asia/Kolkata',
      4,
      'active',
    ]);
    company = res.rows[0];
    console.log(`  + Seeded Company: [${company.company_code}] ${company.company_name} (ID: ${company.id})`);
  } else {
    company = existingCompanyRes.rows[0];
    console.log(`  • Existing Company: [${company.company_code}] ${company.company_name} (ID: ${company.id}) (Skipped)`);
  }

  // 2. Company Primary Address
  const existingAddressRes = await pool.query(
    'SELECT id FROM company_addresses WHERE company_id = $1 AND address_type = $2 LIMIT 1',
    [company.id, 'head_office']
  );

  if (existingAddressRes.rowCount === 0) {
    await pool.query(
      `INSERT INTO company_addresses (
        company_id, address_type, address_line_1, address_line_2,
        city, district, state, postal_code, country, landmark, is_primary, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        company.id,
        'head_office',
        'Shop No. 12, Fashion Commercial Complex',
        'MG Road, Main Market',
        'Hosur',
        'Krishnagiri',
        'Tamil Nadu',
        '635109',
        'India',
        'Near Central Bus Stand',
        true,
        true,
      ]
    );
    console.log('  + Seeded Company Address (Head Office - Hosur, Tamil Nadu)');
  }

  // 3. Company Contact
  const existingContactRes = await pool.query(
    'SELECT id FROM company_contacts WHERE company_id = $1 AND is_primary = TRUE LIMIT 1',
    [company.id]
  );

  if (existingContactRes.rowCount === 0) {
    await pool.query(
      `INSERT INTO company_contacts (
        company_id, contact_type, contact_name, designation, email, phone, mobile, is_primary, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        company.id,
        'owner',
        'Pooja Sharma',
        'Managing Director',
        'owner@poojafashion.com',
        '+91 98765 43210',
        '+91 98765 43210',
        true,
        true,
      ]
    );
    console.log('  + Seeded Company Contact (Owner: Pooja Sharma)');
  }

  // 4. Company Tax Details
  const existingTaxRes = await pool.query(
    'SELECT id FROM company_tax_details WHERE company_id = $1 LIMIT 1',
    [company.id]
  );

  if (existingTaxRes.rowCount === 0) {
    await pool.query(
      `INSERT INTO company_tax_details (
        company_id, gstin, pan_number, tan_number, gst_registration_type,
        gst_state_code, tax_registered_name, is_primary, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        company.id,
        '33AAAAA0000A1Z5',
        'AAAAA0000A',
        'BLRP00000A',
        'regular',
        '33',
        'Pooja Fashion Shop Private Limited',
        true,
        true,
      ]
    );
    console.log('  + Seeded Company Tax Details (GSTIN: 33AAAAA0000A1Z5, PAN: AAAAA0000A)');
  }

  // 5. Business Settings
  const existingSettingsRes = await pool.query(
    'SELECT id FROM business_settings WHERE company_id = $1 LIMIT 1',
    [company.id]
  );

  if (existingSettingsRes.rowCount === 0) {
    await pool.query(
      `INSERT INTO business_settings (
        company_id, invoice_prefix, purchase_prefix, customer_prefix,
        supplier_prefix, product_prefix, default_tax_inclusive,
        default_payment_terms_days, allow_negative_stock, enable_barcode,
        enable_customer_credit, enable_product_returns, enable_product_exchange,
        decimal_places
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        company.id,
        'PFS-INV',
        'PFS-PUR',
        'PFS-CUS',
        'PFS-SUP',
        'PFS-PRO',
        true,
        30,
        false,
        true,
        true,
        true,
        true,
        2,
      ]
    );
    console.log('  + Seeded Business Settings for Pooja Fashion Shop');
  }

  // 6. Branches
  const branchesToSeed = [
    {
      branch_code: 'PFS-HO',
      branch_name: 'Head Office',
      branch_type: 'head_office',
      email: 'headoffice@poojafashion.com',
      phone: '+91 98765 43211',
      mobile: '+91 98765 43211',
      manager_name: 'Pooja Sharma',
      opening_date: '2020-01-01',
      is_main_branch: true,
      address: {
        address_line_1: 'Shop No. 12, Fashion Commercial Complex',
        address_line_2: 'MG Road, Main Market',
        city: 'Hosur',
        district: 'Krishnagiri',
        state: 'Tamil Nadu',
        postal_code: '635109',
        country: 'India',
        landmark: 'Near Central Bus Stand',
      },
    },
    {
      branch_code: 'PFS-B01',
      branch_name: 'Hosur Branch',
      branch_type: 'store',
      email: 'hosur@poojafashion.com',
      phone: '+91 98765 43212',
      mobile: '+91 98765 43212',
      manager_name: 'Rajesh Kumar',
      opening_date: '2021-06-15',
      is_main_branch: false,
      address: {
        address_line_1: 'Plot No. 45, Bye-Pass Road',
        address_line_2: 'Opposite Town Hall',
        city: 'Hosur',
        district: 'Krishnagiri',
        state: 'Tamil Nadu',
        postal_code: '635109',
        country: 'India',
        landmark: 'Opposite Town Hall',
      },
    },
  ];

  const processedBranches = [];

  for (const bDef of branchesToSeed) {
    const existingBranchRes = await pool.query(
      'SELECT * FROM branches WHERE company_id = $1 AND branch_code = $2 LIMIT 1',
      [company.id, bDef.branch_code]
    );

    let branch;
    if (existingBranchRes.rowCount === 0) {
      const insertBranchQuery = `
        INSERT INTO branches (
          company_id, branch_code, branch_name, branch_type,
          email, phone, mobile, manager_name, opening_date,
          is_main_branch, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')
        RETURNING *;
      `;
      const res = await pool.query(insertBranchQuery, [
        company.id,
        bDef.branch_code,
        bDef.branch_name,
        bDef.branch_type,
        bDef.email,
        bDef.phone,
        bDef.mobile,
        bDef.manager_name,
        bDef.opening_date,
        bDef.is_main_branch,
      ]);
      branch = res.rows[0];
      console.log(`  + Seeded Branch: [${branch.branch_code}] ${branch.branch_name} (ID: ${branch.id})`);

      // Branch address
      if (bDef.address) {
        await pool.query(
          `INSERT INTO branch_addresses (
            branch_id, address_line_1, address_line_2, city, district,
            state, postal_code, country, landmark, is_primary, is_active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, TRUE)`,
          [
            branch.id,
            bDef.address.address_line_1,
            bDef.address.address_line_2,
            bDef.address.city,
            bDef.address.district,
            bDef.address.state,
            bDef.address.postal_code,
            bDef.address.country,
            bDef.address.landmark,
          ]
        );
      }
    } else {
      branch = existingBranchRes.rows[0];
      console.log(`  • Existing Branch: [${branch.branch_code}] ${branch.branch_name} (ID: ${branch.id}) (Skipped)`);
    }

    processedBranches.push(branch);
  }

  return {
    company,
    branches: processedBranches,
  };
};

export default {
  seedCompanies,
};
