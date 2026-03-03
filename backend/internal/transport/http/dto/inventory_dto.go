package dto

import (
	"time"

	"github.com/google/uuid"
)

// InventorySlot is the "Output" DTO.
// It represents a single physical slot in the vending machine.
type InventorySlot struct {
	SlotID      int           `json:"slotId"`
	Quantity    int           `json:"quantity"`
	ProductName string          `json:"productName"` 
	PriceCents  int           `json:"priceCents"`       
	ProductID   string          `json:"productId"`   
	DateAdded   *time.Time      `json:"dateAdded"`   
}

// UpdateQuantityRequest is the "Input" DTO.
// Used when an admin manually refills a slot (Manual override).
type UpdateQuantityRequest struct {
	SlotID   int `json:"slotId"`
	Quantity int `json:"quantity"`
}

// AssignProductRequest is another "Input" DTO.
// Used when the user wants to put a new product into a specific slot.
type AssignProductRequest struct {
	SlotID    int     `json:"slotId"`
	ProductID uuid.UUID `json:"productId"`
}