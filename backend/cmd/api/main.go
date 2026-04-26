package main

import (
	"context"
	"errors"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
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
	router, err := transport.NewRouter(db, cfg)
	if err != nil {
		log.Fatal().Err(err).Str("service", "echo_server").Msg("Failed to initialize router")
	}

	seedAdminIfNeeded(ctx, db, cfg)

	// Create signal-aware context
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	log.Info().Str("service", "echo_server").Str("PORT", cfg.Port).Str("log_level", cfg.LogLevel).Msg("Starting server")

	if err := router.Start(ctx, cfg.Port); err != nil {
		log.Fatal().Err(err).Str("service", "echo_server").Msg("Server stopped with error")
	}

	log.Info().Str("service", "echo_server").Msg("Server shut down gracefully")
}

func seedAdminIfNeeded(ctx context.Context, db *service.Database, cfg *config.Config) {
	if cfg.SeedAdminEmail == "" || cfg.SeedAdminPassword == "" {
		return
	}

	count, err := db.Queries().CountUsers(ctx)
	if err != nil {
		if isMissingUsersTableError(err) {
			log.Warn().Msg("Seeder: users table not found yet; skipping initial admin seed")
			return
		}
		log.Error().Err(err).Msg("Seeder: could not count users")
		return
	}
	if count > 0 {
		return
	}

	authSvc := service.NewAuthService(db, cfg)
	_, err = authSvc.CreateUser(ctx, cfg.SeedAdminEmail, cfg.SeedAdminPassword, "admin", nil)
	if err != nil {
		log.Error().Err(err).Msg("Seeder: failed to create initial admin")
		return
	}

	log.Info().Str("email", cfg.SeedAdminEmail).Msg("Seeder: initial admin created")
}

func isMissingUsersTableError(err error) bool {
	var pgErr *pgconn.PgError
	if !errors.As(err, &pgErr) {
		return false
	}

	return pgErr.Code == "42P01" && pgErr.TableName == "users"
}
