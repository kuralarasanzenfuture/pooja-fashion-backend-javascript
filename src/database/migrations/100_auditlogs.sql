CREATE TABLE
    IF NOT EXISTS audit_logs (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        -- =========================================
        -- COMPANY / BRANCH
        -- =========================================
        company_id BIGINT NULL,
        branch_id BIGINT NULL,
        -- =========================================
        -- USER INFORMATION
        -- =========================================
        user_id BIGINT NULL,
        employee_id BIGINT NULL,
        session_id UUID NULL,
        -- =========================================
        -- ACTION
        -- =========================================
        action VARCHAR(50) NOT NULL,
        -- CREATE, UPDATE, DELETE, RESTORE,
        -- ACTIVATE, DEACTIVATE, LOGIN, LOGOUT,
        -- LOGIN_FAILED, PASSWORD_CHANGE, PASSWORD_RESET,
        -- APPROVE, REJECT, SUBMIT, CANCEL,
        -- EXPORT, IMPORT, DOWNLOAD, UPLOAD, PRINT, VIEW
        -- =========================================
        -- MODULE
        -- =========================================
        module VARCHAR(100) NOT NULL,
        -- products, inventory, sales, purchases,
        -- customers, suppliers, employees, users,
        -- finance, branches, settings
        -- =========================================
        -- ENTITY / RECORD
        -- =========================================
        entity_type VARCHAR(100) NOT NULL,
        entity_id BIGINT NULL,
        entity_name VARCHAR(255) NULL,
        -- =========================================
        -- DESCRIPTION
        -- =========================================
        description TEXT NULL,
        -- =========================================
        -- OLD / NEW DATA
        -- =========================================
        old_data JSONB NULL,
        new_data JSONB NULL,
        change_data JSONB NULL,
        -- =========================================
        -- REQUEST INFORMATION
        -- =========================================
        request_id VARCHAR(100) NULL,
        request_method VARCHAR(20) NULL,
        request_url TEXT NULL,
        -- =========================================
        -- IP / DEVICE INFORMATION
        -- =========================================
        ip_address INET NULL,
        user_agent TEXT NULL,
        device_type VARCHAR(50) NULL,
        device_name VARCHAR(255) NULL,
        operating_system VARCHAR(100) NULL,
        browser VARCHAR(100) NULL,
        browser_version VARCHAR(50) NULL,
        -- =========================================
        -- RESULT
        -- =========================================
        status VARCHAR(20) NOT NULL DEFAULT 'success',
        error_message TEXT NULL,
        -- =========================================
        -- TIMESTAMP
        -- =========================================
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        -- =========================================
        -- FOREIGN KEYS
        -- =========================================
        CONSTRAINT fk_audit_logs_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE SET NULL,
        CONSTRAINT fk_audit_logs_branch FOREIGN KEY (branch_id) REFERENCES branches (id) ON DELETE SET NULL,
        CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
        CONSTRAINT fk_audit_logs_employee FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE SET NULL,
        CONSTRAINT fk_audit_logs_session FOREIGN KEY (session_id) REFERENCES user_sessions (id) ON DELETE SET NULL,
        -- =========================================
        -- CHECK CONSTRAINTS
        -- =========================================
        CONSTRAINT chk_audit_logs_action CHECK (
            action IN (
                'CREATE',
                'UPDATE',
                'DELETE',
                'RESTORE',
                'ACTIVATE',
                'DEACTIVATE',
                'LOGIN',
                'LOGOUT',
                'LOGIN_FAILED',
                'PASSWORD_CHANGE',
                'PASSWORD_RESET',
                'APPROVE',
                'REJECT',
                'SUBMIT',
                'CANCEL',
                'EXPORT',
                'IMPORT',
                'DOWNLOAD',
                'UPLOAD',
                'PRINT',
                'VIEW'
            )
        ),
        CONSTRAINT chk_audit_logs_status CHECK (status IN ('success', 'failed')),
        CONSTRAINT chk_audit_logs_module CHECK (BTRIM (module) <> ''),
        CONSTRAINT chk_audit_logs_entity_type CHECK (BTRIM (entity_type) <> '')
    );

-- Company
CREATE INDEX idx_audit_logs_company ON audit_logs (company_id);

-- Branch
CREATE INDEX idx_audit_logs_branch ON audit_logs (branch_id);

-- User
CREATE INDEX idx_audit_logs_user ON audit_logs (user_id);

-- Employee
CREATE INDEX idx_audit_logs_employee ON audit_logs (employee_id);

-- Session
CREATE INDEX idx_audit_logs_session ON audit_logs (session_id);

-- Action
CREATE INDEX idx_audit_logs_action ON audit_logs (action);

-- Module
CREATE INDEX idx_audit_logs_module ON audit_logs (module);

-- Entity
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);

-- Request
CREATE INDEX idx_audit_logs_request ON audit_logs (request_id);

-- Status
CREATE INDEX idx_audit_logs_status ON audit_logs (status);

-- Created date
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);

-- Company + date
CREATE INDEX idx_audit_logs_company_created ON audit_logs (company_id, created_at DESC);

-- Branch + date
CREATE INDEX idx_audit_logs_branch_created ON audit_logs (branch_id, created_at DESC);

-- User + date
CREATE INDEX idx_audit_logs_user_created ON audit_logs (user_id, created_at DESC);