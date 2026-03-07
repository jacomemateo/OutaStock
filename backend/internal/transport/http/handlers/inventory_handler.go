package handlers

import (
	"net/http"
	"strconv"
	"encoding/json"
	"github.com/jacomemateo/OutaStock/backend/internal/service"
	"github.com/jacomemateo/OutaStock/backend/internal/transport/http/dto"
	"github.com/labstack/echo/v5"
	"github.com/go-playground/validator/v10"
	"github.com/rs/zerolog/log"
)

type InventoryHandler struct {
	inventoryService *service.InventoryService
	validator *validator.Validate
}

func NewInventoryHandler(inventoryService *service.InventoryService, validator *validator.Validate) *InventoryHandler {
	return &InventoryHandler{
		inventoryService: inventoryService,
		validator: validator,
		
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

	decoder := json.NewDecoder(c.Request().Body)
	decoder.DisallowUnknownFields()

	var req dto.UpdateInventoryRequest
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