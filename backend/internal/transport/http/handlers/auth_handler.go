package handlers

import (
	"errors"
	"net/http"
	"net/url"
	"strings"

	"github.com/jacomemateo/OutaStock/backend/internal/service"
	"github.com/jacomemateo/OutaStock/backend/internal/transport/http/dto"
	"github.com/labstack/echo/v5"
	"github.com/rs/zerolog/log"
)

type AuthHandler struct {
	BinderValidator
	authService *service.HeadlessAuthService
}

func NewAuthHandler(authService *service.HeadlessAuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) RegisterRoutes(api *echo.Group) {
	api.POST("/auth/login", h.LoginHeadless)
}

func (h *AuthHandler) LoginHeadless(c *echo.Context) error {
	var req dto.HeadlessLoginRequest
	if ok, jsonErr := h.bindAndValidate(c, &req); !ok {
		return jsonErr
	}

	redirectURI, err := resolveRedirectURI(c)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error":   "invalid_origin",
			"message": "Could not determine a valid frontend origin for sign-in.",
		})
	}

	result, err := h.authService.Login(c.Request().Context(), service.HeadlessLoginInput{
		Password:    req.Password,
		RedirectURI: redirectURI,
		Username:    req.Username,
	})
	if err != nil {
		log.Error().
			Err(err).
			Str("service", "auth").
			Msg("Headless login failed")

		var authErr *service.HeadlessAuthError
		if ok := errors.As(err, &authErr); ok {
			return c.JSON(authErr.StatusCode, map[string]string{
				"error":   "login_failed",
				"message": authErr.PublicMessage,
			})
		}

		return c.JSON(http.StatusServiceUnavailable, map[string]string{
			"error":   "auth_unavailable",
			"message": "Authentication service is temporarily unavailable.",
		})
	}

	return c.JSON(http.StatusOK, result)
}

func resolveRedirectURI(c *echo.Context) (string, error) {
	origin := strings.TrimSpace(c.Request().Header.Get(echo.HeaderOrigin))
	if origin == "" {
		referer := strings.TrimSpace(c.Request().Header.Get("Referer"))
		if referer != "" {
			refererURL, err := url.Parse(referer)
			if err == nil && refererURL.Scheme != "" && refererURL.Host != "" {
				origin = refererURL.Scheme + "://" + refererURL.Host
			}
		}
	}

	if origin == "" {
		scheme := c.Scheme()
		if scheme == "" {
			scheme = "http"
		}

		host := c.Request().Host
		if host == "" {
			return "", echo.NewHTTPError(http.StatusBadRequest, "missing request host")
		}

		origin = scheme + "://" + host
	}

	originURL, err := url.Parse(origin)
	if err != nil {
		return "", err
	}

	if originURL.Scheme == "" || originURL.Host == "" {
		return "", echo.NewHTTPError(http.StatusBadRequest, "invalid request origin")
	}

	originURL.Path = "/auth/callback"
	originURL.RawPath = ""
	originURL.RawQuery = ""
	originURL.Fragment = ""
	return originURL.String(), nil
}
