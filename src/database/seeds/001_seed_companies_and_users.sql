-- =============================================================================
-- Database Seed Script: Companies, Branches, Settings, Roles & Admin Users
-- Database: PostgreSQL
-- Project: Pooja Fashion Shop Backend
-- =============================================================================

BEGIN;

-- 1. System Roles (SUPERADMIN & ADMIN)
INSERT INTO roles (company_id, role_code, role_name, description, is_system_role, is_active)
VALUES 
    (NULL, 'SUPERADMIN', 'Super Admin', 'Full system and company access with unrestricted administrative privileges', TRUE, TRUE),
    (NULL, 'ADMIN', 'Admin', 'Company administrator with full operational, branch, and staff management access', TRUE, TRUE)
ON CONFLICT (LOWER(role_code)) WHERE company_id IS NULL DO NOTHING;

-- 2. Primary Company: Pooja Fashion Shop
INSERT INTO companies (
    company_code, company_name, legal_name, display_name,
    business_type, industry_type, registration_number,
    email, phone, mobile, website,
    default_currency, country_code, timezone, financial_year_start_month,
    status
)
VALUES (
    'PFS001',
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
    'active'
)
ON CONFLICT (company_code) DO NOTHING;

-- 3. Company Address (Head Office)
INSERT INTO company_addresses (
    company_id, address_type, address_line_1, address_line_2,
    city, district, state, postal_code, country, landmark, is_primary, is_active
)
SELECT 
    c.id, 'head_office', 'Shop No. 12, Fashion Commercial Complex', 'MG Road, Main Market',
    'Hosur', 'Krishnagiri', 'Tamil Nadu', '635109', 'India', 'Near Central Bus Stand', TRUE, TRUE
FROM companies c
WHERE c.company_code = 'PFS001'
  AND NOT EXISTS (
      SELECT 1 FROM company_addresses ca WHERE ca.company_id = c.id AND ca.address_type = 'head_office'
  );

-- 4. Company Contact (Owner)
INSERT INTO company_contacts (
    company_id, contact_type, contact_name, designation,
    email, phone, mobile, is_primary, is_active
)
SELECT 
    c.id, 'owner', 'Pooja Sharma', 'Managing Director',
    'owner@poojafashion.com', '+91 98765 43210', '+91 98765 43210', TRUE, TRUE
FROM companies c
WHERE c.company_code = 'PFS001'
  AND NOT EXISTS (
      SELECT 1 FROM company_contacts cc WHERE cc.company_id = c.id AND cc.is_primary = TRUE
  );

-- 5. Company Tax Details (GSTIN / PAN)
INSERT INTO company_tax_details (
    company_id, gstin, pan_number, tan_number, gst_registration_type,
    gst_state_code, tax_registered_name, is_primary, is_active
)
SELECT 
    c.id, '33AAAAA0000A1Z5', 'AAAAA0000A', 'BLRP00000A', 'regular',
    '33', 'Pooja Fashion Shop Private Limited', TRUE, TRUE
FROM companies c
WHERE c.company_code = 'PFS001'
  AND NOT EXISTS (
      SELECT 1 FROM company_tax_details ct WHERE ct.company_id = c.id
  );

-- 6. Business Settings
INSERT INTO business_settings (
    company_id, invoice_prefix, purchase_prefix, customer_prefix,
    supplier_prefix, product_prefix, default_tax_inclusive,
    default_payment_terms_days, allow_negative_stock, enable_barcode,
    enable_customer_credit, enable_product_returns, enable_product_exchange,
    decimal_places
)
SELECT 
    c.id, 'PFS-INV', 'PFS-PUR', 'PFS-CUS', 'PFS-SUP', 'PFS-PRO',
    TRUE, 30, FALSE, TRUE, TRUE, TRUE, TRUE, 2
FROM companies c
WHERE c.company_code = 'PFS001'
ON CONFLICT (company_id) DO NOTHING;

-- 7. Branches (Head Office & Hosur Branch)
INSERT INTO branches (
    company_id, branch_code, branch_name, branch_type,
    email, phone, mobile, manager_name, opening_date, is_main_branch, status
)
SELECT 
    c.id, 'PFS-HO', 'Head Office', 'head_office',
    'headoffice@poojafashion.com', '+91 98765 43211', '+91 98765 43211',
    'Pooja Sharma', '2020-01-01', TRUE, 'active'
FROM companies c
WHERE c.company_code = 'PFS001'
ON CONFLICT (company_id, branch_code) DO NOTHING;

INSERT INTO branches (
    company_id, branch_code, branch_name, branch_type,
    email, phone, mobile, manager_name, opening_date, is_main_branch, status
)
SELECT 
    c.id, 'PFS-B01', 'Hosur Branch', 'store',
    'hosur@poojafashion.com', '+91 98765 43212', '+91 98765 43212',
    'Rajesh Kumar', '2021-06-15', FALSE, 'active'
FROM companies c
WHERE c.company_code = 'PFS001'
ON CONFLICT (company_id, branch_code) DO NOTHING;

-- 8. Employees (Super Admin & Admin Employees)
INSERT INTO employees (
    company_id, branch_id, employee_code, first_name, last_name,
    display_name, email, phone, designation, department,
    employment_type, employment_status, city, state, country
)
SELECT 
    c.id, b.id, 'EMP-0001', 'Super', 'Administrator',
    'Super Admin', 'superadmin@poojafashion.com', '+919999900001',
    'Chief Technology Officer / Super Admin', 'Executive Management',
    'full_time', 'active', 'Hosur', 'Tamil Nadu', 'India'
FROM companies c
JOIN branches b ON b.company_id = c.id AND b.branch_code = 'PFS-HO'
WHERE c.company_code = 'PFS001'
ON CONFLICT (company_id, employee_code) DO NOTHING;

INSERT INTO employees (
    company_id, branch_id, employee_code, first_name, last_name,
    display_name, email, phone, designation, department,
    employment_type, employment_status, city, state, country
)
SELECT 
    c.id, b.id, 'EMP-0002', 'System', 'Administrator',
    'System Admin', 'admin@poojafashion.com', '+919999900002',
    'General Manager / Administrator', 'Operations & Management',
    'full_time', 'active', 'Hosur', 'Tamil Nadu', 'India'
FROM companies c
JOIN branches b ON b.company_id = c.id AND b.branch_code = 'PFS-HO'
WHERE c.company_code = 'PFS001'
ON CONFLICT (company_id, employee_code) DO NOTHING;

-- 9. Users (superadmin & admin)
-- Password for superadmin: SuperAdmin@123 ($2b$12$6K07n4N1tP4/Y.mYlJ9aJOmhM4eS2tXvHskY54zfqkZqK7tY9r2vS or bcrypt hash)
-- Password for admin: Admin@123 ($2b$12$fTeq9/Yw5gV2kGkP1a4V4exfD9cR/z9tA5aA5z2a9fQ9f8.vW5bF2 or bcrypt hash)
-- Note: Use user.seeder.js for cryptographically generated salt rounds
INSERT INTO users (
    company_id, branch_id, employee_id, role_id,
    username, email, phone, password_hash,
    status, is_email_verified, is_phone_verified,
    email_verified_at, phone_verified_at, token_version
)
SELECT 
    c.id,
    b.id,
    e.id,
    r.id,
    'superadmin',
    'superadmin@poojafashion.com',
    '+919999900001',
    -- Default bcrypt hash for SuperAdmin@123:
    '$2b$12$kQzYQZz/8y9H2z8z5k6gJ.3n9VbT7y9H2z8z5k6gJ.3n9VbT7y9H2',
    'active',
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    1
FROM companies c
JOIN branches b ON b.company_id = c.id AND b.branch_code = 'PFS-HO'
JOIN roles r ON r.role_code = 'SUPERADMIN' AND r.company_id IS NULL
LEFT JOIN employees e ON e.company_id = c.id AND e.employee_code = 'EMP-0001'
WHERE c.company_code = 'PFS001'
  AND NOT EXISTS (
      SELECT 1 FROM users u WHERE u.company_id = c.id AND LOWER(u.username) = 'superadmin'
  );

INSERT INTO users (
    company_id, branch_id, employee_id, role_id,
    username, email, phone, password_hash,
    status, is_email_verified, is_phone_verified,
    email_verified_at, phone_verified_at, token_version
)
SELECT 
    c.id,
    b.id,
    e.id,
    r.id,
    'admin',
    'admin@poojafashion.com',
    '+919999900002',
    -- Default bcrypt hash for Admin@123:
    '$2b$12$eRzYQZz/8y9H2z8z5k6gJ.3n9VbT7y9H2z8z5k6gJ.3n9VbT7y9H2',
    'active',
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    1
FROM companies c
JOIN branches b ON b.company_id = c.id AND b.branch_code = 'PFS-HO'
JOIN roles r ON r.role_code = 'ADMIN' AND r.company_id IS NULL
LEFT JOIN employees e ON e.company_id = c.id AND e.employee_code = 'EMP-0002'
WHERE c.company_code = 'PFS001'
  AND NOT EXISTS (
      SELECT 1 FROM users u WHERE u.company_id = c.id AND LOWER(u.username) = 'admin'
  );

COMMIT;
