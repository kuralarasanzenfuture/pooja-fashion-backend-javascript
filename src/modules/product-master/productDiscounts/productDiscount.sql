-- ============================================================================
-- PRODUCT DISCOUNTS SQL QUERIES
-- Reference queries for repository implementation (035_product_discounts.sql)
-- ============================================================================

-- Base query to fetch product discount details with relational joins
-- SELECT_PRODUCT_DISCOUNT_BASE
SELECT
    pd.id,
    pd.company_id,
    c.company_name,
    c.company_code,
    pd.product_id,
    p.product_name,
    p.product_code,
    pd.variant_id,
    pv.sku AS variant_sku,
    pv.variant_name,
    pd.discount_id,
    d.discount_code,
    d.discount_name,
    d.discount_type,
    d.discount_value,
    d.minimum_quantity,
    d.maximum_discount,
    d.priority,
    d.is_stackable,
    pd.is_primary,
    pd.is_active,
    pd.created_by,
    u_creator.username AS created_by_name,
    pd.updated_by,
    u_updater.username AS updated_by_name,
    pd.created_at,
    pd.updated_at
FROM product_discounts pd
JOIN companies c ON pd.company_id = c.id
JOIN products p ON pd.product_id = p.id
LEFT JOIN product_variants pv ON pd.variant_id = pv.id
JOIN discounts d ON pd.discount_id = d.id
LEFT JOIN users u_creator ON pd.created_by = u_creator.id
LEFT JOIN users u_updater ON pd.updated_by = u_updater.id;

-- Resolve effective discount for checkout (variant-level precedence, primary precedence, priority DESC)
-- RESOLVE_EFFECTIVE_DISCOUNT
SELECT
    pd.id,
    pd.company_id,
    pd.product_id,
    p.product_name,
    p.product_code,
    pd.variant_id,
    pv.sku AS variant_sku,
    pv.variant_name,
    pd.discount_id,
    d.discount_code,
    d.discount_name,
    d.discount_type,
    d.discount_value,
    d.minimum_quantity,
    d.maximum_discount,
    d.start_at,
    d.end_at,
    d.priority,
    d.is_stackable,
    pd.is_primary,
    pd.is_active
FROM product_discounts pd
JOIN products p ON pd.product_id = p.id
LEFT JOIN product_variants pv ON pd.variant_id = pv.id
JOIN discounts d ON pd.discount_id = d.id
WHERE pd.company_id = $1
  AND pd.product_id = $2
  AND (
    ($3::BIGINT IS NOT NULL AND pd.variant_id = $3::BIGINT)
    OR (pd.variant_id IS NULL)
  )
  AND pd.is_active = TRUE
  AND d.is_active = TRUE
  AND (d.start_at IS NULL OR d.start_at <= $4)
  AND (d.end_at IS NULL OR d.end_at >= $4)
ORDER BY
  (CASE WHEN pd.variant_id IS NOT NULL THEN 1 ELSE 0 END) DESC,
  pd.is_primary DESC,
  d.priority DESC,
  pd.id ASC
LIMIT 1;
