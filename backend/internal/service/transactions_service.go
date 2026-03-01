// internal/service/transactions_service.go
package service

import (
	"context"
	"log"

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
		log.Printf("ERROR: Failed to query transactions: %v", err)
		return nil, err
	}

	log.Printf("DEBUG: Found %d rows from database", len(rows))

	// Convert repository rows directly to DTOs
	var transactions []dto.TransactionResponse
	for _, row := range rows {
		log.Printf("DEBUG: Row - TransactionID.Valid=%v, PriceAtSaleCents=%v, Name=%s", 
			row.TransactionID.Valid, row.PriceAtSaleCents, row.Name)

		uuidString := convertPgtypeUUIDToString(row.TransactionID)

		transaction := dto.TransactionResponse{
			ID:               uuidString,
			ProductName:      row.Name,
			PriceAtSaleCents: int(row.PriceAtSaleCents),
			DateSold:         &row.DateSold.Time,
		}
		transactions = append(transactions, transaction)
	}

	log.Printf("DEBUG: Returning %d transactions", len(transactions))
	return transactions, nil
}