package domain

import (
	"time"

	"github.com/google/uuid"
)

type Product struct {
	ID           uuid.UUID
	Name         string
	PriceCents   int32  // Changed from decimal.Decimal to int32 to represent price in cents
	DateCreated  time.Time
	DateModified time.Time
}
