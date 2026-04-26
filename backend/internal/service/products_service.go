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
func (s *ProductsService) GetAllProducts(ctx context.Context, query ListQuery) ([]dto.ProductResponse, error) {
	totalRows64, err := s.database.queries.CountProductRows(ctx, query.Search)
	if err != nil {
		log.Error().Err(err).Msg("Failed to get product count from database")
		return nil, err
	}

	return Paginate(int(totalRows64), query.PageOffset, query.NumRows, func(calculatedOffset, limit int) ([]dto.ProductResponse, error) {
		rows, err := s.database.queries.GetProducts(ctx, repository.GetProductsParams{
			Search:     query.Search,
			SortBy:     query.SortBy,
			SortDir:    query.SortDir,
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
				CostCents:   int(row.CostCents),
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
		CostCents:  int32(prod.CostCents),
		PriceCents: int32(prod.PriceCents),
	}

	err := s.database.queries.CreateProduct(ctx, product)
	if err != nil {
		return fmt.Errorf("create product in db: %w", err)
	}

	return err
}

func (s *ProductsService) UpdateProduct(ctx context.Context, prodUUID uuid.UUID, req dto.UpdateProductRequest) error {
	// if nothing to update, do nothing
	if req.Name == nil && req.PriceCents == nil && req.CostCents == nil {
		log.Debug().Msg("Getting here shouldn't be possible b.c. of validation....?")
		return nil
	}

	uuidPgtype := pgtype.UUID{
		Bytes: prodUUID,
		Valid: true,
	}

	// both provided -> use the existing combined query
	if req.Name != nil {
		args := repository.UpdateProductNameParams{
			Name:      *req.Name, // sqlc generated string
			ProductID: uuidPgtype,
		}
		if err := s.database.queries.UpdateProductName(ctx, args); err != nil {
			log.Warn().Msgf("error updating product name: %v", err)
			return err
		}
	} else if req.PriceCents != nil {
		args := repository.UpdateProductPriceParams{
			PriceCents: int32(*req.PriceCents), // sqlc generated int32
			ProductID:  uuidPgtype,
		}
		if err := s.database.queries.UpdateProductPrice(ctx, args); err != nil {
			log.Warn().Msgf("error updating product price: %v", err)
			return err
		}
	} else if req.CostCents != nil {
		args := repository.UpdateProductCostParams{
			CostCents: int32(*req.CostCents), // sqlc generated int32
			ProductID: uuidPgtype,
		}
		if err := s.database.queries.UpdateProductCost(ctx, args); err != nil {
			log.Warn().Msgf("error updating product cost: %v", err)
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

	if err := s.database.queries.DeleteProduct(ctx, uuidPgtype); err != nil {
		log.Warn().Msgf("error deleting product: %v", err)
		return err
	}

	return nil
}

func (s *ProductsService) GetProductsCount(ctx context.Context, search string) (int, error) {
	count, err := s.database.queries.CountProductRows(ctx, search)
	if err != nil {
		log.Warn().Msg("Unable to get inventory row count")
		return 0, err
	}
	return int(count), nil
}
