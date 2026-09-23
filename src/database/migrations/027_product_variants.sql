CREATE TABLE
    IF NOT EXISTS product_variants (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        product_id BIGINT NOT NULL,
        sku VARCHAR(100) NOT NULL,
        variant_code VARCHAR(100),
        variant_name VARCHAR(255),
        size_group_id BIGINT,
        size_id BIGINT,
        color_id BIGINT,
        material_id BIGINT,
        unit_id BIGINT NOT NULL,
        -- Optional product-specific identification
        model_no VARCHAR(100),
        style_code VARCHAR(100),
        weight NUMERIC(18, 6),
        -- Inventory behavior
        track_stock BOOLEAN NOT NULL DEFAULT TRUE,
        allow_negative_stock BOOLEAN NOT NULL DEFAULT FALSE,
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by BIGINT,
        updated_by BIGINT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_product_variants_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        CONSTRAINT fk_product_variants_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
        CONSTRAINT fk_product_variants_size_group FOREIGN KEY (size_group_id) REFERENCES size_groups (id) ON DELETE RESTRICT,
        CONSTRAINT fk_product_variants_size FOREIGN KEY (size_id) REFERENCES sizes (id) ON DELETE RESTRICT,
        CONSTRAINT fk_product_variants_color FOREIGN KEY (color_id) REFERENCES colors (id) ON DELETE RESTRICT,
        CONSTRAINT fk_product_variants_material FOREIGN KEY (material_id) REFERENCES materials (id) ON DELETE RESTRICT,
        CONSTRAINT fk_product_variants_unit FOREIGN KEY (unit_id) REFERENCES units (id) ON DELETE RESTRICT,
        CONSTRAINT chk_product_variants_sku CHECK (BTRIM (sku) <> ''),
        CONSTRAINT chk_product_variants_weight CHECK (
            weight IS NULL
            OR weight >= 0
        )
    );

CREATE UNIQUE INDEX IF NOT EXISTS uq_product_variants_company_sku ON product_variants (company_id, LOWER(sku));

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants (product_id);

CREATE INDEX IF NOT EXISTS idx_product_variants_company ON product_variants (company_id);

CREATE INDEX IF NOT EXISTS idx_product_variants_size ON product_variants (size_id);

CREATE INDEX IF NOT EXISTS idx_product_variants_color ON product_variants (color_id);

CREATE INDEX IF NOT EXISTS idx_product_variants_material ON product_variants (material_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_product_variants_default ON product_variants (product_id)
WHERE
    is_default = TRUE;

CREATE INDEX IF NOT EXISTS idx_product_variants_active ON product_variants (company_id, is_active);

-- Product:
-- Men Shirt

-- Variants:

-- SKU-001 → M / Blue / Cotton
-- SKU-002 → L / Blue / Cotton
-- SKU-003 → XL / Blue / Cotton
-- SKU-004 → M / Black / Cotton