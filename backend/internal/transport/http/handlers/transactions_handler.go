// internal/transport/http/handlers/transactions_handler.go
package handlers

import (
	"net/http"

	"github.com/rs/zerolog/log"
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
	transactions.GET("/", h.GetTransactions)
	transactions.GET("/count", h.GetTransactionsCount)
}

const (
	DefaultLimit = int32(10)
	MaxLimit     = int64(200)
)

// GetRecentTransactions handles GET /api/transactions/recent?num_rows=&page_offset=
func (h *TransactionsHandler) GetTransactions(c *echo.Context) error {
	paginationParams, err := ParsePagination(c)
	if err != nil {
		return err
	}

	// 3. Call service with pagination params
	transactions, err := h.transactionsService.GetTransactions(c.Request().Context(), paginationParams.PageOffset, paginationParams.NumRows)
	if err != nil {
		log.Error().Err(err).Msg("Failed to fetch transactions from service")
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to fetch transactions",
		})
	}

	// 4. Return DTOs
	return c.JSON(http.StatusOK, transactions)
}


func (h *TransactionsHandler) GetTransactionsCount(c *echo.Context) error {
	count, err := h.transactionsService.GetTransactionsCount(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to get transactions count",
		})
	}

	return c.JSON(http.StatusOK, count)
}