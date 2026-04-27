package handlers

import (
	"net/http"

	"github.com/jacomemateo/OutaStock/backend/internal/service"
	"github.com/jacomemateo/OutaStock/backend/internal/transport/http/dto"
	"github.com/labstack/echo/v5"
)

type SettingsHandler struct {
	BinderValidator
	settingsService *service.SettingsService
}

func NewSettingsHandler(s *service.SettingsService) *SettingsHandler {
	return &SettingsHandler{settingsService: s}
}

// RegisterRoutes now implements the Handler interface with a single group
func (h *SettingsHandler) RegisterRoutes(authGroup *echo.Group) {
	authGroup.GET("/settings", h.GetSettings)
}

// RegisterAdminRoutes handles the elevated privilege settings
func (h *SettingsHandler) RegisterAdminRoutes(adminGroup *echo.Group) {
	adminGroup.PATCH("/settings", h.UpdateSettings)
}

func (h *SettingsHandler) GetSettings(c *echo.Context) error {
	s, err := h.settingsService.GetSettings(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal_error"})
	}
	return c.JSON(http.StatusOK, s)
}

func (h *SettingsHandler) UpdateSettings(c *echo.Context) error {
	var req dto.UpdateSettingsRequest
	if ok, jsonErr := h.bindAndValidate(c, &req); !ok {
		return jsonErr
	}

	s, err := h.settingsService.UpdateLowStockThreshold(c.Request().Context(), req.LowStockThreshold)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal_error"})
	}
	return c.JSON(http.StatusOK, s)
}