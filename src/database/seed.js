import dotenv from 'dotenv';
dotenv.config();

import { connectDatabase } from './connection.js';
import { seedRoles } from './seeders/role.seeder.js';
import { seedCompanies } from './seeders/company.seeder.js';
import { seedBanks } from './seeders/bank.seeder.js';
import { seedUsers } from './seeders/user.seeder.js';
import { seedCategories } from './seeders/category.seeder.js';
import { seedBrands } from './seeders/brand.seeder.js';
import { seedSizes } from './seeders/size.seeder.js';

const runSeeders = async () => {
  console.log('🌱 [SEEDER] Starting database seeding process...');
  const startTime = Date.now();

  let pool;
  try {
    pool = await connectDatabase();
    if (!pool) {
      console.error('❌ [SEEDER] Failed to initialize database connection.');
      process.exit(1);
    }

    // Step 1: System Roles (SUPERADMIN, ADMIN)
    console.log('\n--- 1. Seeding System Roles (SUPERADMIN & ADMIN) ---');
    const roleStats = await seedRoles();
    console.log(
      `✅ [SEEDER:ROLES] Created: ${roleStats.rolesCreated}, Existing/Skipped: ${roleStats.rolesSkipped}`
    );

    // Step 2: Company Details (Company, Address, Contact, Tax, Settings, Branches)
    console.log('\n--- 2. Seeding Company & Branch Details ---');
    const companyStats = await seedCompanies();
    console.log(
      `✅ [SEEDER:COMPANY] Company '${companyStats.company.company_name}' with ${companyStats.branches.length} branch(es) ready.`
    );

    // Step 3: Banks, Bank Identifiers & Company Accounts (All Indian Banks & Logos)
    console.log('\n--- 3. Seeding All Indian Banks, Bank Identifiers & Company Banks ---');
    const bankStats = await seedBanks({ companyId: companyStats.company.id });
    console.log(
      `✅ [SEEDER:BANKS] ${bankStats.banksTotal} banks verified/seeded, ${bankStats.imagesGenerated} SVG assets on disk, and company accounts ready.`
    );

    // Step 4: Employees & User Accounts (Admin & SuperAdmin)
    console.log('\n--- 4. Seeding Admin & Superadmin Users & Employees ---');
    const userStats = await seedUsers({
      companyId: companyStats.company.id,
      branchId: companyStats.branches[0]?.id,
    });
    console.log(
      `✅ [SEEDER:USERS] ${userStats.users.length} user(s) and ${userStats.employees.length} employee(s) ready.`
    );

    // Step 5: Product Master Categories & Subcategories (All Existing Companies)
    console.log('\n--- 5. Seeding Product Master Categories & Subcategories for All Companies ---');
    const categoryStats = await seedCategories();
    console.log(
      `✅ [SEEDER:CATEGORIES] ${categoryStats.totalCategoriesSeeded} categories and ${categoryStats.totalSubcategoriesSeeded} subcategories seeded across ${categoryStats.totalCompanies} company/companies.`
    );

    // Step 6: Product Master Brands (All Existing Companies)
    console.log('\n--- 6. Seeding Product Master Brands for All Companies ---');
    const brandStats = await seedBrands();
    console.log(
      `✅ [SEEDER:BRANDS] ${brandStats.totalBrandsSeeded} brands seeded across ${brandStats.totalCompanies} company/companies.`
    );

    // Step 7: Product Master Size Groups & Child Sizes (All Existing Companies)
    console.log('\n--- 7. Seeding Product Master Size Groups & Sizes for All Companies ---');
    const sizeStats = await seedSizes();
    console.log(
      `✅ [SEEDER:SIZES] ${sizeStats.totalSizeGroupsSeeded} size groups and ${sizeStats.totalSizesSeeded} sizes seeded across ${sizeStats.totalCompanies} company/companies.`
    );

    const elapsedMs = Date.now() - startTime;
    console.log(`\n🎉 [SEEDER] All seeding completed successfully in ${elapsedMs}ms.`);
    console.log('\n📋 [CREDENTIALS SUMMARY]');
    console.log('  ─────────────────────────────────────────────────────────────');
    console.log('  • SuperAdmin : username="superadmin" | password="SuperAdmin@123"');
    console.log('                 email="superadmin@poojafashion.com"');
    console.log('  • Admin      : username="admin"      | password="Admin@123"');
    console.log('                 email="admin@poojafashion.com"');
    console.log('  ─────────────────────────────────────────────────────────────\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ [SEEDER] Seeding failed with error:', error.message);
    if (pool) {
      await pool.end().catch(() => {});
    }
    process.exit(1);
  }
};

runSeeders();
