# Product Master: Categories API Documentation

Enterprise API documentation for managing product categories in the Pooja Fashion ERP & POS platform.

---

## Base URL
`/api/product-master/categories`

---

## Endpoints

### 1. List Categories
Retrieve a paginated, filterable, and searchable list of product categories.

- **URL:** `GET /api/product-master/categories`
- **Query Parameters:**
  - `page` *(number, optional, default: 1)*: Page number.
  - `limit` *(number, optional, default: 10)*: Number of items per page.
  - `company_id` *(number, optional)*: Filter by company ID.
  - `is_active` *(boolean, optional)*: Filter by active status (`true` / `false`).
  - `search` *(string, optional)*: Search in category name, code, or description.
  - `sortBy` *(string, optional, default: 'display_order')*: Sort column (`id`, `category_code`, `category_name`, `display_order`, `created_at`, `is_active`).
  - `sortOrder` *(string, optional, default: 'asc')*: Sort direction (`asc` / `desc`).
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "companyName": "Pooja Fashion Retail Ltd",
      "companyCode": "PF-CORP",
      "categoryCode": "WOMENS_ETHNIC",
      "categoryName": "Women's Ethnic Wear",
      "description": "Traditional sarees, kurtis, lehengas, and ethnic sets",
      "imageUrl": "/uploads/categories/womens-ethnic-wear/womens-ethnic-wear-image-1727000000000.png",
      "imageKey": "categories/womens-ethnic-wear/womens-ethnic-wear-image-1727000000000.png",
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

### 2. Get Category By ID
Retrieve details of a single category by primary ID.

- **URL:** `GET /api/product-master/categories/:id`
- **Parameters:**
  - `id` *(number, required)*: Category primary ID.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "id": 1,
    "companyId": 1,
    "companyName": "Pooja Fashion Retail Ltd",
    "companyCode": "PF-CORP",
    "categoryCode": "WOMENS_ETHNIC",
    "categoryName": "Women's Ethnic Wear",
    "description": "Traditional sarees, kurtis, lehengas, and ethnic sets",
    "imageUrl": "/uploads/categories/womens-ethnic-wear/womens-ethnic-wear-image-1727000000000.png",
    "imageKey": "categories/womens-ethnic-wear/womens-ethnic-wear-image-1727000000000.png",
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

### 3. Get Category By Code
Retrieve a category by company ID and category code.

- **URL:** `GET /api/product-master/categories/code/:companyId/:categoryCode`
- **Parameters:**
  - `companyId` *(number, required)*: Company ID.
  - `categoryCode` *(string, required)*: Business category code.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "id": 1,
    "companyId": 1,
    "categoryCode": "WOMENS_ETHNIC",
    "categoryName": "Women's Ethnic Wear",
    "description": "Traditional sarees, kurtis, lehengas, and ethnic sets",
    "imageUrl": null,
    "displayOrder": 1,
    "isActive": true
  }
}
```

---

### 4. Get Company Categories
Retrieve all active categories belonging to a company (ordered by display order for catalogs and dropdowns).

- **URL:** `GET /api/product-master/categories/company/:companyId`
- **Query Parameters:**
  - `is_active` *(boolean, optional)*: Filter by active flag.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Company categories retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "categoryCode": "WOMENS_ETHNIC",
      "categoryName": "Women's Ethnic Wear",
      "displayOrder": 1,
      "isActive": true
    }
  ]
}
```

---

### 5. Create Category
Create a new product category. Supports JSON body or `multipart/form-data` with an image file (`image`).

- **URL:** `POST /api/product-master/categories`
- **Headers:** `Content-Type: application/json` or `multipart/form-data`
- **Request Body (JSON):**
```json
{
  "company_id": 1,
  "category_code": "MENS_FORMAL",
  "category_name": "Men's Formal Wear",
  "description": "Shirts, trousers, blazers, and formal suits",
  "display_order": 2,
  "is_active": true
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": 2,
    "companyId": 1,
    "categoryCode": "MENS_FORMAL",
    "categoryName": "Men's Formal Wear",
    "description": "Shirts, trousers, blazers, and formal suits",
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

### 6. Update Category
Update category fields or replace its image.

- **URL:** `PUT /api/product-master/categories/:id`
- **Request Body (JSON):**
```json
{
  "category_name": "Men's Premium Formal Wear",
  "description": "Updated luxury formal suits and shirts",
  "display_order": 1
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": {
    "id": 2,
    "companyId": 1,
    "categoryCode": "MENS_FORMAL",
    "categoryName": "Men's Premium Formal Wear",
    "description": "Updated luxury formal suits and shirts",
    "displayOrder": 1,
    "isActive": true
  }
}
```

---

### 7. Update Category Status
Toggle or set the active status of a category.

- **URL:** `PATCH /api/product-master/categories/:id/status`
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
  "message": "Category status updated successfully",
  "data": {
    "id": 2,
    "isActive": false
  }
}
```

---

### 8. Upload Category Image
Dedicated endpoint for uploading or replacing a category's banner image.

- **URL:** `POST /api/product-master/categories/:id/image`
- **Headers:** `Content-Type: multipart/form-data`
- **Form Data:**
  - `image`: *(file binary, jpg/png/webp)*
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Category image uploaded successfully",
  "data": {
    "id": 2,
    "imageUrl": "/uploads/categories/mens-premium-formal-wear/mens-premium-formal-wear-image-1727001000000.png",
    "imageKey": "categories/mens-premium-formal-wear/mens-premium-formal-wear-image-1727001000000.png"
  }
}
```

---

### 9. Delete Category Image
Removes category image from storage and clears database fields.

- **URL:** `DELETE /api/product-master/categories/:id/image`
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Category image deleted successfully",
  "data": {
    "id": 2,
    "imageUrl": null,
    "imageKey": null
  }
}
```

---

### 10. Delete Category
Deletes a category if no child subcategories or products are linked to it.

- **URL:** `DELETE /api/product-master/categories/:id`
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Category deleted successfully",
  "data": {
    "id": 2,
    "deleted": true
  }
}
```
