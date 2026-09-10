CREATE TABLE
    IF NOT EXISTS roles (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        role_code VARCHAR(50) NOT NULL,
        role_name VARCHAR(100) NOT NULL,
        description TEXT,
        is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_roles_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        CONSTRAINT uq_roles_company_code UNIQUE (company_id, role_code),
        CONSTRAINT uq_roles_company_name UNIQUE (company_id, role_name)
    );

CREATE INDEX idx_roles_company ON roles (company_id);

CREATE INDEX idx_roles_active ON roles (company_id, is_active);