package service

import (
	"context"

	"github.com/rs/zerolog/log"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jacomemateo/OutaStock/backend/internal/repository"
	"github.com/jacomemateo/OutaStock/backend/internal/transport/http/dto"
)

type InventoryService struct {
	database *Database
}

func NewInventoryService(database *Database) *InventoryService {
	return &InventoryService{
		database: database,
	}
}

// GetAllInventory gets all inventory items
func (s *InventoryService) GetAllInventory(ctx context.Context) ([]dto.InventorySlot, error) {
	// Call repository
	rows, err := s.database.queries.GetInventory(ctx)
	if err != nil {
		return nil, err
	}


	inventoryItems := make([]dto.InventorySlot, 0, len(rows)) // Initialize with capacity to avoid multiple allocations

	for _, row := range rows {
		if !row.ProductID.Valid {
			inventorySlot := dto.InventorySlot{
				SlotID:      int(row.SlotID),
				SlotLabel:   row.SlotLabel,
				Quantity:    0,
				ProductName: "",
				PriceCents:  0,
				ProductID:   "",
				DateAdded:   nil,
			}
			inventoryItems = append(inventoryItems, inventorySlot)
			continue
		}

		uuidString := convertPgtypeUUIDToString(row.ProductID)

		inventorySlot := dto.InventorySlot{
			SlotID:      int(row.SlotID),
			SlotLabel:   row.SlotLabel,
			Quantity:    int(row.Quantity.Int32),
			ProductName: row.Name.String,
			PriceCents:  int(row.PriceCents.Int32),
			ProductID:   uuidString,
			DateAdded:   &row.DateAdded.Time,
		}

		inventoryItems = append(inventoryItems, inventorySlot)
	}
	return inventoryItems, nil
}

func (s *InventoryService) UpdateInventory(ctx context.Context, slotID int, req dto.UpdateInventoryRequest) error {
	if req.ProductID == nil && req.Quantity == nil {
		err := s.database.queries.ClearInventorySlot(ctx, int32(slotID))
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

	err := s.database.queries.UpdateInventory(ctx, args)
	if err != nil {
		log.Warn().Msgf("error with the database %s", err)
		return err
	}

	return nil
}
