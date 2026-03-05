package handlers

import (
	"net/http"
	// "strconv"

	"github.com/labstack/echo/v5"
	// "github.com/rs/zerolog/log"
	"github.com/jacomemateo/OutaStock/backend/internal/service"
	// "github.com/jacomemateo/OutaStock/backend/internal/transport/http/dto"
)

type ProductsHandler struct {
	productsService *service.ProductsService
}

func NewProductsHandler(productsService *service.ProductsService) *ProductsHandler {
	return &ProductsHandler{
		productsService: productsService,
	}
}

// GetAllProducts handles GET /api/products/all
func (h *ProductsHandler) GetAllProducts(c *echo.Context) error {
	products, err := h.productsService.GetAllProducts(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to fetch products",
		})
	}
	return c.JSON(http.StatusOK, products)
}

