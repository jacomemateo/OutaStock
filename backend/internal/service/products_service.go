package service

import (
	"context"
	"fmt"

	"github.com/jacomemateo/OutaStock/backend/internal/repository"

	"github.com/rs/zerolog/log"
	"github.com/google/uuid"
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

func (s *ProductsService) CreateProduct(ctx context.Context, prod dto.CreateProductRequest) error {
	product := repository.CreateProductParams{
		Name:       prod.Name,
		PriceCents: int32(prod.PriceCents),
	}

	log.Debug().Msgf("FUCK BRO %s %d", prod.Name, prod.PriceCents)

	err := s.database.queries.CreateProduct(ctx, product)
	if err != nil {
		return fmt.Errorf("create product in db: %w", err)
	}

	return err
}

func (s *ProductsService) UpdateProduct(ctx context.Context, prodUUID uuid.UUID) error {
	return nil
}