package transport

import (
	"context"
	"net/http"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
	"github.com/rs/zerolog/log"

	config "github.com/jacomemateo/OutaStock/backend/cmd"
	"github.com/jacomemateo/OutaStock/backend/internal/service"
	"github.com/jacomemateo/OutaStock/backend/internal/transport/http/handlers"
	httpmiddleware "github.com/jacomemateo/OutaStock/backend/internal/transport/http/middleware"
)

type Router struct {
	handlers    []handlers.Handler
	echo        *echo.Echo
	database    *service.Database
	config      *config.Config
	authService *service.AuthService
}

func NewRouter(database *service.Database, config *config.Config) (*Router, error) {
	r := Router{}
	r.database = database
	r.config = config
	r.echo = echo.New()

	r.echo.Use(middleware.RequestLogger())

	// Conditional CORS (Only for Development)
	if config.LogLevel == "debug" {
		log.Info().
			Str("CORS", "ENABLED").
			Str("Origins", "http://localhost:5173 http://127.0.0.1:5173 http://localhost http://127.0.0.1").
			Msg("CORS Config")
		r.echo.Use(middleware.CORSWithConfig(middleware.CORSConfig{
			AllowOrigins: []string{
				"http://localhost:5173",
				"http://127.0.0.1:5173",
				"http://localhost",
				"http://127.0.0.1",
			},
			AllowMethods: []string{
				http.MethodGet,
				http.MethodPost,
				http.MethodPut,
				http.MethodDelete,
				http.MethodOptions,
				http.MethodPatch,
			},
			AllowHeaders: []string{
				echo.HeaderOrigin,
				echo.HeaderContentType,
				echo.HeaderAccept,
				echo.HeaderAuthorization,
			},
			AllowCredentials: true,
		}))
	} else {
		log.Info().Str("CORS", "DISABLED").Msg("CORS Config")
	}

	// Initialize Services
	authService := service.NewAuthService(database, config)
	transactionsService := service.NewTransactionsService(database)
	inventoryService := service.NewInventoryService(database)
	productsService := service.NewProductsService(database)
	usersService := service.NewUsersService(database)
	settingsService := service.NewSettingsService(database)
	analyticsService := service.NewAnalyticsService(database)

	r.authService = authService

	// Initialize all handlers into the slice
	r.handlers = []handlers.Handler{
		handlers.NewAuthHandler(authService),
		handlers.NewAnalyticsHandler(analyticsService, settingsService),
		handlers.NewUsersHandler(usersService, authService),
		handlers.NewSettingsHandler(settingsService),
		handlers.NewTransactionsHandler(transactionsService),
		handlers.NewInventoryHandler(inventoryService),
		handlers.NewProductsHandler(productsService),
	}

	return &r, nil
}

func (r *Router) Start(ctx context.Context, address string) error {
	r.addRoutes()

	sc := echo.StartConfig{
		Address:         address,
		GracefulTimeout: 10 * time.Second,
		HideBanner:      false,
		HidePort:        false,
		OnShutdownError: func(err error) {
			r.echo.Logger.Error("graceful shutdown failed", "error", err)
		},
	}
	return sc.Start(ctx, r.echo)
}

func (r *Router) addRoutes() {
	api := r.echo.Group("/api")

	// Health check endpoint
	api.GET("/health", func(c *echo.Context) error {
		ctx := c.Request().Context()
		if err := r.database.Ping(ctx); err != nil {
			return c.JSON(http.StatusServiceUnavailable, map[string]string{
				"status": "unhealthy",
				"db":     "disconnected",
				"error":  err.Error(),
			})
		}
		return c.JSON(http.StatusOK, map[string]string{
			"status": "healthy",
			"db":     "connected",
			"time":   time.Now().String(),
		})
	})

	// 1. Register Public Routes (Auth specifically needs the base api group)
	for _, h := range r.handlers {
		if auth, ok := h.(*handlers.AuthHandler); ok {
			auth.RegisterRoutes(api)
		}
	}

	// 2. Setup Protected Groups
	protectedAPI := api.Group("")
	if r.config.AuthEnabled {
		log.Info().Str("service", "auth").Msg("JWT bearer token protection enabled")
		protectedAPI.Use(httpmiddleware.NewJWTAuthMiddleware(r.authService))
	} else {
		log.Warn().Str("service", "auth").Msg("JWT bearer token protection is disabled")
	}

	adminAPI := protectedAPI.Group("")
	adminAPI.Use(httpmiddleware.RequireAdmin)

	// 3. Register Protected and Admin Routes
	for _, h := range r.handlers {
		// All handlers register their standard protected routes
		// For AuthHandler, this calls RegisterProtectedRoutes specifically
		if auth, ok := h.(*handlers.AuthHandler); ok {
			auth.RegisterProtectedRoutes(protectedAPI)
			continue
		}

		// Register standard protected routes for everyone else
		h.RegisterRoutes(protectedAPI)

		// Check if the handler has admin routes (Users and Settings)
		// We use an inline interface check to see if it supports RegisterAdminRoutes
		if adminHand, ok := h.(interface{ RegisterAdminRoutes(*echo.Group) }); ok {
			adminHand.RegisterAdminRoutes(adminAPI)
		}
	}
}