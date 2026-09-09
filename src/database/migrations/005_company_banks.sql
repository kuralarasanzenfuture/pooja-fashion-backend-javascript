CREATE TABLE
    IF NOT EXISTS banks (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        bank_code VARCHAR(50) NOT NULL UNIQUE,
        bank_name VARCHAR(150) NOT NULL,
        short_name VARCHAR(100),
        legal_name VARCHAR(200),
        bank_type VARCHAR(30) NOT NULL DEFAULT 'commercial' CHECK (
            bank_type IN (
                'commercial',
                'cooperative',
                'regional_rural',
                'small_finance',
                'payments',
                'foreign',
                'other'
            )
        ),
        logo_url TEXT,
        logo_light_url TEXT,
        logo_dark_url TEXT,
        website_url TEXT,
        country_code CHAR(2) NOT NULL DEFAULT 'IN',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        is_verified BOOLEAN NOT NULL DEFAULT FALSE,
        display_order INTEGER NOT NULL DEFAULT 0,
        metadata JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_bank_display_order CHECK (display_order >= 0)
    );

CREATE TABLE
    IF NOT EXISTS bank_identifiers (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        bank_id BIGINT NOT NULL,
        identifier_type VARCHAR(30) NOT NULL CHECK (
            identifier_type IN (
                'ifsc',
                'micr',
                'swift',
                'bank_code',
                'routing_number',
                'other'
            )
        ),
        identifier_value VARCHAR(100) NOT NULL,
        branch_name VARCHAR(150),
        city VARCHAR(100),
        state VARCHAR(100),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_bank_identifiers_bank FOREIGN KEY (bank_id) REFERENCES banks (id) ON DELETE CASCADE,
        CONSTRAINT uq_bank_identifier UNIQUE (identifier_type, identifier_value)
    );

CREATE TABLE
    IF NOT EXISTS company_banks (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        bank_id BIGINT NOT NULL,
        account_name VARCHAR(200) NOT NULL,
        account_number VARCHAR(100) NOT NULL,
        account_type VARCHAR(30) NOT NULL DEFAULT 'current' CHECK (
            account_type IN (
                'savings',
                'current',
                'cash_credit',
                'overdraft',
                'other'
            )
        ),
        branch_name VARCHAR(150),
        branch_code VARCHAR(50),
        ifsc_code VARCHAR(20),
        micr_code VARCHAR(20),
        swift_code VARCHAR(20),
        opening_balance NUMERIC(18, 2) NOT NULL DEFAULT 0,
        current_balance NUMERIC(18, 2) NOT NULL DEFAULT 0,
        is_primary BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_company_banks_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        CONSTRAINT fk_company_banks_bank FOREIGN KEY (bank_id) REFERENCES banks (id) ON DELETE RESTRICT,
        CONSTRAINT chk_company_bank_opening_balance CHECK (opening_balance >= 0),
        CONSTRAINT chk_company_bank_current_balance CHECK (current_balance >= 0),
        CONSTRAINT uq_company_bank_account UNIQUE (company_id, account_number)
    );