# Product Master: Brands API Documentation

Enterprise API documentation for managing product brands in the Pooja Fashion ERP & POS platform.

---

## Base URL
`/api/product-master/brands` (also accessible via `/api/brands`)

---

## Endpoints

### 1. List Brands
Retrieve a paginated, filterable, and searchable list of brands.

- **URL:** `GET /api/product-master/brands`
- **Query Parameters:**
  - `page` *(number, optional, default: 1)*: Page number.
  - `limit` *(number, optional, default: 10)*: Number of items per page.
  - `company_id` *(number, optional)*: Filter by company ID.
  - `is_active` *(boolean, optional)*: Filter by active status (`true` / `false`).
  - `search` *(string, optional)*: Search in brand name, code, or description.
  - `sortBy` *(string, optional, default: 'display_order')*: Sort column (`id`, `brand_code`, `brand_name`, `display_order`, `created_at`, `is_active`).
  - `sortOrder` *(string, optional, default: 'asc')*: Sort direction (`asc` / `desc`).
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Brands retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "companyName": "Pooja Fashion Retail Ltd",
      "companyCode": "PF-CORP",
      "brandCode": "POOJA_EXCLUSIVE",
      "brandName": "Pooja Exclusive",
      "description": "In-house luxury ethnic & bridal collection",
      "logoUrl": "/uploads/brands/pooja-exclusive/pooja-exclusive-logo-1727000000000.png",
      "logoKey": "brands/pooja-exclusive/pooja-exclusive-logo-1727000000000.png",
      "websiteUrl": "https://poojafashion.com",
      "displayOrder": 1,
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

### 2. Get Brand By ID
Retrieve details of a single brand by primary ID.

- **URL:** `GET /api/product-master/brands/:id`
- **Parameters:**
  - `id` *(number, required)*: Brand primary ID.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Brand retrieved successfully",
  "data": {
    "id": 1,
    "companyId": 1,
    "companyName": "Pooja Fashion Retail Ltd",
    "companyCode": "PF-CORP",
    "brandCode": "POOJA_EXCLUSIVE",
    "brandName": "Pooja Exclusive",
    "description": "In-house luxury ethnic & bridal collection",
    "logoUrl": "/uploads/brands/pooja-exclusive/pooja-exclusive-logo-1727000000000.png",
    "logoKey": "brands/pooja-exclusive/pooja-exclusive-logo-1727000000000.png",
    "websiteUrl": "https://poojafashion.com",
    "displayOrder": 1,
    "isActive": true,
    "createdBy": 1,
    "updatedBy": null,
    "createdAt": "2026-09-22T10:00:00.000Z",
    "updatedAt": "2026-09-22T10:00:00.000Z"
  }
}
```

---

### 3. Get Brand By Code
Retrieve a brand by company ID and brand code.

- **URL:** `GET /api/product-master/brands/code/:companyId/:brandCode`
- **Parameters:**
  - `companyId` *(number, required)*: Company ID.
  - `brandCode` *(string, required)*: Brand code.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Brand retrieved successfully",
  "data": {
    "id": 1,
    "companyId": 1,
    "brandCode": "POOJA_EXCLUSIVE",
    "brandName": "Pooja Exclusive",
    "displayOrder": 1,
    "isActive": true
  }
}
```

---

### 4. Get Company Brands
Retrieve all brands belonging to a specific company.

- **URL:** `GET /api/product-master/brands/company/:companyId`
- **Query Parameters:**
  - `is_active` *(boolean, optional)*: Filter by active status.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Company brands retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "brandCode": "POOJA_EXCLUSIVE",
      "brandName": "Pooja Exclusive",
      "displayOrder": 1,
      "isActive": true
    }
  ]
}
```

---

### 5. Create Brand
Create a new brand. Supports JSON or multipart/form-data with logo image (`logo` or `image`).

- **URL:** `POST /api/product-master/brands`
- **Request Body (JSON):**
```json
{
  "company_id": 1,
  "brand_code": "MANYAVAR",
  "brand_name": "Manyavar",
  "description": "Celebration wear for men and women",
  "website_url": "https://manyavar.com",
  "display_order": 2,
  "is_active": true
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Brand created successfully",
  "data": {
    "id": 2,
    "companyId": 1,
    "brandCode": "MANYAVAR",
    "brandName": "Manyavar",
    "description": "Celebration wear for men and women",
    "logoUrl": null,
    "websiteUrl": "https://manyavar.com",
    "displayOrder": 2,
    "isActive": true,
    "createdBy": 1,
    "updatedBy": null,
    "createdAt": "2026-09-22T10:15:00.000Z",
    "updatedAt": "2026-09-22T10:15:00.000Z"
  }
}
```

---

### 6. Update Brand
Update brand details or replace its logo.

- **URL:** `PUT /api/product-master/brands/:id`
- **Request Body (JSON):**
```json
{
  "brand_name": "Manyavar & Mohey",
  "description": "Premium festive and wedding attire",
  "display_order": 1
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Brand updated successfully",
  "data": {
    "id": 2,
    "companyId": 1,
    "brandCode": "MANYAVAR",
    "brandName": "Manyavar & Mohey",
    "displayOrder": 1,
    "isActive": true
  }
}
```

---

### 7. Update Brand Status
Toggle brand active status (`is_active`).

- **URL:** `PATCH /api/product-master/brands/:id/status`
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
  "message": "Brand status updated successfully",
  "data": {
    "id": 2,
    "isActive": false
  }
}
```

---

### 8. Upload Brand Logo
Dedicated endpoint to upload or replace brand logo image.

- **URL:** `POST /api/product-master/brands/:id/logo`
- **Headers:** `Content-Type: multipart/form-data`
- **Form Data:**
  - `logo`: *(file binary, jpg/png/webp/svg)*
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Brand logo uploaded successfully",
  "data": {
    "id": 2,
    "logoUrl": "/uploads/brands/manyavar/manyavar-logo-1727003000000.png",
    "logoKey": "brands/manyavar/manyavar-logo-1727003000000.png"
  }
}
```

---

### 9. Delete Brand Logo
Remove brand logo from storage and clear DB columns.

- **URL:** `DELETE /api/product-master/brands/:id/logo`
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Brand logo deleted successfully",
  "data": {
    "id": 2,
    "logoUrl": null,
    "logoKey": null
  }
}
```

---

### 10. Delete Brand
Deletes a brand if no products in the catalog are linked to it.

- **URL:** `DELETE /api/product-master/brands/:id`
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Brand deleted successfully",
  "data": {
    "id": 2,
    "deleted": true
  }
}
```
