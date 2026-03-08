package dto

import (
	"time"
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

type UpdateProductRequest struct {
	PriceCents *int    `json:"priceCents" validate:"required_without=Name,omitempty,gte=0"` // Changed from decimal.Decimal to int to represent price in cents
	Name       *string `json:"name" validate:"required_without=PriceCents"`
}
