package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

    "github.com/rs/zerolog/log"
    "github.com/rs/zerolog"
	"github.com/jacomemateo/OutaStock/backend/internal/transport"
	"github.com/jacomemateo/OutaStock/backend/internal/service"
)

var (
	connectionString = "postgres://postgres:secret@localhost:5432/vending?sslmode=disable"
	echo_port 		   = ":8080"
	origins = []string{"http://localhost:5173"} // Vite dev server, will come from env later
	logLevel = "debug" // will come from env later, hardcoded for now
)

func main() {
	// ---------- LOGGER ----------
	switch logLevel {
	case "debug":
		log.Logger = zerolog.New(zerolog.ConsoleWriter{
			Out:        os.Stdout,
			TimeFormat: time.RFC3339,
		}).With().Timestamp().Logger()

		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	case "info":
		log.Logger = zerolog.New(os.Stdout).
		With().Timestamp().Logger()

		zerolog.SetGlobalLevel(zerolog.InfoLevel)
	default:
		zerolog.SetGlobalLevel(zerolog.InfoLevel)
		log.Warn().Str("logLevel", logLevel).Msg("Unknown log level, defaulting to INFO")
	}	

	// ---------- DATABASE ----------
	// Will come from env later, hardcoded for now
	ctx := context.Background()

	db, err := service.NewDatabase(ctx, connectionString)
	if err != nil {
    	log.Fatal().Err(err).Str("service", "database").Msg("Failed to connect")
	} 
	log.Info().Str("service", "database").Msg("Connected successfully")	
	
	
	// Close database connection when main exits
	defer func() {
		db.Close()
		log.Info().Str("service", "database").Msg("connection closed")
	}()

	// ---------- ECHO SERVER & GRACEFUL SHUTDOWN ----------
	router := transport.NewRouter(db, origins)

	// Create signal-aware context
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	log.Info().Str("service", "echo_server").Msgf("Starting server on %s", echo_port)

	if err := router.Start(ctx, echo_port); err != nil {
		log.Fatal().Err(err).Str("service", "echo_server").Msg("Server stopped with error")
	}

	log.Info().Str("service", "echo_server").Msg("Server shut down gracefully")
}
