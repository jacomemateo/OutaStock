-- code: language=postgres

-- name: GetCurrentProducts :many
SELECT
    cp.slot_id,
    cp.quantity,
    cp.date_added,
    pi.name,
    pi.price_cents,
    pi.product_id
FROM inventory cp
LEFT JOIN product_info pi ON cp.product_id = pi.product_id;

-- name: InsertProduct :exec
UPDATE inventory
SET
    product_id = @product_id,
    quantity = @quantity,
    date_added = NOW()
WHERE slot_id = @slot_id;

-- name: UnassignSlot :exec
UPDATE inventory
SET
    product_id = NULL,
    quantity = NULL,
    date_added = NULL
WHERE slot_id = @slot_id;

-- name: UpdateQuantity :exec
UPDATE inventory
SET quantity = @quantity
WHERE slot_id = @slot_id;