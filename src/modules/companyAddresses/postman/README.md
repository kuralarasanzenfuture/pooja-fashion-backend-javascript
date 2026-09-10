# Company Addresses API - Postman & Integration Documentation

This directory contains ready-to-use Postman assets and quick copy-paste request templates for the **Company Addresses** API.

---

## 🚀 Quick Start: Interactive Browser UI (Swagger)

When the backend server is running (`npm run dev`), you can open the interactive Swagger UI in your browser to test and copy-paste API payloads directly:

👉 **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

---

## 📥 How to Import into Postman

1. Open **Postman**.
2. Click **Import** (top left).
3. Drag & drop or select:
   - `company-addresses.postman_collection.json`
4. All requests will automatically use the `{{baseUrl}}` variable (`http://localhost:5000/api`).

---

## 📋 Endpoints Overview

| Method   | Endpoint                                    | Description                                                           |
| :------- | :------------------------------------------ | :-------------------------------------------------------------------- |
| `POST`   | `/api/company-addresses`                    | Create a new company address                                          |
| `GET`    | `/api/company-addresses`                    | Get paginated & filtered list of company addresses                    |
| `GET`    | `/api/company-addresses/:id`                | Get company address by numeric ID                                     |
| `GET`    | `/api/company-addresses/company/:companyId` | Get all addresses for a specific company                              |
| `PUT`    | `/api/company-addresses/:id`                | Update company address details                                        |
| `PATCH`  | `/api/company-addresses/:id/status`         | Toggle / Update active status (`is_active: true/false`)               |
| `PATCH`  | `/api/company-addresses/:id/primary`        | Set address as primary (resets previous primary for the same company) |
| `DELETE` | `/api/company-addresses/:id`                | Delete company address record                                         |

---

## 📝 Copy & Paste Request Payloads

### 1. Create Company Address

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/company-addresses`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Body**:

```json
{
  "company_id": 1,
  "address_type": "registered",
  "address_line_1": "123 Textile Market Road",
  "address_line_2": "Suite 400",
  "city": "Hosur",
  "district": "Krishnagiri",
  "state": "Tamil Nadu",
  "postal_code": "635109",
  "country": "India",
  "landmark": "Near Old Bus Stand",
  "is_primary": true,
  "is_active": true
}
```

### 2. Update Company Address

- **Method**: `PUT`
- **URL**: `http://localhost:5000/api/company-addresses/1`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Body**:

```json
{
  "address_type": "head_office",
  "address_line_1": "456 Commercial Street",
  "city": "Hosur",
  "state": "Tamil Nadu",
  "postal_code": "635109"
}
```

### 3. Update Status

- **Method**: `PATCH`
- **URL**: `http://localhost:5000/api/company-addresses/1/status`
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
- **URL**: `http://localhost:5000/api/company-addresses/1/primary`
- Resets previous primary address for the same company and marks this address as primary.
