-- Make sure there's no data in the product_info table before seeding
DELETE FROM transactions;

-- Make sure there's no data in the inventory table before seeding
UPDATE inventory
SET product_id = NULL,
    quantity = NULL,
    date_added = NULL;


DELETE FROM product_info;


-- Seed data for products
INSERT INTO product_info (name, price_cents) VALUES
    -- Drinks (15)
    ('Coca-Cola', 159),
    ('Diet Coke', 165),
    ('Sprite', 149),
    ('Fanta Orange', 155),
    ('Dr Pepper', 189),
    ('Mountain Dew', 179),
    ('Pepsi', 157),
    ('Root Beer', 169),
    ('Lemonade', 225),
    ('Iced Tea', 185),
    ('Bottled Water', 129),
    ('Sparkling Water', 199),
    ('Gatorade', 259),
    ('Red Bull', 389),
    ('Monster Energy', 349),
    
    -- Candy (13)
    ('Snickers', 139),
    ('Twix', 145),
    ('Milky Way', 135),
    ('M&Ms', 159),
    ('Skittles', 149),
    ('Starburst', 139),
    ('Hershey Bar', 169),
    ('Kit Kat', 159),
    ('Reese Cups', 179),
    ('Almond Joy', 145),
    ('Twizzlers', 139),
    ('Gum', 109),
    ('Mints', 119),
    
    -- Chips (11)
    ('Lays Classic', 169),
    ('Doritos', 179),
    ('Cheetos', 175),
    ('Pringles', 229),
    ('Sun Chips', 185),
    ('Ruffles', 165),
    ('Tostitos', 189),
    ('Pretzels', 139),
    ('Popcorn', 149),
    ('Goldfish', 159),
    ('Cheez-It', 189),
    
    -- Other (7)
    ('Granola Bar', 179),
    ('Protein Bar', 289),
    ('Trail Mix', 249),
    ('Beef Jerky', 359),
    ('Sunflower Seeds', 129),
    ('Oatmeal', 219),
    ('Fruit Snacks', 169);