# Product Discounts API Documentation

Module responsible for mapping promotional campaigns to products and variants (`035_product_discounts.sql`), designating primary discounts, bulk assigning discount campaigns, and real-time checkout discount resolution.

## Base URLs
- `/api/product-discounts`
- `/api/product-master/product-discounts`
- `/api/product-master/product_discounts`

---

## Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/product-discounts` | List product discount mappings with filters & pagination |
| `GET` | `/api/product-discounts/:id` | Get single product discount mapping by ID |
| `GET` | `/api/product-discounts/product/:productId` | Get all discounts for a product and its variants |
| `GET` | `/api/product-discounts/resolve` | Resolve effective discount for checkout (Variant-first, fallback to product) |
| `POST` | `/api/product-discounts` | Create new product discount mapping |
| `PUT` | `/api/product-discounts/:id` | Update product discount mapping |
| `PATCH`| `/api/product-discounts/:id/status` | Toggle active status |
| `POST` | `/api/product-discounts/:id/set-primary` | Set discount mapping as primary for its variant or product |
| `POST` | `/api/product-discounts/bulk-assign` | Bulk assign discount campaign across multiple products |
| `DELETE`| `/api/product-discounts/:id` | Delete product discount mapping |

---

## 1. Resolve Effective Discount (POS Engine)
**`GET /api/product-discounts/resolve?company_id=1&product_id=25&variant_id=50&amount=2000.00&quantity=2`**

### Precedence Hierarchy:
1. Variant-level specific discount takes precedence over Product-wide fallback
2. Primary discount takes precedence over non-primary
3. Highest priority discount (`priority` DESC)
4. Valid within `start_at` and `end_at` dates and `is_active = true`

### Response (200 OK)
```json
{
  "success": true,
  "message": "Effective discount resolved successfully",
  "data": {
    "mapping_id": "1",
    "company_id": "1",
    "product_id": "25",
    "product_name": "Premium Cotton Shirt",
    "product_code": "SHIRT-001",
    "variant_id": "50",
    "variant_sku": "SHIRT-001-BLU-L",
    "variant_name": "Blue / Large",
    "discount_id": "3",
    "discount_code": "SEASON20",
    "discount_name": "Seasonal Sale 20%",
    "discount_type": "PERCENTAGE",
    "discount_value": 20.0,
    "minimum_quantity": 1,
    "maximum_discount": 1000.0,
    "priority": 3,
    "is_stackable": false,
    "is_primary": true,
    "original_amount": 2000.00,
    "quantity": 2,
    "raw_discount": 400.00,
    "applied_discount": 400.00,
    "final_amount": 1600.00,
    "savings_percentage": 20.00,
    "is_applicable": true
  }
}
```

---

## 2. Bulk Assign Discount
**`POST /api/product-discounts/bulk-assign`**

```json
{
  "company_id": "1",
  "discount_id": "4",
  "product_ids": ["25", "26", "27"],
  "is_primary": true
}
```

---

## 3. Create Product Discount Mapping
**`POST /api/product-discounts`**

```json
{
  "company_id": "1",
  "product_id": "25",
  "variant_id": "50",
  "discount_id": "3",
  "is_primary": true
}
```
