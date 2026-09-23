CREATE TABLE
    IF NOT EXISTS product_price_history (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        product_id BIGINT NOT NULL,
        variant_id BIGINT NOT NULL,
        product_price_id BIGINT,
        price_type VARCHAR(30) NOT NULL,
        old_purchase_price NUMERIC(18, 2),
        new_purchase_price NUMERIC(18, 2),
        old_cost_price NUMERIC(18, 2),
        new_cost_price NUMERIC(18, 2),
        old_mrp NUMERIC(18, 2),
        new_mrp NUMERIC(18, 2),
        old_selling_price NUMERIC(18, 2),
        new_selling_price NUMERIC(18, 2),
        reason VARCHAR(255),
        changed_by BIGINT,
        changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_product_price_history_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        CONSTRAINT fk_product_price_history_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT,
        CONSTRAINT fk_product_price_history_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE RESTRICT,
        CONSTRAINT fk_product_price_history_price FOREIGN KEY (product_price_id) REFERENCES product_prices (id) ON DELETE SET NULL
    );

CREATE INDEX IF NOT EXISTS idx_product_price_history_variant ON product_price_history (variant_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_price_history_product ON product_price_history (product_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_price_history_changed_at ON product_price_history (changed_at DESC);