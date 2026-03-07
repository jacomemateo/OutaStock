package handlers
import (
	"encoding/json"
	"github.com/labstack/echo/v5"
	"github.com/rs/zerolog/log"
	"net/http"
	"github.com/go-playground/validator/v10"
)

func (h *ProductsHandler) bindAndValidate(c *echo.Context, v any) error {
	decoder := json.NewDecoder(c.Request().Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(v); err != nil {
		log.Warn().Msgf("Failed to decode request body: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	if err := h.validator.Struct(v); err != nil {
		validationErrors := err.(validator.ValidationErrors)
		errors := map[string]string{}

		for _, e := range validationErrors {
			errors[e.Field()] = e.Tag()
		}

		log.Warn().Msgf("validation error %s", errors)

		return c.JSON(http.StatusBadRequest, errors)
	}

	return nil
}