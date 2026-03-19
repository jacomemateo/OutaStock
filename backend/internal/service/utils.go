package service

import (
	"fmt"

	"github.com/jackc/pgx/v5/pgtype"
)

func convertPgtypeUUIDToString(uuid pgtype.UUID) string {
	// Skip rows with null TransactionID
	if !uuid.Valid {
		return "NULL UUID"
	}
	// Manually convert the byte array to a UUID string format
	// Source - https://stackoverflow.com/a/71134336
	// Posted by Letsgo Brandon, modified by community. See post 'Timeline' for change history
	// Retrieved 2026-02-28, License - CC BY-SA 4.0
	uuidString := fmt.Sprintf("%x-%x-%x-%x-%x", uuid.Bytes[0:4], uuid.Bytes[4:6], uuid.Bytes[6:8], uuid.Bytes[8:10], uuid.Bytes[10:16])
	return uuidString
}

// Internal utility to handle the pagination math
func Paginate[T any](total int, pageOffset int, numRows int, fetch func(offset, limit int) ([]T, error)) ([]T, error) {
	offset := pageOffset * numRows

	if offset+numRows > total {
		offset = max((total-1)/numRows*numRows, 0)
	}

	return fetch(offset, numRows)
}
