# Banks, Bank Identifiers & Company Banks API - Postman Documentation

This directory contains ready-to-use Postman assets and quick copy-paste templates for the **Banks Master**, **Bank Identifiers**, and **Company Banks** APIs.

---

## 🚀 Quick Start: Interactive Browser UI (Swagger)

When the backend server is running (`npm run dev`), open the interactive Swagger UI:

👉 **[http://localhost:5000/api/docs](http://localhost:5000/api/docs)**

---

## 📥 How to Import into Postman

1. Open **Postman**.
2. Click **Import** (top left).
3. Select `banks.postman_collection.json`.
4. All requests will automatically use the `{{baseUrl}}` variable (`http://localhost:5000/api`).

---

## 📋 Endpoints Overview

### Banks Master
| Method   | Endpoint                | Description                                |
| :------- | :---------------------- | :----------------------------------------- |
| `POST`   | `/api/banks`            | Create bank master record                  |
| `GET`    | `/api/banks`            | List banks (paginated, filtered, search)   |
| `GET`    | `/api/banks/:id`        | Get bank by ID                             |
| `GET`    | `/api/banks/code/:code` | Get bank by code                           |
| `PUT`    | `/api/banks/:id`        | Update bank master record                  |
| `PATCH`  | `/api/banks/:id/status` | Update active status                       |
| `DELETE` | `/api/banks/:id`        | Delete bank                                |

### Bank Identifiers
| Method   | Endpoint                                     | Description                                |
| :------- | :------------------------------------------- | :----------------------------------------- |
| `POST`   | `/api/bank-identifiers`                      | Create identifier (IFSC, SWIFT, etc.)      |
| `GET`    | `/api/bank-identifiers`                      | List identifiers with filters              |
| `GET`    | `/api/bank-identifiers/:id`                  | Get identifier by ID                       |
| `GET`    | `/api/bank-identifiers/bank/:bankId`         | List all identifiers for a bank            |
| `GET`    | `/api/bank-identifiers/value/:identifierVal` | Lookup branch by code (e.g. IFSC)          |
| `PUT`    | `/api/bank-identifiers/:id`                  | Update identifier details                  |
| `PATCH`  | `/api/bank-identifiers/:id/status`           | Update active status                       |
| `DELETE` | `/api/bank-identifiers/:id`                  | Delete identifier                          |

### Company Banks
| Method   | Endpoint                                    | Description                                |
| :------- | :------------------------------------------ | :----------------------------------------- |
| `POST`   | `/api/company-banks`                        | Create company bank account (FK to bank)   |
| `GET`    | `/api/company-banks`                        | List company bank accounts                 |
| `GET`    | `/api/company-banks/:id`                    | Get company bank account by ID             |
| `GET`    | `/api/company-banks/company/:companyId`     | List all accounts for a company            |
| `PUT`    | `/api/company-banks/:id`                    | Update company bank account                |
| `PATCH`  | `/api/company-banks/:id/status`             | Update active status                       |
| `PATCH`  | `/api/company-banks/:id/primary`            | Mark account as primary (resets previous)  |
| `DELETE` | `/api/company-banks/:id`                    | Delete company bank account                |
