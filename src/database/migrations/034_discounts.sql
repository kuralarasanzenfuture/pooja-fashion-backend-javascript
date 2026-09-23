CREATE TABLE
    IF NOT EXISTS discounts (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        discount_code VARCHAR(50) NOT NULL,
        discount_name VARCHAR(150) NOT NULL,
        discount_type VARCHAR(30) NOT NULL,
        discount_value NUMERIC(18, 4) NOT NULL,
        minimum_quantity NUMERIC(18, 3),
        maximum_discount NUMERIC(18, 2),
        start_at TIMESTAMPTZ,
        end_at TIMESTAMPTZ,
        priority INTEGER NOT NULL DEFAULT 0,
        is_stackable BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by BIGINT,
        updated_by BIGINT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_discounts_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        CONSTRAINT chk_discounts_code CHECK (BTRIM (discount_code) <> ''),
        CONSTRAINT chk_discounts_name CHECK (BTRIM (discount_name) <> ''),
        CONSTRAINT chk_discounts_type CHECK (discount_type IN ('PERCENTAGE', 'FIXED_AMOUNT')),
        CONSTRAINT chk_discounts_value CHECK (discount_value >= 0),
        CONSTRAINT chk_discounts_percentage CHECK (
            discount_type <> 'PERCENTAGE'
            OR discount_value <= 100
        ),
        CONSTRAINT chk_discounts_quantity CHECK (
            minimum_quantity IS NULL
            OR minimum_quantity > 0
        ),
        CONSTRAINT chk_discounts_maximum CHECK (
            maximum_discount IS NULL
            OR maximum_discount >= 0
        ),
        CONSTRAINT chk_discounts_dates CHECK (
            end_at IS NULL
            OR start_at IS NULL
            OR end_at > start_at
        )
    );

CREATE UNIQUE INDEX IF NOT EXISTS uq_discounts_company_code ON discounts (company_id, LOWER(discount_code));

CREATE INDEX IF NOT EXISTS idx_discounts_company ON discounts (company_id);

CREATE INDEX IF NOT EXISTS idx_discounts_active ON discounts (company_id, is_active);

CREATE INDEX IF NOT EXISTS idx_discounts_dates ON discounts (start_at, end_at);