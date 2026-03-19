// internal/transport/http/handlers/transactions_handler.go
package handlers

import (
	"net/http"
	"strconv"

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
}

const (
	DefaultLimit = int32(10)
	MaxLimit     = int64(200)
)

// GetRecentTransactions handles GET /api/transactions/recent?num_rows=&page_offset=
func (h *TransactionsHandler) GetTransactions(c *echo.Context) error {
	// 1. Parse num_rows query parameter
	numRowsStr := c.QueryParam("num_rows")
	numRows, err := strconv.ParseInt(numRowsStr, 10, 32)
	if err != nil {
		log.Warn().Msgf("Failed to parse num_rows parameter: %s", numRowsStr)
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid num_rows parameter",
		})
	}

	// 2. Parse page_offset query parameter
	pageOffsetStr := c.QueryParam("page_offset")
	pageOffset, err := strconv.ParseInt(pageOffsetStr, 10, 32)
	if err != nil {
		log.Warn().Msgf("Failed to parse page_offset parameter: %s", pageOffsetStr)
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid page_offset parameter",
		})
	}

	// 3. Call service with pagination params
	transactions, err := h.transactionsService.GetTransactions(c.Request().Context(), int(pageOffset), int(numRows))
	if err != nil {
		log.Error().Err(err).Msg("Failed to fetch transactions from service")
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to fetch transactions",
		})
	}

	// 4. Return DTOs
	return c.JSON(http.StatusOK, transactions)
}
