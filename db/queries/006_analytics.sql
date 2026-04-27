-- code: language=postgres

-- name: GetDailyRevenueAndProfit :many
-- Returns one row per day for the last N days.
-- This codebase stores one transaction row per sold item, so revenue and profit
-- are summed directly from each row without a quantity multiplier.
SELECT
    DATE(t.date_sold)::text AS sale_date,
    SUM(t.price_at_sale_cents) AS revenue_cents,
    SUM(t.price_at_sale_cents - COALESCE(p.cost_cents, 0)) AS profit_cents
FROM transactions t
LEFT JOIN product_info p ON t.product_id = p.product_id AND p.date_deleted IS NULL
WHERE t.date_sold >= CURRENT_DATE - (@days::int || ' days')::INTERVAL + INTERVAL '1 day'
GROUP BY DATE(t.date_sold)
ORDER BY sale_date ASC;

-- name: GetTopProducts :many
-- Units sold and profit per product for the last N days.
SELECT
    p.name AS product_name,
    COUNT(*) AS units_sold,
    SUM(t.price_at_sale_cents - COALESCE(p.cost_cents, 0)) AS profit_cents
FROM transactions t
JOIN product_info p ON t.product_id = p.product_id
WHERE p.date_deleted IS NULL
    AND t.date_sold >= CURRENT_DATE - (@days::int || ' days')::INTERVAL + INTERVAL '1 day'
GROUP BY p.product_id, p.name
ORDER BY units_sold DESC, LOWER(p.name) ASC;

-- name: GetInventoryHealth :many
-- Current quantity per slot with product name and cost/price for margin calculation.
SELECT
    i.slot_label AS slot_id,
    COALESCE(i.quantity, 0) AS quantity,
    COALESCE(p.name, '') AS product_name,
    COALESCE(p.cost_cents, 0) AS cost_cents,
    COALESCE(p.price_cents, 0) AS price_cents
FROM inventory i
LEFT JOIN product_info p ON i.product_id = p.product_id AND p.date_deleted IS NULL
ORDER BY i.slot_id ASC;

-- name: GetSalesHeatmap :many
-- Transaction count and revenue per calendar day for the last 28 days.
SELECT
    DATE(date_sold)::text AS sale_date,
    COUNT(*) AS transaction_count,
    SUM(price_at_sale_cents) AS revenue_cents
FROM transactions
WHERE date_sold >= CURRENT_DATE - INTERVAL '27 days'
GROUP BY DATE(date_sold)
ORDER BY sale_date ASC;
