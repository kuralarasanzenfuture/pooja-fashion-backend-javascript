import { getDatabasePool } from '../connection.js';

/**
 * ============================================================
 * COMPANY SEED DATA
 * ============================================================
 */

const COMPANY_SEED_DATA = {
  code: 'PFS001',
  name: 'Pooja Fashion Shop',
  legalName: 'Pooja Fashion Shop Private Limited',
  displayName: 'Pooja Fashion',

  businessType: 'Retail',
  industryType: 'Fashion & Garments',

  registrationNumber: 'REG-PFS-2026-001',

  email: 'contact@poojafashion.com',
  phone: '+91 98765 43210',
  mobile: '+91 98765 43210',
  website: 'https://poojafashion.com',

  defaultCurrency: 'INR',
  countryCode: 'IN',
  timezone: 'Asia/Kolkata',
  financialYearStartMonth: 4,

  status: 'active',
};

/**
 * ============================================================
 * COMPANY ADDRESS
 * ============================================================
 */

const COMPANY_ADDRESS_SEED_DATA = {
  addressType: 'head_office',

  addressLine1: 'Shop No. 12, Fashion Commercial Complex',
  addressLine2: 'MG Road, Main Market',

  city: 'Hosur',
  district: 'Krishnagiri',
  state: 'Tamil Nadu',
  postalCode: '635109',
  country: 'India',

  landmark: 'Near Central Bus Stand',

  isPrimary: true,
  isActive: true,
};

/**
 * ============================================================
 * COMPANY CONTACT
 * ============================================================
 */

const COMPANY_CONTACT_SEED_DATA = {
  contactType: 'owner',
  contactName: 'Pooja Sharma',
  designation: 'Managing Director',

  email: 'owner@poojafashion.com',
  phone: '+91 98765 43210',
  mobile: '+91 98765 43210',

  isPrimary: true,
  isActive: true,
};

/**
 * ============================================================
 * COMPANY TAX DETAILS
 * ============================================================
 */

const COMPANY_TAX_SEED_DATA = {
  gstin: '33AAAAA0000A1Z5',
  panNumber: 'AAAAA0000A',
  tanNumber: 'BLRP00000A',

  gstRegistrationType: 'regular',
  gstStateCode: '33',

  taxRegisteredName: 'Pooja Fashion Shop Private Limited',

  isPrimary: true,
  isActive: true,
};

/**
 * ============================================================
 * BUSINESS SETTINGS
 * ============================================================
 */

const BUSINESS_SETTINGS_SEED_DATA = {
  invoicePrefix: 'PFS-INV',
  purchasePrefix: 'PFS-PUR',
  customerPrefix: 'PFS-CUS',
  supplierPrefix: 'PFS-SUP',
  productPrefix: 'PFS-PRO',

  defaultTaxInclusive: true,
  defaultPaymentTermsDays: 30,

  allowNegativeStock: false,
  enableBarcode: true,

  enableCustomerCredit: true,
  enableProductReturns: true,
  enableProductExchange: true,

  decimalPlaces: 2,
};

/**
 * ============================================================
 * BRANCH SEED DATA
 * ============================================================
 */

const BRANCHES_SEED_DATA = [
  {
    branchCode: 'PFS-HO',
    branchName: 'Head Office',
    branchType: 'head_office',

    email: 'headoffice@poojafashion.com',
    phone: '+91 98765 43211',
    mobile: '+91 98765 43211',

    managerName: 'Pooja Sharma',

    openingDate: '2020-01-01',

    isMainBranch: true,
    status: 'active',

    address: {
      addressLine1: 'Shop No. 12, Fashion Commercial Complex',
      addressLine2: 'MG Road, Main Market',

      city: 'Hosur',
      district: 'Krishnagiri',
      state: 'Tamil Nadu',
      postalCode: '635109',
      country: 'India',

      landmark: 'Near Central Bus Stand',

      isPrimary: true,
      isActive: true,
    },
  },

  {
    branchCode: 'PFS-B01',
    branchName: 'Hosur Branch',
    branchType: 'store',

    email: 'hosur@poojafashion.com',
    phone: '+91 98765 43212',
    mobile: '+91 98765 43212',

    managerName: 'Rajesh Kumar',

    openingDate: '2021-06-15',

    isMainBranch: false,
    status: 'active',

    address: {
      addressLine1: 'Plot No. 45, Bye-Pass Road',
      addressLine2: 'Opposite Town Hall',

      city: 'Hosur',
      district: 'Krishnagiri',
      state: 'Tamil Nadu',
      postalCode: '635109',
      country: 'India',

      landmark: 'Opposite Town Hall',

      isPrimary: true,
      isActive: true,
    },
  },
];

/**
 * ============================================================
 * SEED COMPANIES
 * ============================================================
 *
 * Seeds:
 * 1. Company
 * 2. Company address
 * 3. Company contact
 * 4. Company tax details
 * 5. Business settings
 * 6. Branches
 * 7. Branch addresses
 *
 * All operations are executed inside one transaction.
 */

export const seedCompanies = async () => {
  const pool = getDatabasePool();

  if (!pool) {
    throw new Error('Database pool not initialized');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('⏳ Starting Company Seeding...');

    /**
     * ========================================================
     * 1. COMPANY
     * ========================================================
     */

    const companyUpsertQuery = `
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
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15, $16
      )

      ON CONFLICT (company_code)
      DO UPDATE SET
        company_name = EXCLUDED.company_name,
        legal_name = EXCLUDED.legal_name,
        display_name = EXCLUDED.display_name,
        business_type = EXCLUDED.business_type,
        industry_type = EXCLUDED.industry_type,
        registration_number = EXCLUDED.registration_number,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        mobile = EXCLUDED.mobile,
        website = EXCLUDED.website,
        default_currency = EXCLUDED.default_currency,
        country_code = EXCLUDED.country_code,
        timezone = EXCLUDED.timezone,
        financial_year_start_month =
          EXCLUDED.financial_year_start_month,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP

      RETURNING *;
    `;

    const companyResult = await client.query(companyUpsertQuery, [
      COMPANY_SEED_DATA.code,
      COMPANY_SEED_DATA.name,
      COMPANY_SEED_DATA.legalName,
      COMPANY_SEED_DATA.displayName,
      COMPANY_SEED_DATA.businessType,
      COMPANY_SEED_DATA.industryType,
      COMPANY_SEED_DATA.registrationNumber,
      COMPANY_SEED_DATA.email,
      COMPANY_SEED_DATA.phone,
      COMPANY_SEED_DATA.mobile,
      COMPANY_SEED_DATA.website,
      COMPANY_SEED_DATA.defaultCurrency,
      COMPANY_SEED_DATA.countryCode,
      COMPANY_SEED_DATA.timezone,
      COMPANY_SEED_DATA.financialYearStartMonth,
      COMPANY_SEED_DATA.status,
    ]);

    const company = companyResult.rows[0];

    console.log(
      `  ✓ Company: [${company.company_code}] ` + `${company.company_name} (ID: ${company.id})`
    );

    /**
     * ========================================================
     * 2. COMPANY ADDRESS
     * ========================================================
     */

    const existingAddrRes = await client.query(
      `SELECT id FROM company_addresses WHERE company_id = $1 AND address_type = $2 LIMIT 1`,
      [company.id, COMPANY_ADDRESS_SEED_DATA.addressType]
    );

    if (existingAddrRes.rows.length === 0) {
      await client.query(
        `INSERT INTO company_addresses (
          company_id,
          address_type,
          address_line_1,
          address_line_2,
          city,
          district,
          state,
          postal_code,
          country,
          landmark,
          is_primary,
          is_active
        )
        VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11, $12
        )`,
        [
          company.id,
          COMPANY_ADDRESS_SEED_DATA.addressType,
          COMPANY_ADDRESS_SEED_DATA.addressLine1,
          COMPANY_ADDRESS_SEED_DATA.addressLine2,
          COMPANY_ADDRESS_SEED_DATA.city,
          COMPANY_ADDRESS_SEED_DATA.district,
          COMPANY_ADDRESS_SEED_DATA.state,
          COMPANY_ADDRESS_SEED_DATA.postalCode,
          COMPANY_ADDRESS_SEED_DATA.country,
          COMPANY_ADDRESS_SEED_DATA.landmark,
          COMPANY_ADDRESS_SEED_DATA.isPrimary,
          COMPANY_ADDRESS_SEED_DATA.isActive,
        ]
      );
    } else {
      await client.query(
        `UPDATE company_addresses SET
          address_line_1 = $2,
          address_line_2 = $3,
          city = $4,
          district = $5,
          state = $6,
          postal_code = $7,
          country = $8,
          landmark = $9,
          is_primary = $10,
          is_active = $11,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1`,
        [
          existingAddrRes.rows[0].id,
          COMPANY_ADDRESS_SEED_DATA.addressLine1,
          COMPANY_ADDRESS_SEED_DATA.addressLine2,
          COMPANY_ADDRESS_SEED_DATA.city,
          COMPANY_ADDRESS_SEED_DATA.district,
          COMPANY_ADDRESS_SEED_DATA.state,
          COMPANY_ADDRESS_SEED_DATA.postalCode,
          COMPANY_ADDRESS_SEED_DATA.country,
          COMPANY_ADDRESS_SEED_DATA.landmark,
          COMPANY_ADDRESS_SEED_DATA.isPrimary,
          COMPANY_ADDRESS_SEED_DATA.isActive,
        ]
      );
    }

    console.log('  ✓ Company Address');

    /**
     * ========================================================
     * 3. COMPANY CONTACT
     * ========================================================
     */

    const existingContactRes = await client.query(
      `SELECT id FROM company_contacts WHERE company_id = $1 AND contact_type = $2 LIMIT 1`,
      [company.id, COMPANY_CONTACT_SEED_DATA.contactType]
    );

    if (existingContactRes.rows.length === 0) {
      await client.query(
        `INSERT INTO company_contacts (
          company_id,
          contact_type,
          contact_name,
          designation,
          email,
          phone,
          mobile,
          is_primary,
          is_active
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9
        )`,
        [
          company.id,
          COMPANY_CONTACT_SEED_DATA.contactType,
          COMPANY_CONTACT_SEED_DATA.contactName,
          COMPANY_CONTACT_SEED_DATA.designation,
          COMPANY_CONTACT_SEED_DATA.email,
          COMPANY_CONTACT_SEED_DATA.phone,
          COMPANY_CONTACT_SEED_DATA.mobile,
          COMPANY_CONTACT_SEED_DATA.isPrimary,
          COMPANY_CONTACT_SEED_DATA.isActive,
        ]
      );
    } else {
      await client.query(
        `UPDATE company_contacts SET
          contact_name = $2,
          designation = $3,
          email = $4,
          phone = $5,
          mobile = $6,
          is_primary = $7,
          is_active = $8,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1`,
        [
          existingContactRes.rows[0].id,
          COMPANY_CONTACT_SEED_DATA.contactName,
          COMPANY_CONTACT_SEED_DATA.designation,
          COMPANY_CONTACT_SEED_DATA.email,
          COMPANY_CONTACT_SEED_DATA.phone,
          COMPANY_CONTACT_SEED_DATA.mobile,
          COMPANY_CONTACT_SEED_DATA.isPrimary,
          COMPANY_CONTACT_SEED_DATA.isActive,
        ]
      );
    }

    console.log('  ✓ Company Contact');

    /**
     * ========================================================
     * 4. COMPANY TAX DETAILS
     * ========================================================
     */

    const existingTaxRes = await client.query(
      `SELECT id FROM company_tax_details WHERE company_id = $1 LIMIT 1`,
      [company.id]
    );

    if (existingTaxRes.rows.length === 0) {
      await client.query(
        `INSERT INTO company_tax_details (
          company_id,
          gstin,
          pan_number,
          tan_number,
          gst_registration_type,
          gst_state_code,
          tax_registered_name,
          is_primary,
          is_active
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9
        )`,
        [
          company.id,
          COMPANY_TAX_SEED_DATA.gstin,
          COMPANY_TAX_SEED_DATA.panNumber,
          COMPANY_TAX_SEED_DATA.tanNumber,
          COMPANY_TAX_SEED_DATA.gstRegistrationType,
          COMPANY_TAX_SEED_DATA.gstStateCode,
          COMPANY_TAX_SEED_DATA.taxRegisteredName,
          COMPANY_TAX_SEED_DATA.isPrimary,
          COMPANY_TAX_SEED_DATA.isActive,
        ]
      );
    } else {
      await client.query(
        `UPDATE company_tax_details SET
          gstin = $2,
          pan_number = $3,
          tan_number = $4,
          gst_registration_type = $5,
          gst_state_code = $6,
          tax_registered_name = $7,
          is_primary = $8,
          is_active = $9,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1`,
        [
          existingTaxRes.rows[0].id,
          COMPANY_TAX_SEED_DATA.gstin,
          COMPANY_TAX_SEED_DATA.panNumber,
          COMPANY_TAX_SEED_DATA.tanNumber,
          COMPANY_TAX_SEED_DATA.gstRegistrationType,
          COMPANY_TAX_SEED_DATA.gstStateCode,
          COMPANY_TAX_SEED_DATA.taxRegisteredName,
          COMPANY_TAX_SEED_DATA.isPrimary,
          COMPANY_TAX_SEED_DATA.isActive,
        ]
      );
    }

    console.log('  ✓ Company Tax Details');

    /**
     * ========================================================
     * 5. BUSINESS SETTINGS
     * ========================================================
     */

    const businessSettingsQuery = `
      INSERT INTO business_settings (
        company_id,
        invoice_prefix,
        purchase_prefix,
        customer_prefix,
        supplier_prefix,
        product_prefix,
        default_tax_inclusive,
        default_payment_terms_days,
        allow_negative_stock,
        enable_barcode,
        enable_customer_credit,
        enable_product_returns,
        enable_product_exchange,
        decimal_places
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, $14
      )

      ON CONFLICT (company_id)
      DO UPDATE SET
        invoice_prefix = EXCLUDED.invoice_prefix,
        purchase_prefix = EXCLUDED.purchase_prefix,
        customer_prefix = EXCLUDED.customer_prefix,
        supplier_prefix = EXCLUDED.supplier_prefix,
        product_prefix = EXCLUDED.product_prefix,
        default_tax_inclusive = EXCLUDED.default_tax_inclusive,
        default_payment_terms_days =
          EXCLUDED.default_payment_terms_days,
        allow_negative_stock =
          EXCLUDED.allow_negative_stock,
        enable_barcode = EXCLUDED.enable_barcode,
        enable_customer_credit =
          EXCLUDED.enable_customer_credit,
        enable_product_returns =
          EXCLUDED.enable_product_returns,
        enable_product_exchange =
          EXCLUDED.enable_product_exchange,
        decimal_places = EXCLUDED.decimal_places,
        updated_at = CURRENT_TIMESTAMP

      RETURNING *;
    `;

    await client.query(businessSettingsQuery, [
      company.id,
      BUSINESS_SETTINGS_SEED_DATA.invoicePrefix,
      BUSINESS_SETTINGS_SEED_DATA.purchasePrefix,
      BUSINESS_SETTINGS_SEED_DATA.customerPrefix,
      BUSINESS_SETTINGS_SEED_DATA.supplierPrefix,
      BUSINESS_SETTINGS_SEED_DATA.productPrefix,
      BUSINESS_SETTINGS_SEED_DATA.defaultTaxInclusive,
      BUSINESS_SETTINGS_SEED_DATA.defaultPaymentTermsDays,
      BUSINESS_SETTINGS_SEED_DATA.allowNegativeStock,
      BUSINESS_SETTINGS_SEED_DATA.enableBarcode,
      BUSINESS_SETTINGS_SEED_DATA.enableCustomerCredit,
      BUSINESS_SETTINGS_SEED_DATA.enableProductReturns,
      BUSINESS_SETTINGS_SEED_DATA.enableProductExchange,
      BUSINESS_SETTINGS_SEED_DATA.decimalPlaces,
    ]);

    console.log('  ✓ Business Settings');

    /**
     * ========================================================
     * 6. BRANCHES
     * ========================================================
     */

    const processedBranches = [];

    for (const branchDef of BRANCHES_SEED_DATA) {
      const branchQuery = `
        INSERT INTO branches (
          company_id,
          branch_code,
          branch_name,
          branch_type,
          email,
          phone,
          mobile,
          manager_name,
          opening_date,
          is_main_branch,
          status
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10, $11
        )

        ON CONFLICT (company_id, branch_code)
        DO UPDATE SET
          branch_name = EXCLUDED.branch_name,
          branch_type = EXCLUDED.branch_type,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          mobile = EXCLUDED.mobile,
          manager_name = EXCLUDED.manager_name,
          opening_date = EXCLUDED.opening_date,
          is_main_branch = EXCLUDED.is_main_branch,
          status = EXCLUDED.status,
          updated_at = CURRENT_TIMESTAMP

        RETURNING *;
      `;

      const branchResult = await client.query(branchQuery, [
        company.id,
        branchDef.branchCode,
        branchDef.branchName,
        branchDef.branchType,
        branchDef.email,
        branchDef.phone,
        branchDef.mobile,
        branchDef.managerName,
        branchDef.openingDate,
        branchDef.isMainBranch,
        branchDef.status,
      ]);

      const branch = branchResult.rows[0];

      console.log(
        `  ✓ Branch: [${branch.branch_code}] ` + `${branch.branch_name} (ID: ${branch.id})`
      );

      /**
       * ======================================================
       * 7. BRANCH ADDRESS
       * ======================================================
       */

      if (branchDef.address) {
        const existingBranchAddrRes = await client.query(
          `SELECT id FROM branch_addresses WHERE branch_id = $1 LIMIT 1`,
          [branch.id]
        );

        if (existingBranchAddrRes.rows.length === 0) {
          await client.query(
            `INSERT INTO branch_addresses (
              branch_id,
              address_line_1,
              address_line_2,
              city,
              district,
              state,
              postal_code,
              country,
              landmark,
              is_primary,
              is_active
            )
            VALUES (
              $1, $2, $3, $4, $5,
              $6, $7, $8, $9, $10, $11
            )`,
            [
              branch.id,
              branchDef.address.addressLine1,
              branchDef.address.addressLine2,
              branchDef.address.city,
              branchDef.address.district,
              branchDef.address.state,
              branchDef.address.postalCode,
              branchDef.address.country,
              branchDef.address.landmark,
              branchDef.address.isPrimary,
              branchDef.address.isActive,
            ]
          );
        } else {
          await client.query(
            `UPDATE branch_addresses SET
              address_line_1 = $2,
              address_line_2 = $3,
              city = $4,
              district = $5,
              state = $6,
              postal_code = $7,
              country = $8,
              landmark = $9,
              is_primary = $10,
              is_active = $11,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $1`,
            [
              existingBranchAddrRes.rows[0].id,
              branchDef.address.addressLine1,
              branchDef.address.addressLine2,
              branchDef.address.city,
              branchDef.address.district,
              branchDef.address.state,
              branchDef.address.postalCode,
              branchDef.address.country,
              branchDef.address.landmark,
              branchDef.address.isPrimary,
              branchDef.address.isActive,
            ]
          );
        }
      }

      processedBranches.push(branch);
    }

    /**
     * ========================================================
     * COMMIT
     * ========================================================
     */

    await client.query('COMMIT');

    console.log('✅ Company Seeding completed successfully!');

    return {
      company,
      branches: processedBranches,
    };
  } catch (error) {
    await client.query('ROLLBACK');

    console.error('❌ Error seeding company details:', error.message);

    throw error;
  } finally {
    client.release();
  }
};

export default {
  seedCompanies,
};
