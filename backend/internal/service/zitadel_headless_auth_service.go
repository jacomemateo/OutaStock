package service

import (
	"bytes"
	"context"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	config "github.com/jacomemateo/OutaStock/backend/cmd"
)

const (
	headlessLoginScope      = "openid urn:zitadel:iam:org:project:id:zitadel:aud"
	maxErrorResponseBodyLen = 8 * 1024
)

type HeadlessLoginInput struct {
	Password    string
	RedirectURI string
	Username    string
}

type HeadlessLoginResult struct {
	AccessToken string         `json:"accessToken"`
	ExpiresIn   int64          `json:"expiresIn"`
	IDToken     string         `json:"idToken,omitempty"`
	Scope       string         `json:"scope,omitempty"`
	TokenType   string         `json:"tokenType"`
	User        map[string]any `json:"user"`
}

type HeadlessAuthService struct {
	apiBaseURL       string
	httpClient       *http.Client
	issuerHost       string
	issuerScheme     string
	machineKey       *zitadelServiceUserMachineKey
	noRedirectClient *http.Client
	oidcClientID     string
	oidcScope        string
	serviceUserToken string
}

type HeadlessAuthError struct {
	Err           error
	PublicMessage string
	StatusCode    int
}

func (e *HeadlessAuthError) Error() string {
	if e.Err == nil {
		return e.PublicMessage
	}

	if e.PublicMessage == "" {
		return e.Err.Error()
	}

	return fmt.Sprintf("%s: %v", e.PublicMessage, e.Err)
}

func (e *HeadlessAuthError) Unwrap() error {
	return e.Err
}

type zitadelServiceUserMachineKey struct {
	Key    string `json:"key"`
	KeyID  string `json:"keyId"`
	Type   string `json:"type"`
	UserID string `json:"userId"`
}

type zitadelSessionResponse struct {
	SessionID    string `json:"sessionId"`
	SessionToken string `json:"sessionToken"`
}

type zitadelTokenResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   int64  `json:"expires_in"`
	IDToken     string `json:"id_token"`
	Scope       string `json:"scope"`
	TokenType   string `json:"token_type"`
}

type zitadelCallbackResponse struct {
	CallbackURL string `json:"callbackUrl"`
}

type zitadelErrorResponse struct {
	Error            string `json:"error"`
	ErrorDescription string `json:"error_description"`
	Message          string `json:"message"`
}

func NewHeadlessAuthService(cfg *config.Config) (*HeadlessAuthService, error) {
	issuerURL, err := url.Parse(cfg.ZitadelIssuer)
	if err != nil {
		return nil, fmt.Errorf("parse ZITADEL issuer: %w", err)
	}

	apiURL, err := url.Parse(cfg.ZitadelAPIURL)
	if err != nil {
		return nil, fmt.Errorf("parse ZITADEL API URL: %w", err)
	}

	service := &HeadlessAuthService{
		apiBaseURL:   strings.TrimRight(apiURL.String(), "/"),
		httpClient:   &http.Client{Timeout: 15 * time.Second},
		issuerHost:   issuerURL.Host,
		issuerScheme: issuerURL.Scheme,
		noRedirectClient: &http.Client{
			Timeout: 15 * time.Second,
			CheckRedirect: func(_ *http.Request, _ []*http.Request) error {
				return http.ErrUseLastResponse
			},
		},
		oidcClientID:     cfg.ZitadelOIDCClientID,
		oidcScope:        cfg.ZitadelOIDCScope,
		serviceUserToken: strings.TrimSpace(cfg.ZitadelServiceUserToken),
	}

	if cfg.ZitadelServiceUserMachineKeyB64 != "" {
		machineKey, err := decodeServiceUserMachineKey(cfg.ZitadelServiceUserMachineKeyB64)
		if err != nil {
			return nil, err
		}

		service.machineKey = machineKey
	}

	return service, nil
}

func (s *HeadlessAuthService) Login(
	ctx context.Context,
	input HeadlessLoginInput,
) (*HeadlessLoginResult, error) {
	serviceToken, err := s.getServiceAccessToken(ctx)
	if err != nil {
		return nil, err
	}

	session, err := s.createSession(ctx, serviceToken, input.Username)
	if err != nil {
		return nil, err
	}

	session, err = s.updateSessionWithPassword(ctx, serviceToken, session.SessionID, input.Password)
	if err != nil {
		return nil, err
	}

	codeVerifier, err := randomBase64URL(48)
	if err != nil {
		return nil, &HeadlessAuthError{
			Err:           err,
			PublicMessage: "Authentication service is temporarily unavailable.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	callbackState, err := randomBase64URL(24)
	if err != nil {
		return nil, &HeadlessAuthError{
			Err:           err,
			PublicMessage: "Authentication service is temporarily unavailable.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	nonce, err := randomBase64URL(24)
	if err != nil {
		return nil, &HeadlessAuthError{
			Err:           err,
			PublicMessage: "Authentication service is temporarily unavailable.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	authRequestID, err := s.initializeOIDCAuthRequest(
		ctx,
		input.RedirectURI,
		input.Username,
		callbackState,
		nonce,
		codeVerifier,
	)
	if err != nil {
		return nil, err
	}

	callbackURL, err := s.finalizeOIDCAuthRequest(ctx, serviceToken, authRequestID, session)
	if err != nil {
		return nil, err
	}

	tokenResponse, err := s.exchangeCallbackForTokens(
		ctx,
		callbackURL,
		input.RedirectURI,
		callbackState,
		codeVerifier,
	)
	if err != nil {
		return nil, err
	}

	user := s.resolveUserProfile(ctx, tokenResponse, input.Username)

	return &HeadlessLoginResult{
		AccessToken: tokenResponse.AccessToken,
		ExpiresIn:   tokenResponse.ExpiresIn,
		IDToken:     tokenResponse.IDToken,
		Scope:       tokenResponse.Scope,
		TokenType:   tokenResponse.TokenType,
		User:        user,
	}, nil
}

func (s *HeadlessAuthService) getServiceAccessToken(ctx context.Context) (string, error) {
	if s.serviceUserToken != "" {
		return s.serviceUserToken, nil
	}

	if s.machineKey == nil {
		return "", &HeadlessAuthError{
			Err:           errors.New("no ZITADEL service user credential configured"),
			PublicMessage: "Headless auth is not configured for the backend.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	assertion, err := s.createServiceJWTAssertion()
	if err != nil {
		return "", &HeadlessAuthError{
			Err:           err,
			PublicMessage: "Authentication service is temporarily unavailable.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	form := url.Values{}
	form.Set("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer")
	form.Set("scope", headlessLoginScope)
	form.Set("assertion", assertion)

	tokenResponse, err := s.doFormRequest(
		ctx,
		s.httpClient,
		http.MethodPost,
		"/oauth/v2/token",
		form,
		"",
		false,
	)
	if err != nil {
		return "", err
	}

	var parsed zitadelTokenResponse
	if err := json.Unmarshal(tokenResponse, &parsed); err != nil {
		return "", &HeadlessAuthError{
			Err:           err,
			PublicMessage: "Authentication service is temporarily unavailable.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	if parsed.AccessToken == "" {
		return "", &HeadlessAuthError{
			Err:           errors.New("ZITADEL returned an empty service access token"),
			PublicMessage: "Authentication service is temporarily unavailable.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	return parsed.AccessToken, nil
}

func (s *HeadlessAuthService) createSession(
	ctx context.Context,
	serviceToken string,
	username string,
) (*zitadelSessionResponse, error) {
	responseBody, err := s.doJSONRequest(
		ctx,
		s.httpClient,
		http.MethodPost,
		"/v2/sessions",
		map[string]any{
			"checks": map[string]any{
				"user": map[string]any{
					"loginName": username,
				},
			},
		},
		serviceToken,
		true,
	)
	if err != nil {
		return nil, err
	}

	var sessionResponse zitadelSessionResponse
	if err := json.Unmarshal(responseBody, &sessionResponse); err != nil {
		return nil, &HeadlessAuthError{
			Err:           err,
			PublicMessage: "Authentication service returned an invalid response.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	if sessionResponse.SessionID == "" || sessionResponse.SessionToken == "" {
		return nil, &HeadlessAuthError{
			Err:           errors.New("ZITADEL session create response was incomplete"),
			PublicMessage: "Authentication service returned an invalid response.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	return &sessionResponse, nil
}

func (s *HeadlessAuthService) updateSessionWithPassword(
	ctx context.Context,
	serviceToken string,
	sessionID string,
	password string,
) (*zitadelSessionResponse, error) {
	responseBody, err := s.doJSONRequest(
		ctx,
		s.httpClient,
		http.MethodPatch,
		fmt.Sprintf("/v2/sessions/%s", url.PathEscape(sessionID)),
		map[string]any{
			"checks": map[string]any{
				"password": map[string]any{
					"password": password,
				},
			},
		},
		serviceToken,
		true,
	)
	if err != nil {
		return nil, err
	}

	var sessionResponse zitadelSessionResponse
	if err := json.Unmarshal(responseBody, &sessionResponse); err != nil {
		return nil, &HeadlessAuthError{
			Err:           err,
			PublicMessage: "Authentication service returned an invalid response.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	if sessionResponse.SessionToken == "" {
		return nil, &HeadlessAuthError{
			Err:           errors.New("ZITADEL session update response was incomplete"),
			PublicMessage: "Authentication service returned an invalid response.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	sessionResponse.SessionID = sessionID
	return &sessionResponse, nil
}

func (s *HeadlessAuthService) initializeOIDCAuthRequest(
	ctx context.Context,
	redirectURI string,
	username string,
	state string,
	nonce string,
	codeVerifier string,
) (string, error) {
	authorizeURL, err := url.Parse(s.apiBaseURL + "/oauth/v2/authorize")
	if err != nil {
		return "", &HeadlessAuthError{
			Err:           err,
			PublicMessage: "Authentication service is temporarily unavailable.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	authorizeURL.RawQuery = url.Values{
		"client_id":             []string{s.oidcClientID},
		"code_challenge":        []string{createCodeChallenge(codeVerifier)},
		"code_challenge_method": []string{"S256"},
		"login_hint":            []string{username},
		"nonce":                 []string{nonce},
		"redirect_uri":          []string{redirectURI},
		"response_type":         []string{"code"},
		"scope":                 []string{s.oidcScope},
		"state":                 []string{state},
	}.Encode()

	request, err := http.NewRequestWithContext(ctx, http.MethodGet, authorizeURL.String(), nil)
	if err != nil {
		return "", &HeadlessAuthError{
			Err:           err,
			PublicMessage: "Authentication service is temporarily unavailable.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	s.applyProxyHeaders(request)

	response, err := s.noRedirectClient.Do(request)
	if err != nil {
		return "", &HeadlessAuthError{
			Err:           err,
			PublicMessage: "Authentication service is temporarily unavailable.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusFound && response.StatusCode != http.StatusSeeOther {
		return "", s.mapUnexpectedAuthResponse(response, "initialize OIDC login", false)
	}

	location := response.Header.Get("Location")
	if location == "" {
		return "", &HeadlessAuthError{
			Err:           errors.New("missing redirect location from ZITADEL authorize endpoint"),
			PublicMessage: "Authentication service returned an invalid response.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	locationURL, err := url.Parse(location)
	if err != nil {
		return "", &HeadlessAuthError{
			Err:           err,
			PublicMessage: "Authentication service returned an invalid response.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	authRequestID := locationURL.Query().Get("authRequest")
	if authRequestID == "" {
		return "", &HeadlessAuthError{
			Err:           errors.New("missing authRequest ID in ZITADEL redirect"),
			PublicMessage: "Authentication service returned an invalid response.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	return authRequestID, nil
}

func (s *HeadlessAuthService) finalizeOIDCAuthRequest(
	ctx context.Context,
	serviceToken string,
	authRequestID string,
	session *zitadelSessionResponse,
) (string, error) {
	responseBody, err := s.doJSONRequest(
		ctx,
		s.httpClient,
		http.MethodPost,
		fmt.Sprintf("/v2/oidc/auth_requests/%s", url.PathEscape(authRequestID)),
		map[string]any{
			"session": map[string]any{
				"sessionId":    session.SessionID,
				"sessionToken": session.SessionToken,
			},
		},
		serviceToken,
		false,
	)
	if err != nil {
		return "", err
	}

	var callbackResponse zitadelCallbackResponse
	if err := json.Unmarshal(responseBody, &callbackResponse); err != nil {
		return "", &HeadlessAuthError{
			Err:           err,
			PublicMessage: "Authentication service returned an invalid response.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	if callbackResponse.CallbackURL == "" {
		return "", &HeadlessAuthError{
			Err:           errors.New("ZITADEL callback response did not include a callback URL"),
			PublicMessage: "Authentication service returned an invalid response.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	return callbackResponse.CallbackURL, nil
}

func (s *HeadlessAuthService) exchangeCallbackForTokens(
	ctx context.Context,
	callbackURL string,
	redirectURI string,
	expectedState string,
	codeVerifier string,
) (*zitadelTokenResponse, error) {
	parsedCallbackURL, err := url.Parse(callbackURL)
	if err != nil {
		return nil, &HeadlessAuthError{
			Err:           err,
			PublicMessage: "Authentication service returned an invalid response.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	if authError := parsedCallbackURL.Query().Get("error"); authError != "" {
		errorDescription := parsedCallbackURL.Query().Get("error_description")
		return nil, &HeadlessAuthError{
			Err:           fmt.Errorf("OIDC callback error: %s %s", authError, errorDescription),
			PublicMessage: "Sign-in failed. Please try again.",
			StatusCode:    http.StatusUnauthorized,
		}
	}

	code := parsedCallbackURL.Query().Get("code")
	state := parsedCallbackURL.Query().Get("state")
	if code == "" || state == "" {
		return nil, &HeadlessAuthError{
			Err:           errors.New("callback URL did not include code and state"),
			PublicMessage: "Authentication service returned an invalid response.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	if state != expectedState {
		return nil, &HeadlessAuthError{
			Err:           fmt.Errorf("unexpected callback state %q", state),
			PublicMessage: "Authentication service returned an invalid response.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	form := url.Values{}
	form.Set("client_id", s.oidcClientID)
	form.Set("code", code)
	form.Set("code_verifier", codeVerifier)
	form.Set("grant_type", "authorization_code")
	form.Set("redirect_uri", redirectURI)

	responseBody, err := s.doFormRequest(
		ctx,
		s.httpClient,
		http.MethodPost,
		"/oauth/v2/token",
		form,
		"",
		false,
	)
	if err != nil {
		return nil, err
	}

	var tokenResponse zitadelTokenResponse
	if err := json.Unmarshal(responseBody, &tokenResponse); err != nil {
		return nil, &HeadlessAuthError{
			Err:           err,
			PublicMessage: "Authentication service returned an invalid response.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	if tokenResponse.AccessToken == "" || tokenResponse.TokenType == "" {
		return nil, &HeadlessAuthError{
			Err:           errors.New("token response missing access token"),
			PublicMessage: "Authentication service returned an invalid response.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	return &tokenResponse, nil
}

func (s *HeadlessAuthService) resolveUserProfile(
	ctx context.Context,
	tokenResponse *zitadelTokenResponse,
	username string,
) map[string]any {
	user, err := s.fetchUserInfo(ctx, tokenResponse.AccessToken)
	if err == nil && len(user) > 0 {
		return user
	}

	if idTokenClaims := decodeJWTClaims(tokenResponse.IDToken); len(idTokenClaims) > 0 {
		return idTokenClaims
	}

	return map[string]any{
		"name":               username,
		"preferred_username": username,
	}
}

func (s *HeadlessAuthService) fetchUserInfo(
	ctx context.Context,
	accessToken string,
) (map[string]any, error) {
	request, err := http.NewRequestWithContext(
		ctx,
		http.MethodGet,
		s.apiBaseURL+"/oidc/v1/userinfo",
		nil,
	)
	if err != nil {
		return nil, err
	}

	s.applyProxyHeaders(request)
	request.Header.Set("Authorization", "Bearer "+accessToken)

	response, err := s.httpClient.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("userinfo endpoint returned %d", response.StatusCode)
	}

	var userInfo map[string]any
	if err := json.NewDecoder(response.Body).Decode(&userInfo); err != nil {
		return nil, err
	}

	return userInfo, nil
}

func (s *HeadlessAuthService) createServiceJWTAssertion() (string, error) {
	block, _ := pem.Decode([]byte(s.machineKey.Key))
	if block == nil {
		return "", errors.New("failed to decode service user private key PEM")
	}

	privateKey, err := parseRSAPrivateKey(block.Bytes)
	if err != nil {
		return "", err
	}

	now := time.Now().UTC()
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, jwt.MapClaims{
		"aud": s.issuerScheme + "://" + s.issuerHost,
		"exp": now.Add(5 * time.Minute).Unix(),
		"iat": now.Unix(),
		"iss": s.machineKey.UserID,
		"sub": s.machineKey.UserID,
	})
	token.Header["kid"] = s.machineKey.KeyID

	return token.SignedString(privateKey)
}

func (s *HeadlessAuthService) doJSONRequest(
	ctx context.Context,
	client *http.Client,
	method string,
	requestPath string,
	body any,
	bearerToken string,
	credentialError bool,
) ([]byte, error) {
	bodyBytes, err := json.Marshal(body)
	if err != nil {
		return nil, &HeadlessAuthError{
			Err:           err,
			PublicMessage: "Authentication service is temporarily unavailable.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	request, err := http.NewRequestWithContext(
		ctx,
		method,
		s.apiBaseURL+requestPath,
		bytes.NewReader(bodyBytes),
	)
	if err != nil {
		return nil, &HeadlessAuthError{
			Err:           err,
			PublicMessage: "Authentication service is temporarily unavailable.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	s.applyProxyHeaders(request)
	request.Header.Set("Accept", "application/json")
	request.Header.Set("Content-Type", "application/json")
	if bearerToken != "" {
		request.Header.Set("Authorization", "Bearer "+bearerToken)
	}

	return s.executeRequest(client, request, credentialError)
}

func (s *HeadlessAuthService) doFormRequest(
	ctx context.Context,
	client *http.Client,
	method string,
	requestPath string,
	form url.Values,
	bearerToken string,
	credentialError bool,
) ([]byte, error) {
	request, err := http.NewRequestWithContext(
		ctx,
		method,
		s.apiBaseURL+requestPath,
		strings.NewReader(form.Encode()),
	)
	if err != nil {
		return nil, &HeadlessAuthError{
			Err:           err,
			PublicMessage: "Authentication service is temporarily unavailable.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	s.applyProxyHeaders(request)
	request.Header.Set("Accept", "application/json")
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	if bearerToken != "" {
		request.Header.Set("Authorization", "Bearer "+bearerToken)
	}

	return s.executeRequest(client, request, credentialError)
}

func (s *HeadlessAuthService) executeRequest(
	client *http.Client,
	request *http.Request,
	credentialError bool,
) ([]byte, error) {
	response, err := client.Do(request)
	if err != nil {
		return nil, &HeadlessAuthError{
			Err:           err,
			PublicMessage: "Authentication service is temporarily unavailable.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}
	defer response.Body.Close()

	bodyBytes, readErr := io.ReadAll(io.LimitReader(response.Body, maxErrorResponseBodyLen))
	if readErr != nil {
		return nil, &HeadlessAuthError{
			Err:           readErr,
			PublicMessage: "Authentication service is temporarily unavailable.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}

	if response.StatusCode >= http.StatusOK && response.StatusCode < http.StatusMultipleChoices {
		return bodyBytes, nil
	}

	return nil, s.mapZitadelError(response.StatusCode, bodyBytes, credentialError)
}

func (s *HeadlessAuthService) mapUnexpectedAuthResponse(
	response *http.Response,
	operation string,
	credentialError bool,
) error {
	bodyBytes, _ := io.ReadAll(io.LimitReader(response.Body, maxErrorResponseBodyLen))
	return s.mapZitadelError(response.StatusCode, bodyBytes, credentialError, operation)
}

func (s *HeadlessAuthService) mapZitadelError(
	statusCode int,
	bodyBytes []byte,
	credentialError bool,
	operation ...string,
) error {
	message := parseZitadelErrorMessage(bodyBytes)
	if message == "" {
		message = http.StatusText(statusCode)
	}

	contextMessage := "ZITADEL request failed"
	if len(operation) > 0 && operation[0] != "" {
		contextMessage = operation[0]
	}

	switch {
	case credentialError && (statusCode == http.StatusBadRequest ||
		statusCode == http.StatusUnauthorized ||
		statusCode == http.StatusForbidden ||
		statusCode == http.StatusNotFound):
		return &HeadlessAuthError{
			Err:           fmt.Errorf("%s: %s", contextMessage, message),
			PublicMessage: "Invalid username or password.",
			StatusCode:    http.StatusUnauthorized,
		}
	default:
		return &HeadlessAuthError{
			Err:           fmt.Errorf("%s: %s", contextMessage, message),
			PublicMessage: "Authentication service is temporarily unavailable.",
			StatusCode:    http.StatusServiceUnavailable,
		}
	}
}

func (s *HeadlessAuthService) applyProxyHeaders(request *http.Request) {
	if s.issuerHost == "" {
		return
	}

	request.Host = s.issuerHost
	if s.issuerScheme != "" {
		request.Header.Set("X-Forwarded-Proto", s.issuerScheme)
	}
}

func createCodeChallenge(codeVerifier string) string {
	digest := sha256.Sum256([]byte(codeVerifier))
	return base64.RawURLEncoding.EncodeToString(digest[:])
}

func randomBase64URL(byteLength int) (string, error) {
	randomBytes := make([]byte, byteLength)
	if _, err := rand.Read(randomBytes); err != nil {
		return "", err
	}

	return base64.RawURLEncoding.EncodeToString(randomBytes), nil
}

func decodeServiceUserMachineKey(encoded string) (*zitadelServiceUserMachineKey, error) {
	decodedBytes, err := base64.StdEncoding.DecodeString(encoded)
	if err != nil {
		return nil, fmt.Errorf("decode ZITADEL service user machine key: %w", err)
	}

	var machineKey zitadelServiceUserMachineKey
	if err := json.Unmarshal(decodedBytes, &machineKey); err != nil {
		return nil, fmt.Errorf("parse ZITADEL service user machine key: %w", err)
	}

	if machineKey.UserID == "" || machineKey.KeyID == "" || machineKey.Key == "" {
		return nil, errors.New("ZITADEL service user machine key is missing required fields")
	}

	return &machineKey, nil
}

func parseRSAPrivateKey(derBytes []byte) (*rsa.PrivateKey, error) {
	privateKey, err := x509.ParsePKCS1PrivateKey(derBytes)
	if err == nil {
		return privateKey, nil
	}

	pkcs8Key, err := x509.ParsePKCS8PrivateKey(derBytes)
	if err != nil {
		return nil, errors.New("failed to parse RSA private key")
	}

	parsedKey, ok := pkcs8Key.(*rsa.PrivateKey)
	if !ok {
		return nil, errors.New("private key is not an RSA key")
	}

	return parsedKey, nil
}

func parseZitadelErrorMessage(bodyBytes []byte) string {
	if len(bodyBytes) == 0 {
		return ""
	}

	var parsed zitadelErrorResponse
	if err := json.Unmarshal(bodyBytes, &parsed); err == nil {
		switch {
		case parsed.ErrorDescription != "":
			return parsed.ErrorDescription
		case parsed.Message != "":
			return parsed.Message
		case parsed.Error != "":
			return parsed.Error
		}
	}

	return strings.TrimSpace(string(bodyBytes))
}

func decodeJWTClaims(token string) map[string]any {
	parts := strings.Split(token, ".")
	if len(parts) < 2 {
		return nil
	}

	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil
	}

	var claims map[string]any
	if err := json.Unmarshal(payload, &claims); err != nil {
		return nil
	}

	return claims
}
