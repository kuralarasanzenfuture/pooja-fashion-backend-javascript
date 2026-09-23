# Product Images API Documentation

The **Product Images** module manages image assets and product galleries for retail catalogs, e-commerce, and POS terminals under **Product Master** in the Pooja Fashion ERP & POS platform.

---

## File Storage & Architecture

- **Dedicated Product Subfolders:**
  Every product's images are stored strictly in an isolated directory:
  `uploads/products/product-{productId}/`
- **Naming Pattern:**
  - Product-level image: `prod-{productId}-img-{timestamp}-{random}.ext`
  - Variant-level image: `prod-{productId}-var-{variantId}-img-{timestamp}-{random}.ext`
- **Physical File Cleanup:**
  Deleting an image via `DELETE /api/product-master/product-images/:id` automatically removes the physical file from the product's subfolder on disk.

---

## Base URLs
- Product Master Route: `http://localhost:5000/api/product-master/product-images`
- Direct Route Alias: `http://localhost:5000/api/product-images`

---

## Endpoints

### 1. List Product Images
- **Method:** `GET`
- **Path:** `/api/product-master/product-images`
- **Query Parameters:**
  - `page` (optional integer, default: 1)
  - `limit` (optional integer, default: 10, max: 100)
  - `company_id` (optional integer)
  - `product_id` (optional integer)
  - `variant_id` (optional integer)
  - `is_primary` (optional boolean)
  - `is_active` (optional boolean)
  - `search` (optional string)
  - `sortBy` (optional enum: `id`, `display_order`, `product_id`, `variant_id`, `is_primary`, `is_active`, `created_at`, default: `id`)
  - `sortOrder` (optional enum: `asc`, `desc`, default: `asc`)

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Product images retrieved successfully",
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
      "variant_id": 1,
      "variant": {
        "id": 1,
        "sku": "SILK-ANK-M-RED",
        "name": "Silk Anarkali - M / Red"
      },
      "image_url": "/uploads/products/product-1/prod-1-var-1-img-1727028000000-abc12.jpg",
      "image_key": "products/product-1/prod-1-var-1-img-1727028000000-abc12.jpg",
      "original_file_name": "anarkali-red-front.jpg",
      "mime_type": "image/jpeg",
      "file_size": 245890,
      "width": null,
      "height": null,
      "alt_text": "Silk Anarkali Front View",
      "display_order": 0,
      "is_primary": true,
      "is_active": true,
      "created_by": 1,
      "created_at": "2026-09-22T17:00:00.000Z"
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

### 2. Get Images by Product ID
- **Method:** `GET`
- **Path:** `/api/product-master/product-images/product/:productId`
- **Query Parameters:**
  - `variant_id` (optional integer)
  - `is_primary` (optional boolean)
  - `is_active` (optional boolean)

---

### 3. Upload & Create Product Image
- **Method:** `POST`
- **Path:** `/api/product-master/product-images`
- **Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `company_id` (required integer): `1`
  - `product_id` (required integer): `1`
  - `variant_id` (optional integer): `1`
  - `image` (binary file): Select image (`.jpg`, `.png`, `.webp`)
  - `alt_text` (optional string): `"Front Embroidery Angle"`
  - `display_order` (optional integer): `0`
  - `is_primary` (optional boolean): `true`

---

### 4. Update Product Image Metadata
- **Method:** `PUT`
- **Path:** `/api/product-master/product-images/:id`
- **Request Body:**
```json
{
  "alt_text": "Silk Anarkali - Designer Front Embroidery",
  "display_order": 1,
  "is_primary": true
}
```

---

### 5. Set Image as Primary
- **Method:** `POST`
- **Path:** `/api/product-master/product-images/:id/set-primary`
- **Description:** Atomically sets this image as primary, unsetting other primary images for the same product or variant scope.

---

### 6. Batch Reorder Images
- **Method:** `POST`
- **Path:** `/api/product-master/product-images/reorder`
- **Request Body:**
```json
{
  "items": [
    { "id": 1, "display_order": 0 },
    { "id": 2, "display_order": 1 },
    { "id": 3, "display_order": 2 }
  ]
}
```

---

### 7. Delete Product Image
- **Method:** `DELETE`
- **Path:** `/api/product-master/product-images/:id`
- **Description:** Deletes the database record and removes the physical image file from the product's subfolder on disk.
