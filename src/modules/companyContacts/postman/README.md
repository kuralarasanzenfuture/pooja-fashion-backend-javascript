# Company Contacts API - Postman & Integration Documentation

This directory contains ready-to-use Postman assets and quick copy-paste request templates for the **Company Contacts** API.

---

## 🚀 Quick Start: Interactive Browser UI (Swagger)

When the backend server is running (`npm run dev`), you can open the interactive Swagger UI in your browser to test and copy-paste API payloads directly:

👉 **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

---

## 📥 How to Import into Postman

1. Open **Postman**.
2. Click **Import** (top left).
3. Drag & drop or select:
   - `company-contacts.postman_collection.json`
4. All requests will automatically use the `{{baseUrl}}` variable (`http://localhost:5000/api`).

---

## 📋 Endpoints Overview

| Method   | Endpoint                                  | Description                                                           |
| :------- | :---------------------------------------- | :-------------------------------------------------------------------- |
| `POST`   | `/api/company-contacts`                  | Create a new company contact                                          |
| `GET`    | `/api/company-contacts`                  | Get paginated & filtered list of company contacts                     |
| `GET`    | `/api/company-contacts/:id`              | Get company contact by numeric ID                                     |
| `GET`    | `/api/company-contacts/company/:companyId` | Get all contacts for a specific company                              |
| `PUT`    | `/api/company-contacts/:id`              | Update company contact details                                        |
| `PATCH`  | `/api/company-contacts/:id/status`       | Toggle / Update active status (`is_active: true/false`)               |
| `PATCH`  | `/api/company-contacts/:id/primary`      | Set contact as primary (resets previous primary for the same company) |
| `DELETE` | `/api/company-contacts/:id`              | Delete company contact record                                         |

---

## 📝 Copy & Paste Request Payloads

### 1. Create Company Contact

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/company-contacts`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Body**:

```json
{
  "company_id": 1,
  "contact_type": "manager",
  "contact_name": "Rajesh Kumar",
  "designation": "General Manager",
  "email": "rajesh.kumar@poojafashion.com",
  "phone": "04344-245678",
  "mobile": "+919876543210",
  "is_primary": true,
  "is_active": true
}
```

### 2. Update Company Contact

- **Method**: `PUT`
- **URL**: `http://localhost:5000/api/company-contacts/1`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Body**:

```json
{
  "contact_name": "Rajesh K.",
  "designation": "Senior General Manager",
  "mobile": "+919876543211"
}
```

### 3. Update Status

- **Method**: `PATCH`
- **URL**: `http://localhost:5000/api/company-contacts/1/status`
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
- **URL**: `http://localhost:5000/api/company-contacts/1/primary`
- Resets previous primary contact for the same company and marks this contact as primary.
