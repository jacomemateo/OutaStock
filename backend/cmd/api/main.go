package main

import (
	"context"
	"os"
	"time"
    "github.com/rs/zerolog"
    "github.com/rs/zerolog/log"

	"github.com/jacomemateo/OutaStock/backend/internal/transport"
	"github.com/jacomemateo/OutaStock/backend/internal/service"
)

func main() {
	// Create zerolog logger
	log.Logger = log.Output(zerolog.ConsoleWriter{
		Out:        os.Stdout,
		TimeFormat: time.RFC3339,
	})

	// Set log level (could come from env)
	zerolog.SetGlobalLevel(zerolog.DebugLevel)

	connectionString := "postgres://postgres:secret@localhost:5432/vending?sslmode=disable"
	ctx := context.Background()

	db, err := service.NewDatabase(ctx, connectionString)
	if err != nil {
    	log.Fatal().Err(err).Msg("Failed to connect to database")
	}

	defer func() {
		db.Close()
		log.Info().Msg("Database connection closed")
	}()

	router := transport.NewRouter(db)
	if err := router.Start(); err != nil {
		log.Fatal().Err(err).Msg("Failed to start ECHO server")
	}

}
