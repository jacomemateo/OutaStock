// internal/service/transactions_service.go
package service

import (
	"context"
	"log"

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
		log.Printf("ERROR: Failed to query inventory: %v", err)  // ADD THIS
		return nil, err
	}

	log.Printf("DEBUG: Found %d rows from database", len(rows))  // ADD THIS

	inventoryItems := make([]dto.InventorySlot, 0, len(rows))  // Initialize with capacity to avoid multiple allocations

	for _, row := range rows {
		log.Printf("DEBUG: Row - SlotID=%v, Quantity=%v, DateAdded=%v, Name=%s, PriceCents=%v, ProductID=%v", 
			row.SlotID, row.Quantity, row.DateAdded, row.Name, row.PriceCents, row.ProductID)


		if !row.ProductID.Valid {
			inventorySlot := dto.InventorySlot{
				SlotID:	  int(row.SlotID),
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
			Quantity: int(row.Quantity.Int32),
			ProductName: row.Name.String,
			PriceCents: int(row.PriceCents.Int32),
			ProductID:  uuidString,
			DateAdded:  &row.DateAdded.Time,
		}
		
		inventoryItems = append(inventoryItems, inventorySlot)
	}
	log.Printf("DEBUG: Returning %d inventory items", len(inventoryItems))
	return inventoryItems, nil
}