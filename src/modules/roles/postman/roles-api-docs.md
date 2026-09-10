# Roles API Documentation

Enterprise Role-Based Access Control (RBAC) API with intelligent role code auto-generation, system role protection, and company default role seeding.

## Base URL

```
/api/roles
```

## System Roles & Safeguards

- **SUPERADMIN (`SUPERADMIN`)**: Complete platform and company control. Cannot be deleted or deactivated.
- **ADMIN (`ADMIN`)**: Company administrator with management capabilities. Cannot be deleted.
- **Custom Roles**: Business-defined roles (e.g. `STORE_MANAGER`, `CASHIER`, `SALES_EXECUTIVE`). Can be created, updated, activated/deactivated, and deleted.

## Role Code Auto-Generation

When creating a role via `POST /api/roles`, passing `role_code` is optional.

- If omitted, a clean uppercase snake_case role code is automatically generated based on the `role_name`.
- Semantic standard names (e.g. `"Store Manager"` $\to$ `STORE_MANAGER`, `"Super Admin"` $\to$ `SUPERADMIN`, `"Cashier"` $\to$ `CASHIER`) are normalized automatically.
- Name collisions are automatically handled by appending sequential numbering (e.g., `CASHIER_01`, `CASHIER_02`).

---

## Endpoints

### 1. List Roles (Paginated & Filtered)

- **Method:** `GET`
- **URL:** `/api/roles`
- **Query Parameters:**
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `company_id` (number, optional)
  - `is_active` (boolean, optional)
  - `is_system_role` (boolean, optional)
  - `search` (string, optional) - searches `role_name`, `role_code`, `description`
  - `sortBy` (enum: `id`, `company_id`, `role_code`, `role_name`, `is_system_role`, `is_active`, `created_at`)
  - `sortOrder` (enum: `asc`, `desc`)

### 2. Get Role by ID

- **Method:** `GET`
- **URL:** `/api/roles/:id`

### 3. Get Role by Company and Code

- **Method:** `GET`
- **URL:** `/api/roles/code/:companyId/:roleCode`

### 4. Get All Roles for a Company

- **Method:** `GET`
- **URL:** `/api/roles/company/:companyId`

### 5. Create Role

- **Method:** `POST`
- **URL:** `/api/roles`
- **Request Body (with Auto-Generated Code):**

```json
{
  "company_id": 1,
  "role_name": "Senior Cashier",
  "description": "Handles POS checkout and cash reconciliation"
}
```

_Resulting `role_code`: `SENIOR_CASHIER`_

- **Request Body (with Explicit Code):**

```json
{
  "company_id": 1,
  "role_name": "Lead Stylist",
  "role_code": "LEAD_STYLIST",
  "description": "Floor fashion consultant"
}
```

### 6. Update Role

- **Method:** `PUT`
- **URL:** `/api/roles/:id`
- **Request Body:**

```json
{
  "role_name": "Head Cashier",
  "description": "Supervises POS cashiers"
}
```

### 7. Update Role Active Status

- **Method:** `PATCH`
- **URL:** `/api/roles/:id/status`
- **Request Body:**

```json
{
  "is_active": false
}
```

### 8. Delete Role

- **Method:** `DELETE`
- **URL:** `/api/roles/:id`
  _(Fails with `403 Forbidden` if attempting to delete a system role)_

### 9. Seed Default System Roles for Company

- **Method:** `POST`
- **URL:** `/api/roles/company/:companyId/seed-defaults`
