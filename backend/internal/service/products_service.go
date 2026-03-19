package service

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jacomemateo/OutaStock/backend/internal/repository"

	"github.com/google/uuid"
	"github.com/jacomemateo/OutaStock/backend/internal/transport/http/dto"
	"github.com/rs/zerolog/log"
)

type ProductsService struct {
	database *Database
}

func NewProductsService(database *Database) *ProductsService {
	return &ProductsService{
		database: database,
	}
}

// GetAllProducts gets paginated products and returns DTOs directly
func (s *ProductsService) GetAllProducts(ctx context.Context, pageOffset int, numRows int) ([]dto.ProductResponse, error) {
	// 1. Get total count for the pagination helper
	totalRows64, err := s.database.Queries.CountProductRows(ctx)
	if err != nil {
		log.Error().Err(err).Msg("Failed to get product count from database")
		return nil, err
	}

	// 2. Wrap the DB call and DTO mapping in the Paginate helper
	return Paginate(int(totalRows64), pageOffset, numRows, func(calculatedOffset, limit int) ([]dto.ProductResponse, error) {
		
		// 3. Call repository with safe offset and limit
		rows, err := s.database.Queries.GetProducts(ctx, repository.GetProductsParams{
			NumRows:    int32(limit),
			PageOffset: int32(calculatedOffset),
		})
		if err != nil {
			log.Error().Err(err).Msg("Failed to query products from database")
			return nil, err
		}

		// 4. Map the database rows to DTOs
		productResponses := make([]dto.ProductResponse, 0, len(rows))
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
	})
}

func (s *ProductsService) CreateProduct(ctx context.Context, prod dto.CreateProductRequest) error {
	product := repository.CreateProductParams{
		Name:       prod.Name,
		PriceCents: int32(prod.PriceCents),
	}

	err := s.database.Queries.CreateProduct(ctx, product)
	if err != nil {
		return fmt.Errorf("create product in db: %w", err)
	}

	return err
}

func (s *ProductsService) UpdateProduct(ctx context.Context, prodUUID uuid.UUID, req dto.UpdateProductRequest) error {
	// if nothing to update, do nothing
	if req.Name == nil && req.PriceCents == nil {
		log.Debug().Msg("Getting here shouldn't be possible b.c. of validation....?")
		return nil
	}

	uuidPgtype := pgtype.UUID{
		Bytes: prodUUID,
		Valid: true,
	}

	// both provided -> use the existing combined query
	if req.Name != nil && req.PriceCents != nil {
		args := repository.UpdateProductParams{
			PriceCents: int32(*req.PriceCents), // sqlc generated int32
			Name:       *req.Name,              // sqlc generated string
			ProductID:  uuidPgtype,
		}
		if err := s.database.Queries.UpdateProduct(ctx, args); err != nil {
			log.Warn().Msgf("error updating product: %v", err)
			return err
		}
		return nil
	}

	if req.Name != nil {
		log.Debug().Msg("updating name")
		args := repository.UpdateProductNameParams{
			Name:      *req.Name,
			ProductID: uuidPgtype,
		}

		if err := s.database.Queries.UpdateProductName(ctx, args); err != nil {
			log.Warn().Msgf("error updating product name: %v", err)
			return err
		}
	}
	if req.PriceCents != nil {
		log.Debug().Msg("updating price")
		args := repository.UpdateProductPriceParams{
			PriceCents: int32(*req.PriceCents),
			ProductID:  uuidPgtype,
		}

		if err := s.database.Queries.UpdateProductPrice(ctx, args); err != nil {
			log.Warn().Msgf("error updating product price: %v", err)
			return err
		}
	}

	return nil
}

func (s *ProductsService) DeleteProduct(ctx context.Context, prodUUID uuid.UUID) error {
	uuidPgtype := pgtype.UUID{
		Bytes: prodUUID,
		Valid: true,
	}

	if err := s.database.Queries.DeleteProduct(ctx, uuidPgtype); err != nil {
		log.Warn().Msgf("error deleting product: %v", err)
		return err
	}

	return nil
}
