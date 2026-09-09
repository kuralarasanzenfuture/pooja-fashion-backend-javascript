# Company Tax Details API Documentation & Copy-Paste Reference

Interactive Swagger URL (Browser):
👉 **http://localhost:5000/api/docs**

Base URL:
`http://localhost:5000/api`

---

## 1. POST /api/company-tax-details (Create Company Tax Detail)

### URL:

```http
POST http://localhost:5000/api/company-tax-details
Content-Type: application/json
```

### Request Body (Copy & Paste):

```json
{
  "company_id": 1,
  "gstin": "33AABCP1234F1Z5",
  "pan_number": "AABCP1234F",
  "tan_number": "CHEP12345A",
  "gst_registration_type": "regular",
  "gst_state_code": "33",
  "tax_registered_name": "Pooja Fashion Shop Private Limited",
  "is_primary": true,
  "is_active": true
}
```

### Success Response (201 Created):

```json
{
  "success": true,
  "message": "Company tax detail created successfully",
  "data": {
    "id": 1,
    "companyId": 1,
    "gstin": "33AABCP1234F1Z5",
    "panNumber": "AABCP1234F",
    "tanNumber": "CHEP12345A",
    "gstRegistrationType": "regular",
    "gstStateCode": "33",
    "taxRegisteredName": "Pooja Fashion Shop Private Limited",
    "isPrimary": true,
    "isActive": true,
    "createdAt": "2026-09-09T17:25:00.000Z",
    "updatedAt": "2026-09-09T17:25:00.000Z"
  }
}
```

---

## 2. GET /api/company-tax-details (Get Tax Details List with Pagination & Filters)

### URL:

```http
GET http://localhost:5000/api/company-tax-details?page=1&limit=10&company_id=1&gst_registration_type=regular&is_active=true&sortBy=created_at&sortOrder=desc
```

### Success Response (200 OK):

```json
{
  "success": true,
  "message": "Company tax details retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "companyName": "Pooja Fashion Shop",
      "companyCode": "PFS001",
      "gstin": "33AABCP1234F1Z5",
      "panNumber": "AABCP1234F",
      "gstRegistrationType": "regular",
      "gstStateCode": "33",
      "taxRegisteredName": "Pooja Fashion Shop Private Limited",
      "isPrimary": true,
      "isActive": true,
      "createdAt": "2026-09-09T17:25:00.000Z"
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

## 3. GET /api/company-tax-details/:id (Get Tax Detail by ID)

### URL:

```http
GET http://localhost:5000/api/company-tax-details/1
```

---

## 4. GET /api/company-tax-details/company/:companyId (Get All Tax Details for a Company)

### URL:

```http
GET http://localhost:5000/api/company-tax-details/company/1
```

---

## 5. PUT /api/company-tax-details/:id (Update Tax Detail)

### URL:

```http
PUT http://localhost:5000/api/company-tax-details/1
Content-Type: application/json
```

### Request Body (Copy & Paste):

```json
{
  "gst_registration_type": "regular",
  "gstin": "33AABCP1234F2Z8",
  "tax_registered_name": "Pooja Fashion Retail Private Limited"
}
```

---

## 6. PATCH /api/company-tax-details/:id/status (Toggle / Update Tax Detail Status)

### URL:

```http
PATCH http://localhost:5000/api/company-tax-details/1/status
Content-Type: application/json
```

### Request Body (Copy & Paste):

```json
{
  "is_active": false
}
```

---

## 7. PATCH /api/company-tax-details/:id/primary (Set Tax Detail as Primary)

### URL:

```http
PATCH http://localhost:5000/api/company-tax-details/1/primary
```

---

## 8. DELETE /api/company-tax-details/:id (Delete Tax Detail)

### URL:

```http
DELETE http://localhost:5000/api/company-tax-details/1
```
