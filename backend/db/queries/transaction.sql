-- code: language=postgres

-- name: GetRecentTransactions :many
SELECT
    t.transaction_id,
    t.price_at_sale,
    t.date_sold,
    p.name
FROM transactions as t
JOIN product_info p ON t.product_id = p.product_id
ORDER BY t.date_sold DESC
LIMIT @num_rows;