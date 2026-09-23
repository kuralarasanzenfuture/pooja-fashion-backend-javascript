CREATE TABLE
    IF NOT EXISTS taxes (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        tax_code VARCHAR(50) NOT NULL,
        tax_name VARCHAR(100) NOT NULL,
        tax_type VARCHAR(30) NOT NULL DEFAULT 'GST',
        rate NUMERIC(7, 4) NOT NULL,
        cgst_rate NUMERIC(7, 4) NOT NULL DEFAULT 0,
        sgst_rate NUMERIC(7, 4) NOT NULL DEFAULT 0,
        igst_rate NUMERIC(7, 4) NOT NULL DEFAULT 0,
        cess_rate NUMERIC(7, 4) NOT NULL DEFAULT 0,
        is_inclusive BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by BIGINT,
        updated_by BIGINT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_taxes_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        CONSTRAINT chk_taxes_code CHECK (BTRIM (tax_code) <> ''),
        CONSTRAINT chk_taxes_name CHECK (BTRIM (tax_name) <> ''),
        CONSTRAINT chk_taxes_rate CHECK (
            rate >= 0
            AND rate <= 100
        ),
        CONSTRAINT chk_taxes_cgst CHECK (
            cgst_rate >= 0
            AND cgst_rate <= 100
        ),
        CONSTRAINT chk_taxes_sgst CHECK (
            sgst_rate >= 0
            AND sgst_rate <= 100
        ),
        CONSTRAINT chk_taxes_igst CHECK (
            igst_rate >= 0
            AND igst_rate <= 100
        ),
        CONSTRAINT chk_taxes_cess CHECK (
            cess_rate >= 0
            AND cess_rate <= 100
        )
    );

CREATE UNIQUE INDEX IF NOT EXISTS uq_taxes_company_code ON taxes (company_id, LOWER(tax_code));

CREATE UNIQUE INDEX IF NOT EXISTS uq_taxes_company_name ON taxes (company_id, LOWER(tax_name));

CREATE INDEX IF NOT EXISTS idx_taxes_company ON taxes (company_id);

CREATE INDEX IF NOT EXISTS idx_taxes_active ON taxes (company_id, is_active);

-- GST_0
-- GST_5
-- GST_12
-- GST_18
-- GST_28