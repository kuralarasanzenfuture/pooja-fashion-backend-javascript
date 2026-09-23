# Materials Postman Collection & Documentation

This directory contains the API documentation and Postman artifacts for the **Product Master: Materials** module of Pooja Fashion backend.

## Files
- `materials.postman_collection.json`: Complete Postman v2.1 collection with preconfigured requests and collection variables.
- `materials-api-docs.md`: Markdown REST API specification including parameters, payload contracts, and HTTP responses.

## Import into Postman
1. Open Postman.
2. Click **Import** in the top left.
3. Select `materials.postman_collection.json`.
4. Configure collection variables:
   - `baseUrl`: default `http://localhost:5000`
   - `companyId`: default `1`
   - `materialId`: ID of the created material
   - `materialCode`: e.g. `COTTON`
