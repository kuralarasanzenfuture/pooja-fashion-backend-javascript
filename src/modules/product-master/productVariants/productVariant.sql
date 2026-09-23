-- Product Variants Reference SQL Queries

-- 1. List Product Variants with Filters, Search, and Multi-Table Joins
SELECT 
    pv.id,
    pv.company_id,
    c.company_name,
    c.company_code,
    pv.product_id,
    p.product_code,
    p.product_name,
    pv.sku,
    pv.variant_code,
    pv.variant_name,
    pv.size_group_id,
    sg.group_name AS size_group_name,
    sg.group_code AS size_group_code,
    pv.size_id,
    s.size_name,
    s.size_code,
    pv.color_id,
    col.color_name,
    col.color_code,
    col.hex_code AS color_hex_code,
    pv.material_id,
    m.material_name,
    m.material_code,
    pv.unit_id,
    u.unit_name,
    u.unit_code,
    u.symbol AS unit_symbol,
    pv.model_no,
    pv.style_code,
    pv.weight,
    pv.track_stock,
    pv.allow_negative_stock,
    pv.is_default,
    pv.is_active,
    pv.created_by,
    pv.updated_by,
    pv.created_at,
    pv.updated_at
FROM product_variants pv
JOIN companies c ON pv.company_id = c.id
JOIN products p ON pv.product_id = p.id
LEFT JOIN size_groups sg ON pv.size_group_id = sg.id
LEFT JOIN sizes s ON pv.size_id = s.id
LEFT JOIN colors col ON pv.color_id = col.id
LEFT JOIN materials m ON pv.material_id = m.id
JOIN units u ON pv.unit_id = u.id
WHERE pv.company_id = $1
  AND ($2::bigint IS NULL OR pv.product_id = $2)
  AND ($3::bigint IS NULL OR pv.size_group_id = $3)
  AND ($4::bigint IS NULL OR pv.size_id = $4)
  AND ($5::bigint IS NULL OR pv.color_id = $5)
  AND ($6::bigint IS NULL OR pv.material_id = $6)
  AND ($7::bigint IS NULL OR pv.unit_id = $7)
  AND ($8::boolean IS NULL OR pv.is_default = $8)
  AND ($9::boolean IS NULL OR pv.is_active = $9)
  AND (
      $10::text IS NULL
      OR pv.sku ILIKE '%' || $10 || '%'
      OR pv.variant_name ILIKE '%' || $10 || '%'
      OR pv.variant_code ILIKE '%' || $10 || '%'
      OR pv.model_no ILIKE '%' || $10 || '%'
      OR pv.style_code ILIKE '%' || $10 || '%'
  )
ORDER BY pv.is_default DESC, pv.sku ASC
LIMIT $11 OFFSET $12;

-- 2. Count Total Matching Product Variants
SELECT COUNT(pv.id) AS total
FROM product_variants pv
WHERE pv.company_id = $1
  AND ($2::bigint IS NULL OR pv.product_id = $2)
  AND ($3::bigint IS NULL OR pv.size_group_id = $3)
  AND ($4::bigint IS NULL OR pv.size_id = $4)
  AND ($5::bigint IS NULL OR pv.color_id = $5)
  AND ($6::bigint IS NULL OR pv.material_id = $6)
  AND ($7::bigint IS NULL OR pv.unit_id = $7)
  AND ($8::boolean IS NULL OR pv.is_default = $8)
  AND ($9::boolean IS NULL OR pv.is_active = $9)
  AND (
      $10::text IS NULL
      OR pv.sku ILIKE '%' || $10 || '%'
      OR pv.variant_name ILIKE '%' || $10 || '%'
      OR pv.variant_code ILIKE '%' || $10 || '%'
      OR pv.model_no ILIKE '%' || $10 || '%'
      OR pv.style_code ILIKE '%' || $10 || '%'
  );

-- 3. Get Single Variant by ID with Full Relations
SELECT 
    pv.id,
    pv.company_id,
    c.company_name,
    c.company_code,
    pv.product_id,
    p.product_code,
    p.product_name,
    pv.sku,
    pv.variant_code,
    pv.variant_name,
    pv.size_group_id,
    sg.group_name AS size_group_name,
    sg.group_code AS size_group_code,
    pv.size_id,
    s.size_name,
    s.size_code,
    pv.color_id,
    col.color_name,
    col.color_code,
    col.hex_code AS color_hex_code,
    pv.material_id,
    m.material_name,
    m.material_code,
    pv.unit_id,
    u.unit_name,
    u.unit_code,
    u.symbol AS unit_symbol,
    pv.model_no,
    pv.style_code,
    pv.weight,
    pv.track_stock,
    pv.allow_negative_stock,
    pv.is_default,
    pv.is_active,
    pv.created_by,
    pv.updated_by,
    pv.created_at,
    pv.updated_at
FROM product_variants pv
JOIN companies c ON pv.company_id = c.id
JOIN products p ON pv.product_id = p.id
LEFT JOIN size_groups sg ON pv.size_group_id = sg.id
LEFT JOIN sizes s ON pv.size_id = s.id
LEFT JOIN colors col ON pv.color_id = col.id
LEFT JOIN materials m ON pv.material_id = m.id
JOIN units u ON pv.unit_id = u.id
WHERE pv.id = $1;

-- 4. Get Variant by Company ID and SKU
SELECT 
    pv.id,
    pv.company_id,
    pv.product_id,
    pv.sku,
    pv.variant_name,
    pv.is_default,
    pv.is_active
FROM product_variants pv
WHERE pv.company_id = $1 AND LOWER(pv.sku) = LOWER($2);

-- 5. Clear Previous Default Variant for Product
UPDATE product_variants
SET is_default = FALSE, updated_at = CURRENT_TIMESTAMP
WHERE product_id = $1 AND is_default = TRUE;

-- 6. Insert New Product Variant
INSERT INTO product_variants (
    company_id,
    product_id,
    sku,
    variant_code,
    variant_name,
    size_group_id,
    size_id,
    color_id,
    material_id,
    unit_id,
    model_no,
    style_code,
    weight,
    track_stock,
    allow_negative_stock,
    is_default,
    is_active,
    created_by
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
) RETURNING id;

-- 7. Update Product Variant
UPDATE product_variants
SET 
    sku = COALESCE($2, sku),
    variant_code = $3,
    variant_name = $4,
    size_group_id = $5,
    size_id = $6,
    color_id = $7,
    material_id = $8,
    unit_id = COALESCE($9, unit_id),
    model_no = $10,
    style_code = $11,
    weight = $12,
    track_stock = COALESCE($13, track_stock),
    allow_negative_stock = COALESCE($14, allow_negative_stock),
    is_default = COALESCE($15, is_default),
    is_active = COALESCE($16, is_active),
    updated_by = $17,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING id;

-- 8. Delete Product Variant
DELETE FROM product_variants WHERE id = $1;
