-- =============================================================================
-- Database Seed Script: All Indian Banks, Identifiers & Company Accounts
-- Database: PostgreSQL
-- Project: Pooja Fashion Shop Backend
-- =============================================================================

BEGIN;

-- 1. All Major Indian Banks (Public, Private, SFB, Payments, Cooperative, RRB, Foreign)
INSERT INTO banks (
    bank_code, bank_name, short_name, legal_name, bank_type,
    logo_url, logo_light_url, logo_dark_url, website_url,
    country_code, is_active, is_verified, display_order, metadata
) VALUES
-- Public Sector Commercial Banks
('SBIN', 'State Bank of India', 'SBI', 'State Bank of India', 'commercial', '/uploads/banks/state-bank-of-india/logo.svg', '/uploads/banks/state-bank-of-india/logo-light.svg', '/uploads/banks/state-bank-of-india/logo-dark.svg', 'https://www.sbi.co.in', 'IN', TRUE, TRUE, 1, '{"category":"public_sector","toll_free":"1800 1234","head_office":"Mumbai","tagline":"The Banker to Every Indian"}'::jsonb),
('PUNB', 'Punjab National Bank', 'PNB', 'Punjab National Bank', 'commercial', '/uploads/banks/punjab-national-bank/logo.svg', '/uploads/banks/punjab-national-bank/logo-light.svg', '/uploads/banks/punjab-national-bank/logo-dark.svg', 'https://www.pnbindia.in', 'IN', TRUE, TRUE, 2, '{"category":"public_sector","toll_free":"1800 180 2222","head_office":"New Delhi","tagline":"The Name You Can Bank Upon"}'::jsonb),
('BARB', 'Bank of Baroda', 'BOB', 'Bank of Baroda', 'commercial', '/uploads/banks/bank-of-baroda/logo.svg', '/uploads/banks/bank-of-baroda/logo-light.svg', '/uploads/banks/bank-of-baroda/logo-dark.svg', 'https://www.bankofbaroda.in', 'IN', TRUE, TRUE, 3, '{"category":"public_sector","toll_free":"1800 5700","head_office":"Vadodara","tagline":"India''s International Bank"}'::jsonb),
('CNRB', 'Canara Bank', 'Canara Bank', 'Canara Bank', 'commercial', '/uploads/banks/canara-bank/logo.svg', '/uploads/banks/canara-bank/logo-light.svg', '/uploads/banks/canara-bank/logo-dark.svg', 'https://www.canarabank.com', 'IN', TRUE, TRUE, 4, '{"category":"public_sector","toll_free":"1800 425 0018","head_office":"Bengaluru","tagline":"Together We Can"}'::jsonb),
('UBIN', 'Union Bank of India', 'Union Bank', 'Union Bank of India', 'commercial', '/uploads/banks/union-bank-of-india/logo.svg', '/uploads/banks/union-bank-of-india/logo-light.svg', '/uploads/banks/union-bank-of-india/logo-dark.svg', 'https://www.unionbankofindia.co.in', 'IN', TRUE, TRUE, 5, '{"category":"public_sector","toll_free":"1800 22 2244","head_office":"Mumbai","tagline":"Good People to Bank With"}'::jsonb),
('BKID', 'Bank of India', 'BOI', 'Bank of India', 'commercial', '/uploads/banks/bank-of-india/logo.svg', '/uploads/banks/bank-of-india/logo-light.svg', '/uploads/banks/bank-of-india/logo-dark.svg', 'https://www.bankofindia.co.in', 'IN', TRUE, TRUE, 6, '{"category":"public_sector","toll_free":"1800 103 1906","head_office":"Mumbai","tagline":"Relationship Beyond Banking"}'::jsonb),
('IDIB', 'Indian Bank', 'Indian Bank', 'Indian Bank', 'commercial', '/uploads/banks/indian-bank/logo.svg', '/uploads/banks/indian-bank/logo-light.svg', '/uploads/banks/indian-bank/logo-dark.svg', 'https://www.indianbank.in', 'IN', TRUE, TRUE, 7, '{"category":"public_sector","toll_free":"1800 425 00000","head_office":"Chennai","tagline":"Your Tech-Friendly Bank"}'::jsonb),
('CBIN', 'Central Bank of India', 'Central Bank', 'Central Bank of India', 'commercial', '/uploads/banks/central-bank-of-india/logo.svg', '/uploads/banks/central-bank-of-india/logo-light.svg', '/uploads/banks/central-bank-of-india/logo-dark.svg', 'https://www.centralbankofindia.co.in', 'IN', TRUE, TRUE, 8, '{"category":"public_sector","toll_free":"1800 22 1911","head_office":"Mumbai","tagline":"Central To You Since 1911"}'::jsonb),
('IOBA', 'Indian Overseas Bank', 'IOB', 'Indian Overseas Bank', 'commercial', '/uploads/banks/indian-overseas-bank/logo.svg', '/uploads/banks/indian-overseas-bank/logo-light.svg', '/uploads/banks/indian-overseas-bank/logo-dark.svg', 'https://www.iob.in', 'IN', TRUE, TRUE, 9, '{"category":"public_sector","toll_free":"1800 890 4445","head_office":"Chennai","tagline":"Good People to Grow With"}'::jsonb),
('UCBA', 'UCO Bank', 'UCO Bank', 'UCO Bank', 'commercial', '/uploads/banks/uco-bank/logo.svg', '/uploads/banks/uco-bank/logo-light.svg', '/uploads/banks/uco-bank/logo-dark.svg', 'https://www.ucobank.com', 'IN', TRUE, TRUE, 10, '{"category":"public_sector","toll_free":"1800 103 0123","head_office":"Kolkata","tagline":"Honours Your Trust"}'::jsonb),
('MAHB', 'Bank of Maharashtra', 'BOM', 'Bank of Maharashtra', 'commercial', '/uploads/banks/bank-of-maharashtra/logo.svg', '/uploads/banks/bank-of-maharashtra/logo-light.svg', '/uploads/banks/bank-of-maharashtra/logo-dark.svg', 'https://www.bankofmaharashtra.in', 'IN', TRUE, TRUE, 11, '{"category":"public_sector","toll_free":"1800 233 4526","head_office":"Pune","tagline":"Ek Parivar, Ek Bank"}'::jsonb),
('PSIB', 'Punjab & Sind Bank', 'PSB', 'Punjab & Sind Bank', 'commercial', '/uploads/banks/punjab-sind-bank/logo.svg', '/uploads/banks/punjab-sind-bank/logo-light.svg', '/uploads/banks/punjab-sind-bank/logo-dark.svg', 'https://punjabandsindbank.co.in', 'IN', TRUE, TRUE, 12, '{"category":"public_sector","toll_free":"1800 419 8300","head_office":"New Delhi","tagline":"Where Service Is A Way Of Life"}'::jsonb),

-- Private Sector Commercial Banks
('HDFC', 'HDFC Bank', 'HDFC', 'HDFC Bank Limited', 'commercial', '/uploads/banks/hdfc-bank/logo.svg', '/uploads/banks/hdfc-bank/logo-light.svg', '/uploads/banks/hdfc-bank/logo-dark.svg', 'https://www.hdfcbank.com', 'IN', TRUE, TRUE, 13, '{"category":"private_sector","toll_free":"1800 202 6161","head_office":"Mumbai","tagline":"We Understand Your World"}'::jsonb),
('ICIC', 'ICICI Bank', 'ICICI', 'ICICI Bank Limited', 'commercial', '/uploads/banks/icici-bank/logo.svg', '/uploads/banks/icici-bank/logo-light.svg', '/uploads/banks/icici-bank/logo-dark.svg', 'https://www.icicibank.com', 'IN', TRUE, TRUE, 14, '{"category":"private_sector","toll_free":"1800 1080","head_office":"Mumbai","tagline":"Hum Hai Na, Khayal Aapka"}'::jsonb),
('UTIB', 'Axis Bank', 'Axis Bank', 'Axis Bank Limited', 'commercial', '/uploads/banks/axis-bank/logo.svg', '/uploads/banks/axis-bank/logo-light.svg', '/uploads/banks/axis-bank/logo-dark.svg', 'https://www.axisbank.com', 'IN', TRUE, TRUE, 15, '{"category":"private_sector","toll_free":"1860 419 5555","head_office":"Mumbai","tagline":"Badhti Ka Naam Zindagi"}'::jsonb),
('KKBK', 'Kotak Mahindra Bank', 'Kotak', 'Kotak Mahindra Bank Limited', 'commercial', '/uploads/banks/kotak-mahindra-bank/logo.svg', '/uploads/banks/kotak-mahindra-bank/logo-light.svg', '/uploads/banks/kotak-mahindra-bank/logo-dark.svg', 'https://www.kotak.com', 'IN', TRUE, TRUE, 16, '{"category":"private_sector","toll_free":"1860 266 2666","head_office":"Mumbai","tagline":"Let''s Make Money Simple"}'::jsonb),
('INDB', 'IndusInd Bank', 'IndusInd', 'IndusInd Bank Limited', 'commercial', '/uploads/banks/indusind-bank/logo.svg', '/uploads/banks/indusind-bank/logo-light.svg', '/uploads/banks/indusind-bank/logo-dark.svg', 'https://www.indusind.com', 'IN', TRUE, TRUE, 17, '{"category":"private_sector","toll_free":"1860 267 7777","head_office":"Mumbai","tagline":"We Make You Feel Richer"}'::jsonb),
('YESB', 'Yes Bank', 'Yes Bank', 'Yes Bank Limited', 'commercial', '/uploads/banks/yes-bank/logo.svg', '/uploads/banks/yes-bank/logo-light.svg', '/uploads/banks/yes-bank/logo-dark.svg', 'https://www.yesbank.in', 'IN', TRUE, TRUE, 18, '{"category":"private_sector","toll_free":"1800 1200","head_office":"Mumbai","tagline":"Experience Our Expertise"}'::jsonb),
('IDFB', 'IDFC FIRST Bank', 'IDFC FIRST', 'IDFC FIRST Bank Limited', 'commercial', '/uploads/banks/idfc-first-bank/logo.svg', '/uploads/banks/idfc-first-bank/logo-light.svg', '/uploads/banks/idfc-first-bank/logo-dark.svg', 'https://www.idfcfirstbank.com', 'IN', TRUE, TRUE, 19, '{"category":"private_sector","toll_free":"1800 10 888","head_office":"Mumbai","tagline":"Always You First"}'::jsonb),
('FDRL', 'Federal Bank', 'Federal Bank', 'The Federal Bank Limited', 'commercial', '/uploads/banks/federal-bank/logo.svg', '/uploads/banks/federal-bank/logo-light.svg', '/uploads/banks/federal-bank/logo-dark.svg', 'https://www.federalbank.co.in', 'IN', TRUE, TRUE, 20, '{"category":"private_sector","toll_free":"1800 425 1199","head_office":"Aluva","tagline":"Your Perfect Banking Partner"}'::jsonb),
('BDBL', 'Bandhan Bank', 'Bandhan', 'Bandhan Bank Limited', 'commercial', '/uploads/banks/bandhan-bank/logo.svg', '/uploads/banks/bandhan-bank/logo-light.svg', '/uploads/banks/bandhan-bank/logo-dark.svg', 'https://www.bandhanbank.com', 'IN', TRUE, TRUE, 21, '{"category":"private_sector","toll_free":"1800 258 8181","head_office":"Kolkata","tagline":"Aapka Bhala, Sabki Bhalai"}'::jsonb),
('RATN', 'RBL Bank', 'RBL', 'RBL Bank Limited', 'commercial', '/uploads/banks/rbl-bank/logo.svg', '/uploads/banks/rbl-bank/logo-light.svg', '/uploads/banks/rbl-bank/logo-dark.svg', 'https://www.rblbank.com', 'IN', TRUE, TRUE, 22, '{"category":"private_sector","toll_free":"1800 120 616161","head_office":"Mumbai","tagline":"Apno Ka Bank"}'::jsonb),
('SIBL', 'South Indian Bank', 'SIB', 'The South Indian Bank Limited', 'commercial', '/uploads/banks/south-indian-bank/logo.svg', '/uploads/banks/south-indian-bank/logo-light.svg', '/uploads/banks/south-indian-bank/logo-dark.svg', 'https://www.southindianbank.com', 'IN', TRUE, TRUE, 23, '{"category":"private_sector","toll_free":"1800 425 1809","head_office":"Thrissur","tagline":"Experience Next Generation Banking"}'::jsonb),
('KVBL', 'Karur Vysya Bank', 'KVB', 'The Karur Vysya Bank Limited', 'commercial', '/uploads/banks/karur-vysya-bank/logo.svg', '/uploads/banks/karur-vysya-bank/logo-light.svg', '/uploads/banks/karur-vysya-bank/logo-dark.svg', 'https://www.kvb.co.in', 'IN', TRUE, TRUE, 24, '{"category":"private_sector","toll_free":"1860 258 1916","head_office":"Karur","tagline":"Smart Way to Bank"}'::jsonb),
('CIUB', 'City Union Bank', 'CUB', 'City Union Bank Limited', 'commercial', '/uploads/banks/city-union-bank/logo.svg', '/uploads/banks/city-union-bank/logo-light.svg', '/uploads/banks/city-union-bank/logo-dark.svg', 'https://www.cityunionbank.com', 'IN', TRUE, TRUE, 25, '{"category":"private_sector","toll_free":"044 7122 5000","head_office":"Kumbakonam","tagline":"Trust and Excellence since 1904"}'::jsonb),
('KARB', 'Karnataka Bank', 'Karnataka Bank', 'Karnataka Bank Limited', 'commercial', '/uploads/banks/karnataka-bank/logo.svg', '/uploads/banks/karnataka-bank/logo-light.svg', '/uploads/banks/karnataka-bank/logo-dark.svg', 'https://karnatakabank.com', 'IN', TRUE, TRUE, 26, '{"category":"private_sector","toll_free":"1800 425 1444","head_office":"Mangaluru","tagline":"Your Family Bank Across India"}'::jsonb),
('TMBL', 'Tamilnad Mercantile Bank', 'TMB', 'Tamilnad Mercantile Bank Limited', 'commercial', '/uploads/banks/tamilnad-mercantile-bank/logo.svg', '/uploads/banks/tamilnad-mercantile-bank/logo-light.svg', '/uploads/banks/tamilnad-mercantile-bank/logo-dark.svg', 'https://www.tmb.in', 'IN', TRUE, TRUE, 27, '{"category":"private_sector","toll_free":"1800 425 0426","head_office":"Thoothukudi","tagline":"Be a Step Ahead of Life"}'::jsonb),
('IBKL', 'IDBI Bank', 'IDBI', 'IDBI Bank Limited', 'commercial', '/uploads/banks/idbi-bank/logo.svg', '/uploads/banks/idbi-bank/logo-light.svg', '/uploads/banks/idbi-bank/logo-dark.svg', 'https://www.idbibank.in', 'IN', TRUE, TRUE, 28, '{"category":"private_sector","toll_free":"1800 209 4324","head_office":"Mumbai","tagline":"Bank Aisa Dost Jaisa"}'::jsonb),
('JAKA', 'Jammu & Kashmir Bank', 'J&K Bank', 'The Jammu and Kashmir Bank Limited', 'commercial', '/uploads/banks/jammu-kashmir-bank/logo.svg', '/uploads/banks/jammu-kashmir-bank/logo-light.svg', '/uploads/banks/jammu-kashmir-bank/logo-dark.svg', 'https://www.jkbank.com', 'IN', TRUE, TRUE, 29, '{"category":"private_sector","toll_free":"1800 890 2122","head_office":"Srinagar","tagline":"Serving to Empower"}'::jsonb),
('CSBK', 'CSB Bank', 'CSB', 'CSB Bank Limited', 'commercial', '/uploads/banks/csb-bank/logo.svg', '/uploads/banks/csb-bank/logo-light.svg', '/uploads/banks/csb-bank/logo-dark.svg', 'https://www.csb.co.in', 'IN', TRUE, TRUE, 30, '{"category":"private_sector","toll_free":"1800 266 9090","head_office":"Thrissur","tagline":"Support All The Way"}'::jsonb),
('DLXB', 'Dhanlaxmi Bank', 'Dhanlaxmi', 'Dhanlaxmi Bank Limited', 'commercial', '/uploads/banks/dhanlaxmi-bank/logo.svg', '/uploads/banks/dhanlaxmi-bank/logo-light.svg', '/uploads/banks/dhanlaxmi-bank/logo-dark.svg', 'https://www.dhanbank.com', 'IN', TRUE, TRUE, 31, '{"category":"private_sector","toll_free":"1800 425 1747","head_office":"Thrissur","tagline":"Tann. Mann. Dhan."}'::jsonb),
('NTBL', 'Nainital Bank', 'Nainital Bank', 'The Nainital Bank Limited', 'commercial', '/uploads/banks/nainital-bank/logo.svg', '/uploads/banks/nainital-bank/logo-light.svg', '/uploads/banks/nainital-bank/logo-dark.svg', 'https://www.nainitalbank.co.in', 'IN', TRUE, TRUE, 32, '{"category":"private_sector","toll_free":"1800 180 4031","head_office":"Nainital","tagline":"Banking with Personal Touch"}'::jsonb),

-- Small Finance Banks
('AUBL', 'AU Small Finance Bank', 'AU Bank', 'AU Small Finance Bank Limited', 'small_finance', '/uploads/banks/au-small-finance-bank/logo.svg', '/uploads/banks/au-small-finance-bank/logo-light.svg', '/uploads/banks/au-small-finance-bank/logo-dark.svg', 'https://www.aubank.in', 'IN', TRUE, TRUE, 33, '{"category":"small_finance","toll_free":"1800 1200 1200","head_office":"Jaipur","tagline":"Badlaav Humse Hai"}'::jsonb),
('ESFB', 'Equitas Small Finance Bank', 'Equitas', 'Equitas Small Finance Bank Limited', 'small_finance', '/uploads/banks/equitas-small-finance-bank/logo.svg', '/uploads/banks/equitas-small-finance-bank/logo-light.svg', '/uploads/banks/equitas-small-finance-bank/logo-dark.svg', 'https://www.equitasbank.com', 'IN', TRUE, TRUE, 34, '{"category":"small_finance","toll_free":"1800 103 1222","head_office":"Chennai","tagline":"Beyond Banking"}'::jsonb),
('UJVN', 'Ujjivan Small Finance Bank', 'Ujjivan', 'Ujjivan Small Finance Bank Limited', 'small_finance', '/uploads/banks/ujjivan-small-finance-bank/logo.svg', '/uploads/banks/ujjivan-small-finance-bank/logo-light.svg', '/uploads/banks/ujjivan-small-finance-bank/logo-dark.svg', 'https://www.ujjivansfb.in', 'IN', TRUE, TRUE, 35, '{"category":"small_finance","toll_free":"1800 208 2121","head_office":"Bengaluru","tagline":"Build A Better Life"}'::jsonb),
('JSFB', 'Jana Small Finance Bank', 'Jana SFB', 'Jana Small Finance Bank Limited', 'small_finance', '/uploads/banks/jana-small-finance-bank/logo.svg', '/uploads/banks/jana-small-finance-bank/logo-light.svg', '/uploads/banks/jana-small-finance-bank/logo-dark.svg', 'https://www.janabank.com', 'IN', TRUE, TRUE, 36, '{"category":"small_finance","toll_free":"1800 2080","head_office":"Bengaluru","tagline":"Likho Apni Kahani"}'::jsonb),
('CLBL', 'Capital Small Finance Bank', 'Capital SFB', 'Capital Small Finance Bank Limited', 'small_finance', '/uploads/banks/capital-small-finance-bank/logo.svg', '/uploads/banks/capital-small-finance-bank/logo-light.svg', '/uploads/banks/capital-small-finance-bank/logo-dark.svg', 'https://www.capitalbank.co.in', 'IN', TRUE, TRUE, 37, '{"category":"small_finance","toll_free":"1800 120 1600","head_office":"Jalandhar","tagline":"Vishwas Se Vikas Tak"}'::jsonb),
('UTKS', 'Utkarsh Small Finance Bank', 'Utkarsh', 'Utkarsh Small Finance Bank Limited', 'small_finance', '/uploads/banks/utkarsh-small-finance-bank/logo.svg', '/uploads/banks/utkarsh-small-finance-bank/logo-light.svg', '/uploads/banks/utkarsh-small-finance-bank/logo-dark.svg', 'https://www.utkarsh.bank', 'IN', TRUE, TRUE, 38, '{"category":"small_finance","toll_free":"1800 123 9878","head_office":"Varanasi","tagline":"Aapki Ummeed Ka Khaata"}'::jsonb),
('ESMF', 'ESAF Small Finance Bank', 'ESAF', 'ESAF Small Finance Bank Limited', 'small_finance', '/uploads/banks/esaf-small-finance-bank/logo.svg', '/uploads/banks/esaf-small-finance-bank/logo-light.svg', '/uploads/banks/esaf-small-finance-bank/logo-dark.svg', 'https://www.esafbank.com', 'IN', TRUE, TRUE, 39, '{"category":"small_finance","toll_free":"1800 103 3723","head_office":"Thrissur","tagline":"Joy of Banking"}'::jsonb),
('SURY', 'Suryoday Small Finance Bank', 'Suryoday', 'Suryoday Small Finance Bank Limited', 'small_finance', '/uploads/banks/suryoday-small-finance-bank/logo.svg', '/uploads/banks/suryoday-small-finance-bank/logo-light.svg', '/uploads/banks/suryoday-small-finance-bank/logo-dark.svg', 'https://www.suryodaybank.com', 'IN', TRUE, TRUE, 40, '{"category":"small_finance","toll_free":"1800 266 7711","head_office":"Navi Mumbai","tagline":"A Bank of Smiles"}'::jsonb),
('SMCB', 'Shivalik Small Finance Bank', 'Shivalik', 'Shivalik Small Finance Bank Limited', 'small_finance', '/uploads/banks/shivalik-small-finance-bank/logo.svg', '/uploads/banks/shivalik-small-finance-bank/logo-light.svg', '/uploads/banks/shivalik-small-finance-bank/logo-dark.svg', 'https://shivalikbank.com', 'IN', TRUE, TRUE, 41, '{"category":"small_finance","toll_free":"1800 202 5333","head_office":"Noida","tagline":"A Bank for Digital Bharat"}'::jsonb),
('UTBI', 'Unity Small Finance Bank', 'Unity SFB', 'Unity Small Finance Bank Limited', 'small_finance', '/uploads/banks/unity-small-finance-bank/logo.svg', '/uploads/banks/unity-small-finance-bank/logo-light.svg', '/uploads/banks/unity-small-finance-bank/logo-dark.svg', 'https://theunitybank.com', 'IN', TRUE, TRUE, 42, '{"category":"small_finance","toll_free":"1800 209 1122","head_office":"Mumbai","tagline":"Bank with Unity"}'::jsonb),

-- Payments Banks
('AIRP', 'Airtel Payments Bank', 'Airtel Bank', 'Airtel Payments Bank Limited', 'payments', '/uploads/banks/airtel-payments-bank/logo.svg', '/uploads/banks/airtel-payments-bank/logo-light.svg', '/uploads/banks/airtel-payments-bank/logo-dark.svg', 'https://www.airtel.in/bank', 'IN', TRUE, TRUE, 43, '{"category":"payments","toll_free":"1800 103 0103","head_office":"New Delhi","tagline":"Banking Is Now On Your Fingertips"}'::jsonb),
('IPOS', 'India Post Payments Bank', 'IPPB', 'India Post Payments Bank Limited', 'payments', '/uploads/banks/india-post-payments-bank/logo.svg', '/uploads/banks/india-post-payments-bank/logo-light.svg', '/uploads/banks/india-post-payments-bank/logo-dark.svg', 'https://www.ippbonline.com', 'IN', TRUE, TRUE, 44, '{"category":"payments","toll_free":"155299","head_office":"New Delhi","tagline":"Aapka Bank, Aapke Dwaar"}'::jsonb),
('PYTM', 'Paytm Payments Bank', 'Paytm Bank', 'Paytm Payments Bank Limited', 'payments', '/uploads/banks/paytm-payments-bank/logo.svg', '/uploads/banks/paytm-payments-bank/logo-light.svg', '/uploads/banks/paytm-payments-bank/logo-dark.svg', 'https://www.paytmbank.com', 'IN', TRUE, TRUE, 45, '{"category":"payments","toll_free":"0120 4456 456","head_office":"Noida","tagline":"Simplifying Payments for India"}'::jsonb),
('FINO', 'Fino Payments Bank', 'Fino', 'Fino Payments Bank Limited', 'payments', '/uploads/banks/fino-payments-bank/logo.svg', '/uploads/banks/fino-payments-bank/logo-light.svg', '/uploads/banks/fino-payments-bank/logo-dark.svg', 'https://www.finobank.com', 'IN', TRUE, TRUE, 46, '{"category":"payments","toll_free":"1860 266 3466","head_office":"Navi Mumbai","tagline":"Qadar Aapki Mehnat Ki"}'::jsonb),
('JIOP', 'Jio Payments Bank', 'Jio Bank', 'Jio Payments Bank Limited', 'payments', '/uploads/banks/jio-payments-bank/logo.svg', '/uploads/banks/jio-payments-bank/logo-light.svg', '/uploads/banks/jio-payments-bank/logo-dark.svg', 'https://www.jiopaymentsbank.com', 'IN', TRUE, TRUE, 47, '{"category":"payments","toll_free":"1800 891 9999","head_office":"Navi Mumbai","tagline":"Digital Banking for Every Indian"}'::jsonb),
('NSPB', 'NSDL Payments Bank', 'NSDL Bank', 'NSDL Payments Bank Limited', 'payments', '/uploads/banks/nsdl-payments-bank/logo.svg', '/uploads/banks/nsdl-payments-bank/logo-light.svg', '/uploads/banks/nsdl-payments-bank/logo-dark.svg', 'https://www.nsdlbank.com', 'IN', TRUE, TRUE, 48, '{"category":"payments","toll_free":"1800 266 0199","head_office":"Mumbai","tagline":"Secure and Seamless Digital Banking"}'::jsonb),

-- Co-operative Banks
('SRCB', 'Saraswat Co-operative Bank', 'Saraswat', 'The Saraswat Co-operative Bank Limited', 'cooperative', '/uploads/banks/saraswat-co-operative-bank/logo.svg', '/uploads/banks/saraswat-co-operative-bank/logo-light.svg', '/uploads/banks/saraswat-co-operative-bank/logo-dark.svg', 'https://www.saraswatbank.com', 'IN', TRUE, TRUE, 49, '{"category":"cooperative","toll_free":"1800 22 9999","head_office":"Mumbai","tagline":"Serving with Smile"}'::jsonb),
('COSB', 'Cosmos Co-operative Bank', 'Cosmos', 'The Cosmos Co-operative Bank Limited', 'cooperative', '/uploads/banks/cosmos-co-operative-bank/logo.svg', '/uploads/banks/cosmos-co-operative-bank/logo-light.svg', '/uploads/banks/cosmos-co-operative-bank/logo-dark.svg', 'https://www.cosmosbank.com', 'IN', TRUE, TRUE, 50, '{"category":"cooperative","toll_free":"1800 233 0234","head_office":"Pune","tagline":"Rich in Tradition, Rich in Trust"}'::jsonb),
('SVCB', 'SVC Co-operative Bank', 'SVC Bank', 'SVC Co-operative Bank Limited', 'cooperative', '/uploads/banks/svc-co-operative-bank/logo.svg', '/uploads/banks/svc-co-operative-bank/logo-light.svg', '/uploads/banks/svc-co-operative-bank/logo-dark.svg', 'https://www.svcbank.com', 'IN', TRUE, TRUE, 51, '{"category":"cooperative","toll_free":"1800 313 2120","head_office":"Mumbai","tagline":"Experience the Next Step"}'::jsonb),
('TNSC', 'Tamil Nadu State Apex Co-operative Bank', 'TNSC Bank', 'The Tamil Nadu State Apex Co-operative Bank Limited', 'cooperative', '/uploads/banks/tamil-nadu-state-apex-co-operative-bank/logo.svg', '/uploads/banks/tamil-nadu-state-apex-co-operative-bank/logo-light.svg', '/uploads/banks/tamil-nadu-state-apex-co-operative-bank/logo-dark.svg', 'https://www.tnscbank.com', 'IN', TRUE, TRUE, 52, '{"category":"cooperative","toll_free":"044 2530 2300","head_office":"Chennai","tagline":"Pioneers in Rural & State Co-operative Banking"}'::jsonb),

-- Regional Rural Banks (RRBs)
('BUPB', 'Baroda UP Bank', 'Baroda UP', 'Baroda UP Bank', 'regional_rural', '/uploads/banks/baroda-up-bank/logo.svg', '/uploads/banks/baroda-up-bank/logo-light.svg', '/uploads/banks/baroda-up-bank/logo-dark.svg', 'https://www.barodaupbank.in', 'IN', TRUE, TRUE, 53, '{"category":"regional_rural","sponsor_bank":"Bank of Baroda","toll_free":"1800 1800 225","head_office":"Gorakhpur"}'::jsonb),
('ARYB', 'Aryavart Bank', 'Aryavart', 'Aryavart Bank', 'regional_rural', '/uploads/banks/aryavart-bank/logo.svg', '/uploads/banks/aryavart-bank/logo-light.svg', '/uploads/banks/aryavart-bank/logo-dark.svg', 'https://www.aryavart-rrb.com', 'IN', TRUE, TRUE, 54, '{"category":"regional_rural","sponsor_bank":"Bank of India","toll_free":"1800 102 0304","head_office":"Lucknow"}'::jsonb),
('KLGB', 'Kerala Gramin Bank', 'Kerala Gramin', 'Kerala Gramin Bank', 'regional_rural', '/uploads/banks/kerala-gramin-bank/logo.svg', '/uploads/banks/kerala-gramin-bank/logo-light.svg', '/uploads/banks/kerala-gramin-bank/logo-dark.svg', 'https://www.keralagbank.com', 'IN', TRUE, TRUE, 55, '{"category":"regional_rural","sponsor_bank":"Canara Bank","toll_free":"1800 425 4121","head_office":"Malappuram"}'::jsonb),
('PKGB', 'Karnataka Gramin Bank', 'Karnataka Gramin', 'Karnataka Gramin Bank', 'regional_rural', '/uploads/banks/karnataka-gramin-bank/logo.svg', '/uploads/banks/karnataka-gramin-bank/logo-light.svg', '/uploads/banks/karnataka-gramin-bank/logo-dark.svg', 'https://karnatakagraminbank.com', 'IN', TRUE, TRUE, 56, '{"category":"regional_rural","sponsor_bank":"Canara Bank","toll_free":"1800 102 5250","head_office":"Ballari"}'::jsonb),
('APGV', 'Andhra Pradesh Grameena Vikas Bank', 'APGVB', 'Andhra Pradesh Grameena Vikas Bank', 'regional_rural', '/uploads/banks/andhra-pradesh-grameena-vikas-bank/logo.svg', '/uploads/banks/andhra-pradesh-grameena-vikas-bank/logo-light.svg', '/uploads/banks/andhra-pradesh-grameena-vikas-bank/logo-dark.svg', 'https://www.apgvbank.in', 'IN', TRUE, TRUE, 57, '{"category":"regional_rural","sponsor_bank":"State Bank of India","toll_free":"1800 425 2242","head_office":"Warangal"}'::jsonb),

-- Foreign Commercial Banks
('CITI', 'Citibank India', 'Citibank', 'Citibank N.A. India', 'foreign', '/uploads/banks/citibank-india/logo.svg', '/uploads/banks/citibank-india/logo-light.svg', '/uploads/banks/citibank-india/logo-dark.svg', 'https://www.online.citibank.co.in', 'IN', TRUE, TRUE, 58, '{"category":"foreign","toll_free":"1860 210 2484","head_office":"Mumbai","tagline":"Let''s Get It Done"}'::jsonb),
('SCBL', 'Standard Chartered Bank', 'StanChart', 'Standard Chartered Bank India', 'foreign', '/uploads/banks/standard-chartered-bank/logo.svg', '/uploads/banks/standard-chartered-bank/logo-light.svg', '/uploads/banks/standard-chartered-bank/logo-dark.svg', 'https://www.sc.com/in', 'IN', TRUE, TRUE, 59, '{"category":"foreign","toll_free":"1800 345 5000","head_office":"Mumbai","tagline":"Here for Good"}'::jsonb),
('HSBC', 'HSBC Bank India', 'HSBC', 'The Hongkong and Shanghai Banking Corporation Limited', 'foreign', '/uploads/banks/hsbc-bank-india/logo.svg', '/uploads/banks/hsbc-bank-india/logo-light.svg', '/uploads/banks/hsbc-bank-india/logo-dark.svg', 'https://www.hsbc.co.in', 'IN', TRUE, TRUE, 60, '{"category":"foreign","toll_free":"1800 266 3456","head_office":"Mumbai","tagline":"Opening Up a World of Opportunity"}'::jsonb),
('DEUT', 'Deutsche Bank India', 'Deutsche Bank', 'Deutsche Bank AG India', 'foreign', '/uploads/banks/deutsche-bank-india/logo.svg', '/uploads/banks/deutsche-bank-india/logo-light.svg', '/uploads/banks/deutsche-bank-india/logo-dark.svg', 'https://www.deutschebank.co.in', 'IN', TRUE, TRUE, 61, '{"category":"foreign","toll_free":"1860 266 6601","head_office":"Mumbai","tagline":"Passionate to Perform"}'::jsonb),
('DBSS', 'DBS Bank India', 'DBS', 'DBS Bank India Limited', 'foreign', '/uploads/banks/dbs-bank-india/logo.svg', '/uploads/banks/dbs-bank-india/logo-light.svg', '/uploads/banks/dbs-bank-india/logo-dark.svg', 'https://www.dbs.com/in', 'IN', TRUE, TRUE, 62, '{"category":"foreign","toll_free":"1800 209 4555","head_office":"Mumbai","tagline":"Live more, Bank less"}'::jsonb),
('BARC', 'Barclays Bank India', 'Barclays', 'Barclays Bank PLC India', 'foreign', '/uploads/banks/barclays-bank-india/logo.svg', '/uploads/banks/barclays-bank-india/logo-light.svg', '/uploads/banks/barclays-bank-india/logo-dark.svg', 'https://www.barclays.in', 'IN', TRUE, TRUE, 63, '{"category":"foreign","toll_free":"1800 266 1234","head_office":"Mumbai","tagline":"Now, There''s a Thought"}'::jsonb)
ON CONFLICT (bank_code) DO UPDATE SET
    bank_name = EXCLUDED.bank_name,
    short_name = EXCLUDED.short_name,
    legal_name = EXCLUDED.legal_name,
    bank_type = EXCLUDED.bank_type,
    logo_url = EXCLUDED.logo_url,
    logo_light_url = EXCLUDED.logo_light_url,
    logo_dark_url = EXCLUDED.logo_dark_url,
    website_url = EXCLUDED.website_url,
    display_order = EXCLUDED.display_order,
    metadata = EXCLUDED.metadata,
    updated_at = CURRENT_TIMESTAMP;

-- 2. Company Operating Bank Accounts (Pooja Fashion Shop PFS001)
INSERT INTO company_banks (
    company_id, bank_id, account_name, account_number, account_type,
    branch_name, branch_code, ifsc_code, micr_code, swift_code,
    opening_balance, current_balance, is_primary, is_active, notes
)
SELECT 
    c.id, b.id, 'Pooja Fashion Shop Private Limited - Main Operations',
    '50200084930125', 'current', 'Hosur Main Branch', '1234',
    'HDFC0001234', '635240002', 'HDFCINBBXXX',
    250000.00, 485600.00, TRUE, TRUE,
    'Primary operational current account for vendor payments, supplier remittances, and wholesale collections'
FROM companies c, banks b
WHERE c.company_code = 'PFS001' AND b.bank_code = 'HDFC'
ON CONFLICT (company_id, account_number) DO UPDATE SET
    bank_id = EXCLUDED.bank_id,
    account_name = EXCLUDED.account_name,
    is_primary = EXCLUDED.is_primary,
    notes = EXCLUDED.notes,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO company_banks (
    company_id, bank_id, account_name, account_number, account_type,
    branch_name, branch_code, ifsc_code, micr_code, swift_code,
    opening_balance, current_balance, is_primary, is_active, notes
)
SELECT 
    c.id, b.id, 'Pooja Fashion Shop - POS & Digital Collections',
    '057205001928', 'current', 'Hosur Branch', '0572',
    'ICIC0000572', '635229002', 'ICICINBBXXX',
    100000.00, 234150.00, FALSE, TRUE,
    'POS merchant card swipe settlements and UPI/online retail customer collections'
FROM companies c, banks b
WHERE c.company_code = 'PFS001' AND b.bank_code = 'ICIC'
ON CONFLICT (company_id, account_number) DO UPDATE SET
    bank_id = EXCLUDED.bank_id,
    account_name = EXCLUDED.account_name,
    is_primary = EXCLUDED.is_primary,
    notes = EXCLUDED.notes,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO company_banks (
    company_id, bank_id, account_name, account_number, account_type,
    branch_name, branch_code, ifsc_code, micr_code, swift_code,
    opening_balance, current_balance, is_primary, is_active, notes
)
SELECT 
    c.id, b.id, 'Pooja Fashion Shop - Statutory & Tax Reserve',
    '38192048591', 'current', 'Hosur Main Branch', '0843',
    'SBIN0000843', '635002001', 'SBININBBXXX',
    150000.00, 195000.00, FALSE, TRUE,
    'Dedicated reserve account for GST remittances, TDS compliance, and advance taxes'
FROM companies c, banks b
WHERE c.company_code = 'PFS001' AND b.bank_code = 'SBIN'
ON CONFLICT (company_id, account_number) DO UPDATE SET
    bank_id = EXCLUDED.bank_id,
    account_name = EXCLUDED.account_name,
    is_primary = EXCLUDED.is_primary,
    notes = EXCLUDED.notes,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO company_banks (
    company_id, bank_id, account_name, account_number, account_type,
    branch_name, branch_code, ifsc_code, micr_code, swift_code,
    opening_balance, current_balance, is_primary, is_active, notes
)
SELECT 
    c.id, b.id, 'Pooja Fashion Shop - Payroll & Staff Disbursements',
    '918020048192837', 'current', 'Hosur Branch', '0673',
    'UTIB0000673', '635211002', 'AXISINBBXXX',
    75000.00, 128400.00, FALSE, TRUE,
    'Staff salary direct disbursements, festival bonuses, and employee incentives'
FROM companies c, banks b
WHERE c.company_code = 'PFS001' AND b.bank_code = 'UTIB'
ON CONFLICT (company_id, account_number) DO UPDATE SET
    bank_id = EXCLUDED.bank_id,
    account_name = EXCLUDED.account_name,
    is_primary = EXCLUDED.is_primary,
    notes = EXCLUDED.notes,
    updated_at = CURRENT_TIMESTAMP;

COMMIT;
