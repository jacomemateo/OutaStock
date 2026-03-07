package handlers

import (
	"net/http"
	"encoding/json"
	"github.com/jacomemateo/OutaStock/backend/internal/service"
	"github.com/jacomemateo/OutaStock/backend/internal/transport/http/dto"
	"github.com/labstack/echo/v5"
	"github.com/rs/zerolog/log"
	// "github.com/jacomemateo/OutaStock/backend/internal/transport/http/dto"
	"github.com/go-playground/validator/v10"

)

type ProductsHandler struct {
	productsService *service.ProductsService
	validator *validator.Validate
}

func NewProductsHandler(productsService *service.ProductsService, validator *validator.Validate) *ProductsHandler {
	return &ProductsHandler{
		productsService: productsService,
		validator: validator,
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
	decoder := json.NewDecoder(c.Request().Body)
	decoder.DisallowUnknownFields()

	var req dto.CreateProductRequest
	if err := decoder.Decode(&req); err != nil {
		log.Warn().Msgf("Failed to decode request body: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	if err := h.validator.Struct(req); err != nil {
		validationErrors := err.(validator.ValidationErrors)
		errors := map[string]string{}
		for _, e := range validationErrors {
			errors[e.Field()] = e.Tag()
		}
		log.Warn().Msgf("validation error %s", errors)
		return c.JSON(http.StatusBadRequest, errors)
	}

	err := h.productsService.CreateProduct(c.Request().Context(), req)
	if err != nil {
		log.Debug().Msgf("%s", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to create new product",
		})
	}

	return c.NoContent(http.StatusCreated)
}
