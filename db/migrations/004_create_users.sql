CREATE TABLE users (
    user_id       UUID        PRIMARY KEY DEFAULT uuidv7(),
    email         TEXT        UNIQUE NOT NULL,
    password_hash TEXT        NOT NULL,
    role          TEXT        NOT NULL DEFAULT 'worker' CHECK (role IN ('admin', 'worker')),
    is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
    created_by    UUID        REFERENCES users(user_id) ON DELETE SET NULL,
    date_created  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_modified TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_user_date_modified
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_date_modified();

CREATE TABLE app_settings (
    id                  INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    low_stock_threshold INT NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0)
);

INSERT INTO app_settings (low_stock_threshold) VALUES (5);
