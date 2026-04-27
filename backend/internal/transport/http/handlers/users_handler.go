package handlers

import (
    "net/http"

    "github.com/google/uuid"
    "github.com/jacomemateo/OutaStock/backend/internal/service"
    "github.com/jacomemateo/OutaStock/backend/internal/transport/http/dto"
    httpmiddleware "github.com/jacomemateo/OutaStock/backend/internal/transport/http/middleware"
    "github.com/labstack/echo/v5"
    "github.com/rs/zerolog/log"
)

type UsersHandler struct {
    BinderValidator
    usersService *service.UsersService
    authService  *service.AuthService
}

func NewUsersHandler(usersService *service.UsersService, authService *service.AuthService) *UsersHandler {
    return &UsersHandler{usersService: usersService, authService: authService}
}

// RegisterRoutes now matches the Handler interface (one argument)
func (h *UsersHandler) RegisterRoutes(protectedGroup *echo.Group) {
    protectedGroup.PATCH("/users/me/password", h.ChangePassword)
}

// RegisterAdminRoutes is a specialized method for higher-privilege routes
func (h *UsersHandler) RegisterAdminRoutes(adminGroup *echo.Group) {
    adminGroup.GET("/users", h.ListUsers)
    adminGroup.POST("/users", h.CreateUser)
    adminGroup.PATCH("/users/:id/role", h.UpdateRole)
    adminGroup.DELETE("/users/:id", h.DeleteUser)
}

func (h *UsersHandler) ListUsers(c *echo.Context) error {
	users, err := h.usersService.ListUsers(c.Request().Context())
	if err != nil {
		log.Error().Err(err).Msg("ListUsers failed")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal_error"})
	}
	return c.JSON(http.StatusOK, users)
}

func (h *UsersHandler) CreateUser(c *echo.Context) error {
	var req dto.CreateUserRequest
	if ok, jsonErr := h.bindAndValidate(c, &req); !ok {
		return jsonErr
	}

	var createdBy *uuid.UUID
	if claims := httpmiddleware.GetClaims(c); claims != nil {
		callerID, err := uuid.Parse(claims.UserID)
		if err == nil {
			createdBy = &callerID
		}
	}

	user, err := h.authService.CreateUser(c.Request().Context(), req.Email, req.Password, req.Role, createdBy)
	if err != nil {
		if err == service.ErrWeakPassword {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
		}
		log.Error().Err(err).Msg("CreateUser failed")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal_error"})
	}

	return c.JSON(http.StatusCreated, map[string]string{
		"userId": user.UserID.String(),
		"email":  user.Email,
		"role":   user.Role,
	})
}

func (h *UsersHandler) UpdateRole(c *echo.Context) error {
	targetID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid user id"})
	}

	var req dto.UpdateRoleRequest
	if ok, jsonErr := h.bindAndValidate(c, &req); !ok {
		return jsonErr
	}

	callerID := uuid.Nil
	if claims := httpmiddleware.GetClaims(c); claims != nil {
		if parsedCallerID, err := uuid.Parse(claims.UserID); err == nil {
			callerID = parsedCallerID
		}
	}

	if err := h.usersService.UpdateRole(c.Request().Context(), targetID, callerID, req.Role); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}

func (h *UsersHandler) ChangePassword(c *echo.Context) error {
	var req dto.ChangePasswordRequest
	if ok, jsonErr := h.bindAndValidate(c, &req); !ok {
		return jsonErr
	}

	claims := httpmiddleware.GetClaims(c)
	if claims == nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	callerID, err := uuid.Parse(claims.UserID)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	if err := h.authService.UpdatePassword(c.Request().Context(), callerID, req.CurrentPassword, req.NewPassword); err != nil {
		switch err {
		case service.ErrInvalidCredentials:
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Current password is incorrect."})
		case service.ErrWeakPassword:
			return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
		case service.ErrUserInactive:
			return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
		default:
			log.Error().Err(err).Msg("ChangePassword failed")
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal_error"})
		}
	}

	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}

func (h *UsersHandler) DeleteUser(c *echo.Context) error {
	targetID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid user id"})
	}

	callerID := uuid.Nil
	if claims := httpmiddleware.GetClaims(c); claims != nil {
		if parsedCallerID, err := uuid.Parse(claims.UserID); err == nil {
			callerID = parsedCallerID
		}
	}

	if err := h.usersService.DeleteUser(c.Request().Context(), targetID, callerID); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}
