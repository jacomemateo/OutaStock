DO $$
DECLARE
    counter INTEGER := 0;
    max_attempts INTEGER := 2000000;
    attempts INTEGER := 0;

    rand_product RECORD;
    rand_time TIMESTAMPTZ;

    accept_prob FLOAT;
    hour_diff FLOAT;
    day_weight FLOAT;
    time_weight FLOAT;
BEGIN
    WHILE counter < 100000 AND attempts < max_attempts LOOP
        attempts := attempts + 1;

        -- Random product
        SELECT product_id, price_cents INTO rand_product
        FROM product_info
        ORDER BY random()
        LIMIT 1;

        -- Generate random timestamp in last 5 years
        rand_time := to_timestamp(
            extract(epoch FROM NOW() - INTERVAL '5 years') +
            random() * extract(epoch FROM INTERVAL '5 years')
        );

        -- ===== Day weighting =====
        -- 0 = Sunday, 6 = Saturday
        IF extract(dow FROM rand_time) IN (0, 6) THEN
            day_weight := 0.4;  -- weekends (less activity)
        ELSE
            day_weight := 1.0;  -- weekdays
        END IF;

        -- ===== Time weighting (peak around 16:00) =====
        hour_diff := abs(extract(hour FROM rand_time) - 16);

        -- Gaussian-like dropoff from 4 PM
        time_weight := exp(- (hour_diff * hour_diff) / 20.0);

        -- Combined probability
        accept_prob := day_weight * time_weight;

        -- Reject most "bad" timestamps
        IF random() > accept_prob THEN
            CONTINUE;
        END IF;

        -- Try insert
        BEGIN
            INSERT INTO transactions (
                transaction_id,
                product_id,
                price_at_sale_cents,
                date_sold
            )
            VALUES (
                uuidv7(),
                rand_product.product_id,
                rand_product.price_cents,
                rand_time
            );

            counter := counter + 1;

            IF counter % 1000 = 0 THEN
                RAISE NOTICE 'Inserted % transactions...', counter;
            END IF;

        EXCEPTION
            WHEN unique_violation THEN
                CONTINUE;
        END;
    END LOOP;

    RAISE NOTICE 'Finished! Inserted % transactions after % attempts', counter, attempts;
END $$;