package service

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

func convertPgtypeUUIDToString(uuid pgtype.UUID) string {
	if !uuid.Valid {
		return ""
	}
	uuidString := fmt.Sprintf("%x-%x-%x-%x-%x", uuid.Bytes[0:4], uuid.Bytes[4:6], uuid.Bytes[6:8], uuid.Bytes[8:10], uuid.Bytes[10:16])
	return uuidString
}

func uuidToPgtype(id uuid.UUID) pgtype.UUID {
	return pgtype.UUID{
		Bytes: [16]byte(id),
		Valid: true,
	}
}

func formatPgTimestamp(timestamp pgtype.Timestamptz) string {
	if !timestamp.Valid {
		return ""
	}
	return timestamp.Time.UTC().Format(time.RFC3339)
}

// Internal utility to handle the pagination math
func Paginate[T any](total int, pageOffset int, numRows int, fetch func(offset, limit int) ([]T, error)) ([]T, error) {
	offset := pageOffset * numRows

	if offset+numRows > total {
		offset = max((total-1)/numRows*numRows, 0)
	}

	return fetch(offset, numRows)
}
