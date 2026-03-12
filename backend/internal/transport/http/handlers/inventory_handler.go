package handlers

import (
	"net/http"
	"strconv"

	"github.com/jacomemateo/OutaStock/backend/internal/service"
	"github.com/jacomemateo/OutaStock/backend/internal/transport/http/dto"
	"github.com/labstack/echo/v5"
	"github.com/rs/zerolog/log"
)

type InventoryHandler struct {
	inventoryService *service.InventoryService
	BinderValidator
}

func NewInventoryHandler(inventoryService *service.InventoryService) *InventoryHandler {
	return &InventoryHandler{
		inventoryService: inventoryService,
	}
}

func (h *InventoryHandler) RegisterRoutes(api *echo.Group) {
	// Invetory routes
	inventory := api.Group("/inventory")
	inventory.GET("/", h.GetAllInventory)
	inventory.PATCH("/:slotID", h.UpdateInventory)
}

// GetAllInventory handles GET /api/inventory/?num_rows=&page_offset=
func (h *InventoryHandler) GetAllInventory(c *echo.Context) error {
	numRowsStr := c.QueryParam("num_rows")
	numRows, err := strconv.ParseInt(numRowsStr, 10, 32)
	if err != nil {
		log.Warn().Msgf("Failed to parse num_rows parameter: %s", numRowsStr)
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid num_rows parameter",
		})
	}

	pageOffsetStr := c.QueryParam("page_offset")
	pageOffset, err := strconv.ParseInt(pageOffsetStr, 10, 32)
	if err != nil {
		log.Warn().Msgf("Failed to parse page_offset parameter: %s", pageOffsetStr)
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid page_offset parameter",
		})
	}

	inventory, err := h.inventoryService.GetAllInventory(c.Request().Context(), int(pageOffset), int(numRows))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to fetch inventory",
		})
	}
	return c.JSON(http.StatusOK, inventory)
}

func (h *InventoryHandler) UpdateInventory(c *echo.Context) error {
	slotIDStr := c.Param("slotID")

	slotIdInt, err := strconv.ParseInt(slotIDStr, 10, 32)
	if err != nil {
		log.Warn().Msgf("Failed to parse slotID parameter: %s", slotIDStr)
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid slotID parameter",
		})
	}

	var req dto.UpdateInventoryRequest
	if err, json_err := h.bindAndValidate(c, &req); !err {
		return json_err
	}

	err = h.inventoryService.UpdateInventory(c.Request().Context(), int(slotIdInt), req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to update inventory",
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Slot updated successfully",
	})
}
