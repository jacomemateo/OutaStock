# 🏗️ System Architecture & Stack Blueprint

This document serves as the "Technical Source of Truth" for our Software Engineering semester project. It outlines our choices, how the data flows, and how to maintain the environment.

---

## 1. The Core Stack

We are using a **strictly-typed** stack to minimize runtime errors and ensure seamless integration between the backend and frontend.

| Component | Technology | Reasoning |
| --- | --- | --- |
| **Backend** | **Go (Golang)** | Type-safe, high performance, and compiles to a tiny single binary. |
| **Framework** | **Echo** | Handles JSON marshaling and CORS out-of-the-box for our React client. |
| **Frontend** | **React (TypeScript + Vite)** | TypeScript ensures our data models match the backend. Vite provides instant HMR. |
| **Database** | **PostgreSQL** | Relational integrity is required for mapping complex legacy transaction data. |

---

## 2. Project Directory Structure

We use a **Mono-repo** design. This allows us to keep our frontend and backend in sync within a single version-controlled repository.

```text
.
├── .github/workflows/   # CI/CD (GitHub Actions)
├── backend/
│   ├── .air.toml        # Hot-reload configuration
│   ├── cmd/api/         # Main entry point (main.go)
│   ├── db/              # SQL Migrations and sqlc queries
│   ├── Dockerfile       # Multi-stage build (Dev & Prod)
│   └── internal/        # Domain-driven design (Logic & Data)
├── docs/                # Architecture and API documentation
├── web/                 # React (TS) frontend (Vite setup)
├── docker-compose.yml   # Local environment orchestrator
└── README.md            # Project overview & onboarding

```



---

## 3. Data Flow & Layered Logic

Our backend follows a clean, layered architecture to separate concerns. This is vital because our "Inventory Inference Engine" will be complex.

* **Transport (Echo Handlers):** Only handles HTTP requests and JSON responses.
  
  *  **router.go**: Where we'll define the routes, entry point for JSON data, hands off data to correct handler
  
  * **HTTP**: This folder handles HTTP connections.
    * **DTO (Data Transfer Objects)** The actual structs that we'll be sending back and forth between the front end and the backend.
    * **Handlers** Functions that decide what do do with the DTOs. Communicates with the service layer.

* **Service (Business Logic):** The "Brain." This layer will deduce inventory levels based on transaction prices and mapping probabilities.
* **Repository (Data Access):** Uses **sqlc** generated code to perform type-safe SQL queries.
* **Domain (Models):** Defines our shared structs (e.g., `Machine`, `Product`, `Transaction`) used across all layers.

---

## 4. The "Docker Split" (Environment Strategy)

We utilize Docker differently depending on where the code is running:

### 🛠️ Local Development

* **Go & Postgres:** Run inside Docker containers to ensure identical environments for all team members.
* **React:** Runs **natively** on the host machine (`npm run dev`) for the best developer experience and debugging speed.
* **Hot Reloading:** `Air` watches the `backend/` folder and re-compiles the Go binary automatically on save.

### 🚀 Production (Render)

* **Backend:** Render builds our `backend/Dockerfile` (the `prod` stage) and deploys it as a Web Service.
* **Database:** We use **Render Managed PostgreSQL** (not a Docker container) for persistent, backed-up storage.
* **Frontend:** Deployed as a **Static Site** on Render’s CDN for maximum performance.

---

## 5. Automation (DevOps)

* **GitHub Actions:**
* **CI:** Every Pull Request triggers Go tests and TypeScript linting.
* **CD:** Merges to `main` automatically signal Render to pull the latest image and redeploy.


* **sqlc:** We write raw SQL in `db/queries/`. Running `sqlc generate` creates the Go code for us, ensuring our database and code are always in sync.

---

## 6. Living Documentation

* **Stakeholder Notes:** Kept in [Notion] (Link to be added).
* **API Spec:** Defined in `docs/API_SPEC.md`.
* **Database Schema:** Managed via migrations in `backend/db/migrations/`.
