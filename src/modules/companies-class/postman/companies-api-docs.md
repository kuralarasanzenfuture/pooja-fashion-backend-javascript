# Companies API Documentation & Copy-Paste Reference

Interactive Swagger URL (Browser):
👉 **http://localhost:5000/api/docs**

Base URL:
`http://localhost:5000/api`

---

## 1. POST /api/companies (Create Company)

### URL:

```http
POST http://localhost:5000/api/companies
Content-Type: application/json
```

### Request Body (Copy & Paste):

```json
{
  "company_code": "PFS001",
  "company_name": "Pooja Fashion Shop",
  "legal_name": "Pooja Fashion Shop Private Limited",
  "display_name": "Pooja Fashion",
  "business_type": "Retail",
  "industry_type": "Fashion & Garments",
  "registration_number": "U18109TN2024PTC123456",
  "email": "contact@poojafashion.com",
  "phone": "04344-245678",
  "mobile": "+919876543210",
  "website": "https://www.poojafashion.com",
  "logo_url": "https://www.poojafashion.com/logo.png",
  "default_currency": "INR",
  "country_code": "IN",
  "timezone": "Asia/Kolkata",
  "financial_year_start_month": 4,
  "status": "active"
}
```

### Success Response (201 Created):

```json
{
  "success": true,
  "message": "Company created successfully",
  "data": {
    "id": 1,
    "companyCode": "PFS001",
    "companyName": "Pooja Fashion Shop",
    "legalName": "Pooja Fashion Shop Private Limited",
    "displayName": "Pooja Fashion",
    "businessType": "Retail",
    "industryType": "Fashion & Garments",
    "registrationNumber": "U18109TN2024PTC123456",
    "email": "contact@poojafashion.com",
    "phone": "04344-245678",
    "mobile": "+919876543210",
    "website": "https://www.poojafashion.com",
    "logoUrl": "https://www.poojafashion.com/logo.png",
    "defaultCurrency": "INR",
    "countryCode": "IN",
    "timezone": "Asia/Kolkata",
    "financialYearStartMonth": 4,
    "status": "active",
    "createdAt": "2026-09-09T16:30:00.000Z",
    "updatedAt": "2026-09-09T16:30:00.000Z"
  }
}
```

---

## 2. GET /api/companies (Get Companies List)

### URL:

```http
GET http://localhost:5000/api/companies?page=1&limit=10&status=active&sortBy=created_at&sortOrder=desc
```

### Success Response (200 OK):

```json
{
  "success": true,
  "message": "Companies retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyCode": "PFS001",
      "companyName": "Pooja Fashion Shop",
      "displayName": "Pooja Fashion",
      "email": "contact@poojafashion.com",
      "phone": "04344-245678",
      "status": "active",
      "createdAt": "2026-09-09T16:30:00.000Z"
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

## 3. GET /api/companies/:id (Get Company by ID)

### URL:

```http
GET http://localhost:5000/api/companies/1
```

---

## 4. GET /api/companies/code/:companyCode (Get Company by Code)

### URL:

```http
GET http://localhost:5000/api/companies/code/PFS001
```

---

## 5. PUT /api/companies/:id (Update Company)

### URL:

```http
PUT http://localhost:5000/api/companies/1
Content-Type: application/json
```

### Request Body (Copy & Paste):

```json
{
  "company_name": "Pooja Fashion Retail Ltd",
  "display_name": "Pooja Fashion Main Store",
  "email": "info@poojafashion.com",
  "phone": "04344-245999",
  "mobile": "+919876500000",
  "status": "active"
}
```

---

## 6. PATCH /api/companies/:id/status (Update Company Status)

### URL:

```http
PATCH http://localhost:5000/api/companies/1/status
Content-Type: application/json
```

### Request Body (Copy & Paste):

```json
{
  "status": "inactive"
}
```

---

## 7. DELETE /api/companies/:id (Delete Company)

### URL:

```http
DELETE http://localhost:5000/api/companies/1
```
