-- =============================================================================
-- Product Master: Size Groups Schema
-- Table: size_groups
-- =============================================================================

CREATE TABLE
    IF NOT EXISTS size_groups (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        size_group_code VARCHAR(50) NOT NULL,
        size_group_name VARCHAR(100) NOT NULL,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by BIGINT,
        updated_by BIGINT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_size_groups_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        CONSTRAINT chk_size_groups_code CHECK (BTRIM (size_group_code) <> ''),
        CONSTRAINT chk_size_groups_name CHECK (BTRIM (size_group_name) <> '')
    );

CREATE UNIQUE INDEX IF NOT EXISTS uq_size_groups_company_code ON size_groups (company_id, LOWER(size_group_code));

CREATE UNIQUE INDEX IF NOT EXISTS uq_size_groups_company_name ON size_groups (company_id, LOWER(size_group_name));

CREATE INDEX IF NOT EXISTS idx_size_groups_company ON size_groups (company_id);

CREATE INDEX IF NOT EXISTS idx_size_groups_active ON size_groups (company_id, is_active);
