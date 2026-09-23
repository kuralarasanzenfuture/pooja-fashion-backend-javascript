-- Product Images Reference SQL Queries

-- 1. List Product Images with Filters and Multi-Table Joins
SELECT 
    pi.id,
    pi.company_id,
    c.company_name,
    c.company_code,
    pi.product_id,
    p.product_code,
    p.product_name,
    pi.variant_id,
    pv.sku AS variant_sku,
    pv.variant_name,
    pi.image_url,
    pi.image_key,
    pi.original_file_name,
    pi.mime_type,
    pi.file_size,
    pi.width,
    pi.height,
    pi.alt_text,
    pi.display_order,
    pi.is_primary,
    pi.is_active,
    pi.created_by,
    pi.created_at
FROM product_images pi
JOIN companies c ON pi.company_id = c.id
JOIN products p ON pi.product_id = p.id
LEFT JOIN product_variants pv ON pi.variant_id = pv.id
WHERE pi.company_id = $1
  AND ($2::bigint IS NULL OR pi.product_id = $2)
  AND ($3::bigint IS NULL OR pi.variant_id = $3)
  AND ($4::boolean IS NULL OR pi.is_primary = $4)
  AND ($5::boolean IS NULL OR pi.is_active = $5)
  AND (
      $6::text IS NULL
      OR pi.alt_text ILIKE '%' || $6 || '%'
      OR pi.original_file_name ILIKE '%' || $6 || '%'
      OR p.product_name ILIKE '%' || $6 || '%'
      OR pv.sku ILIKE '%' || $6 || '%'
  )
ORDER BY pi.is_primary DESC, pi.display_order ASC, pi.id ASC
LIMIT $7 OFFSET $8;

-- 2. Count Total Matching Product Images
SELECT COUNT(pi.id) AS total
FROM product_images pi
JOIN products p ON pi.product_id = p.id
LEFT JOIN product_variants pv ON pi.variant_id = pv.id
WHERE pi.company_id = $1
  AND ($2::bigint IS NULL OR pi.product_id = $2)
  AND ($3::bigint IS NULL OR pi.variant_id = $3)
  AND ($4::boolean IS NULL OR pi.is_primary = $4)
  AND ($5::boolean IS NULL OR pi.is_active = $5)
  AND (
      $6::text IS NULL
      OR pi.alt_text ILIKE '%' || $6 || '%'
      OR pi.original_file_name ILIKE '%' || $6 || '%'
      OR p.product_name ILIKE '%' || $6 || '%'
      OR pv.sku ILIKE '%' || $6 || '%'
  );

-- 3. Get Single Product Image by ID
SELECT 
    pi.id,
    pi.company_id,
    c.company_name,
    c.company_code,
    pi.product_id,
    p.product_code,
    p.product_name,
    pi.variant_id,
    pv.sku AS variant_sku,
    pv.variant_name,
    pi.image_url,
    pi.image_key,
    pi.original_file_name,
    pi.mime_type,
    pi.file_size,
    pi.width,
    pi.height,
    pi.alt_text,
    pi.display_order,
    pi.is_primary,
    pi.is_active,
    pi.created_by,
    pi.created_at
FROM product_images pi
JOIN companies c ON pi.company_id = c.id
JOIN products p ON pi.product_id = p.id
LEFT JOIN product_variants pv ON pi.variant_id = pv.id
WHERE pi.id = $1;

-- 4. Clear Previous Primary Image for Product (when variant_id IS NULL)
UPDATE product_images
SET is_primary = FALSE
WHERE product_id = $1 AND variant_id IS NULL AND is_primary = TRUE;

-- 5. Clear Previous Primary Image for Variant (when variant_id IS NOT NULL)
UPDATE product_images
SET is_primary = FALSE
WHERE variant_id = $1 AND is_primary = TRUE;

-- 6. Insert New Product Image
INSERT INTO product_images (
    company_id,
    product_id,
    variant_id,
    image_url,
    image_key,
    original_file_name,
    mime_type,
    file_size,
    width,
    height,
    alt_text,
    display_order,
    is_primary,
    is_active,
    created_by
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
) RETURNING id;

-- 7. Update Product Image
UPDATE product_images
SET 
    alt_text = COALESCE($2, alt_text),
    display_order = COALESCE($3, display_order),
    is_primary = COALESCE($4, is_primary),
    is_active = COALESCE($5, is_active)
WHERE id = $1
RETURNING id;

-- 8. Delete Product Image
DELETE FROM product_images WHERE id = $1;
