package service

import (
	"context"

	"github.com/rs/zerolog/log"
	"github.com/jackc/pgx/v5/pgtype"

	"github.com/jacomemateo/OutaStock/backend/internal/transport/http/dto"
	"github.com/jacomemateo/OutaStock/backend/internal/repository"
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

	log.Debug().Msgf("Found %d rows from database", len(rows))  // ADD THIS

	inventoryItems := make([]dto.InventorySlot, 0, len(rows))  // Initialize with capacity to avoid multiple allocations

	for _, row := range rows {
		log.Debug().Msgf("Row - SlotID=%v, SlotLabel=%s, Quantity=%v, DateAdded=%v, Name=%s, PriceCents=%v, ProductID=%v", 
			row.SlotID, row.Quantity, row.DateAdded, row.Name, row.PriceCents, row.ProductID)


		if !row.ProductID.Valid {
			inventorySlot := dto.InventorySlot{
				SlotID:	  int(row.SlotID),
				SlotLabel:  row.SlotLabel,
				Quantity: 0,
				ProductName: "",
				PriceCents: 0,
				ProductID:  "",
				DateAdded:  nil,
			}
			inventoryItems = append(inventoryItems, inventorySlot)
			continue
		}

		uuidString := convertPgtypeUUIDToString(row.ProductID)

		inventorySlot := dto.InventorySlot{
			SlotID:	  int(row.SlotID),
			SlotLabel: row.SlotLabel,
			Quantity: int(row.Quantity.Int32),
			ProductName: row.Name.String,
			PriceCents: int(row.PriceCents.Int32),
			ProductID:  uuidString,
			DateAdded:  &row.DateAdded.Time,
		}
		
		inventoryItems = append(inventoryItems, inventorySlot)
	}
	log.Debug().Msgf("Returning %d inventory items", len(inventoryItems))
	return inventoryItems, nil
}

func (s *InventoryService) UpdateInventory(ctx context.Context, slotID int, req dto.UpdateInventoryRequest) error {
	if req.ProductID == nil && req.Quantity == nil {
		err := s.database.queries.ClearInventorySlot(ctx, int32(slotID))
		if err != nil {
			return err
		}
		log.Debug().Msgf("Cleared inventory slot %d", slotID)
		return nil
	}

	// Convert uuid.UUID to pgtype.UUID
	var pgtypeUUID pgtype.UUID
	if req.ProductID == nil {
		pgtypeUUID = pgtype.UUID { Valid: false }
	} else {
		pgtypeUUID = pgtype.UUID {
			Bytes:  *req.ProductID,
			Valid: true,
		}
	}

	var quantity pgtype.Int4
	if req.Quantity == nil {
		quantity = pgtype.Int4{ Valid: false }
	} else {
		quantity = pgtype.Int4{
			Int32: int32(*req.Quantity),
			Valid: true,
		}
	}

	args := repository.UpdateInventoryParams{
		ProductID: pgtypeUUID,
		Quantity: quantity,
		SlotID:    int32(slotID),
	}

	err := s.database.queries.UpdateInventory(ctx, args)
	if err != nil {
		return err
	}

	if req.ProductID != nil {
		log.Debug().Msgf("Assigned slot %d with product %s", slotID, req.ProductID.String())
	} else {
		log.Debug().Msgf("Updated quantity of slot %d to %d", slotID, *req.Quantity)
	}
	
	return nil
}