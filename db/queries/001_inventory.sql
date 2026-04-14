-- code: language=postgres

-- name: CountInventoryRows :one
SELECT COUNT(*)
FROM inventory cp
LEFT JOIN product_info pi ON cp.product_id = pi.product_id AND pi.date_deleted IS NULL
WHERE @search = '' OR COALESCE(pi.name, '') ILIKE '%' || @search || '%';

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
LEFT JOIN product_info pi ON cp.product_id = pi.product_id AND pi.date_deleted IS NULL
WHERE @search = '' OR COALESCE(pi.name, '') ILIKE '%' || @search || '%'
ORDER BY
    CASE WHEN @sort_by = 'location' AND @sort_dir = 'asc' THEN cp.slot_label END ASC,
    CASE WHEN @sort_by = 'location' AND @sort_dir = 'desc' THEN cp.slot_label END DESC,
    CASE WHEN @sort_by = 'product' AND @sort_dir = 'asc' THEN LOWER(pi.name) END ASC NULLS LAST,
    CASE WHEN @sort_by = 'product' AND @sort_dir = 'desc' THEN LOWER(pi.name) END DESC NULLS LAST,
    CASE WHEN @sort_by = 'quantity' AND @sort_dir = 'asc' THEN cp.quantity END ASC NULLS LAST,
    CASE WHEN @sort_by = 'quantity' AND @sort_dir = 'desc' THEN cp.quantity END DESC NULLS LAST,
    cp.slot_id ASC
LIMIT @num_rows
OFFSET @page_offset;

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
