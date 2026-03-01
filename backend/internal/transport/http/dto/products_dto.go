package dto

import (
	"time"

	"github.com/google/uuid"
)

// ProductResponse is the "Output" DTO.
// This represents a product in your catalog.
type ProductResponse struct {
	ID          *uuid.UUID       `json:"id"`
	Name        string          `json:"name"`
	PriceCents  int           `json:"priceCents"`  // Changed from decimal.Decimal to int to represent price in cents
	DateCreated *time.Time       `json:"dateCreated"`
}

// CreateProductRequest is the "Input" DTO for adding new items.
type CreateProductRequest struct {
	Name  string          `json:"name"`
	PriceCents int           `json:"priceCents"`  // Changed from decimal.Decimal to int to represent price in cents
}

// UpdatePriceRequest is the "Input" DTO for changing a price.
type UpdatePriceRequest struct {
	ProductID *uuid.UUID       `json:"productId"`
	PriceCents int           `json:"priceCents"`  // Changed from decimal.Decimal to int to represent price in cents
}