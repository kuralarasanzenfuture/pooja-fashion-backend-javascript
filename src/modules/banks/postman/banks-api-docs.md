# Banks, Bank Identifiers & Company Banks API Documentation & Copy-Paste Reference

Interactive Swagger URL (Browser):
👉 **http://localhost:5000/api/docs**

Base URL:
`http://localhost:5000/api`

---

# SECTION 1: Banks Master (`/api/banks`)

## 1. POST /api/banks (Create Bank Master)

```http
POST http://localhost:5000/api/banks
Content-Type: application/json
```

```json
{
  "bank_code": "HDFC",
  "bank_name": "HDFC Bank",
  "short_name": "HDFC",
  "legal_name": "HDFC Bank Limited",
  "bank_type": "commercial",
  "logo_url": "https://assets.poojafashion.com/banks/hdfc.png",
  "website_url": "https://www.hdfcbank.com",
  "country_code": "IN",
  "is_active": true,
  "is_verified": true,
  "display_order": 1
}
```

## 2. GET /api/banks (List Banks Paginated & Filtered)

```http
GET http://localhost:5000/api/banks?page=1&limit=10&bank_type=commercial&is_active=true&sortBy=display_order&sortOrder=asc
```

## 3. GET /api/banks/:id (Get Bank by ID)

```http
GET http://localhost:5000/api/banks/1
```

## 4. GET /api/banks/code/:bankCode (Get Bank by Code)

```http
GET http://localhost:5000/api/banks/code/HDFC
```

## 5. PUT /api/banks/:id (Update Bank)

```http
PUT http://localhost:5000/api/banks/1
Content-Type: application/json
```

```json
{
  "short_name": "HDFC Ltd",
  "display_order": 2
}
```

## 6. PATCH /api/banks/:id/status (Toggle Bank Status)

```http
PATCH http://localhost:5000/api/banks/1/status
Content-Type: application/json
```

```json
{
  "is_active": false
}
```

## 7. POST /api/banks/:id/logo (Upload / Replace Bank Logo)

Upload logo files directly via multipart/form-data. Allowed keys: `logo`, `logo_light`, `logo_dark`.
Files are stored automatically in `src/uploads/banks/<bank_slug>/` named after the bank name/slug, and previous physical files are automatically deleted upon replacement.

```http
POST http://localhost:5000/api/banks/1/logo
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="logo"; filename="hdfc-bank.png"
Content-Type: image/png

<binary data>
------WebKitFormBoundary--
```

## 8. DELETE /api/banks/:id/logo (Delete Bank Logo Files)

Deletes physical image files from the bank's upload folder and resets the database URL fields to `null`.
Optional query parameter `type`: `logo` | `logo_light` | `logo_dark` | `all` (default is `all`).

```http
DELETE http://localhost:5000/api/banks/1/logo?type=all
```

## 9. DELETE /api/banks/:id (Delete Bank)

Removes the bank record from the database AND automatically deletes all physical logo files and the bank's upload folder from disk.

```http
DELETE http://localhost:5000/api/banks/1
```

---

# SECTION 2: Bank Identifiers (`/api/bank-identifiers`)

## 1. POST /api/bank-identifiers (Create Identifier / Branch IFSC)

```http
POST http://localhost:5000/api/bank-identifiers
Content-Type: application/json
```

```json
{
  "bank_id": 1,
  "identifier_type": "ifsc",
  "identifier_value": "HDFC0001234",
  "branch_name": "Hosur Main Branch",
  "city": "Hosur",
  "state": "Tamil Nadu",
  "is_active": true
}
```

## 2. GET /api/bank-identifiers (List Identifiers)

```http
GET http://localhost:5000/api/bank-identifiers?page=1&limit=10&bank_id=1&identifier_type=ifsc&city=Hosur
```

## 3. GET /api/bank-identifiers/bank/:bankId (All Identifiers for a Bank)

```http
GET http://localhost:5000/api/bank-identifiers/bank/1
```

## 4. GET /api/bank-identifiers/value/:identifierValue (Lookup by IFSC / Code Value)

```http
GET http://localhost:5000/api/bank-identifiers/value/HDFC0001234
```

## 5. PUT /api/bank-identifiers/:id (Update Identifier)

```http
PUT http://localhost:5000/api/bank-identifiers/1
Content-Type: application/json
```

```json
{
  "branch_name": "Hosur Commercial Hub Branch",
  "city": "Hosur"
}
```

## 6. DELETE /api/bank-identifiers/:id (Delete Identifier)

```http
DELETE http://localhost:5000/api/bank-identifiers/1
```

---

# SECTION 3: Company Bank Accounts (`/api/company-banks`)

## 1. POST /api/company-banks (Create Company Bank Account)

```http
POST http://localhost:5000/api/company-banks
Content-Type: application/json
```

```json
{
  "company_id": 1,
  "bank_id": 1,
  "account_name": "Pooja Fashion Main Operating Account",
  "account_number": "50200012345678",
  "account_type": "current",
  "branch_name": "Hosur Main Branch",
  "branch_code": "1234",
  "ifsc_code": "HDFC0001234",
  "micr_code": "635240002",
  "swift_code": "HDFCINBB",
  "opening_balance": 50000,
  "current_balance": 50000,
  "is_primary": true,
  "is_active": true,
  "notes": "Main operational current account for vendor payments"
}
```

## 2. GET /api/company-banks (List Company Bank Accounts)

```http
GET http://localhost:5000/api/company-banks?page=1&limit=10&company_id=1&account_type=current&is_active=true&sortBy=created_at&sortOrder=desc
```

## 3. GET /api/company-banks/:id (Get Company Bank Account by ID)

```http
GET http://localhost:5000/api/company-banks/1
```

## 4. GET /api/company-banks/company/:companyId (All Accounts for a Company)

```http
GET http://localhost:5000/api/company-banks/company/1
```

## 5. PUT /api/company-banks/:id (Update Company Bank Account)

```http
PUT http://localhost:5000/api/company-banks/1
Content-Type: application/json
```

```json
{
  "account_name": "Pooja Fashion Retail Store Account",
  "notes": "Updated account notes"
}
```

## 6. PATCH /api/company-banks/:id/status (Toggle Account Status)

```http
PATCH http://localhost:5000/api/company-banks/1/status
Content-Type: application/json
```

```json
{
  "is_active": false
}
```

## 7. PATCH /api/company-banks/:id/primary (Set Account as Primary)

```http
PATCH http://localhost:5000/api/company-banks/1/primary
```

## 8. DELETE /api/company-banks/:id (Delete Company Bank Account)

```http
DELETE http://localhost:5000/api/company-banks/1
```
