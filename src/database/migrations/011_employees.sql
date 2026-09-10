CREATE TABLE
    IF NOT EXISTS employees (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        branch_id BIGINT,
        employee_code VARCHAR(50) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        display_name VARCHAR(200),
        phone VARCHAR(20),
        alternate_phone VARCHAR(20),
        email VARCHAR(150),
        date_of_birth DATE,
        gender VARCHAR(20),
        designation VARCHAR(100),
        department VARCHAR(100),
        date_of_joining DATE,
        employment_type VARCHAR(30) NOT NULL DEFAULT 'full_time' CHECK (
            employment_type IN (
                'full_time',
                'part_time',
                'temporary',
                'contract',
                'intern'
            )
        ),
        employment_status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (
            employment_status IN (
                'active',
                'inactive',
                'on_leave',
                'resigned',
                'terminated'
            )
        ),
        salary_type VARCHAR(30) CHECK (salary_type IN ('monthly', 'daily', 'hourly')),
        salary_amount NUMERIC(18, 2),
        address TEXT,
        city VARCHAR(100),
        district VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(20),
        country VARCHAR(100) DEFAULT 'India',
        profile_photo_url TEXT,
        emergency_contact_name VARCHAR(150),
        emergency_contact_phone VARCHAR(20),
        emergency_contact_relation VARCHAR(50),
        notes TEXT,
        created_by BIGINT,
        updated_by BIGINT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_employees_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        CONSTRAINT fk_employees_branch FOREIGN KEY (branch_id) REFERENCES branches (id) ON DELETE SET NULL,
        CONSTRAINT uq_employee_company_code UNIQUE (company_id, employee_code),
        CONSTRAINT chk_employee_salary CHECK (
            salary_amount IS NULL
            OR salary_amount >= 0
        )
    );

CREATE INDEX idx_employees_company ON employees (company_id);

CREATE INDEX idx_employees_branch ON employees (branch_id);

CREATE INDEX IF NOT EXISTS idx_employees_phone ON employees (company_id, phone);

CREATE INDEX IF NOT EXISTS idx_employees_email ON employees (company_id, email);

CREATE INDEX IF NOT EXISTS idx_employees_status ON employees (company_id, employment_status);