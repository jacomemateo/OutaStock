// internal/service/transactions_service.go
package service

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
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
func (s *TransactionsService) GetTransactions(ctx context.Context, query ListQuery) (*dto.PaginatedTransactions, error) {
	totalCount, err := s.GetTransactionsCount(ctx, query.Search)
	if err != nil {
		return nil, err
	}

	if totalCount == 0 {
		return &dto.PaginatedTransactions{
			Items: []dto.TransactionResponse{},
			Total: 0,
		}, nil
	}

	if query.SortBy == "date" && query.SortDir == "desc" && query.CursorDate != nil && query.CursorID != nil {
		rows, err := s.database.queries.GetTransactionsByDateKeyset(ctx, repository.GetTransactionsByDateKeysetParams{
			Search:     query.Search,
			CursorDate: timeToPgtypeTimestamptz(query.CursorDate),
			CursorID:   nullableUUIDToPgtype(query.CursorID),
			NumRows:    int32(query.NumRows),
		})
		if err != nil {
			log.Error().Err(err).Msg("Failed to query transactions from database")
			return nil, err
		}

		transactions := make([]dto.TransactionResponse, 0, len(rows))
		for _, row := range rows {
			transactions = append(transactions, toTransactionResponse(row.TransactionID, row.Name, row.PriceAtSaleCents, row.DateSold))
		}

		return &dto.PaginatedTransactions{
			Items: transactions,
			Total: totalCount,
		}, nil
	}

	transactions, err := Paginate(totalCount, query.PageOffset, query.NumRows, func(calculatedOffset, limit int) ([]dto.TransactionResponse, error) {
		switch query.SortBy {
		case "product":
			rows, err := s.database.queries.GetTransactionsByProduct(ctx, repository.GetTransactionsByProductParams{
				Search:     query.Search,
				SortDir:    query.SortDir,
				NumRows:    int32(limit),
				PageOffset: int32(calculatedOffset),
			})
			if err != nil {
				log.Error().Err(err).Msg("Failed to query transactions from database")
				return nil, err
			}

			transactions := make([]dto.TransactionResponse, 0, len(rows))
			for _, row := range rows {
				transactions = append(transactions, toTransactionResponse(row.TransactionID, row.Name, row.PriceAtSaleCents, row.DateSold))
			}
			return transactions, nil
		case "price":
			rows, err := s.database.queries.GetTransactionsByPrice(ctx, repository.GetTransactionsByPriceParams{
				Search:     query.Search,
				SortDir:    query.SortDir,
				NumRows:    int32(limit),
				PageOffset: int32(calculatedOffset),
			})
			if err != nil {
				log.Error().Err(err).Msg("Failed to query transactions from database")
				return nil, err
			}

			transactions := make([]dto.TransactionResponse, 0, len(rows))
			for _, row := range rows {
				transactions = append(transactions, toTransactionResponse(row.TransactionID, row.Name, row.PriceAtSaleCents, row.DateSold))
			}
			return transactions, nil
		default:
			rows, err := s.database.queries.GetTransactionsByDate(ctx, repository.GetTransactionsByDateParams{
				Search:     query.Search,
				SortDir:    query.SortDir,
				NumRows:    int32(limit),
				PageOffset: int32(calculatedOffset),
			})
			if err != nil {
				log.Error().Err(err).Msg("Failed to query transactions from database")
				return nil, err
			}

			transactions := make([]dto.TransactionResponse, 0, len(rows))
			for _, row := range rows {
				transactions = append(transactions, toTransactionResponse(row.TransactionID, row.Name, row.PriceAtSaleCents, row.DateSold))
			}
			return transactions, nil
		}
	})
	if err != nil {
		return nil, err
	}

	return &dto.PaginatedTransactions{
		Items: transactions,
		Total: totalCount,
	}, nil
}

func (s *TransactionsService) GetTransactionsCount(ctx context.Context, search string) (int, error) {
	if search == "" {
		count, err := s.database.queries.CountTransactionRowsApprox(ctx)
		if err != nil {
			log.Error().Err(err).Msg("Failed to get approx transaction count")
			return 0, err
		}
		return int(count), nil
	}

	count, err := s.database.queries.CountTransactionRows(ctx, search)
	if err != nil {
		log.Error().Err(err).Msg("Failed to get exact transaction count")
		return 0, err
	}
	return int(count), nil
}

func toTransactionResponse(transactionID pgtype.UUID, productName string, priceAtSaleCents int32, dateSold pgtype.Timestamptz) dto.TransactionResponse {
	return dto.TransactionResponse{
		ID:               convertPgtypeUUIDToString(transactionID),
		ProductName:      productName,
		PriceAtSaleCents: int(priceAtSaleCents),
		DateSold:         &dateSold.Time,
	}
}
