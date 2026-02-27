package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type Transaction struct {
	ID          uuid.UUID
	ProductID   uuid.UUID
	ProductName string
	PriceAtSale decimal.Decimal
	DateSold    time.Time
}
