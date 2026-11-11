# Product Master: Categories API Documentation

Enterprise API documentation for managing product categories in the Pooja Fashion ERP & POS platform.

> [!NOTE]
> **Audit Logging:** All write and state modification operations (`CREATE`, `UPDATE`, `DELETE`, `ACTIVATE`, `DEACTIVATE`, `UPLOAD` image, `REORDER`) automatically generate immutable audit entries in `audit_logs` (100_auditlogs.sql) along with field-level change diffs in `audit_log_changes` (101_audit_log_changes.sql). Inspection is available via `/api/audit-logs`.

> [!IMPORTANT]
> **Token-Based Company Isolation:** Logged-in users have an assigned `company_id` in their `users` record. All endpoints automatically scope results strictly to that user's `company_id`. Tenant users cannot view, query, or mutate categories belonging to another company. Only `SUPERADMIN` or unassigned platform `ADMIN` tokens can query across companies.

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

---

### 11. Check Category Name Already Exists
Checks whether a category name already exists in the given company scope (used for live UI validation during category creation and editing).

- **URL:** `GET /api/product-master/categories/check-name`
- **Query Parameters:**
  - `category_name` *(string, required if `name` is omitted)*: The category name to check.
  - `name` *(string, alternative)*: Synonym for `category_name`.
  - `company_id` *(number, optional)*: Company ID (defaults to authenticated user's company).
  - `exclude_id` *(number, optional)*: Category ID to exclude from duplicate check (used when updating an existing category).
- **Response `200 OK` (Available):**
```json
{
  "success": true,
  "message": "Category name is available",
  "data": {
    "exists": false,
    "categoryName": "Designer Sarees",
    "companyId": 1,
    "message": "Category name is available"
  }
}
```
- **Response `200 OK` (Already Exists):**
```json
{
  "success": true,
  "message": "Category name 'Women's Ethnic Wear' already exists for this company",
  "data": {
    "exists": true,
    "categoryName": "Women's Ethnic Wear",
    "companyId": 1,
    "message": "Category name 'Women's Ethnic Wear' already exists for this company"
  }
}
```

---

### 12. Check Category Code Already Exists
Checks whether a category code already exists in the given company scope.

- **URL:** `GET /api/product-master/categories/check-code`
- **Query Parameters:**
  - `category_code` *(string, required if `code` is omitted)*: The category code to check.
  - `code` *(string, alternative)*: Synonym for `category_code`.
  - `company_id` *(number, optional)*: Company ID (defaults to authenticated user's company).
  - `exclude_id` *(number, optional)*: Category ID to exclude from duplicate check (used when updating).
- **Response `200 OK` (Available):**
```json
{
  "success": true,
  "message": "Category code is available",
  "data": {
    "exists": false,
    "categoryCode": "SAREES",
    "companyId": 1,
    "message": "Category code is available"
  }
}
```
- **Response `200 OK` (Already Exists):**
```json
{
  "success": true,
  "message": "Category code 'WOMENS_ETHNIC' already exists for this company",
  "data": {
    "exists": true,
    "categoryCode": "WOMENS_ETHNIC",
    "companyId": 1,
    "message": "Category code 'WOMENS_ETHNIC' already exists for this company"
  }
}
```

---

### 13. List All Categories (Unpaginated Dropdown)
Retrieve complete, unpaginated category records scoped strictly to the token-authenticated user's company (used for forms, select dropdowns, filters).

- **URL:** `GET /api/product-master/categories/all`
- **Query Parameters:**
  - `company_id` *(number, optional)*: SuperAdmin override only.
  - `is_active` *(boolean, optional)*: Filter by active flag (`true` / `false`).
  - `has_image` *(string/boolean, optional)*: Filter by image presence.
  - `search` *(string, optional)*: Search in category name or code.
  - `sortBy` *(string, optional, default: 'display_order')*: Sort column.
  - `sortOrder` *(string, optional, default: 'asc')*: `asc` or `desc`.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "All categories retrieved successfully",
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
  ]
}
```

---

### 14. Hierarchical Category Tree (with Nested Subcategories)
Retrieve a category tree complete with nested `subcategories` arrays and aggregate `subcategoriesCount`, scoped to the token user's company.

- **URL:** `GET /api/product-master/categories/tree`
- **Query Parameters:**
  - `is_active` *(boolean, optional)*: Filter active status for both categories and subcategories.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Category tree retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "companyName": "Pooja Fashion Retail Ltd",
      "companyCode": "PF-CORP",
      "categoryCode": "WOMENS_ETHNIC",
      "categoryName": "Women's Ethnic Wear",
      "displayOrder": 1,
      "isActive": true,
      "subcategoriesCount": 3,
      "subcategories": [
        {
          "id": 10,
          "companyId": 1,
          "categoryId": 1,
          "subcategoryCode": "SILK_SAREES",
          "subcategoryName": "Silk Sarees",
          "displayOrder": 1,
          "isActive": true
        },
        {
          "id": 11,
          "companyId": 1,
          "categoryId": 1,
          "subcategoryCode": "DESIGNER_KURTIS",
          "subcategoryName": "Designer Kurtis",
          "displayOrder": 2,
          "isActive": true
        }
      ]
    }
  ]
}
```

---

### 15. Category Statistics
Retrieve aggregate count metrics (total, active, inactive, with images, and total subcategories) for the authenticated company.

- **URL:** `GET /api/product-master/categories/stats`
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Category statistics retrieved successfully",
  "data": {
    "totalCategories": 12,
    "activeCategories": 10,
    "inactiveCategories": 2,
    "categoriesWithImages": 8,
    "totalSubcategories": 34
  }
}
```

---

### 16. Get Category Subcategories
Retrieve all subcategories under a specific parent category ID.

- **URL:** `GET /api/product-master/categories/:id/subcategories`
- **Parameters:**
  - `id` *(number, required)*: Category ID.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Category subcategories retrieved successfully",
  "data": [
    {
      "id": 10,
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

### 17. Bulk Reorder Categories
Update display orders for multiple categories in a single request. Audited with action `REORDER`.

- **URL:** `PATCH /api/product-master/categories/reorder`
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
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Categories reordered successfully",
  "data": {
    "success": true,
    "message": "Successfully reordered 3 categories",
    "updatedCount": 3,
    "updatedIds": [1, 2, 3]
  }
}
```

