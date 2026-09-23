CREATE TABLE
    IF NOT EXISTS units (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        unit_code VARCHAR(30) NOT NULL,
        unit_name VARCHAR(100) NOT NULL,
        decimal_places SMALLINT NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by BIGINT,
        updated_by BIGINT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_units_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        CONSTRAINT chk_units_code CHECK (BTRIM (unit_code) <> ''),
        CONSTRAINT chk_units_name CHECK (BTRIM (unit_name) <> ''),
        CONSTRAINT chk_units_decimal_places CHECK (decimal_places BETWEEN 0 AND 6)
    );

CREATE UNIQUE INDEX IF NOT EXISTS uq_units_company_code ON units (company_id, LOWER(unit_code));

CREATE UNIQUE INDEX IF NOT EXISTS uq_units_company_name ON units (company_id, LOWER(unit_name));

-- PCS
-- PAIR
-- SET
-- METER
-- KG
-- BOX