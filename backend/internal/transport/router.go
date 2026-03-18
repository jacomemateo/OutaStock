package transport

import (
	"context"
	"net/http"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"

	"github.com/jacomemateo/OutaStock/backend/internal/service"
	"github.com/jacomemateo/OutaStock/backend/internal/transport/http/handlers"
)

type Router struct {
	handlers []handlers.Handler
	echo     *echo.Echo
	database *service.Database // Just store the Database, not the raw pool
}

func NewRouter(database *service.Database) *Router {
	r := Router{}
	r.database = database
	r.echo = echo.New()

	// Middleware
	r.echo.Use(middleware.RequestLogger())

	// Initialize services (using database.queries)
	transactionsService := service.NewTransactionsService(database)
	inventoryService := service.NewInventoryService(database)
	productsService := service.NewProductsService(database)

	// Build handler list
	r.handlers = []handlers.Handler{
		handlers.NewTransactionsHandler(transactionsService),
		handlers.NewInventoryHandler(inventoryService),
		handlers.NewProductsHandler(productsService),
	}

	return &r
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

	// Let each handler register its own routes
	for _, h := range r.handlers {
		h.RegisterRoutes(api)
	}
}
