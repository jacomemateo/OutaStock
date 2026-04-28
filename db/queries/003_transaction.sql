-- db/queries/003_transactions.sql
-- code: language=postgres

-- name: GetTransactions :many
SELECT
    t.transaction_id,
    t.price_at_sale_cents,
    t.date_sold,
    p.name
FROM transactions as t
JOIN product_info p ON t.product_id = p.product_id
WHERE @search = '' OR p.name ILIKE '%' || @search || '%'
ORDER BY
    CASE WHEN @sort_by = 'product' AND @sort_dir = 'asc' THEN LOWER(p.name) END ASC,
    CASE WHEN @sort_by = 'product' AND @sort_dir = 'desc' THEN LOWER(p.name) END DESC,
    CASE WHEN @sort_by = 'date' AND @sort_dir = 'asc' THEN t.date_sold END ASC,
    CASE WHEN @sort_by = 'date' AND @sort_dir = 'desc' THEN t.date_sold END DESC,
    CASE WHEN @sort_by = 'price' AND @sort_dir = 'asc' THEN t.price_at_sale_cents END ASC,
    CASE WHEN @sort_by = 'price' AND @sort_dir = 'desc' THEN t.price_at_sale_cents END DESC,
    t.date_sold DESC,
    t.transaction_id ASC
LIMIT @num_rows
OFFSET @page_offset;

-- name: CountTransactionRows :one
SELECT COUNT(*)
FROM transactions as t
JOIN product_info p ON t.product_id = p.product_id
WHERE @search = '' OR p.name ILIKE '%' || @search || '%';
