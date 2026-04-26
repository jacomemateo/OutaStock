package middleware

import (
	"net/http"
	"strings"

	"github.com/jacomemateo/OutaStock/backend/internal/service"
	"github.com/labstack/echo/v5"
)

const claimsContextKey = "auth.claims"

func NewJWTAuthMiddleware(authService *service.AuthService) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			header := c.Request().Header.Get("Authorization")
			tokenString, ok := extractBearer(header)
			if !ok {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized", "message": "Missing or malformed Authorization header."})
			}

			claims, err := authService.VerifyToken(tokenString)
			if err != nil {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized", "message": "Token is invalid or expired."})
			}

			c.Set(claimsContextKey, claims)
			return next(c)
		}
	}
}

func RequireAdmin(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) error {
		claims, ok := c.Get(claimsContextKey).(*service.OutaStockClaims)
		if !ok || claims == nil {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		}
		if claims.Role != "admin" {
			return c.JSON(http.StatusForbidden, map[string]string{"error": "forbidden", "message": "Admin role required."})
		}
		return next(c)
	}
}

func GetClaims(c *echo.Context) *service.OutaStockClaims {
	claims, _ := c.Get(claimsContextKey).(*service.OutaStockClaims)
	return claims
}

func extractBearer(header string) (string, bool) {
	const prefix = "Bearer "
	if !strings.HasPrefix(header, prefix) {
		return "", false
	}
	token := strings.TrimSpace(strings.TrimPrefix(header, prefix))
	return token, token != ""
}
