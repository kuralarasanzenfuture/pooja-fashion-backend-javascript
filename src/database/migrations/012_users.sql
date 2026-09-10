1CREATE TABLE
    IF NOT EXISTS users (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        -- =========================================================
        -- ORGANIZATION
        -- =========================================================
        company_id BIGINT NOT NULL,
        branch_id BIGINT NULL,
        employee_id BIGINT NULL,
        role_id BIGINT NULL,
        -- =========================================================
        -- LOGIN DETAILS
        -- =========================================================
        username VARCHAR(100) NOT NULL,
        email VARCHAR(150),
        phone VARCHAR(20),
        password_hash TEXT NOT NULL,
        -- =========================================================
        -- PROFILE IMAGE
        -- =========================================================
        profile_image_url TEXT,
        profile_image_key VARCHAR(500),
        profile_image_name VARCHAR(255),
        profile_image_mime_type VARCHAR(100),
        profile_image_size BIGINT,
        -- =========================================================
        -- ACCOUNT STATUS
        -- =========================================================
        status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (
            status IN ('active', 'inactive', 'blocked', 'locked')
        ),
        -- =========================================================
        -- VERIFICATION
        -- =========================================================
        is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
        is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
        email_verified_at TIMESTAMPTZ,
        phone_verified_at TIMESTAMPTZ,
        -- =========================================================
        -- LOGIN SECURITY
        -- =========================================================
        failed_login_attempts INTEGER NOT NULL DEFAULT 0,
        locked_until TIMESTAMPTZ,
        last_login_at TIMESTAMPTZ,
        last_login_ip INET,
        -- =========================================================
        -- PASSWORD SECURITY
        -- =========================================================
        password_changed_at TIMESTAMPTZ,
        must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
        -- Increment whenever all existing refresh tokens
        -- need to become invalid.
        token_version INTEGER NOT NULL DEFAULT 1,
        -- =========================================================
        -- ACCOUNT SECURITY
        -- =========================================================
        two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
        two_factor_enabled_at TIMESTAMPTZ,
        -- =========================================================
        -- AUDIT
        -- =========================================================
        created_by BIGINT NULL,
        updated_by BIGINT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        -- =========================================================
        -- FOREIGN KEYS
        -- =========================================================
        CONSTRAINT fk_users_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        CONSTRAINT fk_users_branch FOREIGN KEY (branch_id) REFERENCES branches (id) ON DELETE SET NULL,
        CONSTRAINT fk_users_employee FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE SET NULL,
        CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE SET NULL,
        -- =========================================================
        -- VALIDATION
        -- =========================================================
        CONSTRAINT chk_users_username_not_blank CHECK (BTRIM (username) <> ''),
        CONSTRAINT chk_users_failed_attempts CHECK (failed_login_attempts >= 0),
        CONSTRAINT chk_users_token_version CHECK (token_version > 0),
        CONSTRAINT chk_users_profile_image_size CHECK (
            profile_image_size IS NULL
            OR profile_image_size >= 0
        )
    );

-- Unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_company_username
    ON users(company_id, LOWER(username));

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email
    ON users(LOWER(email))
    WHERE email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_company_phone
    ON users(company_id, phone)
    WHERE phone IS NOT NULL;

-- Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_users_company
    ON users(company_id);

CREATE INDEX IF NOT EXISTS idx_users_branch
    ON users(branch_id);

CREATE INDEX IF NOT EXISTS idx_users_employee
    ON users(employee_id);

CREATE INDEX IF NOT EXISTS idx_users_role
    ON users(role_id);

CREATE INDEX IF NOT EXISTS idx_users_status
    ON users(company_id, status);

CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(LOWER(email))
    WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_phone
    ON users(company_id, phone);

CREATE INDEX IF NOT EXISTS idx_users_locked
    ON users(locked_until)
    WHERE locked_until IS NOT NULL;