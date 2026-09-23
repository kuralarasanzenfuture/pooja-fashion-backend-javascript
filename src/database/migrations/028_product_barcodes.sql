CREATE TABLE
    IF NOT EXISTS product_barcodes (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        product_id BIGINT NOT NULL,
        variant_id BIGINT NOT NULL,
        barcode VARCHAR(100) NOT NULL,
        barcode_type VARCHAR(30) NOT NULL DEFAULT 'INTERNAL',
        is_primary BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by BIGINT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_product_barcodes_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        CONSTRAINT fk_product_barcodes_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
        CONSTRAINT fk_product_barcodes_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE CASCADE,
        CONSTRAINT chk_product_barcodes_barcode CHECK (BTRIM (barcode) <> ''),
        CONSTRAINT chk_product_barcodes_type CHECK (BTRIM (barcode_type) <> '')
    );

CREATE UNIQUE INDEX IF NOT EXISTS uq_product_barcodes_company_barcode ON product_barcodes (company_id, barcode);

CREATE UNIQUE INDEX IF NOT EXISTS uq_product_barcodes_primary_variant ON product_barcodes (variant_id)
WHERE
    is_primary = TRUE;

CREATE INDEX IF NOT EXISTS idx_product_barcodes_variant ON product_barcodes (variant_id);

CREATE INDEX IF NOT EXISTS idx_product_barcodes_product ON product_barcodes (product_id);

CREATE INDEX IF NOT EXISTS idx_product_barcodes_barcode ON product_barcodes (barcode);

-- EAN
-- UPC
-- CODE128
-- CODE39
-- INTERNAL