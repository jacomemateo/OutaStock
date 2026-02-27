package service

import (
	"context"

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
		return nil, err
	}

	// Convert repository rows to domain models
	var transactions []*domain.Transaction
	for _, row := range rows {
		// Convert pgtype.UUID to uuid.UUID
		var transactionID uuid.UUID
		if row.TransactionID.Valid {
			transactionID = row.TransactionID.Bytes
		}

		// Convert pgtype.Timestamptz to time.Time
		dateSold := row.DateSold.Time

		transaction := &domain.Transaction{
			ID:          transactionID,
			ProductName: row.Name,
			PriceAtSaleCents: row.PriceAtSaleCents,
			DateSold:    dateSold,
		}
		transactions = append(transactions, transaction)
	}

	return transactions, nil
}
