package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/rs/zerolog/log"

	config "github.com/jacomemateo/OutaStock/backend/cmd"
)

const tokenClaimsContextKey = "auth.token_claims"

type TokenClaims struct {
	Active    bool     `json:"active"`
	Audience  []string `json:"-"`
	ClientID  string   `json:"client_id"`
	ExpiresAt int64    `json:"exp"`
	IssuedAt  int64    `json:"iat"`
	Issuer    string   `json:"iss"`
	Scope     string   `json:"scope"`
	Subject   string   `json:"sub"`
	TokenType string   `json:"token_type"`
	Username  string   `json:"username"`
}

type tokenClaimsAlias struct {
	Active    bool            `json:"active"`
	Audience  json.RawMessage `json:"aud"`
	ClientID  string          `json:"client_id"`
	ExpiresAt int64           `json:"exp"`
	IssuedAt  int64           `json:"iat"`
	Issuer    string          `json:"iss"`
	Scope     string          `json:"scope"`
	Subject   string          `json:"sub"`
	TokenType string          `json:"token_type"`
	Username  string          `json:"username"`
}

func (claims *TokenClaims) UnmarshalJSON(data []byte) error {
	var alias tokenClaimsAlias
	if err := json.Unmarshal(data, &alias); err != nil {
		return err
	}

	claims.Active = alias.Active
	claims.ClientID = alias.ClientID
	claims.ExpiresAt = alias.ExpiresAt
	claims.IssuedAt = alias.IssuedAt
	claims.Issuer = alias.Issuer
	claims.Scope = alias.Scope
	claims.Subject = alias.Subject
	claims.TokenType = alias.TokenType
	claims.Username = alias.Username

	if len(alias.Audience) == 0 {
		return nil
	}

	var singleAudience string
	if err := json.Unmarshal(alias.Audience, &singleAudience); err == nil {
		claims.Audience = []string{singleAudience}
		return nil
	}

	var multipleAudiences []string
	if err := json.Unmarshal(alias.Audience, &multipleAudiences); err == nil {
		claims.Audience = multipleAudiences
	}

	return nil
}

type ZitadelAuthenticator struct {
	apiClientID      string
	apiClientSecret  string
	httpClient       *http.Client
	instanceHost     string
	introspectionURL string
	issuer           string
	projectID        string
}

func NewZitadelAuthenticator(cfg *config.Config) *ZitadelAuthenticator {
	instanceHost := ""
	if issuerURL, err := url.Parse(cfg.ZitadelIssuer); err == nil {
		instanceHost = issuerURL.Host
	}

	return &ZitadelAuthenticator{
		apiClientID:      cfg.APIClientID,
		apiClientSecret:  cfg.APIClientSecret,
		httpClient:       &http.Client{Timeout: 10 * time.Second},
		instanceHost:     instanceHost,
		introspectionURL: cfg.IntrospectionURL,
		issuer:           cfg.ZitadelIssuer,
		projectID:        cfg.ZitadelProjectID,
	}
}

func (authenticator *ZitadelAuthenticator) Middleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			if c.Request().Method == http.MethodOptions {
				return next(c)
			}

			tokenString, ok := extractBearerToken(c.Request().Header.Get(echo.HeaderAuthorization))
			if !ok {
				return respondUnauthorized(c, "Missing bearer token.")
			}

			tokenClaims, err := authenticator.introspectToken(c.Request().Context(), tokenString)
			if err != nil {
				log.Error().
					Err(err).
					Str("service", "auth").
					Msg("Failed to introspect access token")

				return c.JSON(http.StatusServiceUnavailable, map[string]string{
					"error":   "auth_unavailable",
					"message": "Authentication service is temporarily unavailable.",
				})
			}

			if !tokenClaims.Active {
				return respondUnauthorized(c, "Access token is not active for this API.")
			}

			if tokenClaims.Issuer != authenticator.issuer {
				return respondUnauthorized(c, "Access token issuer did not match the configured ZITADEL issuer.")
			}

			if authenticator.projectID != "" && !contains(tokenClaims.Audience, authenticator.projectID) {
				return respondUnauthorized(c, "Access token audience did not include the configured project.")
			}

			c.Set(tokenClaimsContextKey, tokenClaims)
			return next(c)
		}
	}
}

func (authenticator *ZitadelAuthenticator) introspectToken(ctx context.Context, tokenString string) (*TokenClaims, error) {
	form := url.Values{}
	form.Set("token", tokenString)
	form.Set("token_type_hint", "access_token")
	form.Set("scope", "openid")

	request, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		authenticator.introspectionURL,
		strings.NewReader(form.Encode()),
	)
	if err != nil {
		return nil, err
	}

	request.SetBasicAuth(authenticator.apiClientID, authenticator.apiClientSecret)
	request.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)
	if authenticator.instanceHost != "" {
		request.Host = authenticator.instanceHost
	}

	response, err := authenticator.httpClient.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	if response.StatusCode == http.StatusUnauthorized {
		return nil, echo.NewHTTPError(http.StatusServiceUnavailable, "ZITADEL introspection credentials were rejected")
	}

	if response.StatusCode != http.StatusOK {
		return nil, echo.NewHTTPError(http.StatusServiceUnavailable, "Unexpected response from ZITADEL introspection endpoint")
	}

	var tokenClaims TokenClaims
	if err := json.NewDecoder(response.Body).Decode(&tokenClaims); err != nil {
		return nil, err
	}

	return &tokenClaims, nil
}

func GetTokenClaims(c *echo.Context) (*TokenClaims, bool) {
	tokenClaims, ok := c.Get(tokenClaimsContextKey).(*TokenClaims)
	return tokenClaims, ok
}

func extractBearerToken(authorizationHeader string) (string, bool) {
	if authorizationHeader == "" {
		return "", false
	}

	const bearerPrefix = "Bearer "
	if !strings.HasPrefix(authorizationHeader, bearerPrefix) {
		return "", false
	}

	tokenString := strings.TrimSpace(strings.TrimPrefix(authorizationHeader, bearerPrefix))
	return tokenString, tokenString != ""
}

func respondUnauthorized(c *echo.Context, message string) error {
	return c.JSON(http.StatusUnauthorized, map[string]string{
		"error":   "unauthorized",
		"message": message,
	})
}

func contains(values []string, target string) bool {
	for _, value := range values {
		if value == target {
			return true
		}
	}

	return false
}
