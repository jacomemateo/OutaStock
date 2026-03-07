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
	// Quantity: Required if ProductID is missing.
	// omitempty ensures gte=0 only runs if Quantity is actually provided.
	Quantity *int `json:"quantity" validate:"required_without=ProductID,omitempty,gte=0"`

	// ProductID: Required if Quantity is missing.
	// Removed gte=0 because UUIDs are not numeric.
	ProductID *uuid.UUID `json:"productUUID" validate:"required_without=Quantity"`
}
