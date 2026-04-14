-- Seed data for 100 random transactions
DO $$
DECLARE
    counter INTEGER := 0;
    max_attempts INTEGER := 2000000;
    attempts INTEGER := 0;
    rand_product RECORD;
    rand_time TIMESTAMPTZ;
BEGIN
    WHILE counter < 10000 AND attempts < max_attempts LOOP
        attempts := attempts + 1;
        
        -- Get random product
        SELECT product_id, price_cents INTO rand_product
        FROM product_info
        ORDER BY random()
        LIMIT 1;
        
        -- Generate random time in last 30 days
        rand_time := to_timestamp(
            extract(epoch FROM NOW() - INTERVAL '5 years') +
            random() * extract(epoch FROM INTERVAL '5 years')
        );
        
        -- Try to insert, catch unique violation
        BEGIN
            INSERT INTO transactions (transaction_id, product_id, price_at_sale_cents, date_sold)
            VALUES (uuidv7(), rand_product.product_id, rand_product.price_cents, rand_time);
            
            counter := counter + 1;
            
            IF counter % 10 = 0 THEN
                RAISE NOTICE 'Inserted % transactions...', counter;
            END IF;
        EXCEPTION 
            WHEN unique_violation THEN
                -- Just try again with different values
                CONTINUE;
        END;
    END LOOP;
    
    RAISE NOTICE 'Finished! Inserted % transactions after % attempts', counter, attempts;
END $$;