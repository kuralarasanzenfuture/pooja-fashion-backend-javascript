CREATE TABLE
    IF NOT EXISTS company_addresses (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        address_type VARCHAR(30) NOT NULL CHECK (
            address_type IN (
                'registered',
                'head_office',
                'billing',
                'warehouse',
                'other'
            )
        ),
        address_line_1 VARCHAR(255) NOT NULL,
        address_line_2 VARCHAR(255),
        city VARCHAR(100),
        district VARCHAR(100),
        state VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100) NOT NULL DEFAULT 'India',
        landmark VARCHAR(255),
        is_primary BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_company_addresses_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
    );