# Product Master: Sizes API Documentation

Enterprise API documentation for managing product sizes (e.g., XS, S, M, L, XL, 32, 34, UK-8) within Size Groups in the Pooja Fashion ERP & POS platform.

---

## Base URL
`/api/product-master/sizes` (also accessible directly via `/api/sizes`)

---

## Endpoints

### 1. List Sizes
Retrieve a paginated, filterable, and searchable list of sizes.

- **URL:** `GET /api/product-master/sizes`
- **Query Parameters:**
  - `page` *(number, optional, default: 1)*: Page number.
  - `limit` *(number, optional, default: 10)*: Number of items per page (max 100).
  - `company_id` *(number, optional)*: Filter by company ID.
  - `size_group_id` *(number, optional)*: Filter by size group ID.
  - `is_active` *(boolean, optional)*: Filter by active status (`true` / `false`).
  - `search` *(string, optional)*: Case-insensitive search on size name, size code, or size group name.
  - `sortBy` *(string, optional, default: 'display_order')*: Sort column (`id`, `size_code`, `size_name`, `display_order`, `created_at`, `is_active`).
  - `sortOrder` *(string, optional, default: 'asc')*: Sort direction (`asc` / `desc`).
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Sizes retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "companyName": "Pooja Fashion Retail Ltd",
      "companyCode": "PF-CORP",
      "sizeGroupId": 1,
      "sizeGroupName": "Men",
      "sizeGroupCode": "MEN",
      "sizeCode": "M",
      "sizeName": "Medium",
      "displayOrder": 2,
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

### 2. Get Size By ID
Retrieve details of a single size by its primary ID.

- **URL:** `GET /api/product-master/sizes/:id`
- **Path Parameters:**
  - `id` *(number, required)*: Size primary key ID.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Size retrieved successfully",
  "data": {
    "id": 1,
    "companyId": 1,
    "companyName": "Pooja Fashion Retail Ltd",
    "companyCode": "PF-CORP",
    "sizeGroupId": 1,
    "sizeGroupName": "Men",
    "sizeGroupCode": "MEN",
    "sizeCode": "M",
    "sizeName": "Medium",
    "displayOrder": 2,
    "isActive": true,
    "createdBy": 1,
    "updatedBy": null,
    "createdAt": "2026-09-22T10:00:00.000Z",
    "updatedAt": "2026-09-22T10:00:00.000Z"
  }
}
```

---

### 3. Get Size By Code
Retrieve a size using its size group ID and size code.

- **URL:** `GET /api/product-master/sizes/code/:sizeGroupId/:sizeCode`
- **Path Parameters:**
  - `sizeGroupId` *(number, required)*: Size Group ID.
  - `sizeCode` *(string, required)*: Unique size code within the group (e.g. `M`, `XL`).
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Size retrieved successfully",
  "data": {
    "id": 1,
    "companyId": 1,
    "companyName": "Pooja Fashion Retail Ltd",
    "companyCode": "PF-CORP",
    "sizeGroupId": 1,
    "sizeGroupName": "Men",
    "sizeGroupCode": "MEN",
    "sizeCode": "M",
    "sizeName": "Medium",
    "displayOrder": 2,
    "isActive": true,
    "createdBy": 1,
    "updatedBy": null,
    "createdAt": "2026-09-22T10:00:00.000Z",
    "updatedAt": "2026-09-22T10:00:00.000Z"
  }
}
```

---

### 4. Get Company Sizes
Retrieve all sizes belonging to a company, ordered by size group and display order.

- **URL:** `GET /api/product-master/sizes/company/:companyId`
- **Query Parameters:**
  - `is_active` *(boolean, optional)*: Filter by active status.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Company sizes retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "companyName": "Pooja Fashion Retail Ltd",
      "companyCode": "PF-CORP",
      "sizeGroupId": 1,
      "sizeGroupName": "Men",
      "sizeGroupCode": "MEN",
      "sizeCode": "S",
      "sizeName": "Small",
      "displayOrder": 1,
      "isActive": true
    }
  ]
}
```

---

### 5. Get Size Group Sizes
Retrieve all sizes configured for a specific size group.

- **URL:** `GET /api/product-master/sizes/size-group/:sizeGroupId`
- **Query Parameters:**
  - `is_active` *(boolean, optional)*: Filter by active status.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Size group sizes retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "companyName": "Pooja Fashion Retail Ltd",
      "companyCode": "PF-CORP",
      "sizeGroupId": 1,
      "sizeGroupName": "Men",
      "sizeGroupCode": "MEN",
      "sizeCode": "S",
      "sizeName": "Small",
      "displayOrder": 1,
      "isActive": true
    }
  ]
}
```

---

### 6. Create Size
Create a new size under a size group.

- **URL:** `POST /api/product-master/sizes`
- **Request Body:**
```json
{
  "company_id": 1,
  "size_group_id": 1,
  "size_code": "M",
  "size_name": "Medium",
  "display_order": 2,
  "is_active": true
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Size created successfully",
  "data": {
    "id": 2,
    "companyId": 1,
    "companyName": "Pooja Fashion Retail Ltd",
    "companyCode": "PF-CORP",
    "sizeGroupId": 1,
    "sizeGroupName": "Men",
    "sizeGroupCode": "MEN",
    "sizeCode": "M",
    "sizeName": "Medium",
    "displayOrder": 2,
    "isActive": true,
    "createdBy": 1,
    "updatedBy": null,
    "createdAt": "2026-09-22T10:00:00.000Z",
    "updatedAt": "2026-09-22T10:00:00.000Z"
  }
}
```

---

### 7. Update Size
Update size properties (name, code, display order, active flag).

- **URL:** `PUT /api/product-master/sizes/:id`
- **Request Body:**
```json
{
  "size_name": "Medium (Regular)",
  "display_order": 2
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Size updated successfully",
  "data": {
    "id": 2,
    "companyId": 1,
    "companyName": "Pooja Fashion Retail Ltd",
    "companyCode": "PF-CORP",
    "sizeGroupId": 1,
    "sizeGroupName": "Men",
    "sizeGroupCode": "MEN",
    "sizeCode": "M",
    "sizeName": "Medium (Regular)",
    "displayOrder": 2,
    "isActive": true
  }
}
```

---

### 8. Update Size Status
Toggle active status (`true` / `false`).

- **URL:** `PATCH /api/product-master/sizes/:id/status`
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
  "message": "Size status updated successfully",
  "data": {
    "id": 2,
    "isActive": false
  }
}
```

---

### 9. Delete Size
Delete size by primary ID. Fails with `400 Bad Request` if variants reference this size.

- **URL:** `DELETE /api/product-master/sizes/:id`
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Size deleted successfully",
  "data": {
    "id": 2,
    "deleted": true,
    "message": "Size deleted successfully"
  }
}
```
