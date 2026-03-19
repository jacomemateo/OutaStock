# OutaStock API Documentation

## Health Check

### `GET /health`

Check if the API service and database are operational.

**Response**

```json
{
  "status": "healthy",
  "db": "connected",
  "time": "2026-02-27 14:39:50.961872 -0500 EST"
}
```

**Status Codes**

* **200 OK** - Service is healthy
* **503 Service Unavailable** - Database disconnected

---

# Transactions

## `GET /api/transactions`

Retrieve a paginated list of recent transactions.

### Query Parameters

| Name        | Type    | Description                                        |
| ----------- | ------- | -------------------------------------------------- |
| num_rows    | integer | Number of transactions to return per page.         |
| page_offset | integer | Zero-based page index (e.g., 0 for page 1, 1 for page 2). |

### Example Request

```bash
curl "http://localhost:8080/api/transactions?num_rows=5&page_offset=0"
```

### Success Response (200)

```json
[
  {
    "id": "019ca08b-1956-75e8-991b-08244a1b6ebd",
    "productName": "Trail Mix",
    "priceAtSaleCents": 249,
    "dateSold": "2026-02-27T01:34:56.496019-05:00"
  }
]
```

### Error Response (500)

```json
{
  "error": "Failed to fetch transactions"
}
```

---

## `GET /api/transactions/count`

Retrieve the total number of transactions in the database. Used for calculating total pages on the frontend.

### Example Request

```bash
curl "http://localhost:8080/api/transactions/count"
```

### Success Response (200)

Returns a raw integer.

```json
54
```

### Error Response (500)

```json
{
  "error": "Failed to get transactions count"
}
```

---

# Inventory

## `GET /api/inventory`

Retrieve inventory slots with pagination.

### Query Parameters

| Name        | Type    | Description                                        |
| ----------- | ------- | -------------------------------------------------- |
| num_rows    | integer | Number of inventory slots to return.               |
| page_offset | integer | Zero-based page index.                             |

### Example Request

```bash
curl "http://localhost:8080/api/inventory?num_rows=10&page_offset=0"
```

### Success Response (200)

```json
[
  {
    "slotId": 1,
    "slotLabel": "A1",
    "quantity": 10,
    "productName": "Trail Mix",
    "priceCents": 249,
    "productId": "019cac06-f112-7c18-874f-78fc806fd57e",
    "dateAdded": "2026-02-27T01:00:00-05:00"
  }
]
```

**Note:** If a slot has no product assigned, product-related fields will be empty or null.

### Error Response (500)

```json
{
  "error": "Failed to fetch inventory"
}
```

---

## `GET /api/inventory/count`

Retrieve the total count of inventory slots.

### Example Request

```bash
curl "http://localhost:8080/api/inventory/count"
```

### Success Response (200)

Returns a raw integer.

```json
20
```

---

## `PATCH /api/inventory/:slotID`

Update an inventory slot (assign product, update quantity, or clear slot).

### URL Parameters

| Name   | Type    | Description       |
| ------ | ------- | ----------------- |
| slotID | integer | Inventory slot ID |

### Request Body

```json
{
  "productUUID": "string (optional)",
  "quantity": 10
}
```

| Field       | Type           | Description                        |
| ----------- | -------------- | ---------------------------------- |
| productUUID | string | null  | Product UUID to assign to the slot |
| quantity    | integer | null | Quantity of items in the slot      |

### Example: Assign Product

```bash
curl -X PATCH "http://localhost:8080/api/inventory/1" \
  -H "Content-Type: application/json" \
  -d '{"productUUID":"019cac06-f112-7f43-a509-42a3ed771d70","quantity":0}'
```

### Example: Clear Slot

```bash
curl -X PATCH "http://localhost:8080/api/inventory/1" \
  -H "Content-Type: application/json" \
  -d '{"productUUID":null,"quantity":null}'
```

### Success Response (200)

```json
{
  "message": "Slot updated successfully"
}
```

### Error Responses

**400 Bad Request**

```json
{
  "error": "Invalid slotID parameter"
}
```

**500 Internal Server Error**

```json
{
  "error": "Failed to update inventory"
}
```

---

# Products

## `GET /api/products`

Retrieve products with pagination.

### Query Parameters

| Name        | Type    | Description                                        |
| ----------- | ------- | -------------------------------------------------- |
| num_rows    | integer | Number of products to return.                      |
| page_offset | integer | Zero-based page index.                             |

### Example Request

```bash
curl "http://localhost:8080/api/products?num_rows=10&page_offset=0"
```

### Success Response (200)

```json
[
  {
    "id": "019cbe99-8159-732f-a262-480494020c64",
    "name": "Coca-Cola",
    "priceCents": 159,
    "dateCreated": "2026-03-05T10:24:17.112673-05:00"
  }
]
```

### Error Response (500)

```json
{
  "error": "Failed to fetch products"
}
```

---

## `GET /api/products/count`

Retrieve the total count of products.

### Example Request

```bash
curl "http://localhost:8080/api/products/count"
```

### Success Response (200)

Returns a raw integer.

```json
15
```

---

## `POST /api/products/new`

Create a new product.

### Request Body

```json
{
  "name": "Sprite",
  "priceCents": 149
}
```

### Success Response (201)

```json
"created product"
```

### Error Response (400)

```json
{
  "Name": "required",
  "PriceCents": "gt"
}
```

---

## `PATCH /api/products/:productID`

Update a product's name or price.

### URL Parameters

| Name      | Type | Description |
| --------- | ---- | ----------- |
| productID | UUID | Product ID  |

### Request Body

At least **one field must be provided**.

```json
{
  "name": "Sprite Zero",
  "priceCents": 169
}
```

### Example Request

```bash
curl -X PATCH "http://localhost:8080/api/products/019cbe99-8159-75ea-b44e-7fec97a7c958" \
  -H "Content-Type: application/json" \
  -d '{"priceCents":175}'
```

### Success Response (202)

```json
"product updated"
```

### Error Responses

**400 Bad Request**

```json
{
  "error": "Invalid productID parameter"
}
```

---

## `DELETE /api/products/:productID`

Soft deletes a product from the database.

> **Note:** Soft delete is used because `transactions` and `inventory` tables have foreign key constraints (`ON DELETE RESTRICT`). This preserves historical data integrity.

### URL Parameters

| Name      | Type | Description |
| --------- | ---- | ----------- |
| productID | UUID | Product ID  |

### Example Request

```bash
curl -X DELETE "http://localhost:8080/api/products/019cd3fa-a89e-73e0-8d0b-2dbfef3e82ad"
```

### Success Response (204)

No Content.

### Error Responses

**400 Bad Request**

```json
{
  "error": "Invalid productID parameter"
}
```

**500 Internal Server Error**

```json
{
  "error": "Failed to update products"
}
```