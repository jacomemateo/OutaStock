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
func (s *TransactionsService) GetTransactions(ctx context.Context, query ListQuery) ([]dto.TransactionResponse, error) {
	totalRows64, err := s.database.Queries.CountTransactionRows(ctx, query.Search)
	if err != nil {
		log.Error().Err(err).Msg("Unable to get transaction row count")
		return nil, err
	}

	return Paginate(int(totalRows64), query.PageOffset, query.NumRows, func(calculatedOffset, limit int) ([]dto.TransactionResponse, error) {
		rows, err := s.database.Queries.GetTransactions(ctx, repository.GetTransactionsParams{
			Search:     query.Search,
			SortBy:     query.SortBy,
			SortDir:    query.SortDir,
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

func (s *TransactionsService) GetTransactionsCount(ctx context.Context, search string) (int, error) {
	count, err := s.database.Queries.CountTransactionRows(ctx, search)
	if err != nil {
		log.Warn().Msg("Unable to get transaction row count")
		return 0, err
	}
	return int(count), nil
}
