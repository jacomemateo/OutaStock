// internal/service/transactions_service.go
package service

import (
	"context"

	"github.com/rs/zerolog/log"
	"github.com/jacomemateo/OutaStock/backend/internal/transport/http/dto"
	"github.com/jacomemateo/OutaStock/backend/internal/repository"
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
    // 1. Get total transaction count for boundary protection
    totalRows64, err := s.database.Queries.CountTransactionRows(ctx)
    if err != nil {
        log.Error().Err(err).Msg("Unable to get transaction row count")
        return nil, err
    }
    totalRows := int(totalRows64)

    // 2. Calculate offset with "last page" fallback logic
    // Ensures users don't request a page that doesn't exist
    offset := pageOffset * numRows

    if offset+numRows > totalRows {
        offset = (totalRows - 1) / numRows * numRows
        if offset < 0 {
            offset = 0
        }
    }

    // 3. Prepare parameters for the repository call
    params := repository.GetTransactionsParams{
        NumRows:    int32(numRows),
        PageOffset: int32(offset),
    }

    // 4. Call repository
    rows, err := s.database.Queries.GetTransactions(ctx, params)
    if err != nil {
        log.Error().Err(err).Msg("Failed to query transactions from database")
        return nil, err
    }

    // 5. Initialize slice with specific capacity to optimize memory allocation
    transactions := make([]dto.TransactionResponse, 0, len(rows))

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