CREATE TABLE
    IF NOT EXISTS product_prices (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        product_id BIGINT NOT NULL,
        variant_id BIGINT NOT NULL,
        price_type VARCHAR(30) NOT NULL,
        purchase_price NUMERIC(18, 2),
        cost_price NUMERIC(18, 2),
        mrp NUMERIC(18, 2),
        selling_price NUMERIC(18, 2),
        min_selling_price NUMERIC(18, 2),
        currency_code CHAR(3) NOT NULL DEFAULT 'INR',
        effective_from TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        effective_to TIMESTAMPTZ,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by BIGINT,
        updated_by BIGINT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_product_prices_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        CONSTRAINT fk_product_prices_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
        CONSTRAINT fk_product_prices_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE CASCADE,
        CONSTRAINT chk_product_prices_type CHECK (BTRIM (price_type) <> ''),
        CONSTRAINT chk_product_prices_purchase CHECK (
            purchase_price IS NULL
            OR purchase_price >= 0
        ),
        CONSTRAINT chk_product_prices_cost CHECK (
            cost_price IS NULL
            OR cost_price >= 0
        ),
        CONSTRAINT chk_product_prices_mrp CHECK (
            mrp IS NULL
            OR mrp >= 0
        ),
        CONSTRAINT chk_product_prices_selling CHECK (
            selling_price IS NULL
            OR selling_price >= 0
        ),
        CONSTRAINT chk_product_prices_min CHECK (
            min_selling_price IS NULL
            OR min_selling_price >= 0
        ),
        CONSTRAINT chk_product_prices_dates CHECK (
            effective_to IS NULL
            OR effective_to > effective_from
        )
    );

CREATE INDEX IF NOT EXISTS idx_product_prices_variant ON product_prices (variant_id);

CREATE INDEX IF NOT EXISTS idx_product_prices_product ON product_prices (product_id);

CREATE INDEX IF NOT EXISTS idx_product_prices_active ON product_prices (company_id, variant_id, is_active);

CREATE INDEX IF NOT EXISTS idx_product_prices_effective ON product_prices (variant_id, effective_from DESC);


-- Purchase Cost
-- MRP
-- Selling Price
-- Wholesale Price
-- Retail Price
-- Special Price

-- Price type examples
-- RETAIL
-- WHOLESALE
-- SPECIAL
-- ONLINE