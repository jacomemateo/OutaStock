// internal/config/config.go
package config

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/joho/godotenv"
	"github.com/rs/zerolog/log"
)

type Config struct {
	DatabaseURL string
	Port        string
	CORSOrigins []string
	LogLevel    string
}

func Load() (*Config, error) {
	// Load .env file
	 loadEnvFile()

	cfg := &Config{}

	user, err := getEnv("POSTGRES_USER")
	if err != nil {
		return nil, err
	}
	password, err := getEnv("POSTGRES_PASSWORD")
	if err != nil {
		return nil, err
	}
	port, err := getEnv("POSTGRES_PORT")
	if err != nil {
		return nil, err
	}
	dbName, err := getEnv("POSTGRES_DB")
	if err != nil {
		return nil, err
	}

	// build connection string for postgres
	cfg.DatabaseURL = fmt.Sprintf(
		"postgres://%s:%s@localhost:%s/%s?sslmode=disable",
		user, password, port, dbName,
	)

	cfg.Port, err = getEnv("ECHO_PORT")
	if err != nil {
		return nil, err
	}

	cfg.Port = ":" + cfg.Port // Prepend ":" for echo server

	CORSOrigins, err := getEnv("ECHO_CORS_ORIGINS")
	if err != nil {
		return nil, err
	}

	cfg.CORSOrigins = strings.Split(CORSOrigins, ",")

	cfg.LogLevel, err = getEnv("ECHO_LOG_LEVEL")
	if err != nil {
		return nil, err
	}

	return cfg, nil
}

func loadEnvFile() {
	// Get current directory
	currentDir, err := os.Getwd()
	if err != nil {
		log.Warn().Err(err).Msg("Failed to get current directory")
	}

	// Try parent directory first
	parentDir := filepath.Dir(currentDir)
	envPath := filepath.Join(parentDir, ".env")

	err = godotenv.Load(envPath)
	if err == nil {
		log.Info().Str("path", envPath).Msg("Loaded .env from parent directory")
	}

	log.Warn().Msg("No .env file found")
}

func getEnv(key string) (string, error) {
	if value := os.Getenv(key); value != "" {
		return value, nil
	}
	return "", fmt.Errorf("Failed to get environment variable: %s", key)
}
