package dto

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// ProductResponse is what we send back to the React frontend
type ProductResponse struct {
	ID          uuid.UUID       `json:"id"` // Go handles UUID -> String conversion automatically
	Name        string          `json:"name"`
	Price       decimal.Decimal `json:"price"`
	DateCreated time.Time       `json:"dateCreated"` // Added because the UI needs it!
}

// CreateProductRequest is what we receive FROM the frontend
type CreateProductRequest struct {
	Name  string          `json:"name"`
	Price decimal.Decimal `json:"price"`
}
