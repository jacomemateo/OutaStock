# Mid-term Presentation Notes

Note: this repository uses `master` as the default branch, not `main`. The summary below is based on:
- the current `master` branch for Sprint 1 style progress
- the `auth` branch and current working tree for newer Sprint 2 infrastructure/auth work
- recent commits such as `1d2d2d4` (Swagger UI), `1faa4f1` / `c33522b` / `72f7801` (pagination), `9dab96a` (proxy/CORS work), `96ef67b` / `4a19b28` / `e9b96cb` / `002135c` / `30938da` / `493fe17` (production + auth setup)

## 1. Findings of Sprint 1 Review Meeting

### Product Progress
Sprint 1 produced a working foundation of the vending machine inventory tracking system. Based on the `master` branch history, the team completed the core backend/database structure first, then added user-facing functionality in the frontend. The repository shows:

- database schema and migrations for products, inventory, and transactions
- SQL queries and generated data-access code with `sqlc`
- backend services and HTTP handlers for inventory, products, and transactions
- a React frontend with dashboard-related pages such as inventory, alerts, analytics, update products, and transaction views
- Swagger/OpenAPI support for API visibility
- Docker-based development and production setup

### Feedback From Stakeholders
Inferred from the direction of later commits and the backlog, the main stakeholder/team feedback likely centered on:

- make the system easier to deploy and demo consistently
- improve pagination and usability for larger transaction/product datasets
- tighten up the frontend flow and dashboard polish
- improve documentation and API clarity
- prepare the system for real authentication and user/account support

### Increment Review
The Sprint 1 increment appears to have delivered:

- CRUD-style product management
- inventory slot viewing and editing
- transaction viewing with pagination support
- dashboard-oriented UI pages
- a usable API surface and Swagger documentation
- a dockerized workflow suitable for demos and team development

### Adjustment for Next Sprint
Based on the current backlog and branch history, likely backlog adjustments after Sprint 1 included:

- prioritize authentication/user profile work
- improve deployment and production environment reliability
- continue pagination and validation improvements
- add more testing and integration coverage
- improve environment/config handling and operational setup

## 2. Findings of Sprint 1 Retrospective Meeting

### a) What Went Well?

- The team made strong progress on the full stack, not just one layer. The repo shows clear movement from schema design to services, handlers, frontend components, and Docker support.
- The architecture is reasonably modular. Backend code is separated into repository/service/transport layers, which makes the code easier to reason about and extend.
- Tooling adoption went well. The project uses Docker, Task, Go, React, SQL migrations, `sqlc`, and Swagger in a way that supports repeatable local development.
- There is evidence of iterative improvement rather than one large dump of code. Commits on `master` show pagination improvements, API cleanup, UI improvements, docs updates, and deployment work.
- The team clearly responded to product direction changes. The older TODO references LogTo, but the newer branch/worktree has moved to ZITADEL-based auth, which shows adaptability.

### b) What Didn’t Go Well?

- Deployment/auth setup became more complex than the original app-only stack. The recent `auth` branch and current working tree show multiple rounds of fixes around Caddy, Docker networking, runtime env injection, and Terraform state drift.
- Production configuration was fragile for a while. Commits such as the dotenv fix, Caddy updates, and the recent Taskfile work suggest the team had to spend time stabilizing the local production flow.
- Authentication introduced cross-service integration issues: stale Terraform state, mismatched client IDs, callback routing issues, and backend introspection failures.
- Testing is still a gap. The TODO file still lists many integration tests that need to be added.
- Some Scrum artifacts are not captured in the repo itself. For example, JIRA burndown charts, exact stakeholder comments, and meeting notes are not versioned here, which makes retrospective reporting harder.

### c) What Should We Start Doing, Stop Doing, or Continue Doing?

#### Start Doing

- Start capturing short written notes after Sprint Review and Retrospective meetings so stakeholder feedback is preserved alongside the code history.
- Start attaching screenshots or exports from JIRA to a shared docs folder before presentations.
- Start adding lightweight integration tests for the highest-risk paths: auth flow, backend protected routes, and key inventory/product operations.
- Start treating deployment scripts and Terraform as first-class deliverables instead of side work, because they are now essential to demos.

#### Stop Doing

- Stop relying on manual, one-off environment fixes during demos.
- Stop allowing runtime config drift between Terraform outputs and running Docker containers.
- Stop waiting too long to validate production-style flows end-to-end. Several recent issues were only obvious once the full auth stack was exercised together.

#### Continue Doing

- Continue using modular backend layering and focused frontend components.
- Continue using Task and Docker to standardize setup across teammates.
- Continue iterating in small commits that reflect concrete fixes or user-facing improvements.
- Continue improving documentation and operational tooling alongside product features.

## 3. Sprint or Burndown Chart of Sprint 1 & 2 From JIRA

The actual JIRA burndown charts are not stored in this repository, so they need to be inserted manually before presenting.

### Sprint 1 Burndown

Suggested talking points:

- Sprint 1 appears to have focused on building the functional baseline: schema, services, API endpoints, frontend pages, and Docker setup.
- If your chart shows a late burn-down, that would match the repo history, where many user-facing and integration features landed after the core backend/database work.
- If your chart shows steady completion, emphasize that the team successfully moved from a barebones scaffold to a demoable product increment.

Placeholder:

`[Insert Sprint 1 burndown chart screenshot from JIRA here]`

### Sprint 2 Burndown

Suggested talking points:

- Sprint 2 likely includes more integration-heavy work: auth, production deployment flow, proxy configuration, and environment management.
- This type of work tends to create a less linear burndown because tasks uncover hidden dependencies across Docker, Caddy, Terraform, frontend auth, and backend middleware.
- The current branch/worktree shows substantial Sprint 2 progress in authentication and deployment hardening, even if these items took longer than expected.

Placeholder:

`[Insert Sprint 2 burndown chart screenshot from JIRA here]`

## 4. Sprint 2 Backlog Screenshot From JIRA

The JIRA backlog screenshot is also not available in the repo, so this should be inserted manually.

Based on the codebase, Sprint 2 backlog items likely included:

- authentication integration
- user profile support
- deployment stabilization
- testing and validation improvements
- remaining pagination/API refinement

Placeholder:

`[Insert Sprint 2 backlog screenshot from JIRA here]`

## 5. Demo of All Completed Features

### Demo Flow

#### 1. Product Overview

Start by explaining that OutaStock is a vending machine inventory tracking system that manages:

- products and prices
- slot assignments
- inventory quantities
- transaction history

#### 2. Core Completed Features From Sprint 1 / `master`

Show:

- dashboard landing experience
- product management pages
- inventory viewing and editing
- recent transactions and transaction history
- analytics/alerts/settings pages as implemented
- Swagger/API access if useful for demonstrating the backend surface

Repository evidence:

- frontend pages/components under `web/src/components`
- backend handlers under `backend/internal/transport/http/handlers`
- schema and query definitions under `db/`

#### 3. Deployment and Auth Features From Sprint 2 / `auth` + Current Working Tree

Show:

- production stack brought up through Task + Docker
- ZITADEL login flow
- protected frontend dashboard route
- protected backend API routes returning `401` without a token
- profile/session information pulled from the authenticated user

Recent work in the current branch/worktree includes:

- Caddy routing for app and auth traffic
- Docker production integration for ZITADEL
- Terraform-managed ZITADEL project/app setup
- frontend OIDC Authorization Code + PKCE flow
- backend bearer token validation via ZITADEL introspection
- improved `Taskfile.yml` automation for `prod` and `prod-nuke`

### Technical Challenges Solved

- connecting a legacy-style inventory app to a modern auth provider
- aligning Docker networking, reverse proxy rules, and OIDC callback routes
- preventing runtime config drift between Terraform outputs and running containers
- adding API protection without breaking public health checks
- making local production setup more repeatable with Task + Terraform + Compose

## Suggested 20-Minute Presentation Structure

### 1. Sprint 1 Review and Increment Summary

2-3 minutes

### 2. Sprint 1 Retrospective

3-4 minutes

### 3. JIRA Burndown + Sprint 2 Backlog

3-4 minutes

### 4. Live Demo of Completed Features

8-9 minutes

### 5. Wrap-up / Questions

1-2 minutes

## Final Note

This draft is grounded in the repository and recent code changes, but the following items still need to be filled in with your team’s exact materials before presenting:

- exact stakeholder quotes from the Sprint 1 Review
- exact retrospective wording agreed on by the team
- Sprint 1 burndown chart screenshot from JIRA
- Sprint 2 burndown chart screenshot from JIRA
- Sprint 2 backlog screenshot from JIRA
