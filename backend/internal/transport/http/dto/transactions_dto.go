package dto

import (
	"time"

	"github.com/google/uuid"
)

// TransactionResponse is the "Output" DTO.
// It combines transaction data with the product name for the UI.
type TransactionResponse struct {
	ID          string      `json:"id"`
	ProductName string          `json:"productName"` // From the JOIN
	PriceAtSaleCents int32           `json:"priceAtSaleCents"`  // Changed from decimal.Decimal to int32 to represent price in cents
	DateSold    *time.Time       `json:"dateSold"`
}

// CreateTransactionRequest is the "Input" DTO.
// Even though you're using CSVs, your Service layer will eventually 
// map CSV rows into a slice of these to send to the Repository.
type CreateTransactionRequest struct {
	ProductID   *uuid.UUID       `json:"productId"`
	PriceAtSaleCents int32           `json:"priceAtSaleCents"`  // Changed from decimal.Decimal to int32 to represent price in cents
	DateSold    *time.Time       `json:"dateSold"`
}