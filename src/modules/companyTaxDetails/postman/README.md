# Company Tax Details API - Postman & Integration Documentation

This directory contains ready-to-use Postman assets and quick copy-paste request templates for the **Company Tax Details** API.

---

## 🚀 Quick Start: Interactive Browser UI (Swagger)

When the backend server is running (`npm run dev`), you can open the interactive Swagger UI in your browser to test and copy-paste API payloads directly:

👉 **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

---

## 📥 How to Import into Postman

1. Open **Postman**.
2. Click **Import** (top left).
3. Drag & drop or select:
   - `company-tax-details.postman_collection.json`
4. All requests will automatically use the `{{baseUrl}}` variable (`http://localhost:5000/api`).

---

## 📋 Endpoints Overview

| Method   | Endpoint                                      | Description                                                           |
| :------- | :-------------------------------------------- | :-------------------------------------------------------------------- |
| `POST`   | `/api/company-tax-details`                  | Create a new company tax detail record                                |
| `GET`    | `/api/company-tax-details`                  | Get paginated & filtered list of company tax details                  |
| `GET`    | `/api/company-tax-details/:id`              | Get company tax detail by numeric ID                                  |
| `GET`    | `/api/company-tax-details/company/:companyId` | Get all tax records for a specific company                            |
| `PUT`    | `/api/company-tax-details/:id`              | Update company tax detail record                                      |
| `PATCH`  | `/api/company-tax-details/:id/status`       | Toggle / Update active status (`is_active: true/false`)               |
| `PATCH`  | `/api/company-tax-details/:id/primary`      | Set tax record as primary (resets previous primary for the company)   |
| `DELETE` | `/api/company-tax-details/:id`              | Delete company tax record                                             |

---

## 📝 Copy & Paste Request Payloads

### 1. Create Company Tax Detail

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/company-tax-details`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Body**:

```json
{
  "company_id": 1,
  "gstin": "33AABCP1234F1Z5",
  "pan_number": "AABCP1234F",
  "tan_number": "CHEP12345A",
  "gst_registration_type": "regular",
  "gst_state_code": "33",
  "tax_registered_name": "Pooja Fashion Shop Private Limited",
  "is_primary": true,
  "is_active": true
}
```

### 2. Update Company Tax Detail

- **Method**: `PUT`
- **URL**: `http://localhost:5000/api/company-tax-details/1`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Body**:

```json
{
  "gst_registration_type": "regular",
  "gstin": "33AABCP1234F2Z8",
  "tax_registered_name": "Pooja Fashion Retail Private Limited"
}
```

### 3. Update Status

- **Method**: `PATCH`
- **URL**: `http://localhost:5000/api/company-tax-details/1/status`
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
- **URL**: `http://localhost:5000/api/company-tax-details/1/primary`
- Resets previous primary tax record for the same company and marks this tax record as primary.
