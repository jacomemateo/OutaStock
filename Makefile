.PHONY: generate_sqlc create_db connect_db nuke_db backend deps seed

generate_sqlc:
	docker run --rm -v $(shell pwd):/src -w /src sqlc/sqlc generate

create_db:
	docker compose up -d

connect_db:
	docker exec -it vending-db psql -U postgres -d vending

nuke_db:
	docker compose down -v

logs_db:
	docker logs vending-db

# Dependencies
deps:
	cd backend && go mod download && go mod tidy

# Backend development
backend: create_db deps
	cd backend && air

# Run Go server without hot reload
backend-run: create_db deps
	cd backend && go run ./cmd/api

seed:
	docker exec -i vending-db psql -U postgres -d vending < db/seeds/01_products.sql
	docker exec -i vending-db psql -U postgres -d vending < db/seeds/02_transactions.sql