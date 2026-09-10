CREATE TABLE IF NOT EXISTS login_history (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    -- =========================================================
    -- USER
    -- =========================================================
    user_id BIGINT NULL,

    -- Keep these even when user_id is NULL.
    -- Useful when someone attempts login with an
    -- unknown username/email.
    username VARCHAR(100),
    email VARCHAR(150),

    -- =========================================================
    -- LOGIN RESULT
    -- =========================================================
    status VARCHAR(30) NOT NULL
        CHECK (
            status IN (
                'success',
                'failed',
                'blocked',
                'locked',
                'logout'
            )
        ),

    reason VARCHAR(255),

    -- =========================================================
    -- CLIENT
    -- =========================================================
    ip_address INET,

    user_agent TEXT,

    device_name VARCHAR(255),
    device_type VARCHAR(50),

    browser VARCHAR(100),
    browser_version VARCHAR(50),

    operating_system VARCHAR(100),
    os_version VARCHAR(50),

    -- =========================================================
    -- LOCATION / NETWORK INFORMATION
    -- =========================================================
    country_code CHAR(2),
    country_name VARCHAR(100),

    region VARCHAR(100),
    city VARCHAR(100),

    -- Optional if you later integrate IP geolocation.
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),

    -- =========================================================
    -- REQUEST INFORMATION
    -- =========================================================
    login_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Request/session correlation
    request_id UUID,

    session_id UUID
);

CREATE INDEX IF NOT EXISTS idx_login_history_user
    ON login_history(user_id);

CREATE INDEX IF NOT EXISTS idx_login_history_username
    ON login_history(LOWER(username));

CREATE INDEX IF NOT EXISTS idx_login_history_login_at
    ON login_history(login_at DESC);

CREATE INDEX IF NOT EXISTS idx_login_history_status
    ON login_history(status);

CREATE INDEX IF NOT EXISTS idx_login_history_ip
    ON login_history(ip_address);

CREATE INDEX IF NOT EXISTS idx_login_history_user_date
    ON login_history(user_id, login_at DESC);

CREATE INDEX IF NOT EXISTS idx_login_history_request
    ON login_history(request_id)
    WHERE request_id IS NOT NULL;