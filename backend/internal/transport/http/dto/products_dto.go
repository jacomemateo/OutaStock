package dto

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// ProductResponse is the "Output" DTO.
// This represents a product in your catalog.
type ProductResponse struct {
	ID          uuid.UUID       `json:"id"`
	Name        string          `json:"name"`
	Price       decimal.Decimal `json:"price"`
	DateCreated time.Time       `json:"dateCreated"`
}

// CreateProductRequest is the "Input" DTO for adding new items.
type CreateProductRequest struct {
	Name  string          `json:"name"`
	Price decimal.Decimal `json:"price"`
}

// UpdatePriceRequest is the "Input" DTO for changing a price.
type UpdatePriceRequest struct {
	ProductID uuid.UUID       `json:"productId"`
	Price     decimal.Decimal `json:"price"`
}