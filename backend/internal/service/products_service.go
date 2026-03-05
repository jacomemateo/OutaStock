package service

import (
	"context"

	"github.com/rs/zerolog/log"
	// "fmt"

	"github.com/jacomemateo/OutaStock/backend/internal/transport/http/dto"
)

type ProductsService struct {
	database *Database
}

func NewProductsService(database *Database) *ProductsService {
	return &ProductsService{
		database: database,
	}
}

// GetAllProducts gets all products and returns DTOs directly
func (s *ProductsService) GetAllProducts(ctx context.Context) ([]dto.ProductResponse, error) {
	rows, err := s.database.queries.GetProducts(ctx)
	if err != nil {
		log.Error().Err(err).Msg("Failed to get products from database")
		return nil, err
	}

	var productResponses []dto.ProductResponse

	for _, row := range rows {
		uuidString := convertPgtypeUUIDToString(row.ProductID)

		productResponses = append(productResponses, dto.ProductResponse{
			ID:          uuidString,
			Name:        row.Name,
			PriceCents:  int(row.PriceCents),
			DateCreated: &row.DateCreated.Time,
		})
	}
	return productResponses, nil
}
