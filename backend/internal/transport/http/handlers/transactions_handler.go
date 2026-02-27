// internal/transport/http/handlers/transactions_handler.go
package handlers

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v5"

	"github.com/jacomemateo/OutaStock/backend/internal/service"
	"github.com/jacomemateo/OutaStock/backend/internal/transport/http/dto"
)

type TransactionsHandler struct {
	transactionsService *service.TransactionsService
}

func NewTransactionsHandler(transactionsService *service.TransactionsService) *TransactionsHandler {
	return &TransactionsHandler{
		transactionsService: transactionsService,
	}
}

// GetRecentTransactions handles GET /api/transactions/recent?limit=10
func (h *TransactionsHandler) GetRecentTransactions(c echo.Context) error {
	// Get limit from query param, default to 10
	limitStr := c.QueryParam("limit")
	limit := 10 // default
	if limitStr != "" {
		if parsed, err := strconv.Atoi(limitStr); err == nil {
			limit = parsed
		}
	}

	// Call service
	transactions, err := h.transactionsService.GetRecentTransactions(c.Request().Context(), int32(limit))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to fetch transactions",
		})
	}

	// Convert domain models to response DTOs
	var response []dto.TransactionResponse
	for _, t := range transactions {
		response = append(response, dto.TransactionResponse{
			ID:          t.ID,
			ProductName: t.ProductName,
			PriceAtSale: t.PriceAtSale,
			DateSold:    t.DateSold,
		})
	}

	return c.JSON(http.StatusOK, response)
}
