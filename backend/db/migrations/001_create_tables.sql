-- code: language=postgres

CREATE TABLE product_info (
    product_id UUID PRIMARY KEY DEFAULT uuidv7(),
    name TEXT NOT NULL,
    price NUMERIC(10, 2) CHECK (price >= 0) NOT NULL,
    date_created TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    -- I know I need a trigger but idk how to implement
    date_modified TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE current_products (
    -- I'm making this an INT since there's a set number of
    -- slots in the machine.
    --
    -- BTW idk what the limit is i just put in 16 as a dummy value
    -- it being hardcoded is fine for now since we're only working on
    -- ONE machine
    slot_id INT PRIMARY KEY CHECK (slot_id BETWEEN 1 AND 16), 
    -- Not unique since the same product could be in two diff slots
    product_id UUID REFERENCES product_info(product_id) ON DELETE RESTRICT,
    -- counts the number of items currently stocked
    quantity INT CHECK (quantity >= 0),
    -- Since items in the machine can change, this is
    -- is to keep track when a item was added in
    date_added TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Auto fill in the number of slots
INSERT INTO current_products (slot_id, product_id, quantity, date_added)
SELECT i, NULL, NULL, NULL
FROM generate_series(1, 16) AS i;

CREATE TABLE transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuidv7(),
    product_id UUID REFERENCES product_info(product_id) ON DELETE RESTRICT NOT NULL,
    -- Snapshot of the price
    price_at_sale NUMERIC(10, 2) CHECK (price_at_sale >= 0) NOT NULL,
    -- The reason that this does not have a DEFAULT CURRENT_TIMESTAMP
    -- is because we get the data from a spreadsheet we get hourly or
    -- daily (idk which yet) data, and I'm going to use the data from 
    -- that spreadsheet for the transaction info.
    date_sold TIMESTAMPTZ NOT NULL,
    -- This prevents the "Double Upload" or "System Glitch" duplicates
    CONSTRAINT unique_sale UNIQUE(product_id, price_at_sale, date_sold)
);

--####TRIGGERS####

-- Trigger for product info
CREATE OR REPLACE FUNCTION update_date_modified()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modified = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_product_date_modified
BEFORE UPDATE ON product_info
FOR EACH ROW
EXECUTE FUNCTION update_date_modified();

-- Trigger to decerement current_products upon transaction
CREATE OR REPlACE FUNCTION deduct_inventory_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    -- This looks for the product_id sold and reduces quantity by 1
    -- We only target slots where the product is actually assigned.
    UPDATE current_products
    SET quantity = quantity - 1
    -- And this makes sure that in case a product is in more than one
    -- slot it decrements from the first slot it finds.
    WHERE slot_id = (
        SELECT slot_id
        FROM current_products
        WHERE product_id = NEW.product_id
        AND quantity > 0
        ORDER BY slot_id ASC -- empty lowest slot number first
        LIMIT 1 -- so that we only select ONE
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;