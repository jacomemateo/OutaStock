// internal/config/config.go
package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	DatabaseURL      string
	Port             string
	LogLevel         string
	AuthEnabled      bool
	ZitadelIssuer    string
	IntrospectionURL string
	APIClientID      string
	APIClientSecret  string
	ZitadelProjectID string
}

func Load() (*Config, error) {
	cfg := &Config{}

	db_url, err := GetEnv("DATABASE_URL")
	if err != nil {
		return nil, err
	}
	cfg.DatabaseURL = db_url

	cfg.Port, err = GetEnv("ECHO_PORT")
	if err != nil {
		return nil, err
	}

	cfg.Port = ":" + cfg.Port // Prepend ":" for echo server

	cfg.LogLevel, err = GetEnv("ECHO_LOG_LEVEL")
	if err != nil {
		return nil, err
	}

	authEnabledValue := GetEnvOrDefault("AUTH_ENABLED", "false")
	cfg.AuthEnabled, err = strconv.ParseBool(authEnabledValue)
	if err != nil {
		return nil, fmt.Errorf("Failed to parse AUTH_ENABLED: %w", err)
	}

	if cfg.AuthEnabled {
		cfg.ZitadelIssuer, err = GetEnv("ZITADEL_ISSUER")
		if err != nil {
			return nil, err
		}

		cfg.IntrospectionURL, err = GetEnv("ZITADEL_INTROSPECTION_URL")
		if err != nil {
			return nil, err
		}

		cfg.APIClientID, err = GetEnv("ZITADEL_API_CLIENT_ID")
		if err != nil {
			return nil, err
		}

		cfg.APIClientSecret, err = GetEnv("ZITADEL_API_CLIENT_SECRET")
		if err != nil {
			return nil, err
		}

		cfg.ZitadelProjectID = GetEnvOrDefault("ZITADEL_PROJECT_ID", "")
	}

	return cfg, nil
}

func GetEnv(key string) (string, error) {
	if value := os.Getenv(key); value != "" {
		return value, nil
	}
	return "", fmt.Errorf("Failed to get environment variable: %s", key)
}

func GetEnvOrDefault(key string, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return defaultValue
}
