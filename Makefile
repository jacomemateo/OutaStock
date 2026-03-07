# Load environment variables from .env file
ifneq (,$(wildcard .env))
    include .env
    export
endif
.PHONY: generate_sqlc create_db connect_db nuke_db backend deps seed frontend

# ----------- SQLC -----------
# ----------------------------
# This should be run every time there's a change in the DB structure
generate_sqlc:
	rm -rf backend/internal/repository/*
	docker run --rm -v $(shell pwd):/src -w /src sqlc/sqlc generate

# --------- Database ---------
# ----------------------------
create_db:
	docker compose up -d

connect_db:
	docker exec -it vending-db psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

nuke_db:
	docker compose down -v

logs_db:
	docker logs vending-db

seed:
	docker exec -i vending-db psql -U $(POSTGRES_USER) -d $(POSTGRES_DB) < db/seeds/01_products.sql
	docker exec -i vending-db psql -U $(POSTGRES_USER) -d $(POSTGRES_DB) < db/seeds/02_transactions.sql
	docker exec -i vending-db psql -U $(POSTGRES_USER) -d $(POSTGRES_DB) < db/seeds/03_inventory.sql 

# ---------- Backend ---------
# ----------------------------

# Dependencies
deps:
	cd backend && go mod download && go mod tidy

# Backend development
run-dev: create_db deps
	air

# Run Go server without hot reload
# Just for testing since we're gonna be packaging with
# docker anyway
run-prod: create_db deps
	cd backend && mkdir -p out/prod && go build -ldflags="-s -w" -o ./out/prod/server ./cmd/api && ./backend/out/prod/server 


# --------- Frontend ---------
# ----------------------------
run-frontend:
	cd web && npm install && npm run dev

# ----------- Misc -----------
# ----------------------------
pretty:
	@echo "Formatting frontend..."
	cd web && npm run pretty
	@echo "Formatting backend..."
	cd backend && gofumpt -w . && goimports -w .
	@echo "All done ✅"