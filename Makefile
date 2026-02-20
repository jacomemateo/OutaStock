generate_sqlc:
	docker run --rm -v $(shell pwd):/src -w /src sqlc/sqlc generate

backend:
	docker compose up -d

connect_db:
	docker exec -it vending-db psql -U postgres -d vending