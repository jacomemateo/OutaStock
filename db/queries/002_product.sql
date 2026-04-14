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
SELECT
    product_id,
    name,
    cost_cents,
    price_cents,
    date_created,
    date_modified,
    date_deleted
FROM product_info
WHERE date_deleted IS NULL
    AND (@search = '' OR name ILIKE '%' || @search || '%')
ORDER BY
    CASE WHEN @sort_by = 'name' AND @sort_dir = 'asc' THEN LOWER(name) END ASC,
    CASE WHEN @sort_by = 'name' AND @sort_dir = 'desc' THEN LOWER(name) END DESC,
    CASE WHEN @sort_by = 'price' AND @sort_dir = 'asc' THEN price_cents END ASC,
    CASE WHEN @sort_by = 'price' AND @sort_dir = 'desc' THEN price_cents END DESC,
    CASE WHEN @sort_by = 'created_at' AND @sort_dir = 'asc' THEN date_created END ASC,
    CASE WHEN @sort_by = 'created_at' AND @sort_dir = 'desc' THEN date_created END DESC,
    LOWER(name) ASC,
    product_id ASC
LIMIT @num_rows
OFFSET @page_offset;

-- name: CountProductRows :one
SELECT COUNT(*)
FROM product_info
WHERE date_deleted IS NULL
    AND (@search = '' OR name ILIKE '%' || @search || '%');
