-- ============================================================================
-- PRODUCT TAXES SQL QUERIES
-- Reference queries for repository implementation (033_product_taxes.sql)
-- ============================================================================

-- Base select query for product_taxes with joined products, variants, taxes, and companies
-- SELECT_PRODUCT_TAX_BASE
SELECT
    pt.id,
    pt.company_id,
    c.company_name,
    c.company_code,
    pt.product_id,
    p.product_name,
    p.product_code,
    pt.variant_id,
    pv.sku AS variant_sku,
    pv.variant_name,
    pt.tax_id,
    t.tax_code,
    t.tax_name,
    t.tax_type,
    t.rate,
    t.cgst_rate,
    t.sgst_rate,
    t.igst_rate,
    t.cess_rate,
    t.is_inclusive,
    pt.is_primary,
    pt.effective_from,
    pt.effective_to,
    pt.is_active,
    pt.created_by,
    u_creator.username AS created_by_name,
    pt.updated_by,
    u_updater.username AS updated_by_name,
    pt.created_at,
    pt.updated_at
FROM product_taxes pt
JOIN companies c ON pt.company_id = c.id
JOIN products p ON pt.product_id = p.id
LEFT JOIN product_variants pv ON pt.variant_id = pv.id
JOIN taxes t ON pt.tax_id = t.id
LEFT JOIN users u_creator ON pt.created_by = u_creator.id
LEFT JOIN users u_updater ON pt.updated_by = u_updater.id;

-- Clear primary tax for a variant
-- CLEAR_PRIMARY_FOR_VARIANT
UPDATE product_taxes
SET is_primary = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE variant_id = $1
  AND is_primary = TRUE;

-- Clear primary tax for a product (product-level where variant_id IS NULL)
-- CLEAR_PRIMARY_FOR_PRODUCT
UPDATE product_taxes
SET is_primary = FALSE,
    updated_at = CURRENT_TIMESTAMP
WHERE product_id = $1
  AND variant_id IS NULL
  AND is_primary = TRUE;

-- Resolve effective tax for POS checkout (Variant first, fallback to product level)
-- RESOLVE_EFFECTIVE_TAX
SELECT
    pt.id,
    pt.company_id,
    pt.product_id,
    p.product_name,
    p.product_code,
    pt.variant_id,
    pv.sku AS variant_sku,
    pv.variant_name,
    pt.tax_id,
    t.tax_code,
    t.tax_name,
    t.tax_type,
    t.rate,
    t.cgst_rate,
    t.sgst_rate,
    t.igst_rate,
    t.cess_rate,
    t.is_inclusive,
    pt.is_primary,
    pt.effective_from,
    pt.effective_to,
    pt.is_active
FROM product_taxes pt
JOIN products p ON pt.product_id = p.id
LEFT JOIN product_variants pv ON pt.variant_id = pv.id
JOIN taxes t ON pt.tax_id = t.id
WHERE pt.company_id = $1
  AND pt.product_id = $2
  AND (
    ($3::BIGINT IS NOT NULL AND pt.variant_id = $3::BIGINT)
    OR ($3::BIGINT IS NULL AND pt.variant_id IS NULL)
    OR (pt.variant_id IS NULL)
  )
  AND pt.is_active = TRUE
  AND t.is_active = TRUE
  AND pt.effective_from <= $4
  AND (pt.effective_to IS NULL OR pt.effective_to > $4)
ORDER BY
  -- Priority 1: Variant-level over Product-level
  (CASE WHEN pt.variant_id IS NOT NULL THEN 1 ELSE 0 END) DESC,
  -- Priority 2: Primary over Non-primary
  pt.is_primary DESC,
  -- Priority 3: Most recently effective
  pt.effective_from DESC
LIMIT 1;
