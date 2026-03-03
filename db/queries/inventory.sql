-- code: language=postgres

-- name: GetInventory :many
SELECT
    cp.slot_id,
    cp.quantity,
    cp.date_added,
    pi.name,
    pi.price_cents,
    pi.product_id
FROM inventory cp
LEFT JOIN product_info pi ON cp.product_id = pi.product_id;

-- name: UpdateInventory :exec
UPDATE inventory
SET
    product_id = COALESCE(@product_id, product_id),
    quantity   = COALESCE(@quantity, quantity)
WHERE slot_id = @slot_id;