CREATE TABLE
    IF NOT EXISTS products (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        product_code VARCHAR(50) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        category_id BIGINT NOT NULL,
        subcategory_id BIGINT,
        brand_id BIGINT,
        product_type_id BIGINT,
        description TEXT,
        short_description TEXT,
        manufacturer_name VARCHAR(150),
        manufacturer_part_no VARCHAR(100),
        default_unit_id BIGINT NOT NULL,
        is_variant_product BOOLEAN NOT NULL DEFAULT TRUE,
        track_stock BOOLEAN NOT NULL DEFAULT TRUE,
        allow_negative_stock BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by BIGINT,
        updated_by BIGINT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_products_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT,
        CONSTRAINT fk_products_subcategory FOREIGN KEY (subcategory_id) REFERENCES subcategories (id) ON DELETE RESTRICT,
        CONSTRAINT fk_products_brand FOREIGN KEY (brand_id) REFERENCES brands (id) ON DELETE RESTRICT,
        CONSTRAINT fk_products_type FOREIGN KEY (product_type_id) REFERENCES product_types (id) ON DELETE RESTRICT,
        CONSTRAINT fk_products_unit FOREIGN KEY (default_unit_id) REFERENCES units (id) ON DELETE RESTRICT,
        CONSTRAINT chk_products_code CHECK (BTRIM (product_code) <> ''),
        CONSTRAINT chk_products_name CHECK (BTRIM (product_name) <> '')
    );

CREATE UNIQUE INDEX IF NOT EXISTS uq_products_company_code ON products (company_id, LOWER(product_code));

CREATE INDEX IF NOT EXISTS idx_products_company ON products (company_id);

CREATE INDEX IF NOT EXISTS idx_products_category ON products (category_id);

CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products (subcategory_id);

CREATE INDEX IF NOT EXISTS idx_products_brand ON products (brand_id);

CREATE INDEX IF NOT EXISTS idx_products_type ON products (product_type_id);

CREATE INDEX IF NOT EXISTS idx_products_active ON products (company_id, is_active);

CREATE INDEX IF NOT EXISTS idx_products_name ON products (company_id, LOWER(product_name));