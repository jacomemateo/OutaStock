package service

import "context"

type AnalyticsService struct {
	db *Database
}

func NewAnalyticsService(db *Database) *AnalyticsService {
	return &AnalyticsService{db: db}
}

type DailyRevenueRow struct {
	Date         string  `json:"date"`
	RevenueCents float64 `json:"revenueCents"`
	ProfitCents  float64 `json:"profitCents"`
}

func (s *AnalyticsService) GetDailyRevenueAndProfit(ctx context.Context, days int) ([]DailyRevenueRow, error) {
	rows, err := s.db.queries.GetDailyRevenueAndProfit(ctx, int32(days))
	if err != nil {
		return nil, err
	}

	out := make([]DailyRevenueRow, len(rows))
	for i, row := range rows {
		out[i] = DailyRevenueRow{
			Date:         row.SaleDate,
			RevenueCents: float64(row.RevenueCents),
			ProfitCents:  float64(row.ProfitCents),
		}
	}

	return out, nil
}

type TopProductRow struct {
	ProductName string  `json:"productName"`
	UnitsSold   int64   `json:"unitsSold"`
	ProfitCents float64 `json:"profitCents"`
}

func (s *AnalyticsService) GetTopProducts(ctx context.Context, days int) ([]TopProductRow, error) {
	rows, err := s.db.queries.GetTopProducts(ctx, int32(days))
	if err != nil {
		return nil, err
	}

	out := make([]TopProductRow, len(rows))
	for i, row := range rows {
		out[i] = TopProductRow{
			ProductName: row.ProductName,
			UnitsSold:   row.UnitsSold,
			ProfitCents: float64(row.ProfitCents),
		}
	}

	return out, nil
}

type InventoryHealthRow struct {
	SlotID      string  `json:"slotId"`
	ProductName string  `json:"productName"`
	Quantity    int32   `json:"quantity"`
	CostCents   float64 `json:"costCents"`
	PriceCents  float64 `json:"priceCents"`
}

func (s *AnalyticsService) GetInventoryHealth(ctx context.Context) ([]InventoryHealthRow, error) {
	rows, err := s.db.queries.GetInventoryHealth(ctx)
	if err != nil {
		return nil, err
	}

	out := make([]InventoryHealthRow, len(rows))
	for i, row := range rows {
		out[i] = InventoryHealthRow{
			SlotID:      row.SlotID,
			ProductName: row.ProductName,
			Quantity:    row.Quantity,
			CostCents:   float64(row.CostCents),
			PriceCents:  float64(row.PriceCents),
		}
	}

	return out, nil
}

type HeatmapRow struct {
	Date             string  `json:"date"`
	TransactionCount int64   `json:"transactionCount"`
	RevenueCents     float64 `json:"revenueCents"`
}

func (s *AnalyticsService) GetSalesHeatmap(ctx context.Context) ([]HeatmapRow, error) {
	rows, err := s.db.queries.GetSalesHeatmap(ctx)
	if err != nil {
		return nil, err
	}

	out := make([]HeatmapRow, len(rows))
	for i, row := range rows {
		out[i] = HeatmapRow{
			Date:             row.SaleDate,
			TransactionCount: row.TransactionCount,
			RevenueCents:     float64(row.RevenueCents),
		}
	}

	return out, nil
}
