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
	BinderValidator
	productsService *service.ProductsService
}

func NewProductsHandler(productsService *service.ProductsService) *ProductsHandler {
	return &ProductsHandler{
		productsService: productsService,
	}
}

func (h *ProductsHandler) RegisterRoutes(api *echo.Group) {
	products := api.Group("/products")
	products.GET("/", h.GetAllProducts)
	products.POST("/new", h.CreateProduct)
	products.PATCH("/:productID", h.UpdateProduct)
	products.DELETE("/:productID", h.DeleteProduct)
}

// GetAllIProducts handles GET /api/products/?num_rows=&page_offset=
func (h *ProductsHandler) GetAllProducts(c *echo.Context) error {
	paginationParams, err := ParsePagination(c)
	if err != nil {
		return err
	}

	products, err := h.productsService.GetAllProducts(c.Request().Context(), paginationParams.PageOffset, paginationParams.NumRows)
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

func (h *ProductsHandler) DeleteProduct(c *echo.Context) error {
	prodUUIDString := c.Param("productID")

	prodUUID, err := uuid.Parse(prodUUIDString)
	if err != nil {
		log.Warn().Msgf("unable to parse product UUID string: %s", err)
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid productID parameter",
		})
	}

	if err := h.productsService.DeleteProduct(c.Request().Context(), prodUUID); err != nil {
		log.Warn().Msgf("issue with service: %s", err)
		return c.JSON(http.
			StatusInternalServerError,
			map[string]string{
				"error": "Failed to delete product",
			})
	}

	return c.JSON(http.StatusNoContent, "Deleted product")
}

func (h *ProductsHandler) GetProductsCount(c *echo.Context) error {
	count, err := h.productsService.GetProductsCount(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to Product count",
		})
	}

	return c.JSON(http.StatusOK, count)
}
