package transport

import (
	"time"
	"net/http"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"

	"github.com/jacomemateo/OutaStock/backend/internal/transport/http/handlers"
	"github.com/jacomemateo/OutaStock/backend/internal/service"

)

type Router struct {
	echo *echo.Echo
	database            *service.Database  // Just store the Database, not the raw pool
	transactionsHandler  *handlers.TransactionsHandler
}

func (r *Router) Init(database *service.Database) {
	r.database = database
	r.echo = echo.New()
	r.echo.Use(middleware.RequestLogger())

    r.echo.Use(middleware.CORSWithConfig(middleware.CORSConfig{
        AllowOrigins: []string{
			"http://localhost:5173",   // Vite dev server,
        },
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
	
	// Initialize handlers
	r.transactionsHandler = handlers.NewTransactionsHandler(transactionsService)
}

func (r *Router) Start() {
	r.addRoutes()

	if err := r.echo.Start(":8080"); err != nil {
		r.echo.Logger.Error("Failed to start server: " + err.Error())
	}

	r.echo.Logger.Info("Started server on :8080")
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
}