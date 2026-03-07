package dto

import (
	"time"

	"github.com/google/uuid"
)

// ProductResponse is the "Output" DTO.
// This represents a product in your catalog.
type ProductResponse struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	PriceCents  int        `json:"priceCents"` // Changed from decimal.Decimal to int to represent price in cents
	DateCreated *time.Time `json:"dateCreated"`
}

// CreateProductRequest is the "Input" DTO for adding new items.
type CreateProductRequest struct {
	Name       string `json:"name" validate:"required"`
	PriceCents int    `json:"priceCents" validate:"required,gt=0"` // Changed from decimal.Decimal to int to represent price in cents
}

// UpdatePriceRequest is the "Input" DTO for changing a price.
type UpdateProductRequest struct {
	ProductID   *uuid.UUID `json:"productId"`
	PriceCents  int        `json:"priceCents"` // Changed from decimal.Decimal to int to represent price in cents
	ProductName string     `json:"name"`
}
