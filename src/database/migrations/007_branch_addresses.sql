CREATE TABLE
    IF NOT EXISTS branch_addresses (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        branch_id BIGINT NOT NULL,
        address_line_1 VARCHAR(255) NOT NULL,
        address_line_2 VARCHAR(255),
        city VARCHAR(100),
        district VARCHAR(100),
        state VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100) NOT NULL DEFAULT 'India',
        landmark VARCHAR(255),
        is_primary BOOLEAN NOT NULL DEFAULT TRUE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_branch_addresses_branch FOREIGN KEY (branch_id) REFERENCES branches (id) ON DELETE CASCADE
    );