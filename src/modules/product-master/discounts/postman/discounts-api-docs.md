# Discounts API Documentation

Module responsible for promotional campaigns, coupon slabs, and discount calculations (`034_discounts.sql`). Supports percentage and fixed amount discounts, maximum discount caps, volume purchase minimum quantity thresholds, and real-time POS discount evaluation.

## Base URLs
- `/api/discounts`
- `/api/product-master/discounts`

---

## Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/discounts` | List discounts with search, filters, pagination |
| `GET` | `/api/discounts/:id` | Get single discount by ID |
| `POST` | `/api/discounts` | Create custom discount campaign |
| `PUT` | `/api/discounts/:id` | Update discount details |
| `PATCH`| `/api/discounts/:id/status` | Toggle discount active status |
| `DELETE`| `/api/discounts/:id` | Delete discount (checks if in use) |
| `POST` | `/api/discounts/seed/:companyId` | Seed standard retail promotional discounts |
| `POST` | `/api/discounts/calculate` | Real-time POS discount deduction & savings calculator |

---

## 1. Seed Standard Promotional Discounts
**`POST /api/discounts/seed/:companyId`**

Seeds 5 standard retail promotional discounts:
- `WELCOME10`: 10% off (max ₹500 cap)
- `FLAT500`: Flat ₹500 off
- `SEASON20`: 20% off (max ₹1,000 cap)
- `FESTIVE25`: 25% off (max ₹1,500 cap)
- `BULK15`: 15% off for 5+ items (max ₹2,500 cap, stackable)

---

## 2. Calculate Discount (POS Engine)
**`POST /api/discounts/calculate`**

Evaluates discounts against checkout line items or cart amounts.

### Request Body (By Discount ID)
```json
{
  "amount": 2000.00,
  "quantity": 2,
  "discount_id": "1"
}
```

### Request Body (Direct Parameters)
```json
{
  "amount": 10000.00,
  "quantity": 1,
  "discount_type": "PERCENTAGE",
  "discount_value": 20.0,
  "maximum_discount": 1000.0
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Discount calculated successfully",
  "data": {
    "original_amount": 10000.00,
    "quantity": 1,
    "discount_type": "PERCENTAGE",
    "discount_value": 20.0,
    "raw_discount": 2000.00,
    "applied_discount": 1000.00,
    "maximum_discount_cap": 1000.00,
    "final_amount": 9000.00,
    "savings_percentage": 10.00,
    "is_applicable": true
  }
}
```

---

## 3. Create Custom Discount
**`POST /api/discounts`**

### Request Body
```json
{
  "company_id": "1",
  "discount_code": "FLASH30",
  "discount_name": "Flash Sale 30% Off",
  "discount_type": "PERCENTAGE",
  "discount_value": 30.0,
  "minimum_quantity": 1,
  "maximum_discount": 1500.0,
  "start_at": "2026-09-23T00:00:00.000Z",
  "end_at": "2026-09-30T23:59:59.000Z",
  "priority": 10,
  "is_stackable": false,
  "is_active": true
}
```

---

## 4. List Discounts
**`GET /api/discounts?company_id=1&page=1&limit=20&sort_by=priority&sort_order=desc`**

---

## 5. Update Discount
**`PUT /api/discounts/:id`**

```json
{
  "discount_name": "Flash Sale 30% Off (Extended)",
  "maximum_discount": 2000.00
}
```

---

## 6. Toggle Discount Status
**`PATCH /api/discounts/:id/status`**

```json
{
  "is_active": false
}
```
