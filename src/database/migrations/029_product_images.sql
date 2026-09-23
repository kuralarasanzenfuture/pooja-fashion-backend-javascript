CREATE TABLE
    IF NOT EXISTS product_images (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        product_id BIGINT NOT NULL,
        variant_id BIGINT,
        image_url TEXT NOT NULL,
        image_key VARCHAR(500),
        original_file_name VARCHAR(255),
        mime_type VARCHAR(100),
        file_size BIGINT,
        width INTEGER,
        height INTEGER,
        alt_text VARCHAR(255),
        display_order INTEGER NOT NULL DEFAULT 0,
        is_primary BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by BIGINT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_product_images_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
        CONSTRAINT fk_product_images_variant FOREIGN KEY (variant_id) REFERENCES product_variants (id) ON DELETE CASCADE,
        CONSTRAINT chk_product_images_url CHECK (BTRIM (image_url) <> ''),
        CONSTRAINT chk_product_images_file_size CHECK (
            file_size IS NULL
            OR file_size >= 0
        ),
        CONSTRAINT chk_product_images_dimensions CHECK (
            (
                width IS NULL
                OR width > 0
            )
            AND (
                height IS NULL
                OR height > 0
            )
        ),
        CONSTRAINT chk_product_images_display_order CHECK (display_order >= 0)
    );

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images (product_id);

CREATE INDEX IF NOT EXISTS idx_product_images_variant ON product_images (variant_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_product_images_primary_product ON product_images (product_id)
WHERE
    variant_id IS NULL
    AND is_primary = TRUE;

CREATE UNIQUE INDEX IF NOT EXISTS uq_product_images_primary_variant ON product_images (variant_id)
WHERE
    variant_id IS NOT NULL
    AND is_primary = TRUE;