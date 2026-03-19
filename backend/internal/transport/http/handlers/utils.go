package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

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
    NumRows  int
    PageOffset int
}

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