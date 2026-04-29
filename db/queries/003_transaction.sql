-- db/queries/003_transaction.sql
-- code: language=postgres

-- name: GetTransactionsByDate :many
SELECT
    t.transaction_id,
    t.price_at_sale_cents,
    t.date_sold,
    p.name
FROM transactions t
JOIN product_info p ON t.product_id = p.product_id
WHERE @search::text = '' OR p.name ILIKE '%' || @search || '%'
ORDER BY
    CASE WHEN @sort_dir::text = 'asc' THEN t.date_sold END ASC,
    CASE WHEN @sort_dir::text = 'desc' THEN t.date_sold END DESC,
    t.transaction_id ASC
LIMIT @num_rows::int
OFFSET @page_offset::int;

-- name: GetTransactionsByProduct :many
SELECT
    t.transaction_id,
    t.price_at_sale_cents,
    t.date_sold,
    p.name
FROM transactions t
JOIN product_info p ON t.product_id = p.product_id
WHERE @search::text = '' OR p.name ILIKE '%' || @search || '%'
ORDER BY
    CASE WHEN @sort_dir::text = 'asc' THEN LOWER(p.name) END ASC,
    CASE WHEN @sort_dir::text = 'desc' THEN LOWER(p.name) END DESC,
    t.transaction_id ASC
LIMIT @num_rows::int
OFFSET @page_offset::int;

-- name: GetTransactionsByPrice :many
SELECT
    t.transaction_id,
    t.price_at_sale_cents,
    t.date_sold,
    p.name
FROM transactions t
JOIN product_info p ON t.product_id = p.product_id
WHERE @search::text = '' OR p.name ILIKE '%' || @search || '%'
ORDER BY
    CASE WHEN @sort_dir::text = 'asc' THEN t.price_at_sale_cents END ASC,
    CASE WHEN @sort_dir::text = 'desc' THEN t.price_at_sale_cents END DESC,
    t.transaction_id ASC
LIMIT @num_rows::int
OFFSET @page_offset::int;

-- name: CountTransactionRows :one
SELECT COUNT(*)
FROM transactions t
JOIN product_info p ON t.product_id = p.product_id
WHERE @search::text = '' OR p.name ILIKE '%' || @search || '%';

-- name: CountTransactionRowsApprox :one
-- Reads from PostgreSQL stats catalog. Returns in ~0.014ms vs 285ms for COUNT(*).
-- Slightly stale (autovacuum updates it) but fine for pagination UI display.
SELECT reltuples::BIGINT AS estimate
FROM pg_catalog.pg_class
WHERE relname = 'transactions';

-- name: GetTransactionsByDateKeyset :many
-- Cursor-based pagination for date sort.
-- On the first page, pass cursor_date = NULL and cursor_id = NULL.
-- On subsequent pages, pass the date_sold and transaction_id of the LAST row
-- from the previous page as the cursor values.
SELECT
    t.transaction_id,
    t.price_at_sale_cents,
    t.date_sold,
    p.name
FROM transactions t
JOIN product_info p ON t.product_id = p.product_id
WHERE
    (@search::text = '' OR p.name ILIKE '%' || @search || '%')
    AND (
        @cursor_date::timestamptz IS NULL
        OR (t.date_sold, t.transaction_id) < (@cursor_date::timestamptz, @cursor_id::uuid)
    )
ORDER BY t.date_sold DESC, t.transaction_id ASC
LIMIT @num_rows::int;
