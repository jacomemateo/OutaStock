package service

import "context"

type SettingsService struct{ db *Database }

func NewSettingsService(db *Database) *SettingsService { return &SettingsService{db: db} }

type AppSettingsResponse struct {
	LowStockThreshold int32 `json:"lowStockThreshold"`
}

func (s *SettingsService) GetSettings(ctx context.Context) (*AppSettingsResponse, error) {
	row, err := s.db.queries.GetAppSettings(ctx)
	if err != nil {
		return nil, err
	}

	return &AppSettingsResponse{LowStockThreshold: row.LowStockThreshold}, nil
}

func (s *SettingsService) UpdateLowStockThreshold(ctx context.Context, v int32) (*AppSettingsResponse, error) {
	row, err := s.db.queries.UpdateLowStockThreshold(ctx, v)
	if err != nil {
		return nil, err
	}

	return &AppSettingsResponse{LowStockThreshold: row.LowStockThreshold}, nil
}
