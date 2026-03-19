// internal/config/config.go
package config

import (
	"fmt"
	"os"
)

type Config struct {
	DatabaseURL string
	Port        string
	LogLevel    string
}

func Load() (*Config, error) {
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


func getEnv(key string) (string, error) {
	if value := os.Getenv(key); value != "" {
		return value, nil
	}
	return "", fmt.Errorf("Failed to get environment variable: %s", key)
}
