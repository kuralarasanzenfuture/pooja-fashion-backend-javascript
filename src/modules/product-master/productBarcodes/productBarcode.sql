-- Product Barcodes Reference SQL Queries

-- 1. List Product Barcodes with Filters, Search, and Multi-Table Joins
SELECT 
    pb.id,
    pb.company_id,
    c.company_name,
    c.company_code,
    pb.product_id,
    p.product_code,
    p.product_name,
    pb.variant_id,
    pv.sku AS variant_sku,
    pv.variant_name,
    pv.variant_code,
    s.size_name,
    s.size_code,
    col.color_name,
    col.color_code,
    col.hex_code AS color_hex_code,
    m.material_name,
    m.material_code,
    u.unit_name,
    u.unit_code,
    u.symbol AS unit_symbol,
    pb.barcode,
    pb.barcode_type,
    pb.is_primary,
    pb.is_active,
    pb.created_by,
    pb.created_at
FROM product_barcodes pb
JOIN companies c ON pb.company_id = c.id
JOIN products p ON pb.product_id = p.id
JOIN product_variants pv ON pb.variant_id = pv.id
LEFT JOIN sizes s ON pv.size_id = s.id
LEFT JOIN colors col ON pv.color_id = col.id
LEFT JOIN materials m ON pv.material_id = m.id
JOIN units u ON pv.unit_id = u.id
WHERE pb.company_id = $1
  AND ($2::bigint IS NULL OR pb.product_id = $2)
  AND ($3::bigint IS NULL OR pb.variant_id = $3)
  AND ($4::varchar IS NULL OR pb.barcode_type = $4)
  AND ($5::boolean IS NULL OR pb.is_primary = $5)
  AND ($6::boolean IS NULL OR pb.is_active = $6)
  AND (
      $7::text IS NULL
      OR pb.barcode ILIKE '%' || $7 || '%'
      OR pv.sku ILIKE '%' || $7 || '%'
      OR p.product_name ILIKE '%' || $7 || '%'
  )
ORDER BY pb.is_primary DESC, pb.id ASC
LIMIT $8 OFFSET $9;

-- 2. Count Total Matching Product Barcodes
SELECT COUNT(pb.id) AS total
FROM product_barcodes pb
JOIN product_variants pv ON pb.variant_id = pv.id
JOIN products p ON pb.product_id = p.id
WHERE pb.company_id = $1
  AND ($2::bigint IS NULL OR pb.product_id = $2)
  AND ($3::bigint IS NULL OR pb.variant_id = $3)
  AND ($4::varchar IS NULL OR pb.barcode_type = $4)
  AND ($5::boolean IS NULL OR pb.is_primary = $5)
  AND ($6::boolean IS NULL OR pb.is_active = $6)
  AND (
      $7::text IS NULL
      OR pb.barcode ILIKE '%' || $7 || '%'
      OR pv.sku ILIKE '%' || $7 || '%'
      OR p.product_name ILIKE '%' || $7 || '%'
  );

-- 3. Get Single Barcode by ID with Full Relations
SELECT 
    pb.id,
    pb.company_id,
    c.company_name,
    c.company_code,
    pb.product_id,
    p.product_code,
    p.product_name,
    pb.variant_id,
    pv.sku AS variant_sku,
    pv.variant_name,
    pv.variant_code,
    s.size_name,
    s.size_code,
    col.color_name,
    col.color_code,
    col.hex_code AS color_hex_code,
    m.material_name,
    m.material_code,
    u.unit_name,
    u.unit_code,
    u.symbol AS unit_symbol,
    pb.barcode,
    pb.barcode_type,
    pb.is_primary,
    pb.is_active,
    pb.created_by,
    pb.created_at
FROM product_barcodes pb
JOIN companies c ON pb.company_id = c.id
JOIN products p ON pb.product_id = p.id
JOIN product_variants pv ON pb.variant_id = pv.id
LEFT JOIN sizes s ON pv.size_id = s.id
LEFT JOIN colors col ON pv.color_id = col.id
LEFT JOIN materials m ON pv.material_id = m.id
JOIN units u ON pv.unit_id = u.id
WHERE pb.id = $1;

-- 4. POS Barcode Scan Lookup by Company ID and Barcode
SELECT 
    pb.id,
    pb.company_id,
    c.company_name,
    c.company_code,
    pb.product_id,
    p.product_code,
    p.product_name,
    p.category_id,
    pb.variant_id,
    pv.sku AS variant_sku,
    pv.variant_name,
    pv.variant_code,
    pv.weight,
    pv.track_stock,
    pv.allow_negative_stock,
    s.size_name,
    s.size_code,
    col.color_name,
    col.color_code,
    col.hex_code AS color_hex_code,
    m.material_name,
    m.material_code,
    u.unit_name,
    u.unit_code,
    u.symbol AS unit_symbol,
    pb.barcode,
    pb.barcode_type,
    pb.is_primary,
    pb.is_active,
    pb.created_at
FROM product_barcodes pb
JOIN companies c ON pb.company_id = c.id
JOIN products p ON pb.product_id = p.id
JOIN product_variants pv ON pb.variant_id = pv.id
LEFT JOIN sizes s ON pv.size_id = s.id
LEFT JOIN colors col ON pv.color_id = col.id
LEFT JOIN materials m ON pv.material_id = m.id
JOIN units u ON pv.unit_id = u.id
WHERE pb.company_id = $1 AND pb.barcode = $2;

-- 5. Clear Previous Primary Barcode for a Variant
UPDATE product_barcodes
SET is_primary = FALSE
WHERE variant_id = $1 AND is_primary = TRUE;

-- 6. Insert New Barcode
INSERT INTO product_barcodes (
    company_id,
    product_id,
    variant_id,
    barcode,
    barcode_type,
    is_primary,
    is_active,
    created_by
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8
) RETURNING id;

-- 7. Update Barcode
UPDATE product_barcodes
SET 
    barcode = COALESCE($2, barcode),
    barcode_type = COALESCE($3, barcode_type),
    is_primary = COALESCE($4, is_primary),
    is_active = COALESCE($5, is_active)
WHERE id = $1
RETURNING id;

-- 8. Delete Barcode
DELETE FROM product_barcodes WHERE id = $1;
