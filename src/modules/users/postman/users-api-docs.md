# Users API Documentation

Interactive Swagger URL (Browser):  
👉 **http://localhost:5000/api/docs**

Base URL:  
`http://localhost:5000/api`

Authentication:  
All endpoints require a Bearer token in the `Authorization` header (`Authorization: Bearer <token>`) or the `access_token` cookie.  
User management operations (creating, listing all, status updates, deletion) require `admin` or `superadmin` role.

---

# SECTION 1: Users Master (`/api/users`)

## 1. POST /api/users (Create User)

Creates a new enterprise user account with bcrypt password hashing and tenant association.

```http
POST http://localhost:5000/api/users
Content-Type: application/json
Authorization: Bearer {{token}}
```

```json
{
  "company_id": 1,
  "branch_id": 1,
  "role_id": 2,
  "username": "kural_admin",
  "email": "kural@poojafashion.com",
  "phone": "+919876543210",
  "password": "SecurePassword@123",
  "status": "active",
  "is_email_verified": true,
  "is_phone_verified": true,
  "two_factor_enabled": false
}
```

### Response (201 Created)

```json
{
  "success": true,
  "statusCode": 201,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "company_id": 1,
    "branch_id": 1,
    "role_id": 2,
    "employee_id": null,
    "username": "kural_admin",
    "email": "kural@poojafashion.com",
    "phone": "+919876543210",
    "status": "active",
    "is_email_verified": true,
    "is_phone_verified": true,
    "two_factor_enabled": false,
    "failed_login_attempts": 0,
    "locked_until": null,
    "last_login_at": null,
    "created_at": "2026-09-10T16:30:00.000Z",
    "updated_at": "2026-09-10T16:30:00.000Z"
  }
}
```

---

## 2. GET /api/users (List Users Paginated & Filtered)

Lists users with pagination, company/branch/role filters, and text search across username, email, and phone.

```http
GET http://localhost:5000/api/users?page=1&limit=10&company_id=1&status=active&search=kural&sortBy=id&sortOrder=asc
Authorization: Bearer {{token}}
```

### Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "company_id": 1,
      "branch_id": 1,
      "role_id": 2,
      "username": "kural_admin",
      "email": "kural@poojafashion.com",
      "phone": "+919876543210",
      "status": "active",
      "company_name": "Pooja Fashion Retail Pvt Ltd",
      "branch_name": "Hosur Main Branch",
      "role_name": "Admin"
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

## 3. GET /api/users/:id (Get User by ID)

Retrieves full user profile with company, branch, and role details.

```http
GET http://localhost:5000/api/users/1
Authorization: Bearer {{token}}
```

### Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "company_id": 1,
    "branch_id": 1,
    "role_id": 2,
    "employee_id": null,
    "username": "kural_admin",
    "email": "kural@poojafashion.com",
    "phone": "+919876543210",
    "status": "active",
    "company_name": "Pooja Fashion Retail Pvt Ltd",
    "branch_name": "Hosur Main Branch",
    "role_name": "Admin",
    "role_code": "ADMIN"
  }
}
```

---

## 4. PUT /api/users/:id (Update User Details)

Updates user profile fields (branch, role, username, email, phone, verification statuses).

```http
PUT http://localhost:5000/api/users/1
Content-Type: application/json
Authorization: Bearer {{token}}
```

```json
{
  "branch_id": 1,
  "role_id": 2,
  "username": "kural_senior_admin",
  "email": "kural.senior@poojafashion.com",
  "phone": "+919876543211",
  "is_email_verified": true,
  "two_factor_enabled": true
}
```

---

## 5. PATCH /api/users/:id/password (Change Password)

Resets or updates user password. If `current_password` is provided, it verifies against the old hash; otherwise allows administrative password reset.

```http
PATCH http://localhost:5000/api/users/1/password
Content-Type: application/json
Authorization: Bearer {{token}}
```

```json
{
  "current_password": "SecurePassword@123",
  "new_password": "UpdatedPassword@456"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password changed successfully",
  "data": null
}
```

---

## 6. PATCH /api/users/:id/status (Update Status or Lock Account)

Changes user status between `active`, `inactive`, `blocked`, or `locked`. When locking, `lock_minutes` can specify duration.

```http
PATCH http://localhost:5000/api/users/1/status
Content-Type: application/json
Authorization: Bearer {{token}}
```

```json
{
  "status": "locked",
  "lock_minutes": 60
}
```

### Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User status updated successfully",
  "data": {
    "id": 1,
    "status": "locked",
    "locked_until": "2026-09-10T17:30:00.000Z"
  }
}
```

---

## 7. DELETE /api/users/:id (Delete User)

Removes a user account from the system.

```http
DELETE http://localhost:5000/api/users/1
Authorization: Bearer {{token}}
```

### Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User deleted successfully",
  "data": {
    "id": 1
  }
}
```
