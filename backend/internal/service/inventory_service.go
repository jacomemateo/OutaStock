package service

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jacomemateo/OutaStock/backend/internal/repository"
	"github.com/jacomemateo/OutaStock/backend/internal/transport/http/dto"
	"github.com/rs/zerolog/log"
)

type InventoryService struct {
	database *Database
}

func NewInventoryService(database *Database) *InventoryService {
	return &InventoryService{
		database: database,
	}
}

func (s *InventoryService) GetAllInventory(ctx context.Context, pageOffset int, numRows int) ([]dto.InventorySlot, error) {
	// 1. Get the total (needed for the math)
	invTotalRows64, err := s.database.Queries.CountInventoryRows(ctx)
	if err != nil {
		log.Warn().Msg("Unable to get inventory row count")
		return nil, err
	}

	// 2. Let Paginate handle the math and the "hand-off"
	return Paginate(int(invTotalRows64), pageOffset, numRows, func(calculatedOffset, limit int) ([]dto.InventorySlot, error) {
		// Call database using the SAFE offset calculated by the helper
		rows, err := s.database.Queries.GetInventory(ctx, repository.GetInventoryParams{
			NumRows:    int32(limit),
			PageOffset: int32(calculatedOffset),
		})
		if err != nil {
			return nil, err
		}

		// Map your database rows to DTOs (The same loop logic as before)
		inventoryItems := make([]dto.InventorySlot, 0, len(rows))
		for _, row := range rows {
			uuidString := ""
			if row.ProductID.Valid {
				uuidString = convertPgtypeUUIDToString(row.ProductID)
			}

			inventoryItems = append(inventoryItems, dto.InventorySlot{
				SlotID:      int(row.SlotID),
				SlotLabel:   row.SlotLabel,
				Quantity:    int(row.Quantity.Int32),
				ProductName: row.Name.String,
				PriceCents:  int(row.PriceCents.Int32),
				ProductID:   uuidString,
				DateAdded:   &row.DateAdded.Time,
			})
		}

		return inventoryItems, nil
	})
}

func (s *InventoryService) UpdateInventory(ctx context.Context, slotID int, req dto.UpdateInventoryRequest) error {
	if req.ProductID == nil && req.Quantity == nil {
		err := s.database.Queries.ClearInventorySlot(ctx, int32(slotID))
		if err != nil {
			return err
		}
		return nil
	}

	// Convert uuid.UUID to pgtype.UUID
	var pgtypeUUID pgtype.UUID
	if req.ProductID == nil {
		pgtypeUUID = pgtype.UUID{Valid: false}
	} else {
		if err := pgtypeUUID.Scan(*req.ProductID); err != nil {
			log.Warn().Msg("unable to parse uuid")
			return err
		}
	}

	var quantity pgtype.Int4
	if req.Quantity == nil {
		quantity = pgtype.Int4{Valid: false}
	} else {
		quantity = pgtype.Int4{
			Int32: int32(*req.Quantity),
			Valid: true,
		}
	}

	args := repository.UpdateInventoryParams{
		ProductID: pgtypeUUID,
		Quantity:  quantity,
		SlotID:    int32(slotID),
	}

	err := s.database.Queries.UpdateInventory(ctx, args)
	if err != nil {
		log.Warn().Msgf("error with the database %s", err)
		return err
	}

	return nil
}

func (s *InventoryService) GetInventoryCount(ctx context.Context) (int, error) {
	count, err := s.database.Queries.CountInventoryRows(ctx)
	if err != nil {
		log.Warn().Msg("Unable to get inventory row count")
		return 0, err
	}
	return int(count), nil
}
