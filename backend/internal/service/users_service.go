package service

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jacomemateo/OutaStock/backend/internal/repository"
)

type UsersService struct{ db *Database }

func NewUsersService(db *Database) *UsersService { return &UsersService{db: db} }

type UserResponse struct {
	UserID      string `json:"userId"`
	Email       string `json:"email"`
	Role        string `json:"role"`
	IsActive    bool   `json:"isActive"`
	DateCreated string `json:"dateCreated"`
}

func (s *UsersService) ListUsers(ctx context.Context) ([]UserResponse, error) {
	rows, err := s.db.queries.ListUsers(ctx)
	if err != nil {
		return nil, err
	}

	out := make([]UserResponse, len(rows))
	for i, r := range rows {
		out[i] = UserResponse{
			UserID:      convertPgtypeUUIDToString(r.UserID),
			Email:       r.Email,
			Role:        r.Role,
			IsActive:    r.IsActive,
			DateCreated: formatPgTimestamp(r.DateCreated),
		}
	}

	return out, nil
}

func (s *UsersService) UpdateRole(ctx context.Context, targetID, callerID uuid.UUID, newRole string) error {
	if callerID != uuid.Nil && targetID == callerID {
		return fmt.Errorf("cannot change your own role")
	}
	if newRole != "admin" && newRole != "worker" {
		return fmt.Errorf("invalid role")
	}

	_, err := s.db.queries.UpdateUserRole(ctx, repository.UpdateUserRoleParams{
		UserID: uuidToPgtype(targetID),
		Role:   newRole,
	})
	return err
}

func (s *UsersService) DeleteUser(ctx context.Context, targetID, callerID uuid.UUID) error {
	if callerID != uuid.Nil && targetID == callerID {
		return fmt.Errorf("cannot delete your own account")
	}

	_, err := s.db.queries.DeleteUser(ctx, uuidToPgtype(targetID))
	return err
}
