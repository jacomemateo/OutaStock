package dto

type UpdateSettingsRequest struct {
	LowStockThreshold int32 `json:"lowStockThreshold" validate:"min=0"`
}
