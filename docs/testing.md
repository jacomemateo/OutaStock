# OutaStock Testing Report

## Table of Contents

1. [Introduction](#1-introduction)
   1. [Purpose of This Document](#11-purpose-of-this-document)
   2. [References](#12-references)
2. [Testing Process](#2-testing-process)
   1. [Description](#21-description)
   2. [Testing Sessions](#22-testing-sessions)
   3. [Impressions of the Process](#23-impressions-of-the-process)
3. [Test Results](#3-test-results)
   1. [Use Case 1: Log-in](#31-use-case-1-log-in)
   2. [Use Case 2: Add Product to Inventory](#32-use-case-2-add-product-to-inventory)
   3. [Use Case 3: Delete Products](#33-use-case-3-delete-products)
   4. [Use Case 4: Update Product Details](#34-use-case-4-update-product-details)
4. [Appendix A - Peer Review Sign-off](#appendix-a---peer-review-sign-off)
5. [Appendix B - Document Contributions](#appendix-b---document-contributions)

## 1. Introduction

### 1.1 Purpose of This Document

This document records the testing approach, test suites, and observed results for the OutaStock vending-machine inventory tracking system. Its intended readers are the OutaStock development team, the course staff, and project stakeholders who need a clear summary of what was tested, how those tests were derived from the Software Requirements Specification (SRS), and what defects or risks still remain. The report is based on the current repository, the SRS, the assignment rubric, and available evidence in the workspace such as the build results and benchmark artifacts. Where full end-to-end execution could not be reproduced in this workspace, the document states that explicitly and keeps the corresponding cases marked as not executed rather than claiming results that were not observed.

### 1.2 References

- `SRS+version+2-1.pdf`
- `Testing-Template.pdf`
- `Sample-Testing-Document.pdf`
- `README.md`
- `docs/ARCHITECTURE.md`
- `Taskfile.yml`
- `benchmarks/k6_new.txt`
- `benchmarks/sql_new.txt`
- Source files under `backend/`, `db/`, and `web/src/`

## 2. Testing Process

### 2.1 Description

The testing process followed for this report was a requirements-first, specification-based process grounded in the SRS use cases and then checked against the implementation that currently exists in the repository. The team’s top-level use cases in the SRS are Log-in, Add Product to Inventory, Delete Products, and Update Product Details, so the black-box suites in Section 3 are organized around those same flows. For each use case, the repository was inspected to identify the externally visible inputs, expected outputs, validation rules, and boundary conditions that a user or API client would encounter. Examples include the login credentials and token response, product cost and price rules, nonnegative inventory quantities, confirmation before deletion, and the unique-price constraint enforced for products currently assigned to inventory.

The process actually reproduced in this workspace was a blend of static verification, smoke verification, and artifact review rather than a full live-system manual test cycle. Static verification included tracing the UI components, frontend service calls, backend handlers, validation DTOs, SQL queries, triggers, and seed data to confirm what the implemented behavior should be. Smoke verification included running `go test ./...` in the backend to confirm the code compiles and `npm run build` in the frontend to confirm the production bundle builds successfully. Existing benchmark artifacts already present in the repository were also reviewed to incorporate prior nonfunctional testing evidence, especially for transaction-related performance.

This is not identical to an ideal fully manual black-box session on a running deployment. Docker was not available in the current workspace during report generation, so full end-to-end execution against a live local stack could not be reproduced here. Instead of inventing outcomes, this report distinguishes among cases that were supported by direct evidence, cases that revealed defects through specification-to-code comparison, and cases that remain designed test cases that should be executed by the team on the running application before submission or demo.

### 2.2 Testing Sessions

| Date | Location | Time Started | Time Ended | Tester(s) | Use Case(s) Covered | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-05-01 | Local repository workspace | 12:30 PM | 12:55 PM | Document author | UC1-UC4 | SRS-to-code traceability review, validation rules, and boundary analysis |
| 2026-05-01 | Local repository workspace | 12:55 PM | 1:00 PM | Document author | UC1-UC4 | Backend smoke verification with `go test ./...`; repository contains no backend automated tests yet |
| 2026-05-01 | Local repository workspace | 1:00 PM | 1:05 PM | Document author | UC1-UC4 | Frontend smoke verification with `npm run build`; build succeeded with a large-chunk warning |
| 2026-04-27 | Repository benchmark artifacts | Artifact review | Artifact review | Prior team benchmark session | Supporting evidence for transactions/performance | Reviewed `benchmarks/k6_new.txt` and `benchmarks/sql_new.txt` |

### 2.3 Impressions of the Process

The testing process was effective at finding specification mismatches even without full live execution because the project has reasonably clear layering between the frontend, backend, and database. The strongest part of the process was tracing a user-visible action from the React component, through the service client and handler, down to validation and SQL. That made it straightforward to derive equivalence classes and boundary values from real code rather than guessing. The main weakness was the lack of reproducible automated tests and the inability to start the full Docker-based environment in this workspace, which means several black-box cases still need to be run manually on a live system before the document can be considered a final execution log.

Before testing, the codebase appeared structurally sound but under-instrumented from a testing perspective: it builds successfully, includes performance benchmark artifacts, and uses clear DTO validations, but it has no automated unit or integration test files. After the analysis performed for this report, the quality outlook is mixed. Core flows such as login, inventory retrieval, and product listing are relatively low risk because their contracts are simple and consistently implemented. In contrast, feature completeness and edge-case handling remain riskier in a few places because the implementation does not fully match the SRS or only partially completes a flow.

The best modular units at this point appear to be authentication/session handling and transaction performance support. Authentication has a clear request/response contract, explicit credential and token logic, and straightforward failure cases. Transaction browsing also has concrete performance evidence in the benchmark artifacts, including a `k6` run whose 95th percentile request time stayed below 300 ms and SQL plans that show indexing support for common transaction queries. The worst modular units appear to be product update behavior and alert/bulk-import related functionality. Product updates contain a logic path that only applies one field when both cost and price are submitted together, and the alerts page plus file-upload path are visibly incomplete relative to the SRS.

## 3. Test Results

### Status Key

- `Pass`: behavior was supported by direct evidence in the workspace or prior benchmark artifacts
- `Fail`: a defect or SRS mismatch was identified
- `Not Executed`: valid black-box test case designed from the SRS, but not reproduced on a live stack in this workspace

### 3.1 Use Case 1: Log-in

**SRS summary:** Admin and student employees log in to access the dashboard.

**Tester:** Document author

**Equivalence Partitions and Boundary Cases**

| Partition ID | Class | Example / Boundary |
| --- | --- | --- |
| UC1-EP1 | Valid active account with correct credentials | `admin@example.com` / `SecurePassword123!` |
| UC1-EP2 | Valid email with incorrect password | `admin@example.com` / `WrongPassword1!` |
| UC1-EP3 | Invalid email syntax | `adminexample.com` |
| UC1-EP4 | Missing required fields | empty email or empty password |
| UC1-EP5 | Valid token-based session refresh | `GET /api/auth/session` with bearer token |

**Test Cases**

| Test ID | Purpose | Preconditions | Exact Input Data | Expected Result | Actual Result | Status |
| --- | --- | --- | --- | --- | --- | --- |
| UC1-T1 | Verify successful admin login | Seed admin exists; auth enabled | `POST /api/auth/login` with `{"email":"admin@example.com","password":"SecurePassword123!"}` | HTTP 200 with bearer token, role, email, and user ID | Supported by seeded credentials in `.env.dev`, login handler/service flow, and benchmark script using the same credentials | Pass |
| UC1-T2 | Verify rejection of wrong password | Admin account exists | `POST /api/auth/login` with `{"email":"admin@example.com","password":"WrongPassword1!"}` | HTTP 401 with invalid credentials message | Handler returns 401 for invalid credentials; not executed live here | Not Executed |
| UC1-T3 | Verify input validation for malformed email | None | `POST /api/auth/login` with `{"email":"adminexample.com","password":"SecurePassword123!"}` | HTTP 400 validation error | DTO requires a valid email format; not executed live here | Not Executed |
| UC1-T4 | Verify required-field validation | None | `POST /api/auth/login` with `{"email":"","password":""}` | HTTP 400 validation error | DTO requires both fields; not executed live here | Not Executed |
| UC1-T5 | Verify session refresh with valid token | Valid access token from successful login | `GET /api/auth/session` with `Authorization: Bearer <token>` | HTTP 200 with refreshed session payload | Supported by router, protected route, and auth revalidation flow; not executed live here | Not Executed |

**Summary**

- Not executed because no live stack was available in this workspace.
- No defects were found in the login flow by specification-to-code comparison.
- This use case is one of the lower-risk parts of the system.

### 3.2 Use Case 2: Add Product to Inventory

**SRS summary:** An authenticated admin selects a slot, fills in inventory data, and updates the inventory. If quantity is low, the system should surface low-stock information.

**Tester:** Document author

**Equivalence Partitions and Boundary Cases**

| Partition ID | Class | Example / Boundary |
| --- | --- | --- |
| UC2-EP1 | Valid slot update with product and positive quantity | slot `1`, product `Coca-Cola`, quantity `5` |
| UC2-EP2 | Boundary quantity at zero | quantity `0` |
| UC2-EP3 | Invalid negative quantity | quantity `-1` |
| UC2-EP4 | Missing product selection | empty `productUUID` |
| UC2-EP5 | Price-conflict rule in inventory | `Coca-Cola` and `Mints` both priced at `159` cents |

**Test Cases**

| Test ID | Purpose | Preconditions | Exact Input Data | Expected Result | Actual Result | Status |
| --- | --- | --- | --- | --- | --- | --- |
| UC2-T1 | Add a product to a slot with a valid normal quantity | Authenticated admin; editable inventory slot exists | `PATCH /api/inventory/1` with `{"productUUID":"<Coca-Cola UUID>","quantity":5}` | Slot updates successfully; product and quantity appear in inventory table | Supported by inventory handler, DTO, mutation flow, and SQL update path; not executed live here | Not Executed |
| UC2-T2 | Verify zero-quantity boundary | Authenticated admin; editable inventory slot exists | `PATCH /api/inventory/1` with `{"productUUID":"<Coca-Cola UUID>","quantity":0}` | Request succeeds; item remains assigned but appears as out of stock | Supported by DTO `gte=0`, DB `quantity >= 0`, and metrics logic for out-of-stock items; not executed live here | Not Executed |
| UC2-T3 | Reject negative quantity | Authenticated admin | `PATCH /api/inventory/1` with `{"productUUID":"<Coca-Cola UUID>","quantity":-1}` | Validation rejects request | DTO allows only `quantity >= 0`; not executed live here | Not Executed |
| UC2-T4 | Prevent submission with no selected product | Authenticated admin; open edit modal | UI form with empty product selection and any quantity | User should not be able to save or backend should reject incomplete data | Frontend modal only saves when a product is selected; live UI not executed here | Not Executed |
| UC2-T5 | Enforce unique-price rule for simultaneously stocked products | One slot already contains `Coca-Cola` at `159` cents | Attempt to assign `Mints` at `159` cents to a different slot | Request should be rejected because different products with the same price cannot coexist in inventory | Supported by database trigger `enforce_unique_price_in_inventory`; not executed live here | Not Executed |
| UC2-T6 | Verify low-stock behavior at threshold edge | Admin authenticated; low-stock threshold configured, for example `3` | Assign quantity `2` to a stocked slot | System should classify the item as low stock in metrics/analytics | Partially supported by threshold and metrics code, but the dedicated alerts page is incomplete | Fail |

**Defects / Risks Detected**

| Defect ID | Description | Likely Cause | Suggested Repair |
| --- | --- | --- | --- |
| D-UC2-1 | Low-stock behavior is only partially implemented from a user perspective. Metrics and threshold logic exist, but the Alerts page is only a shell and does not actually list or manage alerts. | The SRS includes alert viewing/management requirements, but `web/src/components/Alerts/Alerts.tsx` currently renders only static page chrome. | Implement a real alerts data model and UI or clearly scope the requirement down in the SRS. |

### 3.3 Use Case 3: Delete Products

**SRS summary:** Admin chooses a slot/product to delete, receives confirmation, and the chosen slot becomes empty.

**Tester:** Document author

**Equivalence Partitions and Boundary Cases**

| Partition ID | Class | Example / Boundary |
| --- | --- | --- |
| UC3-EP1 | Confirmed deletion from populated inventory slot | slot `1` with assigned product |
| UC3-EP2 | Deletion canceled by user | confirmation dialog dismissed |
| UC3-EP3 | Deletion of already empty slot | slot with no product |
| UC3-EP4 | Deletion from product catalog while product is still assigned in inventory | soft delete on active product |

**Test Cases**

| Test ID | Purpose | Preconditions | Exact Input Data | Expected Result | Actual Result | Status |
| --- | --- | --- | --- | --- | --- | --- |
| UC3-T1 | Delete a product from an inventory slot after confirmation | Authenticated admin; populated slot exists | In Home/Inventory, click delete on a populated slot and confirm | Slot becomes empty and product is removed from that slot | Supported by confirmation modal, remove mutation, and `ClearInventorySlot` path when both fields are null | Not Executed |
| UC3-T2 | Cancel deletion | Authenticated admin; populated slot exists | Open confirmation modal and choose cancel | No change to slot contents | Supported by modal control flow; not executed live here | Not Executed |
| UC3-T3 | Delete from an already empty slot | Authenticated admin; empty slot exists | Trigger remove action on empty slot | System should remain stable and preserve empty state | Not executed live here | Not Executed |
| UC3-T4 | Delete a product from the product catalog while it is still assigned to inventory | Product exists in `product_info` and is referenced by an `inventory` row | `DELETE /api/products/:productID` | Either the slot should be cleared consistently or deletion should be blocked with a clear message | The current implementation soft-deletes the product only. Inventory can then appear empty in the UI because joins hide deleted products, while the underlying inventory row may still retain `product_id` and quantity. | Fail |

**Defects / Risks Detected**

| Defect ID | Description | Likely Cause | Suggested Repair |
| --- | --- | --- | --- |
| D-UC3-1 | Product-catalog deletion does not fully match the SRS behavior that the chosen slot becomes empty. | `DeleteProduct` only sets `date_deleted`, while inventory rows referencing that product are left untouched. Inventory queries then hide the deleted product because they join only active products. | Either prevent deletion of products still assigned to inventory, or clear/reassign dependent inventory rows transactionally when deletion occurs. |

### 3.4 Use Case 4: Update Product Details

**SRS summary:** Admin edits an existing product and saves updated details so the database and UI reflect the change.

**Tester:** Document author

**Equivalence Partitions and Boundary Cases**

| Partition ID | Class | Example / Boundary |
| --- | --- | --- |
| UC4-EP1 | Valid cost-only update | cost from `100` to `110` cents |
| UC4-EP2 | Valid price-only update | price from `159` to `169` cents |
| UC4-EP3 | Valid simultaneous cost-and-price update | cost `100 -> 110`, price `159 -> 169` |
| UC4-EP4 | Boundary invalid zero price | `priceCents = 0` |
| UC4-EP5 | Invalid negative cost | `costCents = -1` |
| UC4-EP6 | Invalid product identifier | malformed UUID |

**Test Cases**

| Test ID | Purpose | Preconditions | Exact Input Data | Expected Result | Actual Result | Status |
| --- | --- | --- | --- | --- | --- | --- |
| UC4-T1 | Update cost only | Authenticated admin; existing product | `PATCH /api/products/:id` with `{"costCents":110}` | Cost changes and UI reflects new value | Supported by handler/service query path; not executed live here | Not Executed |
| UC4-T2 | Update price only | Authenticated admin; existing product | `PATCH /api/products/:id` with `{"priceCents":169}` | Price changes and UI reflects new value | Supported by handler/service query path; not executed live here | Not Executed |
| UC4-T3 | Update cost and price together from the edit modal | Authenticated admin; existing product | Frontend sends `{"costCents":110,"priceCents":169}` | Both values should update together | The frontend sends both fields, but the backend service uses an `if / else if / else if` chain, so only one field is applied per request. | Fail |
| UC4-T4 | Reject zero price | Authenticated admin | `PATCH /api/products/:id` with `{"priceCents":0}` | User should receive a validation error and the product should remain unchanged | Frontend modal blocks zero price, but backend DTO allows `0`; a direct API call would fall through to a database constraint failure and likely return a generic 500. | Fail |
| UC4-T5 | Reject negative cost | Authenticated admin | `PATCH /api/products/:id` with `{"costCents":-1}` | Request rejected as invalid | DTO validation should reject negative cost; not executed live here | Not Executed |
| UC4-T6 | Reject malformed product ID | Authenticated admin | `PATCH /api/products/not-a-uuid` | HTTP 400 invalid product ID | Supported by handler UUID parsing; not executed live here | Not Executed |

**Defects / Risks Detected**

| Defect ID | Description | Likely Cause | Suggested Repair |
| --- | --- | --- | --- |
| D-UC4-1 | Simultaneous updates of cost and price do not both persist. | `ProductsService.UpdateProduct` updates only the first non-nil field because it uses `if / else if / else if` instead of independent updates or a combined query. | Apply both fields when both are present, ideally in one transactional update query. |
| D-UC4-2 | Direct API updates with `priceCents = 0` produce a backend failure path instead of a clean validation error. | DTO validation for update uses `gte=0`, but the database requires `price_cents > 0`. | Tighten the DTO validation to `gt=0` for price updates and return a client-visible 400-level error. |

## Cross-Use-Case Summary

### Test Cases Not Executed

Most live UI/API black-box cases were not executed in this workspace because the full Docker-backed application could not be started here. The most important cases to run manually before submission are:

- invalid-login and token-refresh cases for UC1
- positive, zero, and conflict inventory assignments for UC2
- confirmed and canceled delete flows for UC3
- all UC4 update-product variants after repairing D-UC4-1 and D-UC4-2

### Cases Supported by Direct Evidence

- Backend smoke verification: `go test ./...` completed successfully, but the repository currently contains no automated Go test files.
- Frontend smoke verification: `npm run build` completed successfully.
- Performance evidence: `benchmarks/k6_new.txt` shows `p(95)=88.88ms` for the transaction benchmark and zero failed HTTP requests in that recorded run.

### Overall Defect List

| Defect ID | Severity | Summary |
| --- | --- | --- |
| D-UC4-1 | High | Editing both cost and price together only updates one field |
| D-UC3-1 | High | Product deletion from the catalog does not consistently clear dependent inventory state |
| D-UC4-2 | Medium | Zero-price product updates are not rejected cleanly at the API boundary |
| D-UC2-1 | Medium | Alert viewing/management is incomplete relative to the SRS |

## Appendix A - Peer Review Sign-off

All team members should review this document before submission and confirm that they agree with its content and format. Any minor disagreements should be documented in the comments column below. Major disagreements should be resolved before sign-off.

| Name | Signature | Date | Comments |
| --- | --- | --- | --- |
| Mateo Jacome |  |  |  |
| Jason Chen |  |  |  |
| Max Anderson |  |  |  |

## Appendix B - Document Contributions

Update this table with the final writing contributions before submission.

| Team Member | Contribution |
| --- | --- |
| Mateo Jacome | Finalized project-specific testing details, verified SRS traceability, and reviewed defects |
| Jason Chen | Reviewed test suites and contributed revisions to results, process, and appendices |
| Max Anderson | Reviewed test suites and contributed revisions to results, process, and appendices |
