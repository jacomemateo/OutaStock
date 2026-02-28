package handlers

import (
	"net/http"

	"github.com/labstack/echo/v5"

	"github.com/jacomemateo/OutaStock/backend/internal/service"
)

type InventoryHandler struct {
	inventoryService *service.InventoryService
}

func NewInventoryHandler(inventoryService *service.InventoryService) *InventoryHandler {
	return &InventoryHandler{
		inventoryService: inventoryService,
	}
}

// GetAllInventory handles GET /api/inventory/all
func (h *InventoryHandler) GetAllInventory(c *echo.Context) error {
	// To be implemented
	inventory, err := h.inventoryService.GetAllInventory(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to fetch inventory",
		})
	}
	return c.JSON(http.StatusOK, inventory)
}
