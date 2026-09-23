# Products API Documentation

The **Products** module manages the core product catalog under **Product Master** in the Pooja Fashion ERP & POS platform. It links categories, subcategories, brands, product types, and default units of measure.

---

## Base URLs
- Product Master Route: `http://localhost:5000/api/product-master/products`
- Direct Route Alias: `http://localhost:5000/api/products`

---

## Endpoints

### 1. List Products
- **Method:** `GET`
- **Path:** `/api/product-master/products`
- **Query Parameters:**
  - `page` (optional integer, default: 1)
  - `limit` (optional integer, default: 10, max: 100)
  - `company_id` (optional integer)
  - `category_id` (optional integer)
  - `subcategory_id` (optional integer)
  - `brand_id` (optional integer)
  - `product_type_id` (optional integer)
  - `default_unit_id` (optional integer)
  - `is_variant_product` (optional boolean)
  - `track_stock` (optional boolean)
  - `allow_negative_stock` (optional boolean)
  - `is_active` (optional boolean)
  - `search` (optional string)
  - `sortBy` (optional enum: `id`, `product_code`, `product_name`, `category_id`, `subcategory_id`, `brand_id`, `product_type_id`, `default_unit_id`, `is_active`, `created_at`, default: `product_name`)
  - `sortOrder` (optional enum: `asc`, `desc`, default: `asc`)

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": 1,
      "company_id": 1,
      "company": {
        "id": 1,
        "name": "Pooja Fashion Retail Ltd",
        "code": "PF-CORP"
      },
      "product_code": "SILK_ANARKALI_01",
      "product_name": "Embroidered Silk Anarkali Suit",
      "category_id": 1,
      "category": {
        "id": 1,
        "name": "Women Ethnic",
        "code": "WOMEN_ETHNIC"
      },
      "subcategory_id": 1,
      "subcategory": {
        "id": 1,
        "name": "Anarkali Suits",
        "code": "ANARKALI"
      },
      "brand_id": 1,
      "brand": {
        "id": 1,
        "name": "Pooja Exclusive",
        "code": "POOJA_EXCL"
      },
      "product_type_id": 1,
      "product_type": {
        "id": 1,
        "name": "Ready-made Garments",
        "code": "READY_MADE"
      },
      "description": "Handcrafted premium silk suit with intricate zari embroidery.",
      "short_description": "Designer silk anarkali suit",
      "manufacturer_name": "Pooja Fashion Crafts Ltd",
      "manufacturer_part_no": "PFC-ANK-2026",
      "default_unit_id": 1,
      "default_unit": {
        "id": 1,
        "name": "Piece",
        "code": "PCS",
        "symbol": "pc"
      },
      "is_variant_product": true,
      "track_stock": true,
      "allow_negative_stock": false,
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

### 2. Get Product by ID
- **Method:** `GET`
- **Path:** `/api/product-master/products/:id`

---

### 3. Get Product by Code
- **Method:** `GET`
- **Path:** `/api/product-master/products/company/:companyId/code/:productCode`

---

### 4. Create Product
- **Method:** `POST`
- **Path:** `/api/product-master/products`
- **Request Body:**
```json
{
  "company_id": 1,
  "product_code": "SILK_ANARKALI_01",
  "product_name": "Embroidered Silk Anarkali Suit",
  "category_id": 1,
  "subcategory_id": 1,
  "brand_id": 1,
  "product_type_id": 1,
  "description": "Handcrafted premium silk suit with intricate zari embroidery.",
  "short_description": "Designer silk anarkali suit",
  "manufacturer_name": "Pooja Fashion Crafts Ltd",
  "manufacturer_part_no": "PFC-ANK-2026",
  "default_unit_id": 1,
  "is_variant_product": true,
  "track_stock": true,
  "allow_negative_stock": false,
  "is_active": true
}
```

---

### 5. Update Product
- **Method:** `PUT`
- **Path:** `/api/product-master/products/:id`
- **Request Body:**
```json
{
  "product_name": "Embroidered Royal Silk Anarkali Suit",
  "short_description": "Exclusive festive designer royal silk anarkali suit",
  "track_stock": true,
  "allow_negative_stock": false
}
```

---

### 6. Update Product Status
- **Method:** `PATCH`
- **Path:** `/api/product-master/products/:id/status`
- **Request Body:**
```json
{
  "is_active": false
}
```

---

### 7. Delete Product
- **Method:** `DELETE`
- **Path:** `/api/product-master/products/:id`
- **Note:** Blocks deletion if associated variants exist in `product_variants`.
