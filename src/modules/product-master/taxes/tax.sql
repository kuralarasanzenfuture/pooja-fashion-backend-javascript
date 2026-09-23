-- ============================================================================
-- TAXES SQL QUERIES
-- Reference queries for repository implementation (032_taxes.sql)
-- ============================================================================

-- Base select query for taxes with joined company and user metadata
-- SELECT_TAX_BASE
SELECT
    t.id,
    t.company_id,
    c.company_name,
    c.company_code,
    t.tax_code,
    t.tax_name,
    t.tax_type,
    t.rate,
    t.cgst_rate,
    t.sgst_rate,
    t.igst_rate,
    t.cess_rate,
    t.is_inclusive,
    t.is_active,
    t.created_by,
    u_creator.username AS created_by_name,
    t.updated_by,
    u_updater.username AS updated_by_name,
    t.created_at,
    t.updated_at
FROM taxes t
JOIN companies c ON t.company_id = c.id
LEFT JOIN users u_creator ON t.created_by = u_creator.id
LEFT JOIN users u_updater ON t.updated_by = u_updater.id;

-- Check duplicate tax code within company (case-insensitive)
-- CHECK_TAX_CODE_EXISTS
SELECT id FROM taxes
WHERE company_id = $1 AND LOWER(tax_code) = LOWER($2)
  AND ($3::BIGINT IS NULL OR id <> $3);

-- Check duplicate tax name within company (case-insensitive)
-- CHECK_TAX_NAME_EXISTS
SELECT id FROM taxes
WHERE company_id = $1 AND LOWER(tax_name) = LOWER($2)
  AND ($3::BIGINT IS NULL OR id <> $3);

-- Check if tax is currently linked to any product or variant
-- CHECK_TAX_IN_USE
SELECT COUNT(*) AS in_use_count
FROM product_taxes
WHERE tax_id = $1;
