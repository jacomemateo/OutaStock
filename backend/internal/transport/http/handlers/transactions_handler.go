// internal/transport/http/handlers/transactions_handler.go
package handlers

import (
	"net/http"
	"strconv"

	"github.com/jacomemateo/OutaStock/backend/internal/service"
	"github.com/labstack/echo/v5"
)

type TransactionsHandler struct {
	transactionsService *service.TransactionsService
	BinderValidator
}

func NewTransactionsHandler(transactionsService *service.TransactionsService) *TransactionsHandler {
	return &TransactionsHandler{
		transactionsService: transactionsService,
	}
}

func (h *TransactionsHandler) RegisterRoutes(api *echo.Group) {
	transactions := api.Group("/transactions")
	transactions.GET("/recent", h.GetRecentTransactions)
}

const (
	DefaultLimit = int32(10)
	MaxLimit     = int64(200)
)

// GetRecentTransactions handles GET /api/transactions/recent?limit=10
func (h *TransactionsHandler) GetRecentTransactions(c *echo.Context) error {
	// Get limit from query param, default to 10
	limit := DefaultLimit // default

	if limitStr := c.QueryParam("limit"); limitStr != "" {
		// Now using strconv.ParseInt instead of strconv.Atoi to avoid overflow issues with int32
		// and also added error handling for non-integer values and out-of-range values
		parsed, err := strconv.ParseInt(limitStr, 10, 32)

		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{
				"error": "Invalid limit parameter",
			})
		} else if parsed <= 0 || parsed > MaxLimit {
			return c.JSON(http.StatusBadRequest, map[string]string{
				"error": "Limit must be between 1 and 200",
			})
		}
		limit = int32(parsed)
	} else {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Limit parameter is required",
		})
	}

	// Call service - now returns DTOs directly
	transactions, err := h.transactionsService.GetRecentTransactions(c.Request().Context(), limit)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to fetch transactions",
		})
	}

	// No conversion needed - transactions are already DTOs!
	return c.JSON(http.StatusOK, transactions)
}
