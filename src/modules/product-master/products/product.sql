-- Products Reference SQL Queries

-- 1. List Products with Pagination, Filters, and Joined Parent Entities
SELECT 
    p.id,
    p.company_id,
    c.company_name,
    c.company_code,
    p.product_code,
    p.product_name,
    p.category_id,
    cat.category_name,
    cat.category_code,
    p.subcategory_id,
    sub.subcategory_name,
    sub.subcategory_code,
    p.brand_id,
    b.brand_name,
    b.brand_code,
    p.product_type_id,
    pt.type_name,
    pt.type_code,
    p.description,
    p.short_description,
    p.manufacturer_name,
    p.manufacturer_part_no,
    p.default_unit_id,
    u.unit_name,
    u.unit_code,
    u.symbol AS unit_symbol,
    p.is_variant_product,
    p.track_stock,
    p.allow_negative_stock,
    p.is_active,
    p.created_by,
    p.updated_by,
    p.created_at,
    p.updated_at
FROM products p
JOIN companies c ON p.company_id = c.id
JOIN categories cat ON p.category_id = cat.id
LEFT JOIN subcategories sub ON p.subcategory_id = sub.id
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN product_types pt ON p.product_type_id = pt.id
JOIN units u ON p.default_unit_id = u.id
WHERE p.company_id = $1
  AND ($2::bigint IS NULL OR p.category_id = $2)
  AND ($3::bigint IS NULL OR p.subcategory_id = $3)
  AND ($4::bigint IS NULL OR p.brand_id = $4)
  AND ($5::bigint IS NULL OR p.product_type_id = $5)
  AND ($6::bigint IS NULL OR p.default_unit_id = $6)
  AND ($7::boolean IS NULL OR p.is_variant_product = $7)
  AND ($8::boolean IS NULL OR p.track_stock = $8)
  AND ($9::boolean IS NULL OR p.allow_negative_stock = $9)
  AND ($10::boolean IS NULL OR p.is_active = $10)
  AND (
      $11::text IS NULL 
      OR p.product_name ILIKE '%' || $11 || '%'
      OR p.product_code ILIKE '%' || $11 || '%'
      OR p.manufacturer_name ILIKE '%' || $11 || '%'
      OR p.manufacturer_part_no ILIKE '%' || $11 || '%'
  )
ORDER BY p.product_name ASC
LIMIT $12 OFFSET $13;

-- 2. Count Total Matching Products
SELECT COUNT(p.id) AS total
FROM products p
WHERE p.company_id = $1
  AND ($2::bigint IS NULL OR p.category_id = $2)
  AND ($3::bigint IS NULL OR p.subcategory_id = $3)
  AND ($4::bigint IS NULL OR p.brand_id = $4)
  AND ($5::bigint IS NULL OR p.product_type_id = $5)
  AND ($6::bigint IS NULL OR p.default_unit_id = $6)
  AND ($7::boolean IS NULL OR p.is_variant_product = $7)
  AND ($8::boolean IS NULL OR p.track_stock = $8)
  AND ($9::boolean IS NULL OR p.allow_negative_stock = $9)
  AND ($10::boolean IS NULL OR p.is_active = $10)
  AND (
      $11::text IS NULL 
      OR p.product_name ILIKE '%' || $11 || '%'
      OR p.product_code ILIKE '%' || $11 || '%'
      OR p.manufacturer_name ILIKE '%' || $11 || '%'
      OR p.manufacturer_part_no ILIKE '%' || $11 || '%'
  );

-- 3. Get Single Product by ID with Full Relations
SELECT 
    p.id,
    p.company_id,
    c.company_name,
    c.company_code,
    p.product_code,
    p.product_name,
    p.category_id,
    cat.category_name,
    cat.category_code,
    p.subcategory_id,
    sub.subcategory_name,
    sub.subcategory_code,
    p.brand_id,
    b.brand_name,
    b.brand_code,
    p.product_type_id,
    pt.type_name,
    pt.type_code,
    p.description,
    p.short_description,
    p.manufacturer_name,
    p.manufacturer_part_no,
    p.default_unit_id,
    u.unit_name,
    u.unit_code,
    u.symbol AS unit_symbol,
    p.is_variant_product,
    p.track_stock,
    p.allow_negative_stock,
    p.is_active,
    p.created_by,
    p.updated_by,
    p.created_at,
    p.updated_at
FROM products p
JOIN companies c ON p.company_id = c.id
JOIN categories cat ON p.category_id = cat.id
LEFT JOIN subcategories sub ON p.subcategory_id = sub.id
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN product_types pt ON p.product_type_id = pt.id
JOIN units u ON p.default_unit_id = u.id
WHERE p.id = $1;

-- 4. Get Product by Code within a Company
SELECT 
    p.id,
    p.company_id,
    p.product_code,
    p.product_name,
    p.category_id,
    p.subcategory_id,
    p.brand_id,
    p.product_type_id,
    p.default_unit_id,
    p.is_active
FROM products p
WHERE p.company_id = $1 AND LOWER(p.product_code) = LOWER($2);

-- 5. Insert New Product
INSERT INTO products (
    company_id,
    product_code,
    product_name,
    category_id,
    subcategory_id,
    brand_id,
    product_type_id,
    description,
    short_description,
    manufacturer_name,
    manufacturer_part_no,
    default_unit_id,
    is_variant_product,
    track_stock,
    allow_negative_stock,
    is_active,
    created_by,
    updated_by
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
) RETURNING *;

-- 6. Update Product
UPDATE products
SET 
    product_code = COALESCE($2, product_code),
    product_name = COALESCE($3, product_name),
    category_id = COALESCE($4, category_id),
    subcategory_id = $5,
    brand_id = $6,
    product_type_id = $7,
    description = $8,
    short_description = $9,
    manufacturer_name = $10,
    manufacturer_part_no = $11,
    default_unit_id = COALESCE($12, default_unit_id),
    is_variant_product = COALESCE($13, is_variant_product),
    track_stock = COALESCE($14, track_stock),
    allow_negative_stock = COALESCE($15, allow_negative_stock),
    is_active = COALESCE($16, is_active),
    updated_by = $17,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;

-- 7. Update Product Status
UPDATE products
SET 
    is_active = $2,
    updated_by = $3,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;

-- 8. Delete Product
DELETE FROM products WHERE id = $1;

-- 9. Check Dependent Product Variants
SELECT COUNT(id) AS variant_count
FROM product_variants
WHERE product_id = $1;
