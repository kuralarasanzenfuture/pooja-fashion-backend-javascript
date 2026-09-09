# Companies API - Postman & Integration Documentation

This directory contains ready-to-use Postman assets and quick copy-paste request templates for the **Companies** API.

---

## 🚀 Quick Start: Interactive Browser UI (Swagger)

When the backend server is running (`npm run dev`), you can open the interactive Swagger UI in your browser to test and copy-paste API payloads directly:

👉 **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

---

## 📥 How to Import into Postman

1. Open **Postman**.
2. Click **Import** (top left).
3. Drag & drop or select:
   - `companies.postman_collection.json`
   - `environments/local.postman_environment.json`
4. In the top-right environment selector in Postman, choose **Pooja Fashion - Local**.
5. All requests will automatically use the `{{baseUrl}}` variable (`http://localhost:5000/api`).

---

## 📋 Endpoints Overview

| Method   | Endpoint                           | Description                                                 |
| :------- | :--------------------------------- | :---------------------------------------------------------- |
| `POST`   | `/api/companies`                   | Create a new company                                        |
| `GET`    | `/api/companies`                   | Get paginated & filtered list of companies                  |
| `GET`    | `/api/companies/:id`               | Get company details by numeric ID                           |
| `GET`    | `/api/companies/code/:companyCode` | Get company details by unique code                          |
| `PUT`    | `/api/companies/:id`               | Update company information                                  |
| `PATCH`  | `/api/companies/:id/status`        | Update company status (`active` / `inactive` / `suspended`) |
| `DELETE` | `/api/companies/:id`               | Delete company record                                       |

---

## 📝 Copy & Paste Request Payloads

### 1. Create Company

- **Method**: `POST`
- **URL**: `http://localhost:5000/api/companies`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Body**:

```json
{
  "company_code": "PFS001",
  "company_name": "Pooja Fashion Shop",
  "legal_name": "Pooja Fashion Shop Private Limited",
  "display_name": "Pooja Fashion",
  "business_type": "Retail",
  "industry_type": "Fashion & Garments",
  "registration_number": "U18109TN2024PTC123456",
  "email": "contact@poojafashion.com",
  "phone": "04344-245678",
  "mobile": "+919876543210",
  "website": "https://www.poojafashion.com",
  "logo_url": "https://www.poojafashion.com/logo.png",
  "default_currency": "INR",
  "country_code": "IN",
  "timezone": "Asia/Kolkata",
  "financial_year_start_month": 4,
  "status": "active"
}
```

#### cURL:

```bash
curl -X POST http://localhost:5000/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "company_code": "PFS001",
    "company_name": "Pooja Fashion Shop",
    "legal_name": "Pooja Fashion Shop Private Limited",
    "display_name": "Pooja Fashion",
    "business_type": "Retail",
    "industry_type": "Fashion & Garments",
    "email": "contact@poojafashion.com",
    "phone": "04344-245678",
    "mobile": "+919876543210",
    "default_currency": "INR",
    "country_code": "IN",
    "status": "active"
  }'
```

---

### 2. Get Companies (Paginated & Filtered)

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/companies?page=1&limit=10&status=active&sortBy=created_at&sortOrder=desc`

#### Query Parameters:

- `page`: Page number (default: `1`)
- `limit`: Items per page (default: `10`, max: `100`)
- `search`: Keyword search across company name, code, and email (optional)
- `status`: `active` | `inactive` | `suspended` (optional)
- `sortBy`: `id` | `company_code` | `company_name` | `created_at` | `status` (default: `created_at`)
- `sortOrder`: `asc` | `desc` (default: `desc`)

#### cURL:

```bash
curl -X GET "http://localhost:5000/api/companies?page=1&limit=10&status=active"
```

---

### 3. Get Company by ID

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/companies/1`

#### cURL:

```bash
curl -X GET http://localhost:5000/api/companies/1
```

---

### 4. Get Company by Company Code

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/companies/code/PFS001`

#### cURL:

```bash
curl -X GET http://localhost:5000/api/companies/code/PFS001
```

---

### 5. Update Company Details

- **Method**: `PUT`
- **URL**: `http://localhost:5000/api/companies/1`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Body**:

```json
{
  "company_name": "Pooja Fashion Retail Ltd",
  "display_name": "Pooja Fashion Main Store",
  "email": "info@poojafashion.com",
  "phone": "04344-245999",
  "mobile": "+919876500000"
}
```

#### cURL:

```bash
curl -X PUT http://localhost:5000/api/companies/1 \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Pooja Fashion Retail Ltd",
    "display_name": "Pooja Fashion Main Store",
    "phone": "04344-245999"
  }'
```

---

### 6. Update Company Status

- **Method**: `PATCH`
- **URL**: `http://localhost:5000/api/companies/1/status`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Body**:

```json
{
  "status": "inactive"
}
```

#### cURL:

```bash
curl -X PATCH http://localhost:5000/api/companies/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "inactive"}'
```

---

### 7. Delete Company

- **Method**: `DELETE`
- **URL**: `http://localhost:5000/api/companies/1`

#### cURL:

```bash
curl -X DELETE http://localhost:5000/api/companies/1
```
