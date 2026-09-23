CREATE TABLE
    IF NOT EXISTS product_discounts (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        product_id BIGINT NOT NULL,
        variant_id BIGINT,
        discount_id BIGINT NOT NULL,
        is_primary BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by BIGINT,
        updated_by BIGINT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_product_discounts_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        CONSTRAINT fk_product_discounts_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
        CONSTRAINT fk_product_discounts_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE CASCADE,
        CONSTRAINT fk_product_discounts_discount FOREIGN KEY (discount_id) REFERENCES discounts (id) ON DELETE RESTRICT
    );

CREATE INDEX IF NOT EXISTS idx_product_discounts_product ON product_discounts (product_id);

CREATE INDEX IF NOT EXISTS idx_product_discounts_variant ON product_discounts (variant_id);

CREATE INDEX IF NOT EXISTS idx_product_discounts_discount ON product_discounts (discount_id);

CREATE INDEX IF NOT EXISTS idx_product_discounts_active ON product_discounts (company_id, is_active);

-- Ensure only one primary discount per variant
CREATE UNIQUE INDEX IF NOT EXISTS uq_product_discounts_primary_variant ON product_discounts (variant_id)
WHERE
    variant_id IS NOT NULL
    AND is_primary = TRUE;

-- Ensure only one primary discount per product (for variant-independent product-wide discounts)
CREATE UNIQUE INDEX IF NOT EXISTS uq_product_discounts_primary_product ON product_discounts (product_id)
WHERE
    variant_id IS NULL
    AND is_primary = TRUE;

-- Prevent assigning the exact same discount to the same variant more than once
CREATE UNIQUE INDEX IF NOT EXISTS uq_product_discounts_variant_discount ON product_discounts (variant_id, discount_id)
WHERE
    variant_id IS NOT NULL;

-- Prevent assigning the exact same discount to the same product more than once
CREATE UNIQUE INDEX IF NOT EXISTS uq_product_discounts_product_discount ON product_discounts (product_id, discount_id)
WHERE
    variant_id IS NULL;