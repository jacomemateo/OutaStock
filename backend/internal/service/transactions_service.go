// internal/service/transactions_service.go
package service

import (
	"context"

	"github.com/jacomemateo/OutaStock/backend/internal/repository"
	"github.com/jacomemateo/OutaStock/backend/internal/transport/http/dto"
	"github.com/rs/zerolog/log"
)

type TransactionsService struct {
	database *Database
}

func NewTransactionsService(database *Database) *TransactionsService {
	return &TransactionsService{
		database: database,
	}
}

// GetTransactions gets paginated recent transactions and returns DTOs directly
func (s *TransactionsService) GetTransactions(ctx context.Context, pageOffset int, numRows int) ([]dto.TransactionResponse, error) {
	// 1. Get total transaction count for the pagination helper
	totalRows64, err := s.database.Queries.CountTransactionRows(ctx)
	if err != nil {
		log.Error().Err(err).Msg("Unable to get transaction row count")
		return nil, err
	}

	// 2. Wrap the database call and mapping in the Paginate helper
	// T here is []dto.TransactionResponse
	return Paginate(int(totalRows64), pageOffset, numRows, func(calculatedOffset, limit int) ([]dto.TransactionResponse, error) {
		// 3. Call repository using the safe offset and limit
		rows, err := s.database.Queries.GetTransactions(ctx, repository.GetTransactionsParams{
			NumRows:    int32(limit),
			PageOffset: int32(calculatedOffset),
		})
		if err != nil {
			log.Error().Err(err).Msg("Failed to query transactions from database")
			return nil, err
		}

		// 4. Map the database rows to DTOs
		transactions := make([]dto.TransactionResponse, 0, len(rows))
		for _, row := range rows {
			uuidString := convertPgtypeUUIDToString(row.TransactionID)

			transactions = append(transactions, dto.TransactionResponse{
				ID:               uuidString,
				ProductName:      row.Name,
				PriceAtSaleCents: int(row.PriceAtSaleCents),
				DateSold:         &row.DateSold.Time,
			})
		}

		return transactions, nil
	})
}

func (s *TransactionsService) GetTransactionsCount(ctx context.Context) (int, error) {
	count, err := s.database.Queries.CountTransactionRows(ctx)
	if err != nil {
		log.Warn().Msg("Unable to get transaction row count")
		return 0, err
	}
	return int(count), nil
}
