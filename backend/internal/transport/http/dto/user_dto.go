package dto

type CreateUserRequest struct {
	Email    string `json:"email"    validate:"required,email"`
	Password string `json:"password" validate:"required"`
	Role     string `json:"role"     validate:"required,oneof=admin worker"`
}

type UpdateRoleRequest struct {
	Role string `json:"role" validate:"required,oneof=admin worker"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword" validate:"required"`
	NewPassword     string `json:"newPassword" validate:"required"`
}
