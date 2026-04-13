-- code: language=postgres

-- name: CreateProduct :exec
INSERT INTO product_info (name, cost_cents, price_cents)
VALUES ( @name, @cost_cents, @price_cents );

-- name: UpdateProductName :exec
UPDATE product_info
SET name = @name
WHERE product_id = @product_id;

-- name: UpdateProductPrice :exec
UPDATE product_info
SET price_cents = @price_cents
WHERE product_id = @product_id;

-- name: UpdateProductCost :exec
UPDATE product_info
SET cost_cents = @cost_cents
WHERE product_id = @product_id;

-- name: DeleteProduct :exec
UPDATE product_info
SET date_deleted = NOW()
WHERE product_id = @product_id;

-- name: GetProducts :many 
SELECT * FROM product_info
WHERE date_deleted IS NULL
ORDER BY name
LIMIT @num_rows
OFFSET @page_offset;

-- name: CountProductRows :one
SELECT COUNT(*) from product_info;