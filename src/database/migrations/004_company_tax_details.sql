CREATE TABLE
    IF NOT EXISTS company_tax_details (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        gstin VARCHAR(20),
        pan_number VARCHAR(20),
        tan_number VARCHAR(20),
        gst_registration_type VARCHAR(30) CHECK (
            gst_registration_type IN ('regular', 'composition', 'unregistered', 'other')
        ),
        gst_state_code VARCHAR(10),
        tax_registered_name VARCHAR(250),
        is_primary BOOLEAN NOT NULL DEFAULT TRUE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_company_tax_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
    );