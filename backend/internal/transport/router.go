package transport

import (
	"net/http"
	"context"
	"time"
	"strings"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"

	"github.com/jacomemateo/OutaStock/backend/internal/service"
	"github.com/jacomemateo/OutaStock/backend/internal/transport/http/handlers"
)

type Router struct {
	echo *echo.Echo
	database            *service.Database  // Just store the Database, not the raw pool
	transactionsHandler  *handlers.TransactionsHandler
	inventoryHandler     *handlers.InventoryHandler
}

func NewRouter(database *service.Database, origins []string) *Router {
	r := Router{}
	r.database = database
	r.echo = echo.New()

	// Middleware
	r.echo.Use(middleware.RequestLogger())
	
	r.echo.Use(middleware.GzipWithConfig(
		middleware.GzipConfig{
			Level: 5, // Compression level (1-9)
			MinLength: 1024,
			Skipper: func(c *echo.Context) bool {
				// Skip compression for health check endpoint
				return strings.Contains(c.Path(), "health")

			},
		},
	))

    r.echo.Use(middleware.CORSWithConfig(middleware.CORSConfig {
        AllowOrigins: origins,
        AllowMethods: []string{
            http.MethodGet,
            http.MethodPost,
            http.MethodPut,
            http.MethodDelete,
            http.MethodOptions,
        },
        AllowHeaders: []string{
            echo.HeaderOrigin,
            echo.HeaderContentType,
            echo.HeaderAccept,
            echo.HeaderAuthorization,
        },
        AllowCredentials: true,
    }))

	// Initialize services (using database.queries)
	transactionsService := service.NewTransactionsService(r.database)
	inventoryService := service.NewInventoryService(r.database)
	
	// Initialize handlers
	r.transactionsHandler = handlers.NewTransactionsHandler(transactionsService)
	r.inventoryHandler = handlers.NewInventoryHandler(inventoryService)

	return &r
}

func (r *Router) Start(ctx context.Context, address string) error {
    r.addRoutes()

	sc := echo.StartConfig{
		Address:         address,
		GracefulTimeout: 10 * time.Second,
		HideBanner: false,
		HidePort: false,
        OnShutdownError: func(err error) {
            r.echo.Logger.Error("graceful shutdown failed", "error", err)
        },
	}
	return sc.Start(ctx, r.echo)
}


func (r *Router) addRoutes() {
	// Health check endpoint
	r.echo.GET("/health", func(c *echo.Context) error {
		// Check if database is connected
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

	// API routes group
	api := r.echo.Group("/api")
	
	// Transaction routes
	transactions := api.Group("/transactions")
	transactions.GET("/recent", r.transactionsHandler.GetRecentTransactions)

	// Invetory routes
	inventory := api.Group("/inventory")
	inventory.GET("/all", r.inventoryHandler.GetAllInventory)
}