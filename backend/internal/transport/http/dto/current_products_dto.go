package dto

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// InventorySlot is the "Output" DTO.
// It represents a single physical slot in the vending machine.
type InventorySlot struct {
	SlotID      int32           `json:"slotId"`
	Quantity    int32           `json:"quantity"`
	ProductName string          `json:"productName"` 
	Price       decimal.Decimal `json:"price"`       
	ProductID   *uuid.UUID      `json:"productId"`   
	DateAdded   *time.Time      `json:"dateAdded"`   
}

// UpdateQuantityRequest is the "Input" DTO.
// Used when an admin manually refills a slot (Manual override).
type UpdateQuantityRequest struct {
	SlotID   int32 `json:"slotId"`
	Quantity int32 `json:"quantity"`
}

// AssignProductRequest is another "Input" DTO.
// Used when the user wants to put a new product into a specific slot.
type AssignProductRequest struct {
	SlotID    int32     `json:"slotId"`
	ProductID uuid.UUID `json:"productId"`
	Quantity  int32     `json:"quantity"`
}