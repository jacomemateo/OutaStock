package main

import (
	"context"
	"log"

	"github.com/jacomemateo/OutaStock/backend/internal/transport"
	"github.com/jacomemateo/OutaStock/backend/internal/service"
)

func main() {
	connectionString := "postgres://postgres:secret@localhost:5432/vending?sslmode=disable"
	ctx := context.Background()

	db, err := service.NewDatabase(ctx, connectionString)
	if err != nil {
    	log.Fatal("Failed to connect to database: ", err)
	}
	defer db.Close()

	router := transport.NewRouter(db)
	if err := router.Start(); err != nil {
		log.Fatal("Failed to start ECHO server: ", err)
	}

	log.Println("Database connection closed")
}
