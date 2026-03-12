# OutaStock API Documentation

Base URL: `http://localhost:8080`

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

## `GET /api/transactions/recent`

Retrieve the most recent transactions.

### Query Parameters

| Name  | Type    | Description                              |
| ----- | ------- | ---------------------------------------- |
| limit | integer | Number of transactions to return (1-200) |

### Example Request

```bash
curl "http://localhost:8080/api/transactions/recent?limit=5"
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

### Error Responses

**400 Bad Request**

```json
{
  "error": "Invalid limit parameter"
}
```

```json
{
  "error": "Limit must be between 1 and 200"
}
```

```json
{
  "error": "Limit parameter is required"
}
```

**500 Internal Server Error**

```json
{
  "error": "Failed to fetch transactions"
}
```

---

# Inventory

## `GET /api/inventory/all`

Retrieve all inventory slots.

### Example Request

```bash
curl "http://localhost:8080/api/inventory/all"
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

If a slot has **no product assigned**, fields related to the product will be empty:

```json
{
  "slotId": 5,
  "slotLabel": "B3",
  "quantity": 0,
  "productName": "",
  "priceCents": 0,
  "productId": "",
  "dateAdded": null
}
```

### Error Response (500)

```json
{
  "error": "Failed to fetch inventory"
}
```

---

## `PATCH /api/inventory/:slotID`

Update an inventory slot.

This endpoint supports:

* Assigning a product to a slot
* Updating the quantity
* Removing a product from a slot

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

### Example: Update Quantity

```bash
curl -X PATCH "http://localhost:8080/api/inventory/1" \
  -H "Content-Type: application/json" \
  -d '{"quantity":50}'
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

Retrieve products with optional pagination.

### Query Parameters

| Parameter   | Type | Description                               |
| ----------- | ---- | ----------------------------------------- |
| num_rows    | int  | Number of products to return |
| page_offset | int  | Zero-based page index. Default:         |

### Example Request

```bash
curl "http://localhost:8080/api/products?num_rows=10&page_offset=2"
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

### Notes

* Pagination ensures that large datasets can be retrieved efficiently.
* The last page will return fewer rows if there are not enough products to fill it.


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

Validation errors return the failing fields:

```json
{
  "Name": "required",
  "PriceCents": "gt"
}
```

### Error Response (500)

```json
{
  "error": "Failed to create new product"
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

| Field      | Type           | Description            |
| ---------- | -------------- | ---------------------- |
| name       | string | null  | Updated product name   |
| priceCents | integer | null | Updated price in cents |

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

**500 Internal Server Error**

```json
{
  "error": "Failed to update products"
}
```

---
## `DELETE /api/products/:productID`
Soft deletes product from database, reason for soft delete is beacuse all transaction and inventory data depends on the product UUID so both the transactions and inventory tables have constraints on deleteing product_info rows.

```sql
CREATE TABLE transactions (
    product_id UUID REFERENCES product_info(product_id) ON DELETE RESTRICT NOT NULL
    ...
);

CREATE TABLE inventory (
    product_id UUID REFERENCES product_info(product_id) ON DELETE RESTRICT,
    ...
);
```

### URL Parameters

| Name      | Type | Description |
| --------- | ---- | ----------- |
| productID | UUID | Product ID  |

### Example Request

```bash
curl -X DELETE "http://localhost:8080/api/products/019cd3fa-a89e-73e0-8d0b-2dbfef3e82ad"
```

### Success Response (204)

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