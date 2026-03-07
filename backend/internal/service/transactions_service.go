// internal/service/transactions_service.go
package service

import (
	"context"
	"fmt"

	"github.com/rs/zerolog/log"

	"github.com/jacomemateo/OutaStock/backend/internal/transport/http/dto"
)

type TransactionsService struct {
	database *Database
}

func NewTransactionsService(database *Database) *TransactionsService {
	return &TransactionsService{
		database: database,
	}
}

// GetRecentTransactions gets the most recent transactions and returns DTOs directly
func (s *TransactionsService) GetRecentTransactions(ctx context.Context, limit int32) ([]dto.TransactionResponse, error) {
	// Call repository
	rows, err := s.database.queries.GetRecentTransactions(ctx, limit)
	if err != nil {
		return nil, fmt.Errorf("Failed to query transactions: %v", err)
	}

	// Convert repository rows directly to DTOs
	transactions := make([]dto.TransactionResponse, 0, len(rows)) // Initialize with capacity to avoid multiple allocations
	for _, row := range rows {
		uuidString := convertPgtypeUUIDToString(row.TransactionID)

		transaction := dto.TransactionResponse{
			ID:               uuidString,
			ProductName:      row.Name,
			PriceAtSaleCents: int(row.PriceAtSaleCents),
			DateSold:         &row.DateSold.Time,
		}
		transactions = append(transactions, transaction)
	}

	return transactions, nil
}
