# Company Contacts API Documentation & Copy-Paste Reference

Interactive Swagger URL (Browser):
👉 **http://localhost:5000/api/docs**

Base URL:
`http://localhost:5000/api`

---

## 1. POST /api/company-contacts (Create Company Contact)

### URL:

```http
POST http://localhost:5000/api/company-contacts
Content-Type: application/json
```

### Request Body (Copy & Paste):

```json
{
  "company_id": 1,
  "contact_type": "manager",
  "contact_name": "Rajesh Kumar",
  "designation": "General Manager",
  "email": "rajesh.kumar@poojafashion.com",
  "phone": "04344-245678",
  "mobile": "+919876543210",
  "is_primary": true,
  "is_active": true
}
```

### Success Response (201 Created):

```json
{
  "success": true,
  "message": "Company contact created successfully",
  "data": {
    "id": 1,
    "companyId": 1,
    "contactType": "manager",
    "contactName": "Rajesh Kumar",
    "designation": "General Manager",
    "email": "rajesh.kumar@poojafashion.com",
    "phone": "04344-245678",
    "mobile": "+919876543210",
    "isPrimary": true,
    "isActive": true,
    "createdAt": "2026-09-09T17:15:00.000Z",
    "updatedAt": "2026-09-09T17:15:00.000Z"
  }
}
```

---

## 2. GET /api/company-contacts (Get Contacts List with Pagination & Filters)

### URL:

```http
GET http://localhost:5000/api/company-contacts?page=1&limit=10&company_id=1&contact_type=manager&is_active=true&sortBy=created_at&sortOrder=desc
```

### Success Response (200 OK):

```json
{
  "success": true,
  "message": "Company contacts retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "companyName": "Pooja Fashion Shop",
      "companyCode": "PFS001",
      "contactType": "manager",
      "contactName": "Rajesh Kumar",
      "designation": "General Manager",
      "email": "rajesh.kumar@poojafashion.com",
      "mobile": "+919876543210",
      "isPrimary": true,
      "isActive": true,
      "createdAt": "2026-09-09T17:15:00.000Z"
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

## 3. GET /api/company-contacts/:id (Get Contact by ID)

### URL:

```http
GET http://localhost:5000/api/company-contacts/1
```

---

## 4. GET /api/company-contacts/company/:companyId (Get All Contacts for a Company)

### URL:

```http
GET http://localhost:5000/api/company-contacts/company/1
```

---

## 5. PUT /api/company-contacts/:id (Update Contact)

### URL:

```http
PUT http://localhost:5000/api/company-contacts/1
Content-Type: application/json
```

### Request Body (Copy & Paste):

```json
{
  "contact_name": "Rajesh K.",
  "designation": "Senior General Manager",
  "email": "rajesh.k@poojafashion.com",
  "mobile": "+919876543211"
}
```

---

## 6. PATCH /api/company-contacts/:id/status (Toggle / Update Contact Status)

### URL:

```http
PATCH http://localhost:5000/api/company-contacts/1/status
Content-Type: application/json
```

### Request Body (Copy & Paste):

```json
{
  "is_active": false
}
```

---

## 7. PATCH /api/company-contacts/:id/primary (Set Contact as Primary)

### URL:

```http
PATCH http://localhost:5000/api/company-contacts/1/primary
```

---

## 8. DELETE /api/company-contacts/:id (Delete Contact)

### URL:

```http
DELETE http://localhost:5000/api/company-contacts/1
```
