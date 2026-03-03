-- code: language=postgres

CREATE TABLE product_info (
    product_id UUID PRIMARY KEY DEFAULT uuidv7(),
    name TEXT NOT NULL,
    price_cents INTEGER CHECK (price_cents >= 0) NOT NULL,  -- price in cents to avoid floating point issues
    date_created TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    -- I know I need a trigger but idk how to implement
    date_modified TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE inventory (
    -- I'm making this an INT since there's a set number of
    -- slots in the machine.
    --
    -- BTW idk what the limit is i just put in 16 as a dummy value
    -- it being hardcoded is fine for now since we're only working on
    -- ONE machine
    slot_id INT PRIMARY KEY,
    slot_label VARCHAR(2) UNIQUE NOT NULL,  -- e.g. A1, B2, etc.
    -- Not unique since the same product could be in two diff slots
    product_id UUID REFERENCES product_info(product_id) ON DELETE RESTRICT,
    -- counts the number of items currently stocked
    quantity INT CHECK (quantity >= 0),
    -- Since items in the machine can change, this is
    -- is to keep track when a item was added in
    date_added TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuidv7(),
    product_id UUID REFERENCES product_info(product_id) ON DELETE RESTRICT NOT NULL,
    -- Snapshot of the price
    price_at_sale_cents INTEGER CHECK (price_at_sale_cents >= 0) NOT NULL,  -- price in cents to avoid floating point issues
    -- The reason that this does not have a DEFAULT CURRENT_TIMESTAMP
    -- is because we get the data from a spreadsheet we get hourly or
    -- daily (idk which yet) data, and I'm going to use the data from 
    -- that spreadsheet for the transaction info.
    date_sold TIMESTAMPTZ NOT NULL,
    -- This prevents the "Double Upload" or "System Glitch" duplicates
    CONSTRAINT unique_sale UNIQUE(product_id, price_at_sale_cents, date_sold)  
);