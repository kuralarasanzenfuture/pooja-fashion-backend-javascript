# Taxes API Documentation

Module responsible for company tax master configuration, Indian GST slabs (`032_taxes.sql`), automatic CGST/SGST/IGST splitting, default tax seeding, and real-time POS tax calculations.

## Base URLs
- `/api/taxes`
- `/api/product-master/taxes`

---

## Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/taxes` | List taxes with search, rate filters, pagination |
| `GET` | `/api/taxes/:id` | Get single tax by ID |
| `POST` | `/api/taxes` | Create custom tax slab |
| `PUT` | `/api/taxes/:id` | Update tax slab details |
| `PATCH`| `/api/taxes/:id/status` | Toggle tax active status |
| `DELETE`| `/api/taxes/:id` | Delete tax (checks if in use) |
| `POST` | `/api/taxes/seed/:companyId` | Seed standard Indian GST slabs (0%, 5%, 12%, 18%, 28%) |
| `POST` | `/api/taxes/calculate` | Real-time tax breakdown calculation for POS / billing |

---

## 1. Seed Default GST Taxes
**`POST /api/taxes/seed/:companyId`**

Seeds 5 standard GST slabs if they do not already exist for the company:
- `GST_0`: 0%
- `GST_5`: 5% (CGST 2.5%, SGST 2.5%, IGST 5%)
- `GST_12`: 12% (CGST 6%, SGST 6%, IGST 12%)
- `GST_18`: 18% (CGST 9%, SGST 9%, IGST 18%)
- `GST_28`: 28% (CGST 14%, SGST 14%, IGST 28%)

### Response (200 OK)
```json
{
  "success": true,
  "message": "Default GST taxes seeded successfully",
  "data": {
    "seeded_count": 5,
    "taxes": [
      {
        "id": "1",
        "company_id": "1",
        "tax_code": "GST_0",
        "tax_name": "GST 0%",
        "rate": 0,
        "cgst_rate": 0,
        "sgst_rate": 0,
        "igst_rate": 0,
        "cess_rate": 0,
        "is_inclusive": false,
        "is_active": true
      },
      {
        "id": "2",
        "company_id": "1",
        "tax_code": "GST_5",
        "tax_name": "GST 5%",
        "rate": 5,
        "cgst_rate": 2.5,
        "sgst_rate": 2.5,
        "igst_rate": 5,
        "cess_rate": 0,
        "is_inclusive": false,
        "is_active": true
      }
    ]
  }
}
```

---

## 2. Calculate Tax Breakdown (POS / Checkout Engine)
**`POST /api/taxes/calculate`**

Calculates exact tax breakdown for an amount, handling inclusive or exclusive tax, and intra-state (CGST + SGST) or inter-state (IGST).

### Request Body (Exclusive Example)
```json
{
  "amount": 1000.00,
  "rate": 18.00,
  "is_inter_state": false,
  "is_inclusive": false
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Tax calculation completed successfully",
  "data": {
    "original_amount": 1000.00,
    "taxable_amount": 1000.00,
    "tax_rate": 18.00,
    "tax_amount": 180.00,
    "cgst_rate": 9.00,
    "cgst_amount": 90.00,
    "sgst_rate": 9.00,
    "sgst_amount": 90.00,
    "igst_rate": 0,
    "igst_amount": 0,
    "cess_rate": 0,
    "cess_amount": 0,
    "total_amount": 1180.00,
    "is_inclusive": false,
    "is_inter_state": false
  }
}
```

### Request Body (Inclusive Example)
```json
{
  "amount": 1180.00,
  "rate": 18.00,
  "is_inclusive": true
}
```

---

## 3. Create Custom Tax
**`POST /api/taxes`**

### Request Body
```json
{
  "company_id": "1",
  "tax_code": "GST_FABRIC_5",
  "tax_name": "Fabric GST 5%",
  "tax_type": "GST",
  "rate": 5.0,
  "is_inclusive": false,
  "is_active": true
}
```
*Note: If `cgst_rate`, `sgst_rate`, `igst_rate` are omitted for GST, they are automatically calculated as `rate / 2` and `rate`.*

---

## 4. List Taxes
**`GET /api/taxes?company_id=1&page=1&limit=20&sort_by=rate&sort_order=asc`**

---

## 5. Update Tax
**`PUT /api/taxes/:id`**

```json
{
  "tax_name": "Apparel GST 12%",
  "rate": 12.0
}
```

---

## 6. Toggle Active Status
**`PATCH /api/taxes/:id/status`**

```json
{
  "is_active": false
}
```
