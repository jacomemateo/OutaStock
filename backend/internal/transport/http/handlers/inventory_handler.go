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

func (h *InventoryHandler) UpdateInventory(c *echo.Context) error {
	slotIDStr := c.Param("slotID")

	// Getting slotID from params
	slotIdInt, err := strconv.ParseInt(slotIDStr, 10, 32)
	if err != nil {
		log.Debug().Msgf("Failed to parse slotID parameter: %s", slotIDStr)
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid slotID parameter",
		})
	}

	// Binding request body to DTO
	var req dto.UpdateInventoryRequest
	if err := c.Bind(&req); err != nil {
		log.Debug().Msgf("Failed to bind request body: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
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
