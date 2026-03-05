package dto

import (
	"time"

	"github.com/google/uuid"
)

// InventorySlot is the "Output" DTO.
// It represents a single physical slot in the vending machine.
type InventorySlot struct {
	SlotID      int        `json:"slotId"`
	SlotLabel   string     `json:"slotLabel"`
	Quantity    int        `json:"quantity"`
	ProductName string     `json:"productName"`
	PriceCents  int        `json:"priceCents"`
	ProductID   string     `json:"productId"`
	DateAdded   *time.Time `json:"dateAdded"`
}

// UpdateInventoryRequest is the "Input" DTO.
type UpdateInventoryRequest struct {
	Quantity  *int       `json:"quantity"`
	ProductID *uuid.UUID `json:"productUUID"`
}
