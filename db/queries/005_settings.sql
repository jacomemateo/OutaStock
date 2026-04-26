-- name: GetAppSettings :one
SELECT * FROM app_settings WHERE id = 1;

-- name: UpdateLowStockThreshold :one
UPDATE app_settings SET low_stock_threshold = @low_stock_threshold WHERE id = 1 RETURNING *;
