package service

import (
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jacomemateo/OutaStock/backend/internal/repository"
	"fmt"
)

type Database struct {
	pool *pgxpool.Pool
	queries *repository.Queries
}

func NewDatabase(ctx context.Context, connString string) (*Database, error) {
	// 1. Connect to the database
	pool, err := pgxpool.New(ctx, connString)

	// Handle connection errors
	if err != nil {
        return nil, fmt.Errorf("create pool: %v", err)
    }

	// 2. Test the connection
    if err := pool.Ping(ctx); err != nil {
        return nil, fmt.Errorf("ping database: %v", err)
    }

	d := &Database{
		pool:    pool,
		queries: repository.New(pool),
	}

	return d, nil
}



// Add a Ping method to check database connectivity
func (d *Database) Ping(ctx context.Context) error {
	if d.pool == nil {
		return fmt.Errorf("database connection not initialized")
	}
	return d.pool.Ping(ctx)
}

// Add a Close method to be called when the app shuts down
func (d *Database) Close() {
	if d.pool != nil {
		d.pool.Close()
	}
}
