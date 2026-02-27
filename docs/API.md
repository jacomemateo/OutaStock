# OutaStock API Documentation

Base URL (for now): `http://localhost:8080`

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

Status Codes

* **200 OK** - Service is healthy
* **503 Service** Unavailable - Database disconnected

## Transactions

### `GET /api/transactions/recent`
Retrieve the most recent transactions.

Query Parameters

| Name |	Type	| Description	| Default
| --- | --- | --- | ---  |
| limit |	integer |	Number of transactions to return |	10

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
