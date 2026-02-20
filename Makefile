.PHONY: generate_sqlc create_db connect_db nuke_db

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