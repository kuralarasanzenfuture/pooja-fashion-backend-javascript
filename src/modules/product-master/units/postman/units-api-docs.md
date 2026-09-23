# Product Master: Units API Documentation

Enterprise API documentation for managing Units of Measure (UOM) (e.g., Pieces, Pairs, Sets, Meters, Kilograms) in the Pooja Fashion ERP & POS platform.

---

## Base URL
`/api/product-master/units` (also accessible directly via `/api/units`)

---

## Endpoints

### 1. List Units
Retrieve a paginated, filterable, and searchable list of units of measure for a company.

- **URL:** `GET /api/product-master/units`
- **Query Parameters:**
  - `page` *(number, optional, default: 1)*: Page number.
  - `limit` *(number, optional, default: 10)*: Items per page (max 100).
  - `company_id` *(number, optional)*: Filter by company ID.
  - `is_active` *(boolean, optional)*: Filter by active status (`true` / `false`).
  - `search` *(string, optional)*: Case-insensitive search on unit name or unit code.
  - `sortBy` *(string, optional, default: 'unit_name')*: Sort column (`id`, `unit_code`, `unit_name`, `decimal_places`, `created_at`, `is_active`).
  - `sortOrder` *(string, optional, default: 'asc')*: Sort direction (`asc` / `desc`).
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Units retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "companyName": "Pooja Fashion Retail Ltd",
      "companyCode": "PF-CORP",
      "unitCode": "PCS",
      "unitName": "Pieces",
      "decimalPlaces": 0,
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

### 2. Get Unit By ID
Retrieve details of a single unit by its primary ID.

- **URL:** `GET /api/product-master/units/:id`
- **Path Parameters:**
  - `id` *(number, required)*: Unit primary key ID.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Unit retrieved successfully",
  "data": {
    "id": 1,
    "companyId": 1,
    "companyName": "Pooja Fashion Retail Ltd",
    "companyCode": "PF-CORP",
    "unitCode": "PCS",
    "unitName": "Pieces",
    "decimalPlaces": 0,
    "isActive": true,
    "createdBy": 1,
    "updatedBy": null,
    "createdAt": "2026-09-22T10:00:00.000Z",
    "updatedAt": "2026-09-22T10:00:00.000Z"
  }
}
```

---

### 3. Get Unit By Code
Retrieve a unit using company ID and unit code.

- **URL:** `GET /api/product-master/units/code/:companyId/:unitCode`
- **Path Parameters:**
  - `companyId` *(number, required)*: Company ID.
  - `unitCode` *(string, required)*: Unique unit code (e.g. `PCS`, `MTR`).
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Unit retrieved successfully",
  "data": {
    "id": 1,
    "companyId": 1,
    "companyName": "Pooja Fashion Retail Ltd",
    "companyCode": "PF-CORP",
    "unitCode": "PCS",
    "unitName": "Pieces",
    "decimalPlaces": 0,
    "isActive": true,
    "createdBy": 1,
    "updatedBy": null,
    "createdAt": "2026-09-22T10:00:00.000Z",
    "updatedAt": "2026-09-22T10:00:00.000Z"
  }
}
```

---

### 4. Get Company Units
Retrieve all units for a company, ordered alphabetically by unit name.

- **URL:** `GET /api/product-master/units/company/:companyId`
- **Query Parameters:**
  - `is_active` *(boolean, optional)*: Filter by active status.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Company units retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "unitCode": "PCS",
      "unitName": "Pieces",
      "decimalPlaces": 0,
      "isActive": true
    }
  ]
}
```

---

### 5. Create Unit
Create a new unit of measure record for a company.

- **URL:** `POST /api/product-master/units`
- **Request Body:**
```json
{
  "company_id": 1,
  "unit_code": "PCS",
  "unit_name": "Pieces",
  "decimal_places": 0,
  "is_active": true
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Unit created successfully",
  "data": {
    "id": 2,
    "companyId": 1,
    "companyName": "Pooja Fashion Retail Ltd",
    "companyCode": "PF-CORP",
    "unitCode": "PCS",
    "unitName": "Pieces",
    "decimalPlaces": 0,
    "isActive": true,
    "createdBy": 1,
    "updatedBy": null,
    "createdAt": "2026-09-22T10:00:00.000Z",
    "updatedAt": "2026-09-22T10:00:00.000Z"
  }
}
```

---

### 6. Update Unit
Update unit details (name, decimal precision, active flag).

- **URL:** `PUT /api/product-master/units/:id`
- **Request Body:**
```json
{
  "unit_name": "Pieces (Units)",
  "decimal_places": 0
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Unit updated successfully",
  "data": {
    "id": 2,
    "companyId": 1,
    "unitCode": "PCS",
    "unitName": "Pieces (Units)",
    "decimalPlaces": 0,
    "isActive": true
  }
}
```

---

### 7. Update Unit Status
Toggle active status (`true` / `false`).

- **URL:** `PATCH /api/product-master/units/:id/status`
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
  "message": "Unit status updated successfully",
  "data": {
    "id": 2,
    "isActive": false
  }
}
```

---

### 8. Delete Unit
Delete unit by primary key ID. Fails with `400 Bad Request` if products or variants reference this unit.

- **URL:** `DELETE /api/product-master/units/:id`
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Unit deleted successfully",
  "data": {
    "id": 2,
    "deleted": true,
    "message": "Unit deleted successfully"
  }
}
```

---

### 9. Seed Default Units
Seed 8 standard apparel units of measure (PCS, PAIR, SET, METER, KG, BOX, DOZEN, ROLL).

- **URL:** `POST /api/product-master/units/company/:companyId/seed-defaults`
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Default units seeded successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "unitCode": "PCS",
      "unitName": "Pieces",
      "decimalPlaces": 0,
      "isActive": true
    }
  ]
}
```
