# Company Banks API - Postman & Integration Documentation

This directory contains ready-to-use Postman assets and quick copy-paste request templates for the **Company Banks** API.

---

## 🚀 Quick Start: Interactive Browser UI (Swagger)

When the backend server is running (`npm run dev`), you can open the interactive Swagger UI in your browser to test and copy-paste API payloads directly:

👉 **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

---

## 📥 How to Import into Postman

1. Open **Postman**.
2. Click **Import** (top left).
3. Drag & drop or select:
   - `company-banks.postman_collection.json`
4. All requests will automatically use the `{{baseUrl}}` variable (`http://localhost:5000/api`).

---

## 📋 Endpoints Overview

| Method   | Endpoint                                  | Description                                                           |
| :------- | :---------------------------------------- | :-------------------------------------------------------------------- |
| `POST`   | `/api/company-banks`                     | Create a new company bank account                                     |
| `GET`    | `/api/company-banks`                     | Get paginated & filtered list of company bank accounts                |
| `GET`    | `/api/company-banks/:id`                 | Get company bank account by numeric ID                                |
| `GET`    | `/api/company-banks/company/:companyId`    | Get all bank accounts for a specific company                          |
| `PUT`    | `/api/company-banks/:id`                 | Update company bank account details                                   |
| `PATCH`  | `/api/company-banks/:id/status`          | Toggle / Update active status (`is_active: true/false`)               |
| `PATCH`  | `/api/company-banks/:id/primary`         | Set account as primary (resets previous primary for the same company) |
| `DELETE` | `/api/company-banks/:id`                 | Delete company bank account record                                    |

---

## 📝 Copy & Paste Request Payloads

### 1. Create Company Bank Account

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/company-banks`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Body**:

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

### 2. Update Company Bank Account

- **Method**: `PUT`
- **URL**: `http://localhost:5000/api/company-banks/1`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Body**:

```json
{
  "branch_name": "Hosur Commercial Branch",
  "branch_code": "1235",
  "current_balance": 75000
}
```

### 3. Update Status

- **Method**: `PATCH`
- **URL**: `http://localhost:5000/api/company-banks/1/status`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Body**:

```json
{
  "is_active": false
}
```

### 4. Mark as Primary

- **Method**: `PATCH`
- **URL**: `http://localhost:5000/api/company-banks/1/primary`
- Resets previous primary bank account for the same company and marks this bank account as primary.
