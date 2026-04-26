package dto

import (
	"time"
)

// ProductResponse is the "Output" DTO.
// This represents a product in your catalog.
type ProductResponse struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	CostCents   int        `json:"costCents"`  // Added cost field to represent cost in cents
	PriceCents  int        `json:"priceCents"` // Changed from decimal.Decimal to int to represent price in cents
	DateCreated *time.Time `json:"dateCreated"`
}

// CreateProductRequest is the "Input" DTO for adding new items.
type CreateProductRequest struct {
	Name       string `json:"name" validate:"required"`
	CostCents  int    `json:"costCents" validate:"required,gt=0"`  // Added cost field to represent cost in cents
	PriceCents int    `json:"priceCents" validate:"required,gt=0"` // Changed from decimal.Decimal to int to represent price in cents
}

type UpdateProductRequest struct {
	CostCents  *int    `json:"costCents" validate:"omitempty,gte=0"`
	PriceCents *int    `json:"priceCents" validate:"omitempty,gte=0"`
	Name       *string `json:"name" validate:"omitempty"`
}
