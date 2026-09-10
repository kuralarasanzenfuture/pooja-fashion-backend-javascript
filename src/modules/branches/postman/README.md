# Branches Postman Collection & Integration Guide

This directory contains integration resources and Postman collections for the **Branches Domain**:

- **Branch Master** (`/api/branches`)
- **Branch Addresses** (`/api/branch-addresses`)
- **Branch Contacts** (`/api/branch-contacts`)

---

## 🚀 Quick Start with Postman

1. Open Postman.
2. Click **Import** (top left).
3. Select `branches.postman_collection.json` from this folder.
4. Set the environment variable:
   - `baseUrl`: `http://localhost:5000/api`

---

## 📖 API Documentation Reference

For quick copy-paste cURL commands and HTTP requests, refer to:
👉 [branches-api-docs.md](./branches-api-docs.md)

Interactive OpenAPI / Swagger UI:
👉 `http://localhost:5000/api/docs`

---

## 🏷️ Meaningful Branch Code Auto-Generation

When creating a branch via `POST /api/branches`, the `branch_code` property is **optional**:

- If omitted, the system will automatically and professionally generate a code:
  - **Head Office**: `PFS-HO`
  - **Retail Stores**: `PFS-B01`, `PFS-B02`, ...
  - **Warehouses**: `PFS-WH01`, `PFS-WH02`, ...
  - **Showrooms**: `PFS-SH01`, `PFS-SH02`, ...
  - **Offices**: `PFS-OF01`, `PFS-OF02`, ...
  - **Others**: `PFS-BR01`, `PFS-BR02`, ...
- If provided, the custom code is validated for uniqueness against the specified `company_id`.
