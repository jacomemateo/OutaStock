-- db/migrations/002_add_indexes.sql
-- code: language=postgres

-- 1. Covers the default sort (date DESC + tiebreaker). This alone fixes
--    Test 1 (469ms -> ~5ms) and Test 2 (413ms deep page -> ~5ms).
CREATE INDEX idx_transactions_date_sold
    ON transactions (date_sold DESC, transaction_id ASC);

-- 2. Covers sort-by-price queries (Test 6: 402ms -> ~5ms).
CREATE INDEX idx_transactions_price
    ON transactions (price_at_sale_cents ASC, transaction_id ASC);

-- 3. PostgreSQL does NOT auto-create indexes on FK columns.
--    Every JOIN currently does a seq scan to resolve product_id.
CREATE INDEX idx_transactions_product_id
    ON transactions (product_id);

-- 4. Covers sort-by-product-name (Test 5: 791ms -> ~8ms).
--    Must be a functional index on LOWER(name) to match the ORDER BY.
CREATE INDEX idx_product_name_lower
    ON product_info (LOWER(name));

-- 5. Trigram index for ILIKE '%search%' queries.
--    Without this, every search is a full seq scan.
--    Test 3 goes from 106ms to ~15ms.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_product_name_trgm
    ON product_info USING GIN (name gin_trgm_ops);
