CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id BIGINT NOT NULL,

    -- =========================================================
    -- DEVICE
    -- =========================================================
    device_name VARCHAR(255),
    device_type VARCHAR(50),

    browser VARCHAR(100),
    browser_version VARCHAR(50),

    operating_system VARCHAR(100),
    os_version VARCHAR(50),

    user_agent TEXT,

    ip_address INET,

    -- =========================================================
    -- SESSION STATE
    -- =========================================================
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    last_activity_at TIMESTAMPTZ,

    expires_at TIMESTAMPTZ NOT NULL,

    revoked_at TIMESTAMPTZ,

    revoked_reason VARCHAR(255),

    CONSTRAINT fk_user_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_user_session_expiry
        CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user
    ON user_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_active
    ON user_sessions(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_user_sessions_expires
    ON user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_user_sessions_activity
    ON user_sessions(last_activity_at DESC);