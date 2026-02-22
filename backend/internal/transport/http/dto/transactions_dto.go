package dto

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

// TransactionResponse is the "Output" DTO.
// It combines transaction data with the product name for the UI.
type TransactionResponse struct {
	ID          uuid.UUID       `json:"id"`
	ProductName string          `json:"productName"` // From the JOIN
	PriceAtSale decimal.Decimal `json:"priceAtSale"`
	DateSold    time.Time       `json:"dateSold"`
}

// CreateTransactionRequest is the "Input" DTO.
// Even though you're using CSVs, your Service layer will eventually 
// map CSV rows into a slice of these to send to the Repository.
type CreateTransactionRequest struct {
	ProductID   uuid.UUID       `json:"productId"`
	PriceAtSale decimal.Decimal `json:"priceAtSale"`
	DateSold    time.Time       `json:"dateSold"`
}