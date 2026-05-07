DO $$
DECLARE
    target          INTEGER     := 5000000;
    batch_size      INTEGER     := 5000;       -- rows accumulated before each INSERT
    max_attempts    INTEGER     := 150000000;  -- safety ceiling

    counter         INTEGER     := 0;
    attempts        INTEGER     := 0;
    batch_count     INTEGER     := 0;
    inserted        BIGINT      := 0;

    -- Pre-loaded product catalogue (avoids per-row ORDER BY random() full scan)
    product_ids     UUID[];
    product_prices  INTEGER[];
    num_products    INTEGER;
    rand_idx        INTEGER;

    rand_time       TIMESTAMPTZ;
    accept_prob     FLOAT;
    hour_diff       FLOAT;
    day_weight      FLOAT;
    time_weight     FLOAT;

    -- Batch staging arrays
    b_ids           UUID[]        := '{}';
    b_products      UUID[]        := '{}';
    b_prices        INTEGER[]     := '{}';
    b_times         TIMESTAMPTZ[] := '{}';
BEGIN
    -- ----------------------------------------------------------------
    -- 1. Cache the product catalogue once up front.
    --    ORDER BY random() on every row was an O(n) scan each iteration.
    -- ----------------------------------------------------------------
    SELECT array_agg(product_id), array_agg(price_cents)
    INTO   product_ids, product_prices
    FROM   product_info;

    num_products := array_length(product_ids, 1);
    RAISE NOTICE 'Loaded % products into memory.', num_products;

    -- ----------------------------------------------------------------
    -- 2. Main generation loop
    -- ----------------------------------------------------------------
    WHILE counter < target AND attempts < max_attempts LOOP
        attempts := attempts + 1;

        -- Pick a random product from the in-memory array (O(1))
        rand_idx := (random() * (num_products - 1))::INTEGER + 1;

        -- Random timestamp within the last 5 years
        rand_time := to_timestamp(
            extract(epoch FROM NOW() - INTERVAL '5 years') +
            random() * extract(epoch FROM INTERVAL '5 years')
        );

        -- Day weighting: weekends less active
        IF extract(dow FROM rand_time) IN (0, 6) THEN
            day_weight := 0.4;
        ELSE
            day_weight := 1.0;
        END IF;

        -- Time weighting: Gaussian peak at 16:00
        hour_diff   := abs(extract(hour FROM rand_time) - 16);
        time_weight := exp(-(hour_diff * hour_diff) / 20.0);
        accept_prob := day_weight * time_weight;

        -- Rejection sampling
        IF random() > accept_prob THEN
            CONTINUE;
        END IF;

        -- ── Accumulate into batch arrays ──────────────────────────────
        batch_count := batch_count + 1;
        b_ids       := array_append(b_ids,      uuidv7());
        b_products  := array_append(b_products,  product_ids[rand_idx]);
        b_prices    := array_append(b_prices,    product_prices[rand_idx]);
        b_times     := array_append(b_times,     rand_time);

        -- ── Flush when batch is full ───────────────────────────────────
        IF batch_count >= batch_size THEN
            INSERT INTO transactions (
                transaction_id,
                product_id,
                price_at_sale_cents,
                date_sold
            )
            SELECT
                unnest(b_ids),
                unnest(b_products),
                unnest(b_prices),
                unnest(b_times)
            ON CONFLICT DO NOTHING;   -- replaces the per-row EXCEPTION block

            GET DIAGNOSTICS inserted = ROW_COUNT;
            counter     := counter + inserted;
            batch_count := 0;
            b_ids       := '{}';
            b_products  := '{}';
            b_prices    := '{}';
            b_times     := '{}';

            IF counter % 500000 = 0 THEN
                RAISE NOTICE 'Inserted % / % transactions (% attempts so far)...',
                             counter, target, attempts;
            END IF;
        END IF;
    END LOOP;

    -- ----------------------------------------------------------------
    -- 3. Flush any remaining rows in the last partial batch
    -- ----------------------------------------------------------------
    IF batch_count > 0 THEN
        INSERT INTO transactions (
            transaction_id,
            product_id,
            price_at_sale_cents,
            date_sold
        )
        SELECT
            unnest(b_ids),
            unnest(b_products),
            unnest(b_prices),
            unnest(b_times)
        ON CONFLICT DO NOTHING;

        GET DIAGNOSTICS inserted = ROW_COUNT;
        counter := counter + inserted;
    END IF;

    RAISE NOTICE 'Done. Inserted % transactions in % attempts.', counter, attempts;
END $$;
