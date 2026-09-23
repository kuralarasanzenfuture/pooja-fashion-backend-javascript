# Product Master: Materials API Documentation

Enterprise API documentation for managing product fabric and material master data (e.g., Cotton, Silk, Linen, Denim) in the Pooja Fashion ERP & POS platform.

---

## Base URL
`/api/product-master/materials` (also accessible directly via `/api/materials`)

---

## Endpoints

### 1. List Materials
Retrieve a paginated, filterable, and searchable list of fabric materials for a company.

- **URL:** `GET /api/product-master/materials`
- **Query Parameters:**
  - `page` *(number, optional, default: 1)*: Page number.
  - `limit` *(number, optional, default: 10)*: Items per page (max 100).
  - `company_id` *(number, optional)*: Filter by company ID.
  - `is_active` *(boolean, optional)*: Filter by active status (`true` / `false`).
  - `search` *(string, optional)*: Case-insensitive search on material name, code, or description.
  - `sortBy` *(string, optional, default: 'material_name')*: Sort column (`id`, `material_code`, `material_name`, `created_at`, `is_active`).
  - `sortOrder` *(string, optional, default: 'asc')*: Sort direction (`asc` / `desc`).
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Materials retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "companyName": "Pooja Fashion Retail Ltd",
      "companyCode": "PF-CORP",
      "materialCode": "COTTON",
      "materialName": "Cotton",
      "description": "100% natural, breathable plant-based cotton fabric",
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

### 2. Get Material By ID
Retrieve details of a single material by its primary ID.

- **URL:** `GET /api/product-master/materials/:id`
- **Path Parameters:**
  - `id` *(number, required)*: Material primary key ID.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Material retrieved successfully",
  "data": {
    "id": 1,
    "companyId": 1,
    "companyName": "Pooja Fashion Retail Ltd",
    "companyCode": "PF-CORP",
    "materialCode": "COTTON",
    "materialName": "Cotton",
    "description": "100% natural, breathable plant-based cotton fabric",
    "isActive": true,
    "createdBy": 1,
    "updatedBy": null,
    "createdAt": "2026-09-22T10:00:00.000Z",
    "updatedAt": "2026-09-22T10:00:00.000Z"
  }
}
```

---

### 3. Get Material By Code
Retrieve a material using company ID and material code.

- **URL:** `GET /api/product-master/materials/code/:companyId/:materialCode`
- **Path Parameters:**
  - `companyId` *(number, required)*: Company ID.
  - `materialCode` *(string, required)*: Unique material code (e.g. `COTTON`, `SILK`).
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Material retrieved successfully",
  "data": {
    "id": 1,
    "companyId": 1,
    "companyName": "Pooja Fashion Retail Ltd",
    "companyCode": "PF-CORP",
    "materialCode": "COTTON",
    "materialName": "Cotton",
    "description": "100% natural, breathable plant-based cotton fabric",
    "isActive": true,
    "createdBy": 1,
    "updatedBy": null,
    "createdAt": "2026-09-22T10:00:00.000Z",
    "updatedAt": "2026-09-22T10:00:00.000Z"
  }
}
```

---

### 4. Get Company Materials
Retrieve all materials for a company, ordered alphabetically by material name.

- **URL:** `GET /api/product-master/materials/company/:companyId`
- **Query Parameters:**
  - `is_active` *(boolean, optional)*: Filter by active status.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Company materials retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "materialCode": "COTTON",
      "materialName": "Cotton",
      "description": "100% natural, breathable cotton",
      "isActive": true
    }
  ]
}
```

---

### 5. Create Material
Create a new material record for a company.

- **URL:** `POST /api/product-master/materials`
- **Request Body:**
```json
{
  "company_id": 1,
  "material_code": "COTTON",
  "material_name": "100% Organic Cotton",
  "description": "Soft breathable natural organic cotton fiber",
  "is_active": true
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Material created successfully",
  "data": {
    "id": 2,
    "companyId": 1,
    "companyName": "Pooja Fashion Retail Ltd",
    "companyCode": "PF-CORP",
    "materialCode": "COTTON",
    "materialName": "100% Organic Cotton",
    "description": "Soft breathable natural organic cotton fiber",
    "isActive": true,
    "createdBy": 1,
    "updatedBy": null,
    "createdAt": "2026-09-22T10:00:00.000Z",
    "updatedAt": "2026-09-22T10:00:00.000Z"
  }
}
```

---

### 6. Update Material
Update material details (name, description, active flag).

- **URL:** `PUT /api/product-master/materials/:id`
- **Request Body:**
```json
{
  "material_name": "100% Combed Cotton",
  "description": "High-grade combed cotton fabric with smooth finish"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Material updated successfully",
  "data": {
    "id": 2,
    "companyId": 1,
    "materialCode": "COTTON",
    "materialName": "100% Combed Cotton",
    "description": "High-grade combed cotton fabric with smooth finish",
    "isActive": true
  }
}
```

---

### 7. Update Material Status
Toggle active status (`true` / `false`).

- **URL:** `PATCH /api/product-master/materials/:id/status`
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
  "message": "Material status updated successfully",
  "data": {
    "id": 2,
    "isActive": false
  }
}
```

---

### 8. Delete Material
Delete material by primary key ID. Fails with `400 Bad Request` if variants reference this material.

- **URL:** `DELETE /api/product-master/materials/:id`
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Material deleted successfully",
  "data": {
    "id": 2,
    "deleted": true,
    "message": "Material deleted successfully"
  }
}
```

---

### 9. Seed Default Materials
Seed 10 standard apparel fabrics (Cotton, Polyester, Silk, Linen, Rayon, Denim, Georgette, Chiffon, Wool, Spandex).

- **URL:** `POST /api/product-master/materials/company/:companyId/seed-defaults`
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Default materials seeded successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "materialCode": "COTTON",
      "materialName": "Cotton",
      "isActive": true
    }
  ]
}
```
