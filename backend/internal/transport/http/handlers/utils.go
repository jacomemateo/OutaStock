package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/jacomemateo/OutaStock/backend/internal/validation"
	"github.com/labstack/echo/v5"
	"github.com/rs/zerolog/log"
)

type BinderValidator struct{}

func (h *BinderValidator) bindAndValidate(c *echo.Context, v any) (bool, error) {
	decoder := json.NewDecoder(c.Request().Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(v); err != nil {
		log.Warn().Msg("unknow field in request body")
		return false, c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	if err := validation.Struct(v); err != nil {
		validationErrors := err.(validator.ValidationErrors)

		errors := map[string]string{}
		for _, e := range validationErrors {
			errors[e.Field()] = e.Tag()
		}
		log.Warn().Msgf("validation: %s", errors)
		return false, c.JSON(http.StatusBadRequest, errors)
	}

	return true, nil
}

type PaginationParams struct {
	NumRows    int
	PageOffset int
}

type SortFieldConfig struct {
	DefaultDirection string
}

type ListQueryParams struct {
	PaginationParams
	Search  string
	SortBy  string
	SortDir string
}

const (
	SortDirectionAsc  = "asc"
	SortDirectionDesc = "desc"
)

func ParsePagination(c *echo.Context) (*PaginationParams, error) {
	numRowsStr := c.QueryParam("num_rows")
	numRows, errL := strconv.ParseInt(numRowsStr, 10, 32)
	if errL != nil {
		log.Warn().Msgf("Failed to parse num_rows parameter: %s", numRowsStr)
		return nil, c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid num_rows parameter",
		})
	}

	pageOffsetStr := c.QueryParam("page_offset")
	pageOffset, errO := strconv.ParseInt(pageOffsetStr, 10, 32)
	if errO != nil {
		log.Warn().Msgf("Failed to parse page_offset parameter: %s", pageOffsetStr)
		return nil, c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid page_offset parameter",
		})
	}

	return &PaginationParams{NumRows: int(numRows), PageOffset: int(pageOffset)}, nil
}

func ParseSearch(c *echo.Context) string {
	return strings.TrimSpace(c.QueryParam("search"))
}

func ParseListQuery(c *echo.Context, defaultSortBy string, defaultSortDir string, allowedSortFields map[string]SortFieldConfig) (*ListQueryParams, error) {
	paginationParams, err := ParsePagination(c)
	if err != nil {
		return nil, err
	}

	search := ParseSearch(c)
	sortBy := strings.ToLower(strings.TrimSpace(c.QueryParam("sort_by")))
	sortDir := strings.ToLower(strings.TrimSpace(c.QueryParam("sort_dir")))

	if sortDir != "" && sortDir != SortDirectionAsc && sortDir != SortDirectionDesc {
		log.Warn().Msgf("Failed to validate sort_dir parameter: %s", sortDir)
		return nil, c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid sort_dir parameter",
		})
	}

	if sortBy == "" {
		return &ListQueryParams{
			PaginationParams: *paginationParams,
			Search:           search,
			SortBy:           defaultSortBy,
			SortDir:          defaultSortDir,
		}, nil
	}

	sortFieldConfig, ok := allowedSortFields[sortBy]
	if !ok {
		log.Warn().Msgf("Failed to validate sort_by parameter: %s", sortBy)
		return nil, c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid sort_by parameter",
		})
	}

	if sortDir == "" {
		sortDir = sortFieldConfig.DefaultDirection
	}

	return &ListQueryParams{
		PaginationParams: *paginationParams,
		Search:           search,
		SortBy:           sortBy,
		SortDir:          sortDir,
	}, nil
}
