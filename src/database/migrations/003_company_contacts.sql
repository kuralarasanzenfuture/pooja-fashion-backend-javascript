CREATE TABLE
    IF NOT EXISTS company_contacts (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        contact_type VARCHAR(30) NOT NULL CHECK (
            contact_type IN (
                'owner',
                'manager',
                'accountant',
                'sales',
                'support',
                'other'
            )
        ),
        contact_name VARCHAR(150) NOT NULL,
        designation VARCHAR(100),
        email VARCHAR(150),
        phone VARCHAR(30),
        mobile VARCHAR(30),
        is_primary BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_company_contacts_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
    );