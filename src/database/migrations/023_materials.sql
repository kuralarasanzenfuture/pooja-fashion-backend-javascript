CREATE TABLE
    IF NOT EXISTS materials (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        material_code VARCHAR(50) NOT NULL,
        material_name VARCHAR(150) NOT NULL,
        description TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_by BIGINT,
        updated_by BIGINT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_materials_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        CONSTRAINT chk_materials_code CHECK (BTRIM (material_code) <> ''),
        CONSTRAINT chk_materials_name CHECK (BTRIM (material_name) <> '')
    );

CREATE UNIQUE INDEX IF NOT EXISTS uq_materials_company_code ON materials (company_id, LOWER(material_code));

CREATE UNIQUE INDEX IF NOT EXISTS uq_materials_company_name ON materials (company_id, LOWER(material_name));

-- Cotton
-- Polyester
-- Silk
-- Linen
-- Rayon
-- Denim
-- Georgette
-- Chiffon