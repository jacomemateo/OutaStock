package domain

import (
	"time"

	"github.com/google/uuid"
)

type CurrentProduct struct {
	ID int
	// The items below are pointers since they're nullable
	ProductID *uuid.UUID
	Quantity  *int
	DateAdded *time.Time
}
