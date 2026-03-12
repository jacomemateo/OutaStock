-- code: language=postgres

-- name: CountInventoryRows :one
SELECT COUNT(*) from inventory;

-- name: GetInventory :many
SELECT
    cp.slot_id,
    cp.slot_label,
    cp.quantity,
    cp.date_added,
    pi.name,
    pi.price_cents,
    pi.product_id
FROM inventory cp
LEFT JOIN product_info pi ON cp.product_id = pi.product_id
ORDER BY cp.slot_id
LIMIT @num_rows
OFFSET @page_offset; -- I have to pass this in from the frontend

-- name: UpdateInventory :exec
UPDATE inventory
SET
    product_id = COALESCE(@product_id, product_id),
    quantity   = COALESCE(@quantity, quantity)
WHERE slot_id = @slot_id;

-- name: ClearInventorySlot :exec
UPDATE inventory
SET
    product_id = NULL,
    quantity   = NULL
WHERE slot_id = @slot_id;
