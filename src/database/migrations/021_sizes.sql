CREATE TABLE
    IF NOT EXISTS sizes (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        size_group_id BIGINT NOT NULL,
        size_code VARCHAR(50) NOT NULL,
        size_name VARCHAR(100) NOT NULL,
        display_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by BIGINT,
        updated_by BIGINT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_sizes_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        CONSTRAINT fk_sizes_group FOREIGN KEY (size_group_id) REFERENCES size_groups (id) ON DELETE RESTRICT,
        CONSTRAINT chk_sizes_code CHECK (BTRIM (size_code) <> ''),
        CONSTRAINT chk_sizes_name CHECK (BTRIM (size_name) <> ''),
        CONSTRAINT chk_sizes_display_order CHECK (display_order >= 0)
    );

CREATE UNIQUE INDEX IF NOT EXISTS uq_sizes_group_code ON sizes (size_group_id, LOWER(size_code));

CREATE UNIQUE INDEX IF NOT EXISTS uq_sizes_group_name ON sizes (size_group_id, LOWER(size_name));

CREATE INDEX IF NOT EXISTS idx_sizes_group ON sizes (size_group_id);

CREATE INDEX IF NOT EXISTS idx_sizes_company ON sizes (company_id);