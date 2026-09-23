# Product Barcodes API Documentation

The **Product Barcodes** module provides barcode management and instant scanning capabilities for retail POS terminals under **Product Master** in the Pooja Fashion ERP & POS platform.

---

## Base URLs
- Product Master Route: `http://localhost:5000/api/product-master/product-barcodes`
- Direct Route Alias: `http://localhost:5000/api/product-barcodes`

---

## Endpoints

### 1. List Product Barcodes
- **Method:** `GET`
- **Path:** `/api/product-master/product-barcodes`
- **Query Parameters:**
  - `page` (optional integer, default: 1)
  - `limit` (optional integer, default: 10, max: 100)
  - `company_id` (optional integer)
  - `product_id` (optional integer)
  - `variant_id` (optional integer)
  - `barcode_type` (optional enum: `EAN`, `EAN13`, `UPC`, `UPCA`, `CODE128`, `CODE39`, `QR`, `INTERNAL`, `CUSTOM`)
  - `is_primary` (optional boolean)
  - `is_active` (optional boolean)
  - `search` (optional string)
  - `sortBy` (optional enum: `id`, `barcode`, `barcode_type`, `product_id`, `variant_id`, `is_primary`, `is_active`, `created_at`, default: `id`)
  - `sortOrder` (optional enum: `asc`, `desc`, default: `desc`)

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Product barcodes retrieved successfully",
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
        "code": "SILK_ANARKALI_01",
        "category_id": 1
      },
      "variant_id": 1,
      "variant": {
        "id": 1,
        "sku": "SILK-ANK-M-RED",
        "name": "Silk Anarkali - M / Red",
        "code": "M-RED",
        "weight": 0.65,
        "track_stock": true,
        "allow_negative_stock": false,
        "size": {
          "name": "Medium",
          "code": "M"
        },
        "color": {
          "name": "Royal Red",
          "code": "RED_ROYAL",
          "hex_code": "#C41E3A"
        },
        "material": {
          "name": "Pure Mulberry Silk",
          "code": "SILK_MUL"
        },
        "unit": {
          "name": "Piece",
          "code": "PCS",
          "symbol": "pc"
        }
      },
      "barcode": "8901234567890",
      "barcode_type": "EAN13",
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

### 2. POS Barcode Scan Lookup
- **Method:** `GET`
- **Path:** `/api/product-master/product-barcodes/scan/:companyId/:barcode`
- **Description:** Real-time barcode resolution endpoint for handheld barcode scanners and POS touchscreens. Immediately returns product, variant, size, color, material, and unit details.

#### Sample Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Scanned barcode resolved successfully",
  "data": {
    "id": 1,
    "company_id": 1,
    "product_id": 1,
    "product": {
      "id": 1,
      "name": "Embroidered Silk Anarkali Suit",
      "code": "SILK_ANARKALI_01",
      "category_id": 1
    },
    "variant_id": 1,
    "variant": {
      "id": 1,
      "sku": "SILK-ANK-M-RED",
      "name": "Silk Anarkali - M / Red",
      "code": "M-RED",
      "size": { "name": "Medium", "code": "M" },
      "color": { "name": "Royal Red", "code": "RED_ROYAL", "hex_code": "#C41E3A" }
    },
    "barcode": "8901234567890",
    "barcode_type": "EAN13",
    "is_primary": true,
    "is_active": true
  }
}
```

---

### 3. Get Barcodes by Variant ID
- **Method:** `GET`
- **Path:** `/api/product-master/product-barcodes/variant/:variantId`

---

### 4. Create Product Barcode
- **Method:** `POST`
- **Path:** `/api/product-master/product-barcodes`
- **Request Body:**
```json
{
  "company_id": 1,
  "product_id": 1,
  "variant_id": 1,
  "barcode": "8901234567890",
  "barcode_type": "EAN13",
  "is_primary": true,
  "is_active": true
}
```

---

### 5. Update Product Barcode
- **Method:** `PUT`
- **Path:** `/api/product-master/product-barcodes/:id`

---

### 6. Set Barcode as Primary
- **Method:** `POST`
- **Path:** `/api/product-master/product-barcodes/:id/set-primary`
- **Description:** Designates this barcode as primary for its variant, atomically unsetting previous primary barcodes for that variant.

---

### 7. Update Barcode Status
- **Method:** `PATCH`
- **Path:** `/api/product-master/product-barcodes/:id/status`

---

### 8. Delete Product Barcode
- **Method:** `DELETE`
- **Path:** `/api/product-master/product-barcodes/:id`
