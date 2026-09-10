# Branches, Branch Addresses & Branch Contacts API Documentation

Interactive Swagger URL (Browser):
👉 **http://localhost:5000/api/docs**

Base URL:
`http://localhost:5000/api`

---

# SECTION 1: Branch Master (`/api/branches`)

## 1. POST /api/branches (Create Branch)

> [!NOTE]
> `branch_code` is optional. If omitted, the system professionally auto-generates it based on the company and branch type:
>
> - Head Office: `<PREFIX>-HO` (e.g. `PFS-HO`)
> - Retail Stores: `<PREFIX>-B01`, `<PREFIX>-B02` (e.g. `PFS-B01` for Hosur, `PFS-B02` for Bangalore)
> - Warehouses: `<PREFIX>-WH01`, `<PREFIX>-WH02`
> - Showrooms: `<PREFIX>-SH01`, `<PREFIX>-SH02`

```http
POST http://localhost:5000/api/branches
Content-Type: application/json
```

```json
{
  "company_id": 1,
  "branch_name": "Hosur Main Branch",
  "branch_type": "store",
  "email": "hosur@poojafashion.com",
  "phone": "+91 4344 223344",
  "mobile": "+91 9876543210",
  "manager_name": "Kuralarasan",
  "opening_date": "2024-01-15",
  "is_main_branch": true,
  "status": "active"
}
```

## 2. GET /api/branches (List Branches Paginated & Filtered)

```http
GET http://localhost:5000/api/branches?page=1&limit=10&company_id=1&branch_type=store&status=active&sortBy=id&sortOrder=asc
```

## 3. GET /api/branches/:id (Get Branch by ID)

```http
GET http://localhost:5000/api/branches/1
```

## 4. GET /api/branches/company/:companyId (List All Branches for Company)

```http
GET http://localhost:5000/api/branches/company/1
```

## 5. GET /api/branches/code/:companyId/:branchCode (Get Branch by Code)

```http
GET http://localhost:5000/api/branches/code/1/PFS-B01
```

## 6. PUT /api/branches/:id (Update Branch)

```http
PUT http://localhost:5000/api/branches/1
Content-Type: application/json
```

```json
{
  "branch_name": "Hosur Central Flagship Store",
  "manager_name": "Kuralarasan Z"
}
```

## 7. PATCH /api/branches/:id/status (Toggle Status)

```http
PATCH http://localhost:5000/api/branches/1/status
Content-Type: application/json
```

```json
{
  "status": "inactive"
}
```

## 8. PATCH /api/branches/:id/main (Set as Main Branch)

```http
PATCH http://localhost:5000/api/branches/1/main
```

## 9. DELETE /api/branches/:id (Delete Branch)

```http
DELETE http://localhost:5000/api/branches/1
```

---

# SECTION 2: Branch Addresses (`/api/branch-addresses`)

## 1. POST /api/branch-addresses (Create Address)

```http
POST http://localhost:5000/api/branch-addresses
Content-Type: application/json
```

```json
{
  "branch_id": 1,
  "address_line_1": "123 MG Road",
  "address_line_2": "Opposite Bus Stand",
  "city": "Hosur",
  "district": "Krishnagiri",
  "state": "Tamil Nadu",
  "postal_code": "635109",
  "country": "India",
  "landmark": "Near Clock Tower",
  "is_primary": true,
  "is_active": true
}
```

## 2. GET /api/branch-addresses (List Addresses Paginated & Filtered)

```http
GET http://localhost:5000/api/branch-addresses?page=1&limit=10&branch_id=1&city=Hosur
```

## 3. GET /api/branch-addresses/:id (Get Address by ID)

```http
GET http://localhost:5000/api/branch-addresses/1
```

## 4. GET /api/branch-addresses/branch/:branchId (List All Addresses for Branch)

```http
GET http://localhost:5000/api/branch-addresses/branch/1
```

## 5. PUT /api/branch-addresses/:id (Update Address)

```http
PUT http://localhost:5000/api/branch-addresses/1
Content-Type: application/json
```

```json
{
  "landmark": "Beside New Shopping Mall"
}
```

## 6. PATCH /api/branch-addresses/:id/primary (Set Primary Address)

```http
PATCH http://localhost:5000/api/branch-addresses/1/primary
```

## 7. DELETE /api/branch-addresses/:id (Delete Address)

```http
DELETE http://localhost:5000/api/branch-addresses/1
```

---

# SECTION 3: Branch Contacts (`/api/branch-contacts`)

## 1. POST /api/branch-contacts (Create Contact)

```http
POST http://localhost:5000/api/branch-contacts
Content-Type: application/json
```

```json
{
  "branch_id": 1,
  "contact_name": "Ramesh Kumar",
  "designation": "Store Manager",
  "email": "ramesh@poojafashion.com",
  "phone": "+91 4344 223344",
  "mobile": "+91 9876543211",
  "is_primary": true,
  "is_active": true
}
```

## 2. GET /api/branch-contacts (List Contacts Paginated & Filtered)

```http
GET http://localhost:5000/api/branch-contacts?page=1&limit=10&branch_id=1
```

## 3. GET /api/branch-contacts/:id (Get Contact by ID)

```http
GET http://localhost:5000/api/branch-contacts/1
```

## 4. GET /api/branch-contacts/branch/:branchId (List All Contacts for Branch)

```http
GET http://localhost:5000/api/branch-contacts/branch/1
```

## 5. PUT /api/branch-contacts/:id (Update Contact)

```http
PUT http://localhost:5000/api/branch-contacts/1
Content-Type: application/json
```

```json
{
  "designation": "Senior Store Manager"
}
```

## 6. PATCH /api/branch-contacts/:id/primary (Set Primary Contact)

```http
PATCH http://localhost:5000/api/branch-contacts/1/primary
```

## 7. DELETE /api/branch-contacts/:id (Delete Contact)

```http
DELETE http://localhost:5000/api/branch-contacts/1
```
