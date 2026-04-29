package service

import (
	"time"

	"github.com/google/uuid"
)

type ListQuery struct {
	PageOffset int
	NumRows    int
	Search     string
	SortBy     string
	SortDir    string
	CursorDate *time.Time
	CursorID   *uuid.UUID
}
