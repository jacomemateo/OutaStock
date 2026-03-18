// internal/config/config.go
package config

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
	"github.com/rs/zerolog/log"
)

type Config struct {
	DatabaseURL string
	Port        string
	LogLevel    string
}

func Load() (*Config, error) {
	// Try to load .env file, for development only
	if loadedFromDotEnv := loadEnvFile(); !loadedFromDotEnv {
		log.Warn().Msg("No .env file found, going to load from environment")
	}

	cfg := &Config{}

	db_url, err := getEnv("DATABASE_URL")
	if err != nil {
		return nil, err
	}
	cfg.DatabaseURL = db_url


	cfg.Port, err = getEnv("ECHO_PORT")
	if err != nil {
		return nil, err
	}

	cfg.Port = ":" + cfg.Port // Prepend ":" for echo server

	cfg.LogLevel, err = getEnv("ECHO_LOG_LEVEL")
	if err != nil {
		return nil, err
	}

	return cfg, nil
}

func loadEnvFile() bool {
	// Get current directory
	currentDir, err := os.Getwd()
	if err != nil {
		log.Warn().Err(err).Msg("Failed to get current directory")
	}

	// Try parent directory first
	envPath := filepath.Join(currentDir, ".env")

	log.Debug().Msgf("Path: %s", envPath)

	err = godotenv.Load(envPath)
	if err == nil {
		log.Info().Str("path", envPath).Msg("Loaded .env from root dir")
		return true
	}

	return false
}

func getEnv(key string) (string, error) {
	if value := os.Getenv(key); value != "" {
		return value, nil
	}
	return "", fmt.Errorf("Failed to get environment variable: %s", key)
}
