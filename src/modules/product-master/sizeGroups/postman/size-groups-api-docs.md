# Product Master: Size Groups API Documentation

Enterprise API documentation for managing product size groups (e.g. Men, Women, Kids, Footwear) in the Pooja Fashion ERP & POS platform.

---

## Base URL
`/api/product-master/size-groups` (also accessible via `/api/size-groups`)

---

## Endpoints

### 1. List Size Groups
Retrieve a paginated, filterable, and searchable list of size groups.

- **URL:** `GET /api/product-master/size-groups`
- **Query Parameters:**
  - `page` *(number, optional, default: 1)*: Page number.
  - `limit` *(number, optional, default: 10)*: Number of items per page.
  - `company_id` *(number, optional)*: Filter by company ID.
  - `is_active` *(boolean, optional)*: Filter by active status (`true` / `false`).
  - `search` *(string, optional)*: Search in size group name, code, or description.
  - `sortBy` *(string, optional, default: 'size_group_name')*: Sort column (`id`, `size_group_code`, `size_group_name`, `created_at`, `is_active`).
  - `sortOrder` *(string, optional, default: 'asc')*: Sort direction (`asc` / `desc`).
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Size groups retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "companyName": "Pooja Fashion Retail Ltd",
      "companyCode": "PF-CORP",
      "sizeGroupCode": "MEN",
      "sizeGroupName": "Men",
      "description": "Standard menswear apparel sizing",
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

### 2. Get Size Group By ID
Retrieve details of a single size group by primary ID.

- **URL:** `GET /api/product-master/size-groups/:id`
- **Parameters:**
  - `id` *(number, required)*: Size group primary ID.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Size group retrieved successfully",
  "data": {
    "id": 1,
    "companyId": 1,
    "companyName": "Pooja Fashion Retail Ltd",
    "companyCode": "PF-CORP",
    "sizeGroupCode": "MEN",
    "sizeGroupName": "Men",
    "description": "Standard menswear apparel sizing",
    "isActive": true,
    "createdBy": 1,
    "updatedBy": null,
    "createdAt": "2026-09-22T10:00:00.000Z",
    "updatedAt": "2026-09-22T10:00:00.000Z"
  }
}
```

---

### 3. Get Size Group By Code
Retrieve a size group by company ID and size group code.

- **URL:** `GET /api/product-master/size-groups/code/:companyId/:sizeGroupCode`
- **Parameters:**
  - `companyId` *(number, required)*: Company ID.
  - `sizeGroupCode` *(string, required)*: Size group code.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Size group retrieved successfully",
  "data": {
    "id": 1,
    "companyId": 1,
    "sizeGroupCode": "MEN",
    "sizeGroupName": "Men",
    "isActive": true
  }
}
```

---

### 4. Get Company Size Groups
Retrieve all size groups for a company.

- **URL:** `GET /api/product-master/size-groups/company/:companyId`
- **Query Parameters:**
  - `is_active` *(boolean, optional)*: Filter by active status.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Company size groups retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "sizeGroupCode": "MEN",
      "sizeGroupName": "Men",
      "isActive": true
    }
  ]
}
```

---

### 5. Create Size Group
Create a new size group.

- **URL:** `POST /api/product-master/size-groups`
- **Request Body (JSON):**
```json
{
  "company_id": 1,
  "size_group_code": "WOMEN",
  "size_group_name": "Women",
  "description": "Womenswear apparel sizing (XS, S, M, L, XL)",
  "is_active": true
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Size group created successfully",
  "data": {
    "id": 2,
    "companyId": 1,
    "sizeGroupCode": "WOMEN",
    "sizeGroupName": "Women",
    "description": "Womenswear apparel sizing (XS, S, M, L, XL)",
    "isActive": true,
    "createdBy": 1,
    "updatedBy": null,
    "createdAt": "2026-09-22T10:15:00.000Z",
    "updatedAt": "2026-09-22T10:15:00.000Z"
  }
}
```

---

### 6. Update Size Group
Update existing size group details.

- **URL:** `PUT /api/product-master/size-groups/:id`
- **Request Body (JSON):**
```json
{
  "size_group_name": "Women's Western & Ethnic",
  "description": "Updated size group description"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Size group updated successfully",
  "data": {
    "id": 2,
    "companyId": 1,
    "sizeGroupCode": "WOMEN",
    "sizeGroupName": "Women's Western & Ethnic",
    "isActive": true
  }
}
```

---

### 7. Update Size Group Status
Toggle or set active status (`is_active`).

- **URL:** `PATCH /api/product-master/size-groups/:id/status`
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
  "message": "Size group status updated successfully",
  "data": {
    "id": 2,
    "isActive": false
  }
}
```

---

### 8. Delete Size Group
Delete size group (checks for child sizes).

- **URL:** `DELETE /api/product-master/size-groups/:id`
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Size group deleted successfully",
  "data": {
    "id": 2,
    "deleted": true
  }
}
```

---

### 9. Seed Default Size Groups
Seed standard default size groups (`Men`, `Women`, `Kids`, `Infants`, `Footwear`) for a company.

- **URL:** `POST /api/product-master/size-groups/company/:companyId/seed-defaults`
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Default size groups seeded successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "sizeGroupCode": "MEN",
      "sizeGroupName": "Men"
    },
    {
      "id": 2,
      "companyId": 1,
      "sizeGroupCode": "WOMEN",
      "sizeGroupName": "Women"
    }
  ]
}
```
