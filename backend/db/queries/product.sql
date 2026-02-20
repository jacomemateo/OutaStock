-- code: language=postgres

-- name: CreateProduct :exec
INSERT INTO product_info (name, price)
VALUES ( @name, @price );

-- name: UpdatePrice :exec
UPDATE product_info
SET price = @price
WHERE product_id = @product_id;

-- name: DeleteProduct :exec
DELETE FROM product_info
WHERE product_id = @product_id;

-- name: GetProducts :many 
SELECT * FROM product_info;