package domain

import (
	"time"

	"github.com/google/uuid"
)

type Transaction struct {
	ID          uuid.UUID
	ProductID   uuid.UUID
	ProductName string
	PriceAtSaleCents int32  // Changed from decimal.Decimal to int32 to represent price in cents
	DateSold    time.Time
}
