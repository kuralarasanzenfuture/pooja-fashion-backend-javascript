# Employees API Documentation

Interactive Swagger URL (Browser):  
👉 **http://localhost:5000/api/docs**

Base URL:  
`http://localhost:5000/api`

Authentication:  
All employee write/management operations require a Bearer token in the `Authorization` header (`Authorization: Bearer <token>`) or the `access_token` cookie, and Admin/SuperAdmin privileges.

---

# SECTION 1: Employees Master (`/api/employees`)

## 1. POST /api/employees (Create Employee)

> [!NOTE]
> `employee_code` is optional. If omitted, the system auto-generates a clean, collision-free code based on the company and department:
>
> - Format: `${COMPANY_PREFIX}-EMP001`, `${COMPANY_PREFIX}-EMP002` (e.g. `PFS-EMP001`)
> - Profile photos can be sent either as a URL in JSON (`profile_photo_url`) or uploaded as a file via `multipart/form-data` with field name `photo` or `profile_photo`.
> - The uploaded photo file is named using the employee's `username` or code slug (`<username>-photo-<timestamp>.jpg`) and stored in `/uploads/employees/`.

```http
POST http://localhost:5000/api/employees
Content-Type: application/json
Authorization: Bearer {{token}}
```

```json
{
  "company_id": 1,
  "branch_id": 1,
  "first_name": "Kuralarasan",
  "last_name": "Zen",
  "display_name": "Kural Zen",
  "phone": "+919876543210",
  "email": "kural@poojafashion.com",
  "date_of_birth": "1995-05-20",
  "gender": "Male",
  "designation": "Store Manager",
  "department": "Sales",
  "date_of_joining": "2024-01-15",
  "employment_type": "full_time",
  "employment_status": "active",
  "salary_type": "monthly",
  "salary_amount": 45000,
  "city": "Hosur",
  "district": "Krishnagiri",
  "state": "Tamil Nadu",
  "pincode": "635109",
  "country": "India"
}
```

### Response (201 Created)

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Employee created successfully",
  "data": {
    "id": 1,
    "companyId": 1,
    "branchId": 1,
    "employeeCode": "PFS-EMP001",
    "firstName": "Kuralarasan",
    "lastName": "Zen",
    "displayName": "Kural Zen",
    "phone": "+919876543210",
    "email": "kural@poojafashion.com",
    "designation": "Store Manager",
    "department": "Sales",
    "employmentType": "full_time",
    "employmentStatus": "active",
    "salaryType": "monthly",
    "salaryAmount": 45000,
    "profilePhotoUrl": null,
    "companyName": "Pooja Fashion Retail Pvt Ltd",
    "companyCode": "PFS",
    "branchName": "Hosur Main Branch",
    "createdAt": "2026-09-10T17:00:00.000Z",
    "updatedAt": "2026-09-10T17:00:00.000Z"
  }
}
```

---

## 2. GET /api/employees (List Employees Paginated & Filtered)

```http
GET http://localhost:5000/api/employees?page=1&limit=10&company_id=1&department=Sales&employment_status=active&search=Kural&sortBy=id&sortOrder=asc
Authorization: Bearer {{token}}
```

### Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Employees retrieved successfully",
  "data": [
    {
      "id": 1,
      "companyId": 1,
      "branchId": 1,
      "employeeCode": "PFS-EMP001",
      "firstName": "Kuralarasan",
      "lastName": "Zen",
      "displayName": "Kural Zen",
      "phone": "+919876543210",
      "email": "kural@poojafashion.com",
      "designation": "Store Manager",
      "department": "Sales",
      "employmentStatus": "active",
      "companyName": "Pooja Fashion Retail Pvt Ltd",
      "branchName": "Hosur Main Branch"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

## 3. GET /api/employees/:id (Get Employee by ID)

```http
GET http://localhost:5000/api/employees/1
Authorization: Bearer {{token}}
```

---

## 4. GET /api/employees/code/:companyId/:employeeCode (Get Employee by Code)

```http
GET http://localhost:5000/api/employees/code/1/PFS-EMP001
Authorization: Bearer {{token}}
```

---

## 5. PUT /api/employees/:id (Update Employee Details)

```http
PUT http://localhost:5000/api/employees/1
Content-Type: application/json
Authorization: Bearer {{token}}
```

```json
{
  "designation": "Senior General Manager",
  "salary_amount": 55000,
  "notes": "Promoted to Senior General Manager"
}
```

---

## 6. POST /api/employees/:id/photo (Upload Profile Photo)

Accepts `multipart/form-data` with `photo` binary file.

```http
POST http://localhost:5000/api/employees/1/photo
Content-Type: multipart/form-data
Authorization: Bearer {{token}}
```

---

## 7. DELETE /api/employees/:id/photo (Remove Profile Photo)

```http
DELETE http://localhost:5000/api/employees/1/photo
Authorization: Bearer {{token}}
```

---

## 8. PATCH /api/employees/:id/status (Update Employment Status)

```http
PATCH http://localhost:5000/api/employees/1/status
Content-Type: application/json
Authorization: Bearer {{token}}
```

```json
{
  "employment_status": "on_leave"
}
```

---

## 9. DELETE /api/employees/:id (Delete Employee)

```http
DELETE http://localhost:5000/api/employees/1
Authorization: Bearer {{token}}
```
