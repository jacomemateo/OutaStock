package handlers

import (
	"net/http"
	"strconv"

	"github.com/jacomemateo/OutaStock/backend/internal/service"
	"github.com/labstack/echo/v5"
	"github.com/rs/zerolog/log"
)

type AnalyticsHandler struct {
	analyticsService *service.AnalyticsService
	settingsService  *service.SettingsService
}

func NewAnalyticsHandler(analyticsService *service.AnalyticsService, settingsService *service.SettingsService) *AnalyticsHandler {
	return &AnalyticsHandler{
		analyticsService: analyticsService,
		settingsService:  settingsService,
	}
}

func (h *AnalyticsHandler) RegisterRoutes(g *echo.Group) {
	g.GET("/analytics/revenue", h.GetRevenue)
	g.GET("/analytics/top-products", h.GetTopProducts)
	g.GET("/analytics/inventory-health", h.GetInventoryHealth)
	g.GET("/analytics/heatmap", h.GetHeatmap)
}

func parseDays(c *echo.Context, defaultDays int) int {
	raw := c.QueryParam("days")
	if raw == "" {
		return defaultDays
	}

	days, err := strconv.Atoi(raw)
	if err != nil || days <= 0 || days > 365 {
		return defaultDays
	}

	return days
}

func (h *AnalyticsHandler) GetRevenue(c *echo.Context) error {
	days := parseDays(c, 30)
	data, err := h.analyticsService.GetDailyRevenueAndProfit(c.Request().Context(), days)
	if err != nil {
		log.Error().Err(err).Msg("GetRevenue failed")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal_error"})
	}

	return c.JSON(http.StatusOK, data)
}

func (h *AnalyticsHandler) GetTopProducts(c *echo.Context) error {
	days := parseDays(c, 30)
	data, err := h.analyticsService.GetTopProducts(c.Request().Context(), days)
	if err != nil {
		log.Error().Err(err).Msg("GetTopProducts failed")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal_error"})
	}

	return c.JSON(http.StatusOK, data)
}

func (h *AnalyticsHandler) GetInventoryHealth(c *echo.Context) error {
	settings, err := h.settingsService.GetSettings(c.Request().Context())
	if err != nil {
		log.Error().Err(err).Msg("GetInventoryHealth: settings fetch failed")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal_error"})
	}

	data, err := h.analyticsService.GetInventoryHealth(c.Request().Context())
	if err != nil {
		log.Error().Err(err).Msg("GetInventoryHealth failed")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal_error"})
	}

	return c.JSON(http.StatusOK, map[string]any{
		"threshold": settings.LowStockThreshold,
		"slots":     data,
	})
}

func (h *AnalyticsHandler) GetHeatmap(c *echo.Context) error {
	data, err := h.analyticsService.GetSalesHeatmap(c.Request().Context())
	if err != nil {
		log.Error().Err(err).Msg("GetHeatmap failed")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal_error"})
	}

	return c.JSON(http.StatusOK, data)
}
