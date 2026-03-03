package handlers

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v5"

	"github.com/jacomemateo/OutaStock/backend/internal/service"
	"github.com/google/uuid"
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
	inventory, err := h.inventoryService.GetAllInventory(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to fetch inventory",
		})
	}
	return c.JSON(http.StatusOK, inventory)
}

func (h *InventoryHandler) AssignSlot(c *echo.Context) error {
	slotIDStr := c.Param("slotID")
	productUUIDStr := c.QueryParam("productUUID")

	slotIdInt, err := strconv.ParseInt(slotIDStr, 10, 32)
	if err != nil {
		log.Debug().Msgf("Failed to parse slotID parameter: %s", slotIDStr)
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid slotID parameter",
		})
	}

	// Converting to "domain type" uuid.UUID for better type safety in the service layer
	// and for code consistency since product IDs are UUIDs. The service layer can
	// still accept uuid.UUID and convert to a pgtype.UUID type.
	prodcutUUID, err := uuid.Parse(productUUIDStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid productUUID parameter",
		})
	}

	err = h.inventoryService.AssignSlot(c.Request().Context(), int(slotIdInt), prodcutUUID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to assign slot",
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Slot assigned successfully",
	})
}

