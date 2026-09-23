-- =============================================================================
-- Product Master: Brands Schema
-- Table: brands
-- =============================================================================

CREATE TABLE
    IF NOT EXISTS brands (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        brand_code VARCHAR(50) NOT NULL,
        brand_name VARCHAR(150) NOT NULL,
        description TEXT,
        logo_url TEXT,
        logo_key VARCHAR(500),
        website_url VARCHAR(255),
        display_order INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by BIGINT,
        updated_by BIGINT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_brands_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        CONSTRAINT chk_brands_code CHECK (BTRIM (brand_code) <> ''),
        CONSTRAINT chk_brands_name CHECK (BTRIM (brand_name) <> ''),
        CONSTRAINT chk_brands_display_order CHECK (display_order >= 0)
    );

CREATE UNIQUE INDEX IF NOT EXISTS uq_brands_company_code ON brands (company_id, LOWER(brand_code));

CREATE UNIQUE INDEX IF NOT EXISTS uq_brands_company_name ON brands (company_id, LOWER(brand_name));

CREATE INDEX IF NOT EXISTS idx_brands_company ON brands (company_id);

CREATE INDEX IF NOT EXISTS idx_brands_active ON brands (company_id, is_active);
