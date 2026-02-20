package domain

import (
	"time"

	"github.com/google/uuid"
)

type CurrentProduct struct {
	ID        int
	ProductID uuid.UUID
	Quantity  int
	DateAdded time.Time
}
