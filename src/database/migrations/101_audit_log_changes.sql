CREATE TABLE
    IF NOT EXISTS audit_log_changes (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        -- =========================================
        -- MAIN AUDIT LOG
        -- =========================================
        audit_log_id BIGINT NOT NULL,
        -- =========================================
        -- FIELD INFORMATION
        -- =========================================
        field_name VARCHAR(150) NOT NULL,
        field_label VARCHAR(200) NULL,
        -- =========================================
        -- DATA TYPE
        -- =========================================
        data_type VARCHAR(50) NULL,
        -- =========================================
        -- OLD VALUE
        -- =========================================
        old_value TEXT NULL,
        -- =========================================
        -- NEW VALUE
        -- =========================================
        new_value TEXT NULL,
        -- =========================================
        -- TIMESTAMP
        -- =========================================
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        -- =========================================
        -- FOREIGN KEY
        -- =========================================
        CONSTRAINT fk_audit_log_changes_audit_log FOREIGN KEY (audit_log_id) REFERENCES audit_logs (id) ON DELETE CASCADE,
        CONSTRAINT chk_audit_log_changes_field CHECK (BTRIM (field_name) <> '')
    );

CREATE INDEX idx_audit_log_changes_audit_log ON audit_log_changes (audit_log_id);

CREATE INDEX idx_audit_log_changes_field ON audit_log_changes (field_name);