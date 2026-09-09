CREATE TABLE
    IF NOT EXISTS branches (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_id BIGINT NOT NULL,
        branch_code VARCHAR(50) NOT NULL,
        branch_name VARCHAR(200) NOT NULL,
        branch_type VARCHAR(30) NOT NULL DEFAULT 'store' CHECK (
            branch_type IN (
                'head_office',
                'store',
                'warehouse',
                'office',
                'showroom',
                'other'
            )
        ),
        email VARCHAR(150),
        phone VARCHAR(30),
        mobile VARCHAR(30),
        manager_name VARCHAR(150),
        opening_date DATE,
        is_main_branch BOOLEAN NOT NULL DEFAULT FALSE,
        status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_branches_company FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        CONSTRAINT uq_branch_code UNIQUE (company_id, branch_code)
    );

--     Pooja Fashion Shop
-- │
-- ├── PFS-HO
-- │   Head Office
-- │
-- ├── PFS-B01
-- │   Hosur Branch
-- │
-- ├── PFS-B02
-- │   Bangalore Branch
-- │
-- └── PFS-B03
--     Krishnagiri Branch