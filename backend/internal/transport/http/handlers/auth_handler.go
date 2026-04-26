package handlers

import (
	"errors"
	"net/http"

	"github.com/google/uuid"
	"github.com/jacomemateo/OutaStock/backend/internal/service"
	"github.com/jacomemateo/OutaStock/backend/internal/transport/http/dto"
	httpmiddleware "github.com/jacomemateo/OutaStock/backend/internal/transport/http/middleware"
	"github.com/labstack/echo/v5"
	"github.com/rs/zerolog/log"
)

type AuthHandler struct {
	BinderValidator
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) RegisterRoutes(api *echo.Group) {
	api.POST("/auth/login", h.Login)
}

func (h *AuthHandler) RegisterProtectedRoutes(authGroup *echo.Group) {
	authGroup.GET("/auth/session", h.GetSession)
}

func (h *AuthHandler) Login(c *echo.Context) error {
	var req dto.LoginRequest
	if ok, jsonErr := h.bindAndValidate(c, &req); !ok {
		return jsonErr
	}

	result, err := h.authService.Login(c.Request().Context(), req.Email, req.Password)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) || errors.Is(err, service.ErrUserInactive) {
			return c.JSON(http.StatusUnauthorized, map[string]string{
				"error":   "unauthorized",
				"message": "Invalid email or password.",
			})
		}
		log.Error().Err(err).Msg("Login error")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal_error"})
	}

	return c.JSON(http.StatusOK, dto.LoginResponse{
		AccessToken: result.AccessToken,
		TokenType:   result.TokenType,
		ExpiresIn:   result.ExpiresIn,
		Role:        result.Role,
		Email:       result.Email,
		UserID:      result.UserID,
	})
}

func (h *AuthHandler) GetSession(c *echo.Context) error {
	claims := httpmiddleware.GetClaims(c)
	if claims == nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	result, err := h.authService.RevalidateSession(c.Request().Context(), userID)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) || errors.Is(err, service.ErrUserInactive) {
			return c.JSON(http.StatusUnauthorized, map[string]string{
				"error":   "unauthorized",
				"message": "Session is no longer valid.",
			})
		}

		log.Error().Err(err).Msg("Session refresh error")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal_error"})
	}

	return c.JSON(http.StatusOK, dto.LoginResponse{
		AccessToken: result.AccessToken,
		TokenType:   result.TokenType,
		ExpiresIn:   result.ExpiresIn,
		Role:        result.Role,
		Email:       result.Email,
		UserID:      result.UserID,
	})
}
