# System Architecture

This document is the technical source of truth for OutaStock as of April 2026. It describes the system that is currently implemented, how the pieces fit together locally, and the likely cloud deployment direction.

## 1. System Goals

OutaStock is a vending machine inventory tracking system designed to:

* manage products and prices
* track inventory counts
* record transactions
* support dashboard-driven admin workflows
* secure the dashboard and API with authentication

The system is built to separate concerns cleanly between UI, API, persistence, and authentication.

## 2. Core Stack

| Layer | Technology | Notes |
| --- | --- | --- |
| Frontend | React + TypeScript + Vite | Dashboard UI, OIDC login flow, local HMR in development |
| Backend | Go | REST API, business logic, auth enforcement |
| HTTP Framework | Echo | Routing, middleware, JSON responses, CORS |
| Database | PostgreSQL | Stores products, inventory, and transaction data |
| Auth | ZITADEL | OIDC login for frontend, token validation for backend |
| IaC | Terraform | Bootstraps local ZITADEL org/project/apps/user state |
| Reverse Proxy | Caddy | Routes `localhost`, `api.localhost`, and `auth.localhost` |
| Codegen | sqlc | Generates type-safe Go database access from SQL |
| Dev Reload | Air + Vite | Hot reload for backend and frontend during development |

## 3. Repository Structure

The project uses a monorepo layout so the frontend, backend, Docker config, and Terraform config evolve together.

```text
.
├── backend/              # Go API, services, repositories, router, config
├── db/                   # SQL schema, queries, and seed data
├── docs/                 # Architecture and API documentation
├── terraform/            # Local ZITADEL bootstrap and env export scripts
├── web/                  # React + Vite frontend
├── docker-compose.yml    # Production-style local stack
├── docker-compose.dev.yml
├── Caddyfile
├── Caddyfile.dev
├── Taskfile.yml
└── README.md
```

## 4. Runtime Architecture

### Production-style local runtime

The production workflow is fully containerized and is intended to behave like a realistic integrated deployment.

Main runtime components:

* `frontend`
  * serves the built React app
  * reads auth settings from generated env
* `backend`
  * serves the API
  * validates access tokens with ZITADEL
* `db`
  * stores application data
* `zitadel-api`
  * core identity service
* `zitadel-login`
  * hosted login UI
* `zitadel-db`
  * dedicated PostgreSQL instance for ZITADEL
* `caddy`
  * public entrypoint and reverse proxy

Public local endpoints:

* `http://localhost` -> frontend
* `http://localhost/api/*` -> backend
* `http://api.localhost` -> backend / Swagger access
* `http://auth.localhost` -> ZITADEL

### Development runtime

Development uses a hybrid setup to preserve fast feedback loops:

Docker runs:

* app database
* Swagger
* Caddy
* ZITADEL services

Local processes run:

* Go backend via `air`
* React frontend via Vite

This gives the team:

* real auth integration
* real database access
* hot reload for backend and frontend
* no Docker rebuild on every code change

## 5. Request Flow

### Authenticated dashboard flow

1. A user opens the frontend.
2. The frontend checks whether a valid local session exists.
3. If not authenticated, the user is sent to ZITADEL using OIDC + PKCE.
4. ZITADEL redirects back to the frontend callback route.
5. The frontend exchanges the authorization code for tokens.
6. The frontend stores the session and attaches the bearer token to API requests.
7. The backend middleware introspects the token with ZITADEL.
8. If valid, the backend serves the protected API response.

### API request flow

1. The React client calls `/api/...`.
2. Caddy forwards the request to the backend.
3. The backend router applies auth middleware to protected routes.
4. The handler calls the appropriate service.
5. The service uses repository/sqlc code to query or mutate PostgreSQL.
6. The backend returns JSON to the frontend.

## 6. Backend Architecture

The Go backend follows a layered design.

### Entry and configuration

Key files:

* [backend/cmd/api/main.go](/Users/mateo/Code/School/CMSC447/OutaStock/backend/cmd/api/main.go)
* [backend/cmd/config.go](/Users/mateo/Code/School/CMSC447/OutaStock/backend/cmd/config.go)

Responsibilities:

* load environment/config
* initialize services
* initialize database access
* start the Echo server

### Transport layer

Key file:

* [backend/internal/transport/router.go](/Users/mateo/Code/School/CMSC447/OutaStock/backend/internal/transport/router.go)

Responsibilities:

* define routes
* configure middleware
* apply CORS
* expose public and protected API groups

Auth middleware lives under the transport layer and enforces bearer token validation before protected endpoints run.

### Service layer

Key files:

* [backend/internal/service/products_service.go](/Users/mateo/Code/School/CMSC447/OutaStock/backend/internal/service/products_service.go)
* [backend/internal/service/inventory_service.go](/Users/mateo/Code/School/CMSC447/OutaStock/backend/internal/service/inventory_service.go)
* [backend/internal/service/transactions_service.go](/Users/mateo/Code/School/CMSC447/OutaStock/backend/internal/service/transactions_service.go)

Responsibilities:

* business logic
* validation orchestration
* shaping repository data into app-level behavior

### Repository layer

Key files:

* [backend/internal/repository/db.go](/Users/mateo/Code/School/CMSC447/OutaStock/backend/internal/repository/db.go)
* sqlc-generated files in [backend/internal/repository](/Users/mateo/Code/School/CMSC447/OutaStock/backend/internal/repository)

Responsibilities:

* execute SQL queries
* map rows to typed Go structs
* keep database access strongly typed

### Domain layer

Key files:

* [backend/internal/domain/product.go](/Users/mateo/Code/School/CMSC447/OutaStock/backend/internal/domain/product.go)
* [backend/internal/domain/inventory.go](/Users/mateo/Code/School/CMSC447/OutaStock/backend/internal/domain/inventory.go)

Responsibilities:

* define core domain models
* keep service contracts explicit

## 7. Frontend Architecture

The frontend is a React single-page application built with TypeScript and Vite.

### App shell and routing

Key files:

* [web/src/main.tsx](/Users/mateo/Code/School/CMSC447/OutaStock/web/src/main.tsx)
* [web/src/App.tsx](/Users/mateo/Code/School/CMSC447/OutaStock/web/src/App.tsx)

Responsibilities:

* boot the React app
* provide global contexts
* define routes
* protect dashboard routes

### Auth state and OIDC logic

Key files:

* [web/src/contexts/AuthContext.tsx](/Users/mateo/Code/School/CMSC447/OutaStock/web/src/contexts/AuthContext.tsx)
* [web/src/services/auth.ts](/Users/mateo/Code/School/CMSC447/OutaStock/web/src/services/auth.ts)
* [web/src/components/AuthCallback.tsx](/Users/mateo/Code/School/CMSC447/OutaStock/web/src/components/AuthCallback.tsx)
* [web/src/components/ProtectedRoute.tsx](/Users/mateo/Code/School/CMSC447/OutaStock/web/src/components/ProtectedRoute.tsx)

Responsibilities:

* discover ZITADEL OIDC endpoints
* start login with PKCE
* complete the auth callback
* persist session data
* expose auth state to the rest of the app

### API access

Key file:

* [web/src/services/api.tsx](/Users/mateo/Code/School/CMSC447/OutaStock/web/src/services/api.tsx)

Responsibilities:

* call backend endpoints
* attach the bearer token when present
* normalize frontend API access patterns

### Dashboard UI

Representative files:

* [web/src/components/Dashboard.tsx](/Users/mateo/Code/School/CMSC447/OutaStock/web/src/components/Dashboard.tsx)
* [web/src/components/Inventory.tsx](/Users/mateo/Code/School/CMSC447/OutaStock/web/src/components/Inventory.tsx)
* [web/src/components/UpdateProducts.tsx](/Users/mateo/Code/School/CMSC447/OutaStock/web/src/components/UpdateProducts.tsx)
* [web/src/components/RecentTransactions.tsx](/Users/mateo/Code/School/CMSC447/OutaStock/web/src/components/RecentTransactions.tsx)
* [web/src/components/Profile.tsx](/Users/mateo/Code/School/CMSC447/OutaStock/web/src/components/Profile.tsx)

Responsibilities:

* render inventory and transaction views
* show authenticated user context
* provide management actions for products and inventory

## 8. Authentication Architecture

Authentication is one of the most important recent additions to the system.

### ZITADEL responsibilities

ZITADEL handles:

* user sign-in
* organization/project/application management
* token issuance
* token introspection
* the admin console

### Terraform responsibilities

Terraform bootstraps local auth configuration by creating or managing:

* the application organization context
* the local project
* the frontend OIDC application
* the backend API application
* the admin human user
* org membership

Terraform also exports runtime values consumed by Docker and dev tooling.

### Frontend auth model

The frontend uses:

* OIDC Authorization Code Flow with PKCE
* browser-local session persistence
* runtime-configured issuer/client settings

### Backend auth model

The backend uses:

* bearer token middleware
* ZITADEL token introspection
* issuer and audience checks

Protected API routes fail closed when auth is missing or invalid.

## 9. Infrastructure as Code and Environment Generation

The `terraform/` directory is used for local auth automation.

Important files:

* [terraform/main.tf](/Users/mateo/Code/School/CMSC447/OutaStock/terraform/main.tf)
* [terraform/variables.tf](/Users/mateo/Code/School/CMSC447/OutaStock/terraform/variables.tf)
* [terraform/outputs.tf](/Users/mateo/Code/School/CMSC447/OutaStock/terraform/outputs.tf)
* [terraform/export-web-env.sh](/Users/mateo/Code/School/CMSC447/OutaStock/terraform/export-web-env.sh)
* [terraform/export-backend-env.sh](/Users/mateo/Code/School/CMSC447/OutaStock/terraform/export-backend-env.sh)
* [terraform/export-dev-env.sh](/Users/mateo/Code/School/CMSC447/OutaStock/terraform/export-dev-env.sh)

Generated artifacts include:

* `terraform/zitadel-web.env`
* `terraform/zitadel-backend.env`
* `.env.dev.local`
* `web/.env.local`

These files bridge Terraform outputs into runtime application config.

## 10. Local Operations Model

The project currently supports two main local workflows.

### Production-style integration workflow

Used when the team wants to test the full stack exactly as containers run together.

Primary command:

```bash
task prod
```

### Fast development workflow

Used when the team wants hot reload while keeping real infrastructure dependencies.

Primary commands:

```bash
task dev
task dev-back
task dev-front
```

This split keeps development fast without giving up real auth and database integration.

## 11. Cloud Deployment Direction

This section is intentionally flexible because the team has not finalized the AWS deployment plan yet.

### What is decided

The application will likely remain split into these logical pieces:

* frontend
* backend API
* PostgreSQL database
* authentication provider
* reverse proxy / ingress layer

### What is not finalized yet

The exact AWS services are still under discussion. Possible directions include:

* frontend on S3 + CloudFront
* backend on ECS, App Runner, EC2, or Elastic Beanstalk
* PostgreSQL on RDS
* auth remaining on self-hosted ZITADEL or moving behind a managed deployment strategy
* ingress via ALB, CloudFront, Nginx, or Caddy depending on the final hosting model

### Current recommendation

Until the team decides on AWS services, treat the Docker + Caddy + Terraform local stack as the authoritative reference architecture. The cloud deployment should preserve the same logical boundaries even if the concrete AWS services change.

## 12. Data and Schema Tooling

Database access is generated from SQL using `sqlc`.

Typical workflow:

1. update schema or queries
2. regenerate code
3. update services/handlers as needed

Command:

```bash
task generate_sqlc
```

## 13. Documentation References

Additional project docs:

* [README.md](/Users/mateo/Code/School/CMSC447/OutaStock/README.md)
* [API.md](/Users/mateo/Code/School/CMSC447/OutaStock/docs/API.md)
* [terraform/README.md](/Users/mateo/Code/School/CMSC447/OutaStock/terraform/README.md)

## 14. Summary

The current system is no longer just a basic Go + React + Postgres app. It is now a multi-service local platform with:

* authenticated frontend access
* protected backend APIs
* Terraform-managed local identity configuration
* containerized integration workflows
* hot-reload development workflows

That is the architecture future deployment decisions should build on.
