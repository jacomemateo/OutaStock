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
	log.Logger = zerolog.New(zerolog.ConsoleWriter{
		Out:        os.Stdout,
		TimeFormat: time.RFC3339,
	}).With().Timestamp().Logger()

	logLevel := "debug" // will come from env later, hardcoded for now
	switch logLevel {
	case "debug":
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	case "info":
		zerolog.SetGlobalLevel(zerolog.InfoLevel)
	default:
		zerolog.SetGlobalLevel(zerolog.InfoLevel)
		log.Warn().Str("logLevel", logLevel).Msg("Unknown log level, defaulting to INFO")
	}	

	// Will come from env later, hardcoded for now
	connectionString := "postgres://postgres:secret@localhost:5432/vending?sslmode=disable"
	ctx := context.Background()

	db, err := service.NewDatabase(ctx, connectionString)
	if err != nil {
    	log.Fatal().Err(err).Str("service", "database").Msg("Failed to connect")
	} else {
		log.Info().Str("service", "database").Msg("Connected successfully")	
	}
	
	defer func() {
		db.Close()
		log.Info().Str("service", "database").Msg("connection closed")
	}()

	router := transport.NewRouter(db)

	// Start server in a goroutine so it doesn't block
	go func() {
		if err := router.Start(); err != nil {
			log.Fatal().Err(err).Str("service", "echo_server").Msg("Failed to start")
		}
	}()
	log.Info().Str("service", "echo_server").Msg("Connected successfully")

	select {} // Block forever
}
