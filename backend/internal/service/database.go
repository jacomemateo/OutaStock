package service

import (
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
	"log"
	"github.com/jacomemateo/OutaStock/backend/internal/repository"
)

type Database struct {
	dbPool *pgxpool.Pool
	queries *repository.Queries
}

func (d *Database) Connect() {
	var err error
	// 1. Connect to the database
	d.dbPool, err = pgxpool.New(context.Background(), "postgres://postgres:secret@localhost:5432/vending?sslmode=disable")

	// Handle connection errors
	if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }

	// Ensure the connection pool is closed when the application exits
	defer d.dbPool.Close()

	    // 2. Test the connection
    if err := d.dbPool.Ping(context.Background()); err != nil {
        log.Fatal("Failed to ping database:", err)
    }

    log.Println("Connected to database successfully!")
	d.queries = repository.New(d.dbPool)

}