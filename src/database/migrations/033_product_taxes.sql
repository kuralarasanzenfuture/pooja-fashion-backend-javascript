CREATE TABLE
    IF NOT EXISTS product_taxes (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        product_id BIGINT NOT NULL,
        variant_id BIGINT,
        tax_id BIGINT NOT NULL,
        is_primary BOOLEAN NOT NULL DEFAULT FALSE,
        effective_from TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        effective_to TIMESTAMPTZ,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by BIGINT,
        updated_by BIGINT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_product_taxes_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        CONSTRAINT fk_product_taxes_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
        CONSTRAINT fk_product_taxes_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE CASCADE,
        CONSTRAINT fk_product_taxes_tax FOREIGN KEY (tax_id) REFERENCES taxes (id) ON DELETE RESTRICT,
        CONSTRAINT chk_product_taxes_dates CHECK (
            effective_to IS NULL
            OR effective_to > effective_from
        )
    );

CREATE INDEX IF NOT EXISTS idx_product_taxes_product ON product_taxes (product_id);

CREATE INDEX IF NOT EXISTS idx_product_taxes_variant ON product_taxes (variant_id);

CREATE INDEX IF NOT EXISTS idx_product_taxes_tax ON product_taxes (tax_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_product_taxes_primary_variant ON product_taxes (variant_id)
WHERE
    variant_id IS NOT NULL
    AND is_primary = TRUE;

CREATE INDEX IF NOT EXISTS idx_product_taxes_active ON product_taxes (company_id, is_active);