package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	config "github.com/jacomemateo/OutaStock/backend/cmd"
	"github.com/jacomemateo/OutaStock/backend/internal/service"
	"github.com/jacomemateo/OutaStock/backend/internal/transport"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)


func main() {
	cfg, err := config.Load()

	if err != nil {
		log.Fatal().Err(err).Msg("Failed to load config")
	}

	// ---------- LOGGER ----------
	switch cfg.LogLevel {
	case "debug":
		// Pretty logger
		log.Logger = zerolog.New(zerolog.ConsoleWriter{
			Out:        os.Stdout,
			TimeFormat: time.RFC3339,
		}).With().Timestamp().Logger()

		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	case "info":
		// json
		log.Logger = zerolog.New(os.Stdout).
			With().Timestamp().Logger()

		zerolog.SetGlobalLevel(zerolog.InfoLevel)
	default:
		zerolog.SetGlobalLevel(zerolog.InfoLevel)
		log.Warn().Str("logLevel", cfg.LogLevel).Msg("Unknown log level, defaulting to INFO")
	}

	// ---------- DATABASE ----------
	// Will come from env later, hardcoded for now
	ctx := context.Background()

	db, err := service.NewDatabase(ctx, cfg.DatabaseURL)
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
	router := transport.NewRouter(db, cfg)

	// Create signal-aware context
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	log.Info().Str("service", "echo_server").Str("PORT", cfg.Port).Str("log_level", cfg.LogLevel).Msg("Starting server")


	if err := router.Start(ctx, cfg.Port); err != nil {
		log.Fatal().Err(err).Str("service", "echo_server").Msg("Server stopped with error")
	}

	log.Info().Str("service", "echo_server").Msg("Server shut down gracefully")
}
