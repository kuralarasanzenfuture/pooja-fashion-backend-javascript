# Product Prices & Price History API Documentation

Module responsible for managing retail, wholesale, special, and online pricing for product variants (`030_product_prices.sql`) along with complete immutable audit trail tracking (`031_product_price_history.sql`).

## Base URLs
- `/api/product-prices`
- `/api/product-master/product-prices`

---

## Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/product-prices` | List product prices with search, filters, pagination |
| `GET` | `/api/product-prices/current` | Resolve current active price for POS or billing |
| `GET` | `/api/product-prices/history` | List global price change audit logs |
| `GET` | `/api/product-prices/:id` | Get price details by ID |
| `GET` | `/api/product-prices/:id/history` | Get audit history for a specific price ID |
| `POST` | `/api/product-prices` | Create a new price record (records initial audit trail) |
| `PUT` | `/api/product-prices/:id` | Update price (records audit trail of price changes) |
| `PATCH`| `/api/product-prices/:id/status` | Toggle price active status |
| `DELETE`| `/api/product-prices/:id` | Delete price record |

---

## 1. Create Product Price
**`POST /api/product-prices`**

### Request Body
```json
{
  "company_id": "1",
  "product_id": "25",
  "variant_id": "50",
  "price_type": "RETAIL",
  "purchase_price": 650.00,
  "cost_price": 720.50,
  "mrp": 1999.00,
  "selling_price": 1499.00,
  "min_selling_price": 1299.00,
  "currency_code": "INR",
  "effective_from": "2026-09-01T00:00:00.000Z",
  "effective_to": null,
  "is_active": true,
  "reason": "Initial catalog pricing"
}
```

### Business Rules & Validations
- `mrp >= selling_price` (selling price cannot exceed MRP).
- `selling_price >= min_selling_price` (minimum selling price cannot exceed selling price).
- If `effective_to` is provided, `effective_to > effective_from`.
- If new price is `is_active: true`, any overlapping active price for this variant & price type has its `effective_to` updated automatically.
- Automatically inserts an initial audit entry in `product_price_history`.

---

## 2. Get Current Active Price (POS Checkout Lookup)
**`GET /api/product-prices/current?variant_id=50&price_type=RETAIL`**

### Query Parameters
- `variant_id` (required): Variant ID
- `price_type` (optional): Default `RETAIL`
- `as_of` (optional): ISO timestamp (defaults to current server time)

### Response (200 OK)
```json
{
  "success": true,
  "message": "Current product price retrieved successfully",
  "data": {
    "id": "10",
    "company_id": "1",
    "company_name": "Pooja Fashion Pvt Ltd",
    "product_id": "25",
    "product_name": "Silk Anarkali Kurti",
    "variant_id": "50",
    "variant_sku": "SAK-RED-XL",
    "price_type": "RETAIL",
    "purchase_price": 650.00,
    "cost_price": 720.50,
    "mrp": 1999.00,
    "selling_price": 1499.00,
    "min_selling_price": 1299.00,
    "currency_code": "INR",
    "effective_from": "2026-09-01T00:00:00.000Z",
    "effective_to": null,
    "is_active": true
  }
}
```

---

## 3. List Product Prices
**`GET /api/product-prices?variant_id=50&page=1&limit=20`**

### Query Parameters
- `page`, `limit`
- `sort_by`: `effective_from` (default), `selling_price`, `mrp`, `id`, `created_at`
- `sort_order`: `desc` (default) or `asc`
- `company_id`, `product_id`, `variant_id`
- `price_type` (`RETAIL`, `WHOLESALE`, `SPECIAL`, `ONLINE`)
- `is_active` (`true`, `false`)
- `search`

---

## 4. Update Product Price
**`PUT /api/product-prices/:id`**

### Request Body
```json
{
  "selling_price": 1399.00,
  "min_selling_price": 1199.00,
  "reason": "Festival season promotional discount"
}
```

### Audit Trail
- Automatically detects differences between old prices and new prices.
- Writes historical entry in `product_price_history` recording `old_selling_price: 1499.00`, `new_selling_price: 1399.00`, `reason: "Festival season promotional discount"`, and `changed_by: user_id`.

---

## 5. Toggle Price Active Status
**`PATCH /api/product-prices/:id/status`**

### Request Body
```json
{
  "is_active": false,
  "reason": "Discontinued price tier"
}
```

---

## 6. Price Change Audit History
**`GET /api/product-prices/history?variant_id=50`**

### Response (200 OK)
```json
{
  "success": true,
  "message": "Price history retrieved successfully",
  "data": [
    {
      "id": "101",
      "company_id": "1",
      "product_id": "25",
      "variant_id": "50",
      "variant_sku": "SAK-RED-XL",
      "product_price_id": "10",
      "price_type": "RETAIL",
      "old_selling_price": 1499.00,
      "new_selling_price": 1399.00,
      "reason": "Festival season promotional discount",
      "changed_by": "2",
      "changed_by_name": "Admin User",
      "changed_at": "2026-09-23T00:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "total_pages": 1
  }
}
```
