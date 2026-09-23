-- ============================================================================
-- PRODUCT PRICES & PRICE HISTORY SQL QUERIES
-- Reference queries for repository implementation
-- ============================================================================

-- Base select query for product_prices with related entities
-- SELECT_PRODUCT_PRICE_BASE
SELECT
    pp.id,
    pp.company_id,
    c.company_name,
    c.company_code,
    pp.product_id,
    p.product_name,
    p.product_code,
    pp.variant_id,
    pv.sku AS variant_sku,
    pv.variant_name,
    pp.price_type,
    pp.purchase_price,
    pp.cost_price,
    pp.mrp,
    pp.selling_price,
    pp.min_selling_price,
    pp.currency_code,
    pp.effective_from,
    pp.effective_to,
    pp.is_active,
    pp.created_by,
    u_creator.username AS created_by_name,
    pp.updated_by,
    u_updater.username AS updated_by_name,
    pp.created_at,
    pp.updated_at
FROM product_prices pp
JOIN companies c ON pp.company_id = c.id
JOIN products p ON pp.product_id = p.id
JOIN product_variants pv ON pp.variant_id = pv.id
LEFT JOIN users u_creator ON pp.created_by = u_creator.id
LEFT JOIN users u_updater ON pp.updated_by = u_updater.id;

-- Base select query for product_price_history
-- SELECT_PRODUCT_PRICE_HISTORY_BASE
SELECT
    pph.id,
    pph.company_id,
    c.company_name,
    c.company_code,
    pph.product_id,
    p.product_name,
    p.product_code,
    pph.variant_id,
    pv.sku AS variant_sku,
    pv.variant_name,
    pph.product_price_id,
    pph.price_type,
    pph.old_purchase_price,
    pph.new_purchase_price,
    pph.old_cost_price,
    pph.new_cost_price,
    pph.old_mrp,
    pph.new_mrp,
    pph.old_selling_price,
    pph.new_selling_price,
    pph.reason,
    pph.changed_by,
    u.username AS changed_by_name,
    pph.changed_at
FROM product_price_history pph
JOIN companies c ON pph.company_id = c.id
JOIN products p ON pph.product_id = p.id
JOIN product_variants pv ON pph.variant_id = pv.id
LEFT JOIN users u ON pph.changed_by = u.id;

-- Find active price as of a given timestamp
-- SELECT_ACTIVE_PRICE_AS_OF
SELECT
    pp.id,
    pp.company_id,
    c.company_name,
    c.company_code,
    pp.product_id,
    p.product_name,
    p.product_code,
    pp.variant_id,
    pv.sku AS variant_sku,
    pv.variant_name,
    pp.price_type,
    pp.purchase_price,
    pp.cost_price,
    pp.mrp,
    pp.selling_price,
    pp.min_selling_price,
    pp.currency_code,
    pp.effective_from,
    pp.effective_to,
    pp.is_active,
    pp.created_by,
    pp.updated_by,
    pp.created_at,
    pp.updated_at
FROM product_prices pp
JOIN companies c ON pp.company_id = c.id
JOIN products p ON pp.product_id = p.id
JOIN product_variants pv ON pp.variant_id = pv.id
WHERE pp.variant_id = $1
  AND pp.price_type = $2
  AND pp.is_active = TRUE
  AND pp.effective_from <= $3
  AND (pp.effective_to IS NULL OR pp.effective_to > $3)
ORDER BY pp.effective_from DESC
LIMIT 1;

-- Expire previous overlapping active prices
-- EXPIRE_OVERLAPPING_PRICES
UPDATE product_prices
SET effective_to = $3,
    updated_at = CURRENT_TIMESTAMP
WHERE variant_id = $1
  AND price_type = $2
  AND is_active = TRUE
  AND (effective_to IS NULL OR effective_to > $3)
  AND effective_from < $3;
