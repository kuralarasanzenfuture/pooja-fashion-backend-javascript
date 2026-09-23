-- =============================================================================
-- Product Master: Subcategories Schema
-- Table: subcategories
-- =============================================================================

CREATE TABLE
    IF NOT EXISTS subcategories (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        category_id BIGINT NOT NULL,
        subcategory_code VARCHAR(50) NOT NULL,
        subcategory_name VARCHAR(150) NOT NULL,
        description TEXT,
        image_url TEXT,
        image_key VARCHAR(500),
        display_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by BIGINT,
        updated_by BIGINT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_subcategories_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        CONSTRAINT fk_subcategories_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT,
        CONSTRAINT chk_subcategories_code CHECK (BTRIM (subcategory_code) <> ''),
        CONSTRAINT chk_subcategories_name CHECK (BTRIM (subcategory_name) <> ''),
        CONSTRAINT chk_subcategories_display_order CHECK (display_order >= 0)
    );

CREATE UNIQUE INDEX IF NOT EXISTS uq_subcategories_company_code ON subcategories (company_id, LOWER(subcategory_code));

CREATE UNIQUE INDEX IF NOT EXISTS uq_subcategories_category_name ON subcategories (category_id, LOWER(subcategory_name));

CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories (category_id);

CREATE INDEX IF NOT EXISTS idx_subcategories_company ON subcategories (company_id);
