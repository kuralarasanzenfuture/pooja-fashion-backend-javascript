# Product Master: Colors API Documentation

Enterprise API documentation for managing product color masters (e.g., Black, White, Navy Blue, Maroon) in the Pooja Fashion ERP & POS platform.

---

## Base URL
`/api/product-master/colors` (also accessible directly via `/api/colors`)

---

## Endpoints

### 1. List Colors
Retrieve a paginated, filterable, and searchable list of colors for a company.

- **URL:** `GET /api/product-master/colors`
- **Query Parameters:**
  - `page` *(number, optional, default: 1)*: Page number.
  - `limit` *(number, optional, default: 10)*: Number of items per page (max 100).
  - `company_id` *(number, optional)*: Filter by company ID.
  - `is_active` *(boolean, optional)*: Filter by active status (`true` / `false`).
  - `search` *(string, optional)*: Case-insensitive search on color name, color code, hex code, or description.
  - `sortBy` *(string, optional, default: 'display_order')*: Sort column (`id`, `color_code`, `color_name`, `display_order`, `created_at`, `is_active`).
  - `sortOrder` *(string, optional, default: 'asc')*: Sort direction (`asc` / `desc`).
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Colors retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "companyName": "Pooja Fashion Retail Ltd",
      "companyCode": "PF-CORP",
      "colorCode": "BLK",
      "colorName": "Black",
      "hexCode": "#000000",
      "description": "Standard black shade",
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

### 2. Get Color By ID
Retrieve details of a single color by its primary ID.

- **URL:** `GET /api/product-master/colors/:id`
- **Path Parameters:**
  - `id` *(number, required)*: Color primary key ID.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Color retrieved successfully",
  "data": {
    "id": 1,
    "companyId": 1,
    "companyName": "Pooja Fashion Retail Ltd",
    "companyCode": "PF-CORP",
    "colorCode": "BLK",
    "colorName": "Black",
    "hexCode": "#000000",
    "description": "Standard black shade",
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

### 3. Get Color By Code
Retrieve a color using its company ID and color code.

- **URL:** `GET /api/product-master/colors/code/:companyId/:colorCode`
- **Path Parameters:**
  - `companyId` *(number, required)*: Company ID.
  - `colorCode` *(string, required)*: Unique color code (e.g. `BLK`, `WHT`).
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Color retrieved successfully",
  "data": {
    "id": 1,
    "companyId": 1,
    "companyName": "Pooja Fashion Retail Ltd",
    "companyCode": "PF-CORP",
    "colorCode": "BLK",
    "colorName": "Black",
    "hexCode": "#000000",
    "description": "Standard black shade",
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

### 4. Get Company Colors
Retrieve all colors belonging to a company, ordered by display order and name.

- **URL:** `GET /api/product-master/colors/company/:companyId`
- **Query Parameters:**
  - `is_active` *(boolean, optional)*: Filter by active status.
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Company colors retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "colorCode": "BLK",
      "colorName": "Black",
      "hexCode": "#000000",
      "displayOrder": 1,
      "isActive": true
    }
  ]
}
```

---

### 5. Create Color
Create a new color for a company.

- **URL:** `POST /api/product-master/colors`
- **Request Body:**
```json
{
  "company_id": 1,
  "color_code": "BLK",
  "color_name": "Jet Black",
  "hex_code": "#0A0A0A",
  "description": "Deep black shade",
  "display_order": 1,
  "is_active": true
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Color created successfully",
  "data": {
    "id": 2,
    "companyId": 1,
    "companyName": "Pooja Fashion Retail Ltd",
    "companyCode": "PF-CORP",
    "colorCode": "BLK",
    "colorName": "Jet Black",
    "hexCode": "#0A0A0A",
    "description": "Deep black shade",
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

### 6. Update Color
Update color details (name, hex code, description, display order).

- **URL:** `PUT /api/product-master/colors/:id`
- **Request Body:**
```json
{
  "color_name": "Jet Black (Premium)",
  "hex_code": "#000000",
  "display_order": 1
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Color updated successfully",
  "data": {
    "id": 2,
    "companyId": 1,
    "colorCode": "BLK",
    "colorName": "Jet Black (Premium)",
    "hexCode": "#000000",
    "displayOrder": 1,
    "isActive": true
  }
}
```

---

### 7. Update Color Status
Toggle active status (`true` / `false`).

- **URL:** `PATCH /api/product-master/colors/:id/status`
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
  "message": "Color status updated successfully",
  "data": {
    "id": 2,
    "isActive": false
  }
}
```

---

### 8. Delete Color
Delete color by ID. Fails with `400 Bad Request` if variants reference this color.

- **URL:** `DELETE /api/product-master/colors/:id`
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Color deleted successfully",
  "data": {
    "id": 2,
    "deleted": true,
    "message": "Color deleted successfully"
  }
}
```

---

### 9. Seed Default Colors
Seed 10 standard apparel colors (Black, White, Navy Blue, Red, Royal Blue, Maroon, Beige, Olive Green, Grey, Yellow).

- **URL:** `POST /api/product-master/colors/company/:companyId/seed-defaults`
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Default colors seeded successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "colorCode": "BLK",
      "colorName": "Black",
      "hexCode": "#000000",
      "displayOrder": 1,
      "isActive": true
    }
  ]
}
```
