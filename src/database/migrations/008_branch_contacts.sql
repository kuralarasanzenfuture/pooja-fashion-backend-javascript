CREATE TABLE
    IF NOT EXISTS branch_contacts (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        branch_id BIGINT NOT NULL,
        contact_name VARCHAR(150) NOT NULL,
        designation VARCHAR(100),
        email VARCHAR(150),
        phone VARCHAR(30),
        mobile VARCHAR(30),
        is_primary BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_branch_contacts_branch FOREIGN KEY (branch_id) REFERENCES branches (id) ON DELETE CASCADE
    );