-- code: language=postgres

-- name: CreateProduct :exec
INSERT INTO product_info (name, price_cents)
VALUES ( @name, @price_cents );

-- name: UpdateProduct :exec
UPDATE product_info
SET
    price_cents = COALESCE(@price_cents, price_cents),
    name = COALESCE(@name, name)
WHERE product_id = @product_id;

-- name: DeleteProduct :exec
DELETE FROM product_info
WHERE product_id = @product_id;

-- name: GetProducts :many 
SELECT * FROM product_info
ORDER BY name;