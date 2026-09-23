-- ============================================================================
-- Module: Product Master - Product Types
-- Table: product_types
-- Description: Product classification types (Ready-made, Fabric, Accessory, Footwear, Service)
-- Migration: 025_product_types.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS product_types (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id BIGINT NOT NULL,
    type_code VARCHAR(50) NOT NULL,
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_stock_item BOOLEAN NOT NULL DEFAULT TRUE,
    is_saleable BOOLEAN NOT NULL DEFAULT TRUE,
    is_purchasable BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT,
    updated_by BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_types_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    CONSTRAINT chk_product_types_code CHECK (BTRIM(type_code) <> ''),
    CONSTRAINT chk_product_types_name CHECK (BTRIM(type_name) <> '')
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_product_types_company_code ON product_types (company_id, LOWER(type_code));
CREATE UNIQUE INDEX IF NOT EXISTS uq_product_types_company_name ON product_types (company_id, LOWER(type_name));
CREATE INDEX IF NOT EXISTS idx_product_types_company ON product_types (company_id);
