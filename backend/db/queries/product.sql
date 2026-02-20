-- name: CreateProduct :exec
INSERT INTO product_info (name, price)
VALUES ( $1, $2 );

-- name: UpdatePrice :exec
UPDATE product_info
SET price = $1
WHERE product_id = $2;

-- name: DeleteProduct :exec
DELETE FROM product_info
WHERE product_id = $1;

-- name: GetProducts :many 
SELECT * FROM product_info;