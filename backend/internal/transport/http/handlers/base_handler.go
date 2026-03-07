package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/jacomemateo/OutaStock/backend/internal/validation"
	"github.com/labstack/echo/v5"
	"github.com/rs/zerolog/log"
)

type BaseHandler struct{}

func (h *BaseHandler) bindAndValidate(c *echo.Context, v any) (bool, error) {
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
