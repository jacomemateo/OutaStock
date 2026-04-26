-- name: CreateUser :one
INSERT INTO users (email, password_hash, role, created_by)
VALUES (@email, @password_hash, @role, @created_by)
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = @email AND is_active = TRUE;

-- name: GetUserByID :one
SELECT * FROM users WHERE user_id = @user_id;

-- name: ListUsers :many
SELECT user_id, email, role, is_active, created_by, date_created
FROM users
WHERE is_active = TRUE
ORDER BY date_created ASC;

-- name: UpdateUserRole :one
UPDATE users SET role = @role WHERE user_id = @user_id RETURNING *;

-- name: DeleteUser :one
DELETE FROM users
WHERE user_id = @user_id
RETURNING *;

-- name: CountUsers :one
SELECT COUNT(*) FROM users;

-- name: UpdateUserPasswordHash :one
UPDATE users
SET password_hash = @password_hash
WHERE user_id = @user_id
RETURNING *;
