# Product Taxes API Documentation

Module responsible for mapping taxes to products and variants (`033_product_taxes.sql`), managing primary taxes, and providing real-time hierarchical POS tax resolution with product fallback.

## Base URLs
- `/api/product-taxes`
- `/api/product-master/product-taxes`

---

## Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/product-taxes` | List product tax mappings with filters & pagination |
| `GET` | `/api/product-taxes/resolve` | Resolve effective tax for POS checkout (Variant -> Product fallback) |
| `GET` | `/api/product-taxes/product/:productId` | List all taxes configured for a specific product and its variants |
| `GET` | `/api/product-taxes/:id` | Get single product tax mapping by ID |
| `POST` | `/api/product-taxes` | Create new product tax mapping (with atomic primary tax handling) |
| `PUT` | `/api/product-taxes/:id` | Update product tax mapping |
| `PATCH`| `/api/product-taxes/:id/status` | Toggle mapping active status |
| `POST` | `/api/product-taxes/:id/set-primary` | Designate mapping as primary tax |
| `DELETE`| `/api/product-taxes/:id` | Delete product tax mapping |
| `POST` | `/api/product-taxes/bulk-assign` | Bulk assign a tax slab to multiple products |

---

## 1. Resolve Effective Tax (POS Checkout Engine)
**`GET /api/product-taxes/resolve?company_id=1&product_id=25&variant_id=50`**

### Hierarchy Rule
1. Checks for active tax configured specifically for `variant_id = 50`.
2. If none found, automatically falls back to product-level tax (`variant_id IS NULL`).
3. Evaluates `effective_from <= as_of` and `effective_to > as_of`.

### Response (200 OK)
```json
{
  "success": true,
  "message": "Effective tax resolved successfully",
  "data": {
    "id": "15",
    "company_id": "1",
    "product_id": "25",
    "product_name": "Cotton Floral Anarkali",
    "variant_id": "50",
    "variant_sku": "CFA-BLUE-L",
    "tax_id": "3",
    "tax_code": "GST_12",
    "tax_name": "GST 12%",
    "rate": 12.0,
    "cgst_rate": 6.0,
    "sgst_rate": 6.0,
    "igst_rate": 12.0,
    "cess_rate": 0,
    "is_inclusive": false,
    "is_primary": true,
    "resolution_level": "VARIANT"
  }
}
```

---

## 2. Create Product Tax Mapping
**`POST /api/product-taxes`**

### Request Body (Variant-Level)
```json
{
  "company_id": "1",
  "product_id": "25",
  "variant_id": "50",
  "tax_id": "3",
  "is_primary": true
}
```

### Request Body (Product-Wide Level)
```json
{
  "company_id": "1",
  "product_id": "25",
  "tax_id": "3",
  "is_primary": true
}
```

---

## 3. Bulk Assign Tax to Products
**`POST /api/product-taxes/bulk-assign`**

```json
{
  "company_id": "1",
  "tax_id": "4",
  "product_ids": ["25", "26", "27"],
  "is_primary": true
}
```

---

## 4. Set as Primary Tax
**`POST /api/product-taxes/:id/set-primary`**

Atomically sets `is_primary = true` on this record while setting `is_primary = false` on all competing taxes for that variant or product.
