CREATE TABLE IF NOT EXISTS user_refresh_tokens (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    -- =========================================================
    -- USER
    -- =========================================================
    user_id BIGINT NOT NULL,

    -- One login/session
    session_id UUID NOT NULL,

    -- NEVER store the actual refresh token.
    -- Store only a cryptographic hash.
    refresh_token_hash VARCHAR(255) NOT NULL,

    -- =========================================================
    -- CLIENT INFORMATION
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
    -- TOKEN STATE
    -- =========================================================
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    issued_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    last_used_at TIMESTAMPTZ,

    revoked_at TIMESTAMPTZ,

    revoked_reason VARCHAR(255),

    expires_at TIMESTAMPTZ NOT NULL,

    -- =========================================================
    -- TOKEN ROTATION / SECURITY
    -- =========================================================
    rotated_from_token_id BIGINT NULL,

    replaced_by_token_id BIGINT NULL,

    reuse_detected_at TIMESTAMPTZ,

    -- =========================================================
    -- AUDIT
    -- =========================================================
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- =========================================================
    -- FOREIGN KEYS
    -- =========================================================
    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_refresh_tokens_rotated_from
        FOREIGN KEY (rotated_from_token_id)
        REFERENCES user_refresh_tokens(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_refresh_tokens_replaced_by
        FOREIGN KEY (replaced_by_token_id)
        REFERENCES user_refresh_tokens(id)
        ON DELETE SET NULL,

    -- =========================================================
    -- UNIQUE
    -- =========================================================
    CONSTRAINT uq_refresh_token_hash
        UNIQUE (refresh_token_hash),

    -- =========================================================
    -- VALIDATION
    -- =========================================================
    CONSTRAINT chk_refresh_token_expiry
        CHECK (expires_at > issued_at)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_refresh_token_active_session
    ON user_refresh_tokens (session_id)
    WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user
    ON user_refresh_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_active
    ON user_refresh_tokens(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires
    ON user_refresh_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_last_used
    ON user_refresh_tokens(last_used_at);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_revoked
    ON user_refresh_tokens(revoked_at)
    WHERE revoked_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_active
    ON user_refresh_tokens(user_id, expires_at)
    WHERE is_active = TRUE;