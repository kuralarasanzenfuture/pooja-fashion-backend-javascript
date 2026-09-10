CREATE TABLE
    IF NOT EXISTS roles (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        -- =========================================================
        -- SCOPE
        -- NULL  = GLOBAL SYSTEM ROLE
        -- VALUE = COMPANY-SPECIFIC ROLE
        -- =========================================================
        company_id BIGINT NULL,
        -- =========================================================
        -- ROLE DETAILS
        -- =========================================================
        role_code VARCHAR(50) NOT NULL,
        role_name VARCHAR(100) NOT NULL,
        description TEXT,
        -- TRUE  = Protected/system-managed role (Global)
        -- FALSE = Normal/custom role (Company-specific)
        is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        -- =========================================================
        -- AUDIT
        -- Note: FK to users(id) can be linked when users table is created
        -- =========================================================
        created_by BIGINT NULL,
        updated_by BIGINT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        -- =========================================================
        -- FOREIGN KEYS
        -- =========================================================
        CONSTRAINT fk_roles_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        -- =========================================================
        -- VALIDATION
        -- =========================================================
        CONSTRAINT chk_roles_code_not_blank CHECK (BTRIM (role_code) <> ''),
        CONSTRAINT chk_roles_name_not_blank CHECK (BTRIM (role_name) <> ''),
        CONSTRAINT chk_roles_system_scope CHECK (
            (
                is_system_role = TRUE
                AND company_id IS NULL
            )
            OR (
                is_system_role = FALSE
                AND company_id IS NOT NULL
            )
        )
    );

-- =============================================================
-- GLOBAL ROLE CODE
-- Example: SUPERADMIN, ADMIN
-- =============================================================
CREATE UNIQUE INDEX IF NOT EXISTS uq_roles_global_code ON roles (LOWER(role_code))
WHERE
    company_id IS NULL;

-- =============================================================
-- COMPANY ROLE CODE
-- Example: Company 1 -> CASHIER, Company 2 -> CASHIER
-- =============================================================
CREATE UNIQUE INDEX IF NOT EXISTS uq_roles_company_code ON roles (company_id, LOWER(role_code))
WHERE
    company_id IS NOT NULL;

-- =============================================================
-- GLOBAL ROLE NAME
-- =============================================================
CREATE UNIQUE INDEX IF NOT EXISTS uq_roles_global_name ON roles (LOWER(role_name))
WHERE
    company_id IS NULL;

-- =============================================================
-- COMPANY ROLE NAME
-- =============================================================
CREATE UNIQUE INDEX IF NOT EXISTS uq_roles_company_name ON roles (company_id, LOWER(role_name))
WHERE
    company_id IS NOT NULL;

-- =============================================================
-- COMPANY LOOKUP
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_roles_company ON roles (company_id);

-- =============================================================
-- ACTIVE ROLES
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_roles_company_active ON roles (company_id, is_active);

-- =============================================================
-- GLOBAL / SYSTEM ROLES
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_roles_system ON roles (is_system_role)
WHERE
    is_system_role = TRUE;

-- =============================================================
-- ROLE CODE SEARCH
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_roles_code ON roles (LOWER(role_code));

-- =============================================================
-- ROLE NAME SEARCH
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles (LOWER(role_name));