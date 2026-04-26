// internal/config/config.go
package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	DatabaseURL       string
	Port              string
	LogLevel          string
	AuthEnabled       bool
	JWTSecret         string
	AccessTokenTTL    int
	SeedAdminEmail    string
	SeedAdminPassword string
}

func Load() (*Config, error) {
	cfg := &Config{}

	databaseURL, err := GetEnv("DATABASE_URL")
	if err != nil {
		return nil, err
	}
	cfg.DatabaseURL = databaseURL

	cfg.Port = GetEnvOrDefault("PORT", "8080")
	if !strings.HasPrefix(cfg.Port, ":") {
		cfg.Port = ":" + cfg.Port
	}

	cfg.LogLevel = GetEnvOrDefault("LOG_LEVEL", "info")

	authEnabledValue := GetEnvOrDefault("AUTH_ENABLED", "false")
	cfg.AuthEnabled, err = strconv.ParseBool(authEnabledValue)
	if err != nil {
		return nil, fmt.Errorf("failed to parse AUTH_ENABLED: %w", err)
	}

	cfg.JWTSecret, err = GetEnv("JWT_SECRET")
	if err != nil {
		return nil, err
	}

	accessTokenTTLValue := GetEnvOrDefault("ACCESS_TOKEN_TTL_MINUTES", "15")
	cfg.AccessTokenTTL, err = strconv.Atoi(accessTokenTTLValue)
	if err != nil {
		return nil, fmt.Errorf("failed to parse ACCESS_TOKEN_TTL_MINUTES: %w", err)
	}

	cfg.SeedAdminEmail = GetEnvOrDefault("SEED_ADMIN_EMAIL", "")
	cfg.SeedAdminPassword = GetEnvOrDefault("SEED_ADMIN_PASSWORD", "")

	return cfg, nil
}

func GetEnv(key string) (string, error) {
	if value := os.Getenv(key); value != "" {
		return value, nil
	}
	return "", fmt.Errorf("failed to get environment variable: %s", key)
}

func GetEnvOrDefault(key string, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return defaultValue
}
