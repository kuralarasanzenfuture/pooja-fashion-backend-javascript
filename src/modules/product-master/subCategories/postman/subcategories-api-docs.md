# Product Master: Subcategories API Documentation

Enterprise API documentation for managing product subcategories within categories and companies in the Pooja Fashion ERP & POS platform.

---

## Base URL
`/api/product-master/subcategories` (also available via `/api/product-master/sub-categories`)

---

## Endpoints

### 1. List Subcategories
Retrieve a paginated, filterable, and searchable list of subcategories.

- **URL:** `GET /api/product-master/subcategories`
- **Query Parameters:**
  - `page` *(number, optional, default: 1)*: Page number.
  - `limit` *(number, optional, default: 10)*: Number of items per page.
  - `company_id` *(number, optional)*: Filter by company ID.
  - `category_id` *(number, optional)*: Filter by parent category ID.
  - `is_active` *(boolean, optional)*: Filter by active flag (`true` / `false`).
  - `search` *(string, optional)*: Search in subcategory name, code, description, or parent category name.
  - `sortBy` *(string, optional, default: 'display_order')*: Sort column (`id`, `subcategory_code`, `subcategory_name`, `display_order`, `created_at`, `is_active`).
  - `sortOrder` *(string, optional, default: 'asc')*: Sort direction (`asc` / `desc`).
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Subcategories retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "companyName": "Pooja Fashion Retail Ltd",
      "companyCode": "PF-CORP",
      "categoryId": 1,
      "categoryName": "Women's Ethnic Wear",
      "categoryCode": "WOMENS_ETHNIC",
      "subcategoryCode": "SILK_SAREES",
      "subcategoryName": "Silk Sarees",
      "description": "Pure Kanchipuram, Banarasi, and raw silk sarees",
      "imageUrl": "/uploads/subcategories/silk-sarees/silk-sarees-image-1727000000000.png",
      "imageKey": "subcategories/silk-sarees/silk-sarees-image-1727000000000.png",
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

### 2. Get Subcategory By ID
Retrieve details of a single subcategory by primary ID.

- **URL:** `GET /api/product-master/subcategories/:id`
- **Parameters:**
  - `id` *(number, required)*: Subcategory primary ID.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Subcategory retrieved successfully",
  "data": {
    "id": 1,
    "companyId": 1,
    "companyName": "Pooja Fashion Retail Ltd",
    "companyCode": "PF-CORP",
    "categoryId": 1,
    "categoryName": "Women's Ethnic Wear",
    "categoryCode": "WOMENS_ETHNIC",
    "subcategoryCode": "SILK_SAREES",
    "subcategoryName": "Silk Sarees",
    "description": "Pure Kanchipuram, Banarasi, and raw silk sarees",
    "imageUrl": "/uploads/subcategories/silk-sarees/silk-sarees-image-1727000000000.png",
    "imageKey": "subcategories/silk-sarees/silk-sarees-image-1727000000000.png",
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

### 3. Get Subcategory By Code
Retrieve a subcategory by company ID and subcategory code.

- **URL:** `GET /api/product-master/subcategories/code/:companyId/:subcategoryCode`
- **Parameters:**
  - `companyId` *(number, required)*: Company ID.
  - `subcategoryCode` *(string, required)*: Business subcategory code.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Subcategory retrieved successfully",
  "data": {
    "id": 1,
    "companyId": 1,
    "categoryId": 1,
    "subcategoryCode": "SILK_SAREES",
    "subcategoryName": "Silk Sarees",
    "displayOrder": 1,
    "isActive": true
  }
}
```

---

### 4. Get Subcategories By Category
Retrieve all subcategories attached to a specific category.

- **URL:** `GET /api/product-master/subcategories/category/:categoryId`
- **Query Parameters:**
  - `is_active` *(boolean, optional)*: Filter by active flag.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Category subcategories retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "categoryId": 1,
      "subcategoryCode": "SILK_SAREES",
      "subcategoryName": "Silk Sarees",
      "displayOrder": 1,
      "isActive": true
    }
  ]
}
```

---

### 5. Get Subcategories By Company
Retrieve all subcategories belonging to a company.

- **URL:** `GET /api/product-master/subcategories/company/:companyId`
- **Query Parameters:**
  - `is_active` *(boolean, optional)*: Filter by active flag.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Company subcategories retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "categoryId": 1,
      "subcategoryCode": "SILK_SAREES",
      "subcategoryName": "Silk Sarees",
      "displayOrder": 1,
      "isActive": true
    }
  ]
}
```

---

### 6. Create Subcategory
Create a new subcategory. Supports JSON or multipart/form-data with image upload (`image`).

- **URL:** `POST /api/product-master/subcategories`
- **Request Body (JSON):**
```json
{
  "company_id": 1,
  "category_id": 1,
  "subcategory_code": "COTTON_SAREES",
  "subcategory_name": "Cotton Sarees",
  "description": "Daily wear handloom cotton sarees",
  "display_order": 2,
  "is_active": true
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Subcategory created successfully",
  "data": {
    "id": 2,
    "companyId": 1,
    "categoryId": 1,
    "subcategoryCode": "COTTON_SAREES",
    "subcategoryName": "Cotton Sarees",
    "description": "Daily wear handloom cotton sarees",
    "imageUrl": null,
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

### 7. Update Subcategory
Update subcategory details or replace its image.

- **URL:** `PUT /api/product-master/subcategories/:id`
- **Request Body (JSON):**
```json
{
  "subcategory_name": "Premium Cotton Sarees",
  "description": "Organic and hand-spun premium cotton sarees",
  "display_order": 1
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Subcategory updated successfully",
  "data": {
    "id": 2,
    "companyId": 1,
    "categoryId": 1,
    "subcategoryCode": "COTTON_SAREES",
    "subcategoryName": "Premium Cotton Sarees",
    "displayOrder": 1,
    "isActive": true
  }
}
```

---

### 8. Update Subcategory Status
Toggle active status (`is_active`).

- **URL:** `PATCH /api/product-master/subcategories/:id/status`
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
  "message": "Subcategory status updated successfully",
  "data": {
    "id": 2,
    "isActive": false
  }
}
```

---

### 9. Upload Subcategory Image
Dedicated endpoint to upload/replace subcategory banner or thumbnail image.

- **URL:** `POST /api/product-master/subcategories/:id/image`
- **Headers:** `Content-Type: multipart/form-data`
- **Form Data:**
  - `image`: *(file binary, jpg/png/webp)*
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Subcategory image uploaded successfully",
  "data": {
    "id": 2,
    "imageUrl": "/uploads/subcategories/premium-cotton-sarees/premium-cotton-sarees-image-1727002000000.png",
    "imageKey": "subcategories/premium-cotton-sarees/premium-cotton-sarees-image-1727002000000.png"
  }
}
```

---

### 10. Delete Subcategory Image
Remove subcategory image from disk and clear DB fields.

- **URL:** `DELETE /api/product-master/subcategories/:id/image`
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Subcategory image deleted successfully",
  "data": {
    "id": 2,
    "imageUrl": null,
    "imageKey": null
  }
}
```

---

### 11. Delete Subcategory
Deletes subcategory if no child products are attached.

- **URL:** `DELETE /api/product-master/subcategories/:id`
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Subcategory deleted successfully",
  "data": {
    "id": 2,
    "deleted": true
  }
}
```
