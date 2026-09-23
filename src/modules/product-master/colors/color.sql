-- ============================================================================
-- Module: Product Master - Colors
-- Table: colors
-- Description: Standard and custom apparel colors per company
-- Migration: 022_colors.sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS colors (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id BIGINT NOT NULL,
    color_code VARCHAR(50) NOT NULL,
    color_name VARCHAR(100) NOT NULL,
    hex_code VARCHAR(7),
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT,
    updated_by BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_colors_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
    CONSTRAINT chk_colors_code CHECK (BTRIM(color_code) <> ''),
    CONSTRAINT chk_colors_name CHECK (BTRIM(color_name) <> ''),
    CONSTRAINT chk_colors_hex CHECK (
        hex_code IS NULL
        OR hex_code ~ '^#[0-9A-Fa-f]{6}$'
    ),
    CONSTRAINT chk_colors_display_order CHECK (display_order >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_colors_company_code ON colors (company_id, LOWER(color_code));
CREATE UNIQUE INDEX IF NOT EXISTS uq_colors_company_name ON colors (company_id, LOWER(color_name));
CREATE INDEX IF NOT EXISTS idx_colors_company ON colors (company_id);
