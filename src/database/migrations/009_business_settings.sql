CREATE TABLE
    IF NOT EXISTS business_settings (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        invoice_prefix VARCHAR(20) NOT NULL DEFAULT 'INV',
        purchase_prefix VARCHAR(20) NOT NULL DEFAULT 'PUR',
        customer_prefix VARCHAR(20) NOT NULL DEFAULT 'CUS',
        supplier_prefix VARCHAR(20) NOT NULL DEFAULT 'SUP',
        product_prefix VARCHAR(20) NOT NULL DEFAULT 'PRO',
        default_tax_inclusive BOOLEAN NOT NULL DEFAULT TRUE,
        default_payment_terms_days INTEGER NOT NULL DEFAULT 0,
        allow_negative_stock BOOLEAN NOT NULL DEFAULT FALSE,
        enable_barcode BOOLEAN NOT NULL DEFAULT TRUE,
        enable_customer_credit BOOLEAN NOT NULL DEFAULT TRUE,
        enable_product_returns BOOLEAN NOT NULL DEFAULT TRUE,
        enable_product_exchange BOOLEAN NOT NULL DEFAULT TRUE,
        decimal_places SMALLINT NOT NULL DEFAULT 2,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_business_settings_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        CONSTRAINT uq_business_settings_company UNIQUE (company_id),
        CHECK (decimal_places BETWEEN 0 AND 4),
        CHECK (default_payment_terms_days >= 0)
    );