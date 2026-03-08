package handlers

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/jacomemateo/OutaStock/backend/internal/service"
	"github.com/jacomemateo/OutaStock/backend/internal/transport/http/dto"
	"github.com/labstack/echo/v5"
	"github.com/rs/zerolog/log"
)

type ProductsHandler struct {
	BaseHandler
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

func (h *ProductsHandler) CreateProduct(c *echo.Context) error {
	var req dto.CreateProductRequest

	if err, json_err := h.bindAndValidate(c, &req); !err {
		return json_err
	}

	err := h.productsService.CreateProduct(c.Request().Context(), req)
	if err != nil {
		log.Warn().Msgf("%s", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to create new product",
		})
	}

	return c.JSON(http.StatusCreated, "created product")
}

func (h *ProductsHandler) UpdateProduct(c *echo.Context) error {
	prodUUIDString := c.Param("productID")

	prodUUID, err := uuid.Parse(prodUUIDString)
	if err != nil {
		log.Warn().Msgf("unable to parse product UUID string: %s", err)
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid productID parameter",
		})
	}

	var req dto.UpdateProductRequest
	if err, json_err := h.bindAndValidate(c, &req); !err {
		log.Warn().Msgf("unable to bind or validate to DTO: %s", json_err)
		return json_err
	}

	if err := h.productsService.UpdateProduct(c.Request().Context(), prodUUID, req); err != nil {
		log.Warn().Msgf("issue with service: %s", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to update products",
		})
	}

	return c.JSON(http.StatusAccepted, "product updated")
}
