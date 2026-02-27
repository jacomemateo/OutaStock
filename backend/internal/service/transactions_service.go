// internal/service/transactions_service.go
package service

import (
	"context"
	"log"

	"github.com/google/uuid"
	"github.com/jacomemateo/OutaStock/backend/internal/domain"
)

type TransactionsService struct {
	database *Database
}

func NewTransactionsService(database *Database) *TransactionsService {
	return &TransactionsService{
		database: database,
	}
}

// GetRecentTransactions gets the most recent transactions
func (s *TransactionsService) GetRecentTransactions(ctx context.Context, limit int32) ([]*domain.Transaction, error) {
	// Call repository
	rows, err := s.database.queries.GetRecentTransactions(ctx, limit)
	if err != nil {
		log.Printf("ERROR: Failed to query transactions: %v", err)  // ADD THIS
		return nil, err
	}

	log.Printf("DEBUG: Found %d rows from database", len(rows))  // ADD THIS

	// Convert repository rows to domain models
	var transactions []*domain.Transaction
	for _, row := range rows {
		log.Printf("DEBUG: Row - TransactionID.Valid=%v, PriceAtSaleCents=%v, Name=%s", 
			row.TransactionID.Valid, row.PriceAtSaleCents, row.Name)  // ADD THIS

		// Convert pgtype.UUID to uuid.UUID
		var transactionID uuid.UUID
		if row.TransactionID.Valid {
			transactionID = row.TransactionID.Bytes
		} else {
			log.Printf("WARNING: TransactionID is null, skipping row")
			continue
		}

		transaction := &domain.Transaction{
			ID:               transactionID,
			ProductName:      row.Name,
			PriceAtSaleCents: row.PriceAtSaleCents,
			DateSold:         row.DateSold.Time,
		}
		transactions = append(transactions, transaction)
	}

	log.Printf("DEBUG: Returning %d transactions", len(transactions))  // ADD THIS
	return transactions, nil
}