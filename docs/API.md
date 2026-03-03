Here's an updated section for your API documentation including Inventory endpoints:

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

## Transactions

### `GET /api/transactions/recent`

Retrieve the most recent transactions.

**Query Parameters**

| Name  | Type    | Description                      | Default |
| ----- | ------- | -------------------------------- | ------- |
| limit | integer | Number of transactions to return | 10      |

**Example Request**

```bash
curl "http://localhost:8080/api/transactions/recent?limit=5"
```

**Response**

Success Response (200 OK)

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

Error Response (500 Internal Server Error)

```json
{
  "error": "Failed to fetch transactions"
}
```

---

## Inventory

### `GET /api/inventory/all`

Retrieve all inventory slots.

**Example Request**

```bash
curl "http://localhost:8080/api/inventory/all"
```

**Response**

Success Response (200 OK)

```json
[
  {
    "slotId": 1,
    "quantity": 10,
    "productName": "Trail Mix",
    "priceCents": 249,
    "productId": "019cac06-f112-7c18-874f-78fc806fd57e",
    "dateAdded": "2026-02-27T01:00:00-05:00"
  }
]
```

Error Response (500 Internal Server Error)

```json
{
  "error": "Failed to fetch inventory"
}
```

---

### `PATCH /api/inventory/:slotID`

Update an inventory slot (assign, unassign, or update quantity).

**URL Parameters**

| Name   | Type    | Description              |
| ------ | ------- | ------------------------ |
| slotID | integer | ID of the slot to update |

**Request Body** (JSON)

| Field       | Type               | Description                                     |
| ----------- | ------------------ | ----------------------------------------------- |
| productUUID | string (nullable)  | UUID of product to assign, or null to unassign  |
| quantity    | integer (nullable) | Quantity of product, or null to leave unchanged |

**Example Request: Assign product to slot**

```bash
curl -X PATCH "http://localhost:8080/api/inventory/1" \
  -H "Content-Type: application/json" \
  -d '{"productUUID": "019cac06-f112-7c18-874f-78fc806fd57e", "quantity": 0}'
```

**Example Request: Unassign product**

```bash
curl -X PATCH "http://localhost:8080/api/inventory/1" \
  -H "Content-Type: application/json" \
  -d '{"productUUID": null, "quantity": null}'
```

**Response**

Success Response (200 OK)

```json
{
  "message": "Slot updated successfully"
}
```

Error Response (400 Bad Request)

```json
{
  "error": "Invalid slotID parameter"
}
```

Error Response (500 Internal Server Error)

```json
{
  "error": "Failed to update inventory"
}
```
