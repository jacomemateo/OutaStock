package transport

import (
	"net/http"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

type Router struct {
	echo *echo.Echo
}

func (r *Router) Init() {
	r.echo = echo.New()
	r.echo.Use(middleware.RequestLogger())

    r.echo.Use(middleware.CORSWithConfig(middleware.CORSConfig{
        AllowOrigins: []string{
			"http://localhost:5173/",   // Vite dev server,
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
}

func (r *Router) Start() {
	r.addRoutes()

	if err := r.echo.Start(":8080"); err != nil {
		r.echo.Logger.Error("Failed to start server: " + err.Error())
	}

	r.echo.Logger.Info("Started server on :8080")
}

func (r *Router) addRoutes() {
	r.echo.GET("/", func(c *echo.Context) error {
		return c.String(http.StatusOK, "Hello, World!")
	})
}