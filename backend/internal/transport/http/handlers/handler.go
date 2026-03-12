package handlers

import (
	"github.com/labstack/echo/v5"
)

type Handler interface {
	RegisterRoutes(g *echo.Group)
}
