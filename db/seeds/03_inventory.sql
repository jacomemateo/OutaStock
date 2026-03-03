-- Clear inventory assignments
UPDATE inventory
SET product_id = NULL,
    quantity = NULL,
    date_added = NULL;

-- Fill 25 slots using products with unique prices
WITH unique_price_products AS (
    SELECT DISTINCT ON (price_cents)
        product_id
    FROM product_info
    ORDER BY price_cents, random()
    LIMIT 25
),
numbered_products AS (
    SELECT 
        product_id,
        ROW_NUMBER() OVER () AS rn
    FROM unique_price_products
)
UPDATE inventory i
SET
    product_id = np.product_id,
    quantity = floor(random() * 8 + 3)::INT,  -- 3–10 stock
    date_added = NOW() - (INTERVAL '1 day' * floor(random() * 14))
FROM numbered_products np
WHERE i.slot_id = np.rn;