-- =============================================================================
-- Product Master: Categories Schema
-- Table: categories
-- =============================================================================

CREATE TABLE
    IF NOT EXISTS categories (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        category_code VARCHAR(50) NOT NULL,
        category_name VARCHAR(150) NOT NULL,
        description TEXT,
        image_url TEXT,
        image_key VARCHAR(500),
        display_order INTEGER NOT NULL DEFAULT 0,1
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by BIGINT,
        updated_by BIGINT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_categories_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        CONSTRAINT chk_categories_code CHECK (BTRIM (category_code) <> ''),
        CONSTRAINT chk_categories_name CHECK (BTRIM (category_name) <> ''),
        CONSTRAINT chk_categories_display_order CHECK (display_order >= 0)
    );

CREATE UNIQUE INDEX IF NOT EXISTS uq_categories_company_code ON categories (company_id, LOWER(category_code));

CREATE UNIQUE INDEX IF NOT EXISTS uq_categories_company_name ON categories (company_id, LOWER(category_name));

CREATE INDEX IF NOT EXISTS idx_categories_company ON categories (company_id);

CREATE INDEX IF NOT EXISTS idx_categories_active ON categories (company_id, is_active);
