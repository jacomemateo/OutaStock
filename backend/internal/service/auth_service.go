package service

import (
	"context"
	"errors"
	"fmt"
	"time"
	"unicode"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	config "github.com/jacomemateo/OutaStock/backend/cmd"
	"github.com/jacomemateo/OutaStock/backend/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrUserInactive       = errors.New("user account is inactive")
	ErrWeakPassword       = errors.New("password must be at least 8 characters and include an uppercase letter, number, and symbol")
)

type OutaStockClaims struct {
	UserID string `json:"uid"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

type LoginResult struct {
	AccessToken string `json:"accessToken"`
	TokenType   string `json:"tokenType"`
	ExpiresIn   int64  `json:"expiresIn"`
	Role        string `json:"role"`
	Email       string `json:"email"`
	UserID      string `json:"userId"`
}

type AuthService struct {
	db  *Database
	cfg *config.Config
}

func NewAuthService(db *Database, cfg *config.Config) *AuthService {
	return &AuthService{db: db, cfg: cfg}
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*LoginResult, error) {
	user, err := s.db.queries.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, ErrInvalidCredentials
	}
	if !user.IsActive {
		return nil, ErrUserInactive
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, ErrInvalidCredentials
	}
	return s.issueToken(user)
}

func (s *AuthService) issueToken(user repository.User) (*LoginResult, error) {
	if !user.UserID.Valid {
		return nil, fmt.Errorf("user is missing a valid id")
	}

	ttl := s.cfg.AccessTokenTTL
	if ttl <= 0 {
		ttl = 15
	}

	now := time.Now()
	exp := now.Add(time.Duration(ttl) * time.Minute)
	userID := convertPgtypeUUIDToString(user.UserID)

	claims := OutaStockClaims{
		UserID: userID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(exp),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		return nil, fmt.Errorf("sign token: %w", err)
	}

	return &LoginResult{
		AccessToken: signed,
		TokenType:   "Bearer",
		ExpiresIn:   int64(ttl * 60),
		Role:        user.Role,
		Email:       user.Email,
		UserID:      userID,
	}, nil
}

func (s *AuthService) VerifyToken(tokenString string) (*OutaStockClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &OutaStockClaims{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(s.cfg.JWTSecret), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*OutaStockClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

func HashPassword(plain string) (string, error) {
	if err := ValidatePasswordComplexity(plain); err != nil {
		return "", err
	}
	b, err := bcrypt.GenerateFromPassword([]byte(plain), bcrypt.DefaultCost)
	return string(b), err
}

func (s *AuthService) CreateUser(ctx context.Context, email, password, role string, createdBy *uuid.UUID) (repository.User, error) {
	hash, err := HashPassword(password)
	if err != nil {
		return repository.User{}, fmt.Errorf("hash password: %w", err)
	}

	params := repository.CreateUserParams{
		Email:        email,
		PasswordHash: hash,
		Role:         role,
		CreatedBy:    pgtype.UUID{Valid: false},
	}
	if createdBy != nil {
		params.CreatedBy = uuidToPgtype(*createdBy)
	}

	return s.db.queries.CreateUser(ctx, params)
}

func ValidatePasswordComplexity(password string) error {
	if len(password) < 8 {
		return ErrWeakPassword
	}

	var hasUpper bool
	var hasDigit bool
	var hasSymbol bool

	for _, r := range password {
		switch {
		case unicode.IsUpper(r):
			hasUpper = true
		case unicode.IsDigit(r):
			hasDigit = true
		case unicode.IsPunct(r) || unicode.IsSymbol(r):
			hasSymbol = true
		}
	}

	if !hasUpper || !hasDigit || !hasSymbol {
		return ErrWeakPassword
	}

	return nil
}

func (s *AuthService) UpdatePassword(ctx context.Context, userID uuid.UUID, currentPassword, newPassword string) error {
	user, err := s.db.queries.GetUserByID(ctx, uuidToPgtype(userID))
	if err != nil {
		return fmt.Errorf("get user: %w", err)
	}
	if !user.IsActive {
		return ErrUserInactive
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(currentPassword)); err != nil {
		return ErrInvalidCredentials
	}

	hash, err := HashPassword(newPassword)
	if err != nil {
		return err
	}

	_, err = s.db.queries.UpdateUserPasswordHash(ctx, repository.UpdateUserPasswordHashParams{
		UserID:       uuidToPgtype(userID),
		PasswordHash: hash,
	})
	if err != nil {
		return fmt.Errorf("update password hash: %w", err)
	}

	return nil
}
