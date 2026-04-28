-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 1: Page 1, default sort (date DESC), no search
-- ─────────────────────────────────────────────────────────────────────────────
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
    t.transaction_id,
    t.price_at_sale_cents,
    t.date_sold,
    p.name
FROM transactions t
JOIN product_info p ON t.product_id = p.product_id
WHERE '' = '' OR p.name ILIKE '%' || '' || '%'
ORDER BY t.date_sold DESC, t.transaction_id ASC
LIMIT 20 OFFSET 0;


-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 2: Deep page — offset 980 = page 50 (this is where offset pagination hurts)
-- ─────────────────────────────────────────────────────────────────────────────
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
    t.transaction_id,
    t.price_at_sale_cents,
    t.date_sold,
    p.name
FROM transactions t
JOIN product_info p ON t.product_id = p.product_id
WHERE '' = '' OR p.name ILIKE '%' || '' || '%'
ORDER BY t.date_sold DESC, t.transaction_id ASC
LIMIT 20 OFFSET 980;


-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 3: Search with ILIKE (the slow path — no trgm index yet)
-- ─────────────────────────────────────────────────────────────────────────────
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
    t.transaction_id,
    t.price_at_sale_cents,
    t.date_sold,
    p.name
FROM transactions t
JOIN product_info p ON t.product_id = p.product_id
WHERE p.name ILIKE '%cola%'
ORDER BY t.date_sold DESC, t.transaction_id ASC
LIMIT 20 OFFSET 0;


-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 4: COUNT(*) — the full table scan that runs on every page load
-- ─────────────────────────────────────────────────────────────────────────────
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT COUNT(*)
FROM transactions t
JOIN product_info p ON t.product_id = p.product_id;


-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 5: Sort by product name
-- ─────────────────────────────────────────────────────────────────────────────
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
    t.transaction_id,
    t.price_at_sale_cents,
    t.date_sold,
    p.name
FROM transactions t
JOIN product_info p ON t.product_id = p.product_id
WHERE '' = '' OR p.name ILIKE '%' || '' || '%'
ORDER BY LOWER(p.name) ASC, t.transaction_id ASC
LIMIT 20 OFFSET 0;


-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 6: Sort by price
-- ─────────────────────────────────────────────────────────────────────────────
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT
    t.transaction_id,
    t.price_at_sale_cents,
    t.date_sold,
    p.name
FROM transactions t
JOIN product_info p ON t.product_id = p.product_id
WHERE '' = '' OR p.name ILIKE '%' || '' || '%'
ORDER BY t.price_at_sale_cents ASC, t.transaction_id ASC
LIMIT 20 OFFSET 0;


-- ─────────────────────────────────────────────────────────────────────────────
-- TEST 7: Fast approximate count (after you add the optimization)
-- Compare this timing against TEST 4 above
-- ─────────────────────────────────────────────────────────────────────────────
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT reltuples::BIGINT AS estimate
FROM pg_catalog.pg_class
WHERE relname = 'transactions';