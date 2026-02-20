package domain

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type Product struct {
	ID           uuid.UUID
	Name         string
	Price        decimal.Decimal
	DateCreated  time.Time
	DateModified time.Time
}
