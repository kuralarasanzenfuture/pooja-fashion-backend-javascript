-- ============================================================================
-- DISCOUNTS SQL QUERIES
-- Reference queries for repository implementation (034_discounts.sql)
-- ============================================================================

-- Base select query for discounts with joined company and user metadata
-- SELECT_DISCOUNT_BASE
SELECT
    d.id,
    d.company_id,
    c.company_name,
    c.company_code,
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
    d.is_active,
    d.created_by,
    u_creator.username AS created_by_name,
    d.updated_by,
    u_updater.username AS updated_by_name,
    d.created_at,
    d.updated_at
FROM discounts d
JOIN companies c ON d.company_id = c.id
LEFT JOIN users u_creator ON d.created_by = u_creator.id
LEFT JOIN users u_updater ON d.updated_by = u_updater.id;

-- Check duplicate discount code within company (case-insensitive)
-- CHECK_DISCOUNT_CODE_EXISTS
SELECT id FROM discounts
WHERE company_id = $1 AND LOWER(discount_code) = LOWER($2)
  AND ($3::BIGINT IS NULL OR id <> $3);

-- Check if discount is currently linked to any product or variant
-- CHECK_DISCOUNT_IN_USE
SELECT COUNT(*) AS in_use_count
FROM product_discounts
WHERE discount_id = $1;
