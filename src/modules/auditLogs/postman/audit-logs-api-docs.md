# Audit Logs & Change Tracking API Documentation

Enterprise API documentation for querying and inspecting audit logs and field-level change history in the Pooja Fashion ERP & POS platform.

---

## Base URL
`/api/audit-logs`

---

## Architecture Overview

All create, update, delete, status toggle (activate/deactivate), and image upload/delete mutations across core modules (such as **Categories** and **Sub-Categories**) automatically record audit entries:
1. **`audit_logs` (Master Record):** Tracks the user, company, branch, session, action, module, entity type, entity ID, description, request metadata (method, URL, IP address, user-agent, device/browser details), previous state snapshot (`old_data`), new state snapshot (`new_data`), and change diff (`change_data`).
2. **`audit_log_changes` (Field-Level Diffs):** Detailed individual field audit trail tracking `field_name`, `field_label`, `data_type`, `old_value`, and `new_value`.

---

## Endpoints

### 1. List Audit Logs
Retrieve a paginated, filterable, and searchable list of audit log records.

- **URL:** `GET /api/audit-logs`
- **Headers:**
  - `Authorization: Bearer <access_token>` (Required)
- **Query Parameters:**
  - `page` *(number, optional, default: 1)*: Page number.
  - `limit` *(number, optional, default: 10, max: 100)*: Items per page.
  - `company_id` *(number, optional)*: Filter by company (strictly enforced for non-superadmin users).
  - `branch_id` *(number, optional)*: Filter by branch ID.
  - `user_id` *(number, optional)*: Filter by acting user ID.
  - `action` *(string, optional)*: Filter by action (`CREATE`, `UPDATE`, `DELETE`, `ACTIVATE`, `DEACTIVATE`, `UPLOAD`, etc.).
  - `module` *(string, optional)*: Filter by module name (e.g. `categories`, `subcategories`).
  - `entity_type` *(string, optional)*: Filter by entity type (`Category`, `SubCategory`, etc.).
  - `entity_id` *(number, optional)*: Filter by primary record ID.
  - `status` *(string, optional)*: `success` or `failed`.
  - `start_date` *(ISO date string, optional)*: From date timestamp.
  - `end_date` *(ISO date string, optional)*: To date timestamp.
  - `search` *(string, optional)*: Full-text search in entity name, description, module, URL, request ID.
  - `sortBy` *(string, optional, default: 'created_at')*: Sort field (`id`, `created_at`, `action`, `module`, `entity_type`, `status`).
  - `sortOrder` *(string, optional, default: 'DESC')*: `ASC` or `DESC`.

- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Audit logs retrieved successfully",
  "data": [
    {
      "id": 101,
      "companyId": 1,
      "company_id": 1,
      "companyName": "Pooja Fashion Retail Ltd",
      "company_name": "Pooja Fashion Retail Ltd",
      "companyCode": "PF-CORP",
      "company_code": "PF-CORP",
      "branchId": 1,
      "branch_id": 1,
      "branchName": "Surat Flagship",
      "branch_name": "Surat Flagship",
      "userId": 5,
      "user_id": 5,
      "userEmail": "admin@poojafashion.com",
      "user_email": "admin@poojafashion.com",
      "action": "UPDATE",
      "module": "categories",
      "entityType": "Category",
      "entity_type": "Category",
      "entityId": 12,
      "entity_id": 12,
      "entityName": "Designer Sarees",
      "entity_name": "Designer Sarees",
      "description": "Category \"Designer Sarees\" updated",
      "oldData": {
        "id": 12,
        "category_name": "Silk Sarees",
        "display_order": 1,
        "is_active": true
      },
      "newData": {
        "id": 12,
        "category_name": "Designer Sarees",
        "display_order": 5,
        "is_active": true
      },
      "changeData": {
        "category_name": { "old": "Silk Sarees", "new": "Designer Sarees" },
        "display_order": { "old": 1, "new": 5 }
      },
      "requestId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "requestMethod": "PUT",
      "requestUrl": "/api/product-master/categories/12",
      "ipAddress": "127.0.0.1",
      "deviceType": "Desktop",
      "deviceName": "Windows 11 (Chrome)",
      "operatingSystem": "Windows",
      "browser": "Chrome",
      "browserVersion": "120.0",
      "status": "success",
      "errorMessage": null,
      "createdAt": "2026-11-11T10:00:00.000Z"
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

### 2. Get Audit Log By ID
Retrieve a single audit log entry along with all corresponding field-level changes from `audit_log_changes`.

- **URL:** `GET /api/audit-logs/:id`
- **Headers:**
  - `Authorization: Bearer <access_token>` (Required)
- **Parameters:**
  - `id` *(number, required)*: Audit log record ID.

- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Audit log retrieved successfully",
  "data": {
    "id": 101,
    "companyId": 1,
    "companyName": "Pooja Fashion Retail Ltd",
    "userId": 5,
    "userEmail": "admin@poojafashion.com",
    "action": "UPDATE",
    "module": "categories",
    "entityType": "Category",
    "entityId": 12,
    "entityName": "Designer Sarees",
    "description": "Category \"Designer Sarees\" updated",
    "oldData": {
      "id": 12,
      "category_name": "Silk Sarees",
      "display_order": 1
    },
    "newData": {
      "id": 12,
      "category_name": "Designer Sarees",
      "display_order": 5
    },
    "changeData": {
      "category_name": { "old": "Silk Sarees", "new": "Designer Sarees" },
      "display_order": { "old": 1, "new": 5 }
    },
    "changes": [
      {
        "id": 501,
        "auditLogId": 101,
        "fieldName": "category_name",
        "fieldLabel": "Category Name",
        "dataType": "string",
        "oldValue": "Silk Sarees",
        "newValue": "Designer Sarees",
        "createdAt": "2026-11-11T10:00:00.000Z"
      },
      {
        "id": 502,
        "auditLogId": 101,
        "fieldName": "display_order",
        "fieldLabel": "Display Order",
        "dataType": "integer",
        "oldValue": "1",
        "newValue": "5",
        "createdAt": "2026-11-11T10:00:00.000Z"
      }
    ],
    "requestId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "requestMethod": "PUT",
    "requestUrl": "/api/product-master/categories/12",
    "ipAddress": "127.0.0.1",
    "deviceType": "Desktop",
    "browser": "Chrome",
    "status": "success",
    "createdAt": "2026-11-11T10:00:00.000Z"
  }
}
```

---

### 3. Get Entity Audit History Timeline
Retrieve chronological history of all audit events for a specific domain entity (e.g. Category ID 12).

- **URL:** `GET /api/audit-logs/entity/:entityType/:entityId`
- **Headers:**
  - `Authorization: Bearer <access_token>` (Required)
- **Parameters:**
  - `entityType` *(string, required)*: e.g. `Category` or `SubCategory`.
  - `entityId` *(number, required)*: e.g. `12`.
- **Query Parameters:**
  - `page` *(number, optional, default: 1)*
  - `limit` *(number, optional, default: 50)*

- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Entity audit history retrieved successfully",
  "data": [
    {
      "id": 102,
      "action": "ACTIVATE",
      "module": "categories",
      "entityType": "Category",
      "entityId": 12,
      "description": "Category \"Designer Sarees\" activated",
      "createdAt": "2026-11-11T10:05:00.000Z"
    },
    {
      "id": 101,
      "action": "UPDATE",
      "module": "categories",
      "entityType": "Category",
      "entityId": 12,
      "description": "Category \"Designer Sarees\" updated",
      "createdAt": "2026-11-11T10:00:00.000Z"
    },
    {
      "id": 95,
      "action": "CREATE",
      "module": "categories",
      "entityType": "Category",
      "entityId": 12,
      "description": "Category \"Silk Sarees\" (Code: SILK_SAREES) created",
      "createdAt": "2026-11-10T09:00:00.000Z"
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 50,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

