-- Make sure there's no data in the product_info table before seeding
DELETE FROM transactions;

-- Make sure there's no data in the inventory table before seeding
UPDATE inventory
SET product_id = NULL,
    quantity = NULL,
    date_added = NULL;


DELETE FROM product_info;