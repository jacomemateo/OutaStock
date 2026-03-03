-- Auto fill in the number of slots
INSERT INTO inventory (slot_id, product_id, quantity, date_added)
SELECT i, NULL, NULL, NULL
FROM generate_series(1, 16) AS i;