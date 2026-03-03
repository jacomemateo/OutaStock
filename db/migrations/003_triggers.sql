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

-- Trigger to decerement inventory upon transaction
CREATE OR REPlACE FUNCTION deduct_inventory_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    -- This looks for the product_id sold and reduces quantity by 1
    -- We only target slots where the product is actually assigned.
    UPDATE inventory
    SET quantity = quantity - 1
    -- And this makes sure that in case a product is in more than one
    -- slot it decrements from the first slot it finds.
    WHERE slot_id = (
        SELECT slot_id
        FROM inventory
        WHERE product_id = NEW.product_id
        AND quantity > 0
        ORDER BY slot_id ASC -- empty lowest slot number first
        LIMIT 1 -- so that we only select ONE
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger that enforces that the inventory cannot contain different products with the same price.
CREATE OR REPLACE FUNCTION enforce_unique_price_in_inventory()
RETURNS TRIGGER AS $$
DECLARE
    new_price INTEGER;
BEGIN
    -- If slot is being cleared, allow it
    IF NEW.product_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Get price of product being inserted/updated
    SELECT price_cents INTO new_price
    FROM product_info
    WHERE product_id = NEW.product_id;

    -- Check if another slot already contains a different product
    -- with the same price
    IF EXISTS (
        SELECT 1
        FROM inventory i
        JOIN product_info p ON i.product_id = p.product_id
        WHERE i.slot_id <> NEW.slot_id
          AND i.product_id IS NOT NULL
          AND p.price_cents = new_price
          AND i.product_id <> NEW.product_id
    ) THEN
        RAISE EXCEPTION 
        'Inventory cannot contain different products with the same price (% cents).',
        new_price;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_unique_price_inventory_trigger
BEFORE INSERT OR UPDATE ON inventory
FOR EACH ROW
EXECUTE FUNCTION enforce_unique_price_in_inventory();