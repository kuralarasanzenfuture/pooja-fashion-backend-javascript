CREATE TABLE
    IF NOT EXISTS companies (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        company_code VARCHAR(50) NOT NULL UNIQUE,
        company_name VARCHAR(200) NOT NULL,
        legal_name VARCHAR(250),
        display_name VARCHAR(200),
        business_type VARCHAR(100),
        industry_type VARCHAR(100),
        registration_number VARCHAR(100),
        email VARCHAR(150),
        phone VARCHAR(30),
        mobile VARCHAR(30),
        website VARCHAR(255),
        logo_url TEXT,
        default_currency CHAR(3) NOT NULL DEFAULT 'INR',
        country_code CHAR(2) NOT NULL DEFAULT 'IN',
        timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Kolkata',
        financial_year_start_month SMALLINT NOT NULL DEFAULT 4,
        status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CHECK (financial_year_start_month BETWEEN 1 AND 12)
    );

-- company_code       : PFS001
-- company_name       : Pooja Fashion Shop
-- legal_name         : Pooja Fashion Shop Private Limited
-- display_name       : Pooja Fashion
-- business_type      : Retail
-- industry_type      : Fashion & Garments
-- default_currency   : INR
-- country_code       : IN
-- timezone           : Asia/Kolkata