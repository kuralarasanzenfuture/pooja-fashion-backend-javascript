# Company Banks API Documentation & Copy-Paste Reference

Interactive Swagger URL (Browser):
👉 **http://localhost:5000/api/docs**

Base URL:
`http://localhost:5000/api`

---

## 1. POST /api/company-banks (Create Company Bank Account)

### URL:

```http
POST http://localhost:5000/api/company-banks
Content-Type: application/json
```

### Request Body (Copy & Paste):

```json
{
  "company_id": 1,
  "bank_name": "HDFC Bank",
  "branch_name": "Hosur Main Branch",
  "account_holder_name": "Pooja Fashion Shop Private Limited",
  "account_number": "50200012345678",
  "account_type": "current",
  "ifsc_code": "HDFC0001234",
  "micr_code": "635240002",
  "swift_code": "HDFCINBB",
  "bank_code": "HDFC",
  "branch_code": "1234",
  "opening_balance": 50000,
  "current_balance": 50000,
  "is_primary": true,
  "is_active": true
}
```

### Success Response (201 Created):

```json
{
  "success": true,
  "message": "Company bank created successfully",
  "data": {
    "id": 1,
    "companyId": 1,
    "bankName": "HDFC Bank",
    "branchName": "Hosur Main Branch",
    "accountHolderName": "Pooja Fashion Shop Private Limited",
    "accountNumber": "50200012345678",
    "accountType": "current",
    "ifscCode": "HDFC0001234",
    "micrCode": "635240002",
    "swiftCode": "HDFCINBB",
    "bankCode": "HDFC",
    "branchCode": "1234",
    "openingBalance": 50000,
    "currentBalance": 50000,
    "isPrimary": true,
    "isActive": true,
    "createdAt": "2026-09-09T17:35:00.000Z",
    "updatedAt": "2026-09-09T17:35:00.000Z"
  }
}
```

---

## 2. GET /api/company-banks (Get Bank Accounts with Pagination & Filters)

### URL:

```http
GET http://localhost:5000/api/company-banks?page=1&limit=10&company_id=1&account_type=current&is_active=true&sortBy=created_at&sortOrder=desc
```

### Success Response (200 OK):

```json
{
  "success": true,
  "message": "Company banks retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "companyName": "Pooja Fashion Shop",
      "companyCode": "PFS001",
      "bankName": "HDFC Bank",
      "branchName": "Hosur Main Branch",
      "accountHolderName": "Pooja Fashion Shop Private Limited",
      "accountNumber": "50200012345678",
      "accountType": "current",
      "ifscCode": "HDFC0001234",
      "openingBalance": 50000,
      "currentBalance": 50000,
      "isPrimary": true,
      "isActive": true,
      "createdAt": "2026-09-09T17:35:00.000Z"
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

## 3. GET /api/company-banks/:id (Get Bank Account by ID)

### URL:

```http
GET http://localhost:5000/api/company-banks/1
```

---

## 4. GET /api/company-banks/company/:companyId (Get All Bank Accounts for a Company)

### URL:

```http
GET http://localhost:5000/api/company-banks/company/1
```

---

## 5. PUT /api/company-banks/:id (Update Bank Account)

### URL:

```http
PUT http://localhost:5000/api/company-banks/1
Content-Type: application/json
```

### Request Body (Copy & Paste):

```json
{
  "branch_name": "Hosur Commercial Branch",
  "branch_code": "1235",
  "current_balance": 75000
}
```

---

## 6. PATCH /api/company-banks/:id/status (Toggle / Update Bank Account Status)

### URL:

```http
PATCH http://localhost:5000/api/company-banks/1/status
Content-Type: application/json
```

### Request Body (Copy & Paste):

```json
{
  "is_active": false
}
```

---

## 7. PATCH /api/company-banks/:id/primary (Set Bank Account as Primary)

### URL:

```http
PATCH http://localhost:5000/api/company-banks/1/primary
```

---

## 8. DELETE /api/company-banks/:id (Delete Bank Account)

### URL:

```http
DELETE http://localhost:5000/api/company-banks/1
```
