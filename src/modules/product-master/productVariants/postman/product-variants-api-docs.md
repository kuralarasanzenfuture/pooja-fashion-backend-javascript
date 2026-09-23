# Product Variants API Documentation

The **Product Variants** module manages product SKUs and multi-attribute retail matrices (size, color, material, unit of measure, weight, barcodes, stock behavior) under **Product Master** in the Pooja Fashion ERP & POS platform.

---

## Base URLs
- Product Master Route: `http://localhost:5000/api/product-master/product-variants`
- Direct Route Alias: `http://localhost:5000/api/product-variants`

---

## Endpoints

### 1. List Product Variants
- **Method:** `GET`
- **Path:** `/api/product-master/product-variants`
- **Query Parameters:**
  - `page` (optional integer, default: 1)
  - `limit` (optional integer, default: 10, max: 100)
  - `company_id` (optional integer)
  - `product_id` (optional integer)
  - `size_group_id` (optional integer)
  - `size_id` (optional integer)
  - `color_id` (optional integer)
  - `material_id` (optional integer)
  - `unit_id` (optional integer)
  - `is_default` (optional boolean)
  - `track_stock` (optional boolean)
  - `allow_negative_stock` (optional boolean)
  - `is_active` (optional boolean)
  - `search` (optional string)
  - `sortBy` (optional enum: `id`, `sku`, `variant_code`, `variant_name`, `product_id`, `size_group_id`, `size_id`, `color_id`, `material_id`, `unit_id`, `weight`, `is_default`, `is_active`, `created_at`, default: `sku`)
  - `sortOrder` (optional enum: `asc`, `desc`, default: `asc`)

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Product variants retrieved successfully",
  "data": [
    {
      "id": 1,
      "company_id": 1,
      "company": {
        "id": 1,
        "name": "Pooja Fashion Retail Ltd",
        "code": "PF-CORP"
      },
      "product_id": 1,
      "product": {
        "id": 1,
        "name": "Embroidered Silk Anarkali Suit",
        "code": "SILK_ANARKALI_01"
      },
      "sku": "SILK-ANK-M-RED",
      "variant_code": "M-RED",
      "variant_name": "Silk Anarkali - M / Red",
      "size_group_id": 1,
      "size_group": {
        "id": 1,
        "name": "Women Standard Sizing",
        "code": "WOMEN_STD"
      },
      "size_id": 2,
      "size": {
        "id": 2,
        "name": "Medium",
        "code": "M"
      },
      "color_id": 1,
      "color": {
        "id": 1,
        "name": "Royal Red",
        "code": "RED_ROYAL",
        "hex_code": "#C41E3A"
      },
      "material_id": 1,
      "material": {
        "id": 1,
        "name": "Pure Mulberry Silk",
        "code": "SILK_MUL"
      },
      "unit_id": 1,
      "unit": {
        "id": 1,
        "name": "Piece",
        "code": "PCS",
        "symbol": "pc"
      },
      "model_no": "MDL-2026-01",
      "style_code": "STL-ANK-01",
      "weight": 0.65,
      "track_stock": true,
      "allow_negative_stock": false,
      "is_default": true,
      "is_active": true,
      "created_by": 1,
      "updated_by": null,
      "created_at": "2026-09-22T17:00:00.000Z",
      "updated_at": "2026-09-22T17:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### 2. Get Variants by Product ID
- **Method:** `GET`
- **Path:** `/api/product-master/product-variants/product/:productId`

---

### 3. Get Product Variant by ID
- **Method:** `GET`
- **Path:** `/api/product-master/product-variants/:id`

---

### 4. Get Product Variant by SKU
- **Method:** `GET`
- **Path:** `/api/product-master/product-variants/company/:companyId/sku/:sku`

---

### 5. Create Product Variant
- **Method:** `POST`
- **Path:** `/api/product-master/product-variants`
- **Request Body:**
```json
{
  "company_id": 1,
  "product_id": 1,
  "sku": "SILK-ANK-M-RED",
  "variant_code": "M-RED",
  "variant_name": "Silk Anarkali - M / Red",
  "size_group_id": 1,
  "size_id": 2,
  "color_id": 1,
  "material_id": 1,
  "unit_id": 1,
  "model_no": "MDL-2026-01",
  "style_code": "STL-ANK-01",
  "weight": 0.65,
  "track_stock": true,
  "allow_negative_stock": false,
  "is_default": true,
  "is_active": true
}
```

---

### 6. Update Product Variant
- **Method:** `PUT`
- **Path:** `/api/product-master/product-variants/:id`

---

### 7. Set Variant as Default
- **Method:** `POST`
- **Path:** `/api/product-master/product-variants/:id/set-default`
- **Description:** Atomically unsets any existing default variant for the parent product and sets this variant as the default.

---

### 8. Update Variant Status
- **Method:** `PATCH`
- **Path:** `/api/product-master/product-variants/:id/status`

---

### 9. Delete Product Variant
- **Method:** `DELETE`
- **Path:** `/api/product-master/product-variants/:id`
- **Description:** Safely deletes variant if no price histories or transactions are attached.
