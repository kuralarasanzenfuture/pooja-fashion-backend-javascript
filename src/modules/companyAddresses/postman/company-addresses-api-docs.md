# Company Addresses API Documentation & Copy-Paste Reference

Interactive Swagger URL (Browser):
👉 **http://localhost:5000/api/docs**

Base URL:
`http://localhost:5000/api`

---

## 1. POST /api/company-addresses (Create Company Address)

### URL:

```http
POST http://localhost:5000/api/company-addresses
Content-Type: application/json
```

### Request Body (Copy & Paste):

```json
{
  "company_id": 1,
  "address_type": "registered",
  "address_line_1": "123 Textile Market Road",
  "address_line_2": "Suite 400, 4th Floor",
  "city": "Hosur",
  "district": "Krishnagiri",
  "state": "Tamil Nadu",
  "postal_code": "635109",
  "country": "India",
  "landmark": "Near Old Bus Stand",
  "is_primary": true,
  "is_active": true
}
```

### Success Response (201 Created):

```json
{
  "success": true,
  "message": "Company address created successfully",
  "data": {
    "id": 1,
    "companyId": 1,
    "addressType": "registered",
    "addressLine1": "123 Textile Market Road",
    "addressLine2": "Suite 400, 4th Floor",
    "city": "Hosur",
    "district": "Krishnagiri",
    "state": "Tamil Nadu",
    "postalCode": "635109",
    "country": "India",
    "landmark": "Near Old Bus Stand",
    "isPrimary": true,
    "isActive": true,
    "createdAt": "2026-09-09T17:00:00.000Z",
    "updatedAt": "2026-09-09T17:00:00.000Z"
  }
}
```

---

## 2. GET /api/company-addresses (Get Addresses List with Pagination & Filters)

### URL:

```http
GET http://localhost:5000/api/company-addresses?page=1&limit=10&company_id=1&address_type=registered&is_active=true&sortBy=created_at&sortOrder=desc
```

### Success Response (200 OK):

```json
{
  "success": true,
  "message": "Company addresses retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "companyName": "Pooja Fashion Shop",
      "companyCode": "PFS001",
      "addressType": "registered",
      "addressLine1": "123 Textile Market Road",
      "city": "Hosur",
      "state": "Tamil Nadu",
      "postalCode": "635109",
      "country": "India",
      "isPrimary": true,
      "isActive": true,
      "createdAt": "2026-09-09T17:00:00.000Z"
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

## 3. GET /api/company-addresses/:id (Get Address by ID)

### URL:

```http
GET http://localhost:5000/api/company-addresses/1
```

---

## 4. GET /api/company-addresses/company/:companyId (Get All Addresses for a Company)

### URL:

```http
GET http://localhost:5000/api/company-addresses/company/1
```

---

## 5. PUT /api/company-addresses/:id (Update Address)

### URL:

```http
PUT http://localhost:5000/api/company-addresses/1
Content-Type: application/json
```

### Request Body (Copy & Paste):

```json
{
  "address_type": "head_office",
  "address_line_1": "456 Commercial Street",
  "address_line_2": "Opposite City Centre",
  "city": "Hosur",
  "district": "Krishnagiri",
  "state": "Tamil Nadu",
  "postal_code": "635109",
  "landmark": "Near Clock Tower"
}
```

---

## 6. PATCH /api/company-addresses/:id/status (Toggle / Update Address Status)

### URL:

```http
PATCH http://localhost:5000/api/company-addresses/1/status
Content-Type: application/json
```

### Request Body (Copy & Paste):

```json
{
  "is_active": false
}
```

---

## 7. PATCH /api/company-addresses/:id/primary (Set Address as Primary)

### URL:

```http
PATCH http://localhost:5000/api/company-addresses/1/primary
```

---

## 8. DELETE /api/company-addresses/:id (Delete Address)

### URL:

```http
DELETE http://localhost:5000/api/company-addresses/1
```
