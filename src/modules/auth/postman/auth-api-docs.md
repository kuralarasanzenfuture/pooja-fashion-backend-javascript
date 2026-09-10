# Authentication API Documentation

Interactive Swagger URL (Browser):  
👉 **http://localhost:5000/api/docs**

Base URL:  
`http://localhost:5000/api`

---

# SECTION 1: Authentication Master (`/api/auth`)

## 1. POST /api/auth/login (User Login)

Authenticates credentials, starts a new device session, sets secure HTTP-only cookies, and returns user profile and tokens.

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json
```

```json
{
  "identifier": "admin",
  "password": "SecurePassword@123",
  "company_id": 1
}
```

### Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "companyId": 1,
      "branchId": 1,
      "employeeId": null,
      "roleId": 1,
      "username": "admin",
      "email": "admin@poojafashion.com",
      "status": "active",
      "roleCode": "SUPERADMIN",
      "roleName": "Super Admin",
      "isSystemRole": true
    },
    "tokens": {
      "tokenType": "Bearer",
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "4a719c...",
      "expiresIn": 900
    },
    "session": {
      "id": "e9b28f73-1996-4122-8ea7-b08e3be16a04",
      "deviceName": "Windows 10/11 (Chrome)",
      "deviceType": "Desktop",
      "browser": "Chrome",
      "operatingSystem": "Windows",
      "ipAddress": "127.0.0.1",
      "createdAt": "2026-09-10T17:15:00.000Z"
    }
  }
}
```

---

## 2. POST /api/auth/refresh-token (Rotate Refresh Token)

Rotates refresh token, invalidates the previous one, and issues a fresh JWT access token. Can read token from HTTP-only cookie or request body.

```http
POST http://localhost:5000/api/auth/refresh-token
Content-Type: application/json
```

```json
{
  "refresh_token": "4a719c..."
}
```

### Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "7c820b...",
    "sessionId": "e9b28f73-1996-4122-8ea7-b08e3be16a04",
    "expiresIn": 900
  }
}
```

---

## 3. GET /api/auth/me (Current Profile & Session Info)

```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer {{token}}
```

---

## 4. POST /api/auth/logout (Logout Current Session)

Terminates the current device session, marks refresh token revoked, and clears HTTP-only cookies.

```http
POST http://localhost:5000/api/auth/logout
Authorization: Bearer {{token}}
```

---

## 5. POST /api/auth/logout-all (Logout All Devices)

Terminates all active sessions across all devices for the caller and increments `token_version` to invalidate any in-flight tokens.

```http
POST http://localhost:5000/api/auth/logout-all
Authorization: Bearer {{token}}
```

---

## 6. GET /api/auth/sessions (Real-time Active Sessions)

Lists all currently active sessions for the user with device fingerprints and `isCurrent` flags.

```http
GET http://localhost:5000/api/auth/sessions
Authorization: Bearer {{token}}
```

### Response (200 OK)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Active sessions retrieved successfully",
  "data": [
    {
      "id": "e9b28f73-1996-4122-8ea7-b08e3be16a04",
      "userId": 1,
      "deviceName": "Windows 10/11 (Chrome)",
      "deviceType": "Desktop",
      "browser": "Chrome",
      "operatingSystem": "Windows",
      "ipAddress": "127.0.0.1",
      "isActive": true,
      "isCurrent": true,
      "createdAt": "2026-09-10T17:15:00.000Z",
      "lastActivityAt": "2026-09-10T17:18:00.000Z"
    }
  ]
}
```

---

## 7. DELETE /api/auth/sessions/:id (Remote Session Termination)

Allows terminating a lost or remote device session.

```http
DELETE http://localhost:5000/api/auth/sessions/e9b28f73-1996-4122-8ea7-b08e3be16a04
Authorization: Bearer {{token}}
```

---

## 8. GET /api/auth/login-history (Login Audit Trail)

```http
GET http://localhost:5000/api/auth/login-history?page=1&limit=10&status=success
Authorization: Bearer {{token}}
```

---

## 9. POST /api/auth/change-password (Change Password & Enforce History)

Verifies current password, enforces password strength, checks that new password does not match any of the last 5 passwords, updates hash in `users` and `password_history`, and logs out all other sessions.

```http
POST http://localhost:5000/api/auth/change-password
Content-Type: application/json
Authorization: Bearer {{token}}
```

```json
{
  "current_password": "SecurePassword@123",
  "new_password": "NewSecurePassword@456"
}
```
