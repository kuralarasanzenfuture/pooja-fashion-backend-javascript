# Product Master: Product Types API Documentation

Enterprise API documentation for managing product classifications and commercial behavior types (e.g., Ready-Made, Fabric, Accessories, Footwear, Services) in the Pooja Fashion ERP & POS platform.

---

## Base URL
`/api/product-master/product-types` (also accessible directly via `/api/product-types`)

---

## Endpoints

### 1. List Product Types
Retrieve a paginated, filterable, and searchable list of product types for a company.

- **URL:** `GET /api/product-master/product-types`
- **Query Parameters:**
  - `page` *(number, optional, default: 1)*: Page number.
  - `limit` *(number, optional, default: 10)*: Items per page (max 100).
  - `company_id` *(number, optional)*: Filter by company ID.
  - `is_stock_item` *(boolean, optional)*: Filter by stock tracking flag.
  - `is_saleable` *(boolean, optional)*: Filter by saleable flag.
  - `is_purchasable` *(boolean, optional)*: Filter by purchasable flag.
  - `is_active` *(boolean, optional)*: Filter by active status (`true` / `false`).
  - `search` *(string, optional)*: Case-insensitive search on type name, type code, or description.
  - `sortBy` *(string, optional, default: 'type_name')*: Sort column (`id`, `type_code`, `type_name`, `created_at`, `is_active`).
  - `sortOrder` *(string, optional, default: 'asc')*: Sort direction (`asc` / `desc`).
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Product types retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "companyName": "Pooja Fashion Retail Ltd",
      "companyCode": "PF-CORP",
      "typeCode": "READY_MADE",
      "typeName": "Ready Made Garments",
      "description": "Finished apparel and ready-to-wear clothing",
      "isStockItem": true,
      "isSaleable": true,
      "isPurchasable": true,
      "isActive": true,
      "createdBy": 1,
      "updatedBy": null,
      "createdAt": "2026-09-22T10:00:00.000Z",
      "updatedAt": "2026-09-22T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 2. Get Product Type By ID
Retrieve details of a single product type by its primary ID.

- **URL:** `GET /api/product-master/product-types/:id`
- **Path Parameters:**
  - `id` *(number, required)*: Product Type primary key ID.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Product type retrieved successfully",
  "data": {
    "id": 1,
    "companyId": 1,
    "companyName": "Pooja Fashion Retail Ltd",
    "companyCode": "PF-CORP",
    "typeCode": "READY_MADE",
    "typeName": "Ready Made Garments",
    "description": "Finished apparel and ready-to-wear clothing",
    "isStockItem": true,
    "isSaleable": true,
    "isPurchasable": true,
    "isActive": true,
    "createdBy": 1,
    "updatedBy": null,
    "createdAt": "2026-09-22T10:00:00.000Z",
    "updatedAt": "2026-09-22T10:00:00.000Z"
  }
}
```

---

### 3. Get Product Type By Code
Retrieve a product type using company ID and type code.

- **URL:** `GET /api/product-master/product-types/code/:companyId/:typeCode`
- **Path Parameters:**
  - `companyId` *(number, required)*: Company ID.
  - `typeCode` *(string, required)*: Unique type code (e.g. `READY_MADE`, `FABRIC`).
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Product type retrieved successfully",
  "data": {
    "id": 1,
    "companyId": 1,
    "companyName": "Pooja Fashion Retail Ltd",
    "companyCode": "PF-CORP",
    "typeCode": "READY_MADE",
    "typeName": "Ready Made Garments",
    "description": "Finished apparel and ready-to-wear clothing",
    "isStockItem": true,
    "isSaleable": true,
    "isPurchasable": true,
    "isActive": true,
    "createdBy": 1,
    "updatedBy": null,
    "createdAt": "2026-09-22T10:00:00.000Z",
    "updatedAt": "2026-09-22T10:00:00.000Z"
  }
}
```

---

### 4. Get Company Product Types
Retrieve all product types for a company, ordered alphabetically by name.

- **URL:** `GET /api/product-master/product-types/company/:companyId`
- **Query Parameters:**
  - `is_active` *(boolean, optional)*: Filter by active status.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Company product types retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "typeCode": "READY_MADE",
      "typeName": "Ready Made Garments",
      "isStockItem": true,
      "isSaleable": true,
      "isPurchasable": true,
      "isActive": true
    }
  ]
}
```

---

### 5. Create Product Type
Create a new product type record for a company.

- **URL:** `POST /api/product-master/product-types`
- **Request Body:**
```json
{
  "company_id": 1,
  "type_code": "READY_MADE",
  "type_name": "Ready Made Garments",
  "description": "Finished apparel and ready-to-wear clothing",
  "is_stock_item": true,
  "is_saleable": true,
  "is_purchasable": true,
  "is_active": true
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Product type created successfully",
  "data": {
    "id": 2,
    "companyId": 1,
    "companyName": "Pooja Fashion Retail Ltd",
    "companyCode": "PF-CORP",
    "typeCode": "READY_MADE",
    "typeName": "Ready Made Garments",
    "description": "Finished apparel and ready-to-wear clothing",
    "isStockItem": true,
    "isSaleable": true,
    "isPurchasable": true,
    "isActive": true,
    "createdBy": 1,
    "updatedBy": null,
    "createdAt": "2026-09-22T10:00:00.000Z",
    "updatedAt": "2026-09-22T10:00:00.000Z"
  }
}
```

---

### 6. Update Product Type
Update product type details (name, commercial flags, description).

- **URL:** `PUT /api/product-master/product-types/:id`
- **Request Body:**
```json
{
  "type_name": "Ready-Made Garments & Outfits",
  "is_stock_item": true,
  "is_saleable": true,
  "is_purchasable": true
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Product type updated successfully",
  "data": {
    "id": 2,
    "companyId": 1,
    "typeCode": "READY_MADE",
    "typeName": "Ready-Made Garments & Outfits",
    "isStockItem": true,
    "isSaleable": true,
    "isPurchasable": true,
    "isActive": true
  }
}
```

---

### 7. Update Product Type Status
Toggle active status (`true` / `false`).

- **URL:** `PATCH /api/product-master/product-types/:id/status`
- **Request Body:**
```json
{
  "is_active": false
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Product type status updated successfully",
  "data": {
    "id": 2,
    "isActive": false
  }
}
```

---

### 8. Delete Product Type
Delete product type by primary key ID. Fails with `400 Bad Request` if products reference this type.

- **URL:** `DELETE /api/product-master/product-types/:id`
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Product type deleted successfully",
  "data": {
    "id": 2,
    "deleted": true,
    "message": "Product type deleted successfully"
  }
}
```

---

### 9. Seed Default Product Types
Seed standard retail product types (READY_MADE, FABRIC, ACCESSORY, FOOTWEAR, SERVICE).

- **URL:** `POST /api/product-master/product-types/company/:companyId/seed-defaults`
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Default product types seeded successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "typeCode": "READY_MADE",
      "typeName": "Ready Made Garments",
      "isStockItem": true,
      "isSaleable": true,
      "isPurchasable": true,
      "isActive": true
    }
  ]
}
```
