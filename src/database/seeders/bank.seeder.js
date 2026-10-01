import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabasePool } from '../connection.js';
import { toSlug } from '../../shared/utils/file.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsBanksDir = path.resolve(__dirname, '..', '..', 'uploads', 'banks');

/**
 * Generate high-definition, beautifully branded SVG bank logo
 * Supports three variants:
 * - 'brand': Full rich brand colors with subtle gradients and crisp monogram
 * - 'light': Clean high-contrast badge on pure white/slate background
 * - 'dark': Modern dark-mode aesthetic with neon/slate border and glowing brand accent
 */
export const generateBankSvg = ({
  bankName,
  shortName,
  bankCode,
  primaryColor = '#004c8f',
  secondaryColor = '#f58220',
  variant = 'brand',
}) => {
  const acronym = (shortName || bankCode || bankName.substring(0, 4)).toUpperCase().trim();
  const safeName = bankName.replace(/[&<>'"]/g, (c) => {
    switch (c) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
    }
  });

  if (variant === 'light') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <defs>
    <linearGradient id="lightBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f8fafc"/>
    </linearGradient>
    <filter id="shadowLight" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
  </defs>
  <!-- Card Background -->
  <rect width="256" height="256" rx="44" fill="url(#lightBg)" stroke="#e2e8f0" stroke-width="3"/>
  <!-- Central Emblem Badge -->
  <g filter="url(#shadowLight)">
    <rect x="52" y="44" width="152" height="116" rx="28" fill="${primaryColor}"/>
    <circle cx="128" cy="80" r="24" fill="${secondaryColor}" fill-opacity="0.25"/>
    <text x="128" y="112" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">${acronym}</text>
  </g>
  <!-- Decorative Accent Bar -->
  <rect x="88" y="174" width="80" height="5" rx="2.5" fill="${secondaryColor}"/>
  <!-- Subtitle -->
  <text x="128" y="206" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" fill="#1e293b" text-anchor="middle">${safeName.length > 22 ? safeName.substring(0, 20) + '...' : safeName}</text>
  <text x="128" y="226" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#64748b" text-anchor="middle" letter-spacing="1">INDIA • ${bankCode}</text>
</svg>`;
  }

  if (variant === 'dark') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <defs>
    <linearGradient id="darkBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}"/>
      <stop offset="100%" stop-color="${secondaryColor}"/>
    </linearGradient>
    <filter id="shadowDark" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="${primaryColor}" flood-opacity="0.35"/>
    </filter>
  </defs>
  <!-- Card Background -->
  <rect width="256" height="256" rx="44" fill="url(#darkBg)" stroke="#1e293b" stroke-width="3"/>
  <!-- Central Emblem Badge -->
  <g filter="url(#shadowDark)">
    <rect x="52" y="44" width="152" height="116" rx="28" fill="url(#neonGlow)"/>
    <circle cx="128" cy="80" r="26" fill="#ffffff" fill-opacity="0.18"/>
    <text x="128" y="112" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">${acronym}</text>
  </g>
  <!-- Decorative Accent Bar -->
  <rect x="88" y="174" width="80" height="5" rx="2.5" fill="${secondaryColor}"/>
  <!-- Subtitle -->
  <text x="128" y="206" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" fill="#f8fafc" text-anchor="middle">${safeName.length > 22 ? safeName.substring(0, 20) + '...' : safeName}</text>
  <text x="128" y="226" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#94a3b8" text-anchor="middle" letter-spacing="1">INDIA • ${bankCode}</text>
</svg>`;
  }

  // Default 'brand' variant
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="100%" height="100%">
  <defs>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}"/>
      <stop offset="100%" stop-color="${secondaryColor}"/>
    </linearGradient>
    <filter id="badgeShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>
  <!-- Card Background -->
  <rect width="256" height="256" rx="44" fill="url(#brandGrad)"/>
  <!-- Inner Frame -->
  <rect x="12" y="12" width="232" height="232" rx="36" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="2"/>
  <!-- Central Emblem Container -->
  <g filter="url(#badgeShadow)">
    <rect x="46" y="38" width="164" height="124" rx="24" fill="#ffffff" fill-opacity="0.96"/>
    <circle cx="128" cy="80" r="28" fill="${primaryColor}" fill-opacity="0.12"/>
    <text x="128" y="114" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="36" font-weight="900" fill="${primaryColor}" text-anchor="middle" letter-spacing="1.2">${acronym}</text>
  </g>
  <!-- Accent Line -->
  <circle cx="128" cy="180" r="4" fill="#ffffff" fill-opacity="0.8"/>
  <!-- Subtitle -->
  <text x="128" y="208" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" fill="#ffffff" text-anchor="middle">${safeName.length > 22 ? safeName.substring(0, 20) + '...' : safeName}</text>
  <text x="128" y="228" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#ffffff" fill-opacity="0.85" text-anchor="middle" letter-spacing="1">SCHEDULED BANK • ${bankCode}</text>
</svg>`;
};

/**
 * Ensure image assets for a bank exist physically on disk
 */
export const ensureBankAssetsOnDisk = async (bank) => {
  const slug = toSlug(bank.bank_name);
  const targetDir = path.join(uploadsBanksDir, slug);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const logoPath = path.join(targetDir, 'logo.svg');
  const logoPngPath = path.join(targetDir, 'logo.png');
  const symbolSvgPath = path.join(targetDir, 'symbol.svg');
  const symbolPngPath = path.join(targetDir, 'symbol.png');
  const logoLightPath = path.join(targetDir, 'logo-light.svg');
  const logoDarkPath = path.join(targetDir, 'logo-dark.svg');

  // If real official SVG logo is not already present, generate branded SVG
  if (!fs.existsSync(logoPath) || fs.statSync(logoPath).size === 0) {
    const brandSvg = generateBankSvg({
      bankName: bank.bank_name,
      shortName: bank.short_name,
      bankCode: bank.bank_code,
      primaryColor: bank.primaryColor,
      secondaryColor: bank.secondaryColor,
      variant: 'brand',
    });
    await fs.promises.writeFile(logoPath, brandSvg, 'utf8');
  }

  if (!fs.existsSync(logoLightPath)) {
    const lightSvg = generateBankSvg({
      bankName: bank.bank_name,
      shortName: bank.short_name,
      bankCode: bank.bank_code,
      primaryColor: bank.primaryColor,
      secondaryColor: bank.secondaryColor,
      variant: 'light',
    });
    await fs.promises.writeFile(logoLightPath, lightSvg, 'utf8');
  }

  if (!fs.existsSync(logoDarkPath)) {
    const darkSvg = generateBankSvg({
      bankName: bank.bank_name,
      shortName: bank.short_name,
      bankCode: bank.bank_code,
      primaryColor: bank.primaryColor,
      secondaryColor: bank.secondaryColor,
      variant: 'dark',
    });
    await fs.promises.writeFile(logoDarkPath, darkSvg, 'utf8');
  }

  const hasPng = fs.existsSync(logoPngPath);
  const hasSymbol = fs.existsSync(symbolSvgPath);
  const hasSymbolPng = fs.existsSync(symbolPngPath);

  return {
    slug,
    logo_url: `/uploads/banks/${slug}/logo.svg`,
    logo_light_url: `/uploads/banks/${slug}/logo-light.svg`,
    logo_dark_url: `/uploads/banks/${slug}/logo-dark.svg`,
    logo_png_url: hasPng ? `/uploads/banks/${slug}/logo.png` : null,
    symbol_svg_url: hasSymbol ? `/uploads/banks/${slug}/symbol.svg` : null,
    symbol_png_url: hasSymbolPng ? `/uploads/banks/${slug}/symbol.png` : null,
    is_official_logo: hasPng || fs.statSync(logoPath).size > 2000,
  };
};

/**
 * Comprehensive dataset of Indian banks across all sectors
 */
export const INDIAN_BANKS = [
  // ─── 1. PUBLIC SECTOR COMMERCIAL BANKS ──────────────────────────────
  {
    bank_code: 'SBIN',
    bank_name: 'State Bank of India',
    short_name: 'SBI',
    legal_name: 'State Bank of India',
    bank_type: 'commercial',
    primaryColor: '#280071',
    secondaryColor: '#00a4e4',
    website_url: 'https://www.sbi.co.in',
    display_order: 1,
    metadata: {
      category: 'public_sector',
      head_office: 'Mumbai',
      state: 'Maharashtra',
      toll_free: '1800 1234',
      established_year: 1955,
      tagline: 'The Banker to Every Indian',
      rbi_classification: 'Scheduled Public Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'SBIN0000001', branch_name: 'Corporate Centre Mumbai', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'SBIN0000843', branch_name: 'Hosur Main Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '400002001', branch_name: 'Mumbai Main', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '635002001', branch_name: 'Hosur Main Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'SBININBBXXX', branch_name: 'Foreign Exchange / Treasury', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '002', branch_name: 'Clearing House Code', city: 'Mumbai', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'PUNB',
    bank_name: 'Punjab National Bank',
    short_name: 'PNB',
    legal_name: 'Punjab National Bank',
    bank_type: 'commercial',
    primaryColor: '#a20032',
    secondaryColor: '#ffc72c',
    website_url: 'https://www.pnbindia.in',
    display_order: 2,
    metadata: {
      category: 'public_sector',
      head_office: 'New Delhi',
      state: 'Delhi',
      toll_free: '1800 180 2222',
      established_year: 1894,
      tagline: 'The Name You Can Bank Upon',
      rbi_classification: 'Scheduled Public Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'PUNB0000100', branch_name: 'New Delhi HO Branch', city: 'New Delhi', state: 'Delhi' },
      { identifier_type: 'ifsc', identifier_value: 'PUNB0182400', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '110024001', branch_name: 'New Delhi Main', city: 'New Delhi', state: 'Delhi' },
      { identifier_type: 'micr', identifier_value: '635024002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'PUNBINBBXXX', branch_name: 'International Banking Div', city: 'New Delhi', state: 'Delhi' },
      { identifier_type: 'bank_code', identifier_value: '024', branch_name: 'Clearing Code', city: 'New Delhi', state: 'Delhi' },
    ],
  },
  {
    bank_code: 'BARB',
    bank_name: 'Bank of Baroda',
    short_name: 'BOB',
    legal_name: 'Bank of Baroda',
    bank_type: 'commercial',
    primaryColor: '#f26522',
    secondaryColor: '#004c8f',
    website_url: 'https://www.bankofbaroda.in',
    display_order: 3,
    metadata: {
      category: 'public_sector',
      head_office: 'Vadodara',
      state: 'Gujarat',
      toll_free: '1800 5700',
      established_year: 1908,
      tagline: "India's International Bank",
      rbi_classification: 'Scheduled Public Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'BARB0MUMBAI', branch_name: 'Corporate Centre Mumbai', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'BARB0HOSURX', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '400012001', branch_name: 'Mumbai Main', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '635012002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'BARBINBBXXX', branch_name: 'Treasury Branch', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '012', branch_name: 'Clearing Code', city: 'Mumbai', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'CNRB',
    bank_name: 'Canara Bank',
    short_name: 'Canara Bank',
    legal_name: 'Canara Bank',
    bank_type: 'commercial',
    primaryColor: '#0091df',
    secondaryColor: '#ffc72c',
    website_url: 'https://www.canarabank.com',
    display_order: 4,
    metadata: {
      category: 'public_sector',
      head_office: 'Bengaluru',
      state: 'Karnataka',
      toll_free: '1800 425 0018',
      established_year: 1906,
      tagline: 'Together We Can',
      rbi_classification: 'Scheduled Public Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'CNRB0000001', branch_name: 'Head Office Branch', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'ifsc', identifier_value: 'CNRB0001156', branch_name: 'Hosur Main Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '560015001', branch_name: 'Bengaluru Main', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'micr', identifier_value: '635015002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'CNRBINBBXXX', branch_name: 'Forex Treasury', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'bank_code', identifier_value: '015', branch_name: 'Clearing Code', city: 'Bengaluru', state: 'Karnataka' },
    ],
  },
  {
    bank_code: 'UBIN',
    bank_name: 'Union Bank of India',
    short_name: 'Union Bank',
    legal_name: 'Union Bank of India',
    bank_type: 'commercial',
    primaryColor: '#00549f',
    secondaryColor: '#e31b23',
    website_url: 'https://www.unionbankofindia.co.in',
    display_order: 5,
    metadata: {
      category: 'public_sector',
      head_office: 'Mumbai',
      state: 'Maharashtra',
      toll_free: '1800 22 2244',
      established_year: 1919,
      tagline: 'Good People to Bank With',
      rbi_classification: 'Scheduled Public Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'UBIN0530001', branch_name: 'Mumbai Central Branch', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'UBIN0542385', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '400026001', branch_name: 'Mumbai Main', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '635026002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'UBININBBXXX', branch_name: 'International Banking', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '026', branch_name: 'Clearing Code', city: 'Mumbai', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'BKID',
    bank_name: 'Bank of India',
    short_name: 'BOI',
    legal_name: 'Bank of India',
    bank_type: 'commercial',
    primaryColor: '#ec6608',
    secondaryColor: '#004a80',
    website_url: 'https://www.bankofindia.co.in',
    display_order: 6,
    metadata: {
      category: 'public_sector',
      head_office: 'Mumbai',
      state: 'Maharashtra',
      toll_free: '1800 103 1906',
      established_year: 1906,
      tagline: 'Relationship Beyond Banking',
      rbi_classification: 'Scheduled Public Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'BKID0000001', branch_name: 'Mumbai HO Branch', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'BKID0008234', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '400013001', branch_name: 'Mumbai Main', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '635013002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'BKIDINBBXXX', branch_name: 'Foreign Exchange', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '013', branch_name: 'Clearing Code', city: 'Mumbai', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'IDIB',
    bank_name: 'Indian Bank',
    short_name: 'Indian Bank',
    legal_name: 'Indian Bank',
    bank_type: 'commercial',
    primaryColor: '#1d3369',
    secondaryColor: '#e2211c',
    website_url: 'https://www.indianbank.in',
    display_order: 7,
    metadata: {
      category: 'public_sector',
      head_office: 'Chennai',
      state: 'Tamil Nadu',
      toll_free: '1800 425 00000',
      established_year: 1907,
      tagline: 'Your Tech-Friendly Bank',
      rbi_classification: 'Scheduled Public Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'IDIB000M001', branch_name: 'Chennai Corporate Office', city: 'Chennai', state: 'Tamil Nadu' },
      { identifier_type: 'ifsc', identifier_value: 'IDIB000H023', branch_name: 'Hosur Main Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '600019001', branch_name: 'Chennai Main', city: 'Chennai', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '635019002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'IDIBINBBXXX', branch_name: 'Treasury & Forex', city: 'Chennai', state: 'Tamil Nadu' },
      { identifier_type: 'bank_code', identifier_value: '019', branch_name: 'Clearing Code', city: 'Chennai', state: 'Tamil Nadu' },
    ],
  },
  {
    bank_code: 'CBIN',
    bank_name: 'Central Bank of India',
    short_name: 'Central Bank',
    legal_name: 'Central Bank of India',
    bank_type: 'commercial',
    primaryColor: '#00508f',
    secondaryColor: '#d42127',
    website_url: 'https://www.centralbankofindia.co.in',
    display_order: 8,
    metadata: {
      category: 'public_sector',
      head_office: 'Mumbai',
      state: 'Maharashtra',
      toll_free: '1800 22 1911',
      established_year: 1911,
      tagline: 'Central To You Since 1911',
      rbi_classification: 'Scheduled Public Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'CBIN0280001', branch_name: 'Mumbai Central Office', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'CBIN0283456', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '400016001', branch_name: 'Mumbai Main', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '635016002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'CBININBBXXX', branch_name: 'Forex Department', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '016', branch_name: 'Clearing Code', city: 'Mumbai', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'IOBA',
    bank_name: 'Indian Overseas Bank',
    short_name: 'IOB',
    legal_name: 'Indian Overseas Bank',
    bank_type: 'commercial',
    primaryColor: '#0a4275',
    secondaryColor: '#f08b23',
    website_url: 'https://www.iob.in',
    display_order: 9,
    metadata: {
      category: 'public_sector',
      head_office: 'Chennai',
      state: 'Tamil Nadu',
      toll_free: '1800 890 4445',
      established_year: 1937,
      tagline: 'Good People to Grow With',
      rbi_classification: 'Scheduled Public Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'IOBA0000001', branch_name: 'Chennai Central Office', city: 'Chennai', state: 'Tamil Nadu' },
      { identifier_type: 'ifsc', identifier_value: 'IOBA0000234', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '600020001', branch_name: 'Chennai Main', city: 'Chennai', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '635020002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'IOBAINBBXXX', branch_name: 'International Business', city: 'Chennai', state: 'Tamil Nadu' },
      { identifier_type: 'bank_code', identifier_value: '020', branch_name: 'Clearing Code', city: 'Chennai', state: 'Tamil Nadu' },
    ],
  },
  {
    bank_code: 'UCBA',
    bank_name: 'UCO Bank',
    short_name: 'UCO Bank',
    legal_name: 'UCO Bank',
    bank_type: 'commercial',
    primaryColor: '#004990',
    secondaryColor: '#ffbf00',
    website_url: 'https://www.ucobank.com',
    display_order: 10,
    metadata: {
      category: 'public_sector',
      head_office: 'Kolkata',
      state: 'West Bengal',
      toll_free: '1800 103 0123',
      established_year: 1943,
      tagline: 'Honours Your Trust',
      rbi_classification: 'Scheduled Public Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'UCBA0000001', branch_name: 'Kolkata Head Office', city: 'Kolkata', state: 'West Bengal' },
      { identifier_type: 'ifsc', identifier_value: 'UCBA0001234', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '700028001', branch_name: 'Kolkata Main', city: 'Kolkata', state: 'West Bengal' },
      { identifier_type: 'micr', identifier_value: '635028002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'UCBAINBBXXX', branch_name: 'Forex Central', city: 'Kolkata', state: 'West Bengal' },
      { identifier_type: 'bank_code', identifier_value: '028', branch_name: 'Clearing Code', city: 'Kolkata', state: 'West Bengal' },
    ],
  },
  {
    bank_code: 'MAHB',
    bank_name: 'Bank of Maharashtra',
    short_name: 'BOM',
    legal_name: 'Bank of Maharashtra',
    bank_type: 'commercial',
    primaryColor: '#035a96',
    secondaryColor: '#fbb03b',
    website_url: 'https://www.bankofmaharashtra.in',
    display_order: 11,
    metadata: {
      category: 'public_sector',
      head_office: 'Pune',
      state: 'Maharashtra',
      toll_free: '1800 233 4526',
      established_year: 1935,
      tagline: 'Ek Parivar, Ek Bank',
      rbi_classification: 'Scheduled Public Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'MAHB0000001', branch_name: 'Pune Head Office', city: 'Pune', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'MAHB0001452', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '411014001', branch_name: 'Pune Main', city: 'Pune', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '635014002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'MAHBINBBXXX', branch_name: 'Treasury & Forex', city: 'Pune', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '014', branch_name: 'Clearing Code', city: 'Pune', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'PSIB',
    bank_name: 'Punjab & Sind Bank',
    short_name: 'PSB',
    legal_name: 'Punjab & Sind Bank',
    bank_type: 'commercial',
    primaryColor: '#a8002e',
    secondaryColor: '#f2ab13',
    website_url: 'https://punjabandsindbank.co.in',
    display_order: 12,
    metadata: {
      category: 'public_sector',
      head_office: 'New Delhi',
      state: 'Delhi',
      toll_free: '1800 419 8300',
      established_year: 1908,
      tagline: 'Where Service Is A Way Of Life',
      rbi_classification: 'Scheduled Public Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'PSIB0000001', branch_name: 'New Delhi Head Office', city: 'New Delhi', state: 'Delhi' },
      { identifier_type: 'ifsc', identifier_value: 'PSIB0000891', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '110023001', branch_name: 'New Delhi Main', city: 'New Delhi', state: 'Delhi' },
      { identifier_type: 'micr', identifier_value: '635023002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'PSIBINBBXXX', branch_name: 'Forex Division', city: 'New Delhi', state: 'Delhi' },
      { identifier_type: 'bank_code', identifier_value: '023', branch_name: 'Clearing Code', city: 'New Delhi', state: 'Delhi' },
    ],
  },

  // ─── 2. PRIVATE SECTOR COMMERCIAL BANKS ─────────────────────────────
  {
    bank_code: 'HDFC',
    bank_name: 'HDFC Bank',
    short_name: 'HDFC',
    legal_name: 'HDFC Bank Limited',
    bank_type: 'commercial',
    primaryColor: '#004c8f',
    secondaryColor: '#ed232a',
    website_url: 'https://www.hdfcbank.com',
    display_order: 13,
    metadata: {
      category: 'private_sector',
      head_office: 'Mumbai',
      state: 'Maharashtra',
      toll_free: '1800 202 6161',
      established_year: 1994,
      tagline: 'We Understand Your World',
      rbi_classification: 'Scheduled Private Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'HDFC0000001', branch_name: 'Mumbai Head Office', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'HDFC0001234', branch_name: 'Hosur Main Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '400240001', branch_name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '635240002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'HDFCINBBXXX', branch_name: 'Treasury & Forex', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '240', branch_name: 'Clearing Code', city: 'Mumbai', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'ICIC',
    bank_name: 'ICICI Bank',
    short_name: 'ICICI',
    legal_name: 'ICICI Bank Limited',
    bank_type: 'commercial',
    primaryColor: '#9b111e',
    secondaryColor: '#f58220',
    website_url: 'https://www.icicibank.com',
    display_order: 14,
    metadata: {
      category: 'private_sector',
      head_office: 'Mumbai',
      state: 'Maharashtra',
      toll_free: '1800 1080',
      established_year: 1994,
      tagline: 'Hum Hai Na, Khayal Aapka',
      rbi_classification: 'Scheduled Private Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'ICIC0000001', branch_name: 'BKC Corporate Branch', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'ICIC0000572', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '400229001', branch_name: 'Mumbai BKC', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '635229002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'ICICINBBXXX', branch_name: 'Global Markets', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '229', branch_name: 'Clearing Code', city: 'Mumbai', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'UTIB',
    bank_name: 'Axis Bank',
    short_name: 'Axis Bank',
    legal_name: 'Axis Bank Limited',
    bank_type: 'commercial',
    primaryColor: '#861f41',
    secondaryColor: '#97144d',
    website_url: 'https://www.axisbank.com',
    display_order: 15,
    metadata: {
      category: 'private_sector',
      head_office: 'Mumbai',
      state: 'Maharashtra',
      toll_free: '1860 419 5555',
      established_year: 1993,
      tagline: 'Badhti Ka Naam Zindagi',
      rbi_classification: 'Scheduled Private Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'UTIB0000001', branch_name: 'Central Mumbai HO', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'UTIB0000673', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '400211001', branch_name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '635211002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'AXISINBBXXX', branch_name: 'Forex Branch', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '211', branch_name: 'Clearing Code', city: 'Mumbai', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'KKBK',
    bank_name: 'Kotak Mahindra Bank',
    short_name: 'Kotak',
    legal_name: 'Kotak Mahindra Bank Limited',
    bank_type: 'commercial',
    primaryColor: '#ed1c24',
    secondaryColor: '#003366',
    website_url: 'https://www.kotak.com',
    display_order: 16,
    metadata: {
      category: 'private_sector',
      head_office: 'Mumbai',
      state: 'Maharashtra',
      toll_free: '1860 266 2666',
      established_year: 2003,
      tagline: "Let's Make Money Simple",
      rbi_classification: 'Scheduled Private Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'KKBK0000001', branch_name: 'BKC Corporate Centre', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'KKBK0008711', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '400485001', branch_name: 'Mumbai Main', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '635485002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'KKBKINBBXXX', branch_name: 'Treasury & Forex', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '485', branch_name: 'Clearing Code', city: 'Mumbai', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'INDB',
    bank_name: 'IndusInd Bank',
    short_name: 'IndusInd',
    legal_name: 'IndusInd Bank Limited',
    bank_type: 'commercial',
    primaryColor: '#800000',
    secondaryColor: '#c38b2c',
    website_url: 'https://www.indusind.com',
    display_order: 17,
    metadata: {
      category: 'private_sector',
      head_office: 'Mumbai',
      state: 'Maharashtra',
      toll_free: '1860 267 7777',
      established_year: 1994,
      tagline: 'We Make You Feel Richer',
      rbi_classification: 'Scheduled Private Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'INDB0000001', branch_name: 'Mumbai Opera House', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'INDB0000682', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '400234001', branch_name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '635234002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'INDBINBBXXX', branch_name: 'Forex Operations', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '234', branch_name: 'Clearing Code', city: 'Mumbai', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'YESB',
    bank_name: 'Yes Bank',
    short_name: 'Yes Bank',
    legal_name: 'Yes Bank Limited',
    bank_type: 'commercial',
    primaryColor: '#002f6c',
    secondaryColor: '#e31837',
    website_url: 'https://www.yesbank.in',
    display_order: 18,
    metadata: {
      category: 'private_sector',
      head_office: 'Mumbai',
      state: 'Maharashtra',
      toll_free: '1800 1200',
      established_year: 2004,
      tagline: 'Experience Our Expertise',
      rbi_classification: 'Scheduled Private Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'YESB0000001', branch_name: 'Mumbai Nehru Centre', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'YESB0000543', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '400532001', branch_name: 'Mumbai Main', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '635532002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'YESBINBBXXX', branch_name: 'Treasury Branch', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '532', branch_name: 'Clearing Code', city: 'Mumbai', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'IDFB',
    bank_name: 'IDFC FIRST Bank',
    short_name: 'IDFC FIRST',
    legal_name: 'IDFC FIRST Bank Limited',
    bank_type: 'commercial',
    primaryColor: '#991b1e',
    secondaryColor: '#ffb71b',
    website_url: 'https://www.idfcfirstbank.com',
    display_order: 19,
    metadata: {
      category: 'private_sector',
      head_office: 'Mumbai',
      state: 'Maharashtra',
      toll_free: '1800 10 888',
      established_year: 2015,
      tagline: 'Always You First',
      rbi_classification: 'Scheduled Private Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'IDFB0040101', branch_name: 'BKC Naman Chambers', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'IDFB0040212', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '400751001', branch_name: 'Mumbai BKC', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '635751002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'IDFBINBBXXX', branch_name: 'Forex Desk', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '751', branch_name: 'Clearing Code', city: 'Mumbai', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'FDRL',
    bank_name: 'Federal Bank',
    short_name: 'Federal Bank',
    legal_name: 'The Federal Bank Limited',
    bank_type: 'commercial',
    primaryColor: '#004b87',
    secondaryColor: '#ffb81c',
    website_url: 'https://www.federalbank.co.in',
    display_order: 20,
    metadata: {
      category: 'private_sector',
      head_office: 'Aluva',
      state: 'Kerala',
      toll_free: '1800 425 1199',
      established_year: 1931,
      tagline: 'Your Perfect Banking Partner',
      rbi_classification: 'Scheduled Private Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'FDRL0000001', branch_name: 'Aluva Head Office', city: 'Aluva', state: 'Kerala' },
      { identifier_type: 'ifsc', identifier_value: 'FDRL0001582', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '682049001', branch_name: 'Kochi Main', city: 'Kochi', state: 'Kerala' },
      { identifier_type: 'micr', identifier_value: '635049002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'FDRLINBBXXX', branch_name: 'International Banking', city: 'Kochi', state: 'Kerala' },
      { identifier_type: 'bank_code', identifier_value: '049', branch_name: 'Clearing Code', city: 'Kochi', state: 'Kerala' },
    ],
  },
  {
    bank_code: 'BDBL',
    bank_name: 'Bandhan Bank',
    short_name: 'Bandhan',
    legal_name: 'Bandhan Bank Limited',
    bank_type: 'commercial',
    primaryColor: '#e31b23',
    secondaryColor: '#00488f',
    website_url: 'https://www.bandhanbank.com',
    display_order: 21,
    metadata: {
      category: 'private_sector',
      head_office: 'Kolkata',
      state: 'West Bengal',
      toll_free: '1800 258 8181',
      established_year: 2015,
      tagline: 'Aapka Bhala, Sabki Bhalai',
      rbi_classification: 'Scheduled Private Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'BDBL0000001', branch_name: 'Kolkata Salt Lake', city: 'Kolkata', state: 'West Bengal' },
      { identifier_type: 'ifsc', identifier_value: 'BDBL0001784', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '700750001', branch_name: 'Kolkata Central', city: 'Kolkata', state: 'West Bengal' },
      { identifier_type: 'micr', identifier_value: '635750002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'BDBLINBBXXX', branch_name: 'Treasury Desk', city: 'Kolkata', state: 'West Bengal' },
      { identifier_type: 'bank_code', identifier_value: '750', branch_name: 'Clearing Code', city: 'Kolkata', state: 'West Bengal' },
    ],
  },
  {
    bank_code: 'RATN',
    bank_name: 'RBL Bank',
    short_name: 'RBL',
    legal_name: 'RBL Bank Limited',
    bank_type: 'commercial',
    primaryColor: '#0a2c5a',
    secondaryColor: '#f26922',
    website_url: 'https://www.rblbank.com',
    display_order: 22,
    metadata: {
      category: 'private_sector',
      head_office: 'Mumbai',
      state: 'Maharashtra',
      toll_free: '1800 120 616161',
      established_year: 1943,
      tagline: 'Apno Ka Bank',
      rbi_classification: 'Scheduled Private Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'RATN0000001', branch_name: 'Mumbai Fort Branch', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'RATN0000245', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '400176001', branch_name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '635176002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'RATNINBBXXX', branch_name: 'Forex Central', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '176', branch_name: 'Clearing Code', city: 'Mumbai', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'SIBL',
    bank_name: 'South Indian Bank',
    short_name: 'SIB',
    legal_name: 'The South Indian Bank Limited',
    bank_type: 'commercial',
    primaryColor: '#8c001a',
    secondaryColor: '#f8b32b',
    website_url: 'https://www.southindianbank.com',
    display_order: 23,
    metadata: {
      category: 'private_sector',
      head_office: 'Thrissur',
      state: 'Kerala',
      toll_free: '1800 425 1809',
      established_year: 1929,
      tagline: 'Experience Next Generation Banking',
      rbi_classification: 'Scheduled Private Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'SIBL0000001', branch_name: 'Thrissur Head Office', city: 'Thrissur', state: 'Kerala' },
      { identifier_type: 'ifsc', identifier_value: 'SIBL0000456', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '680059001', branch_name: 'Thrissur Main', city: 'Thrissur', state: 'Kerala' },
      { identifier_type: 'micr', identifier_value: '635059002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'SIBLINBBXXX', branch_name: 'International Banking', city: 'Kochi', state: 'Kerala' },
      { identifier_type: 'bank_code', identifier_value: '059', branch_name: 'Clearing Code', city: 'Thrissur', state: 'Kerala' },
    ],
  },
  {
    bank_code: 'KVBL',
    bank_name: 'Karur Vysya Bank',
    short_name: 'KVB',
    legal_name: 'The Karur Vysya Bank Limited',
    bank_type: 'commercial',
    primaryColor: '#00508f',
    secondaryColor: '#ea1d24',
    website_url: 'https://www.kvb.co.in',
    display_order: 24,
    metadata: {
      category: 'private_sector',
      head_office: 'Karur',
      state: 'Tamil Nadu',
      toll_free: '1860 258 1916',
      established_year: 1916,
      tagline: 'Smart Way to Bank',
      rbi_classification: 'Scheduled Private Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'KVBL0001101', branch_name: 'Karur Central Office', city: 'Karur', state: 'Tamil Nadu' },
      { identifier_type: 'ifsc', identifier_value: 'KVBL0001245', branch_name: 'Hosur Main Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '639053001', branch_name: 'Karur Main', city: 'Karur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '635053002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'KVBLINBBXXX', branch_name: 'Forex Chennai', city: 'Chennai', state: 'Tamil Nadu' },
      { identifier_type: 'bank_code', identifier_value: '053', branch_name: 'Clearing Code', city: 'Karur', state: 'Tamil Nadu' },
    ],
  },
  {
    bank_code: 'CIUB',
    bank_name: 'City Union Bank',
    short_name: 'CUB',
    legal_name: 'City Union Bank Limited',
    bank_type: 'commercial',
    primaryColor: '#004785',
    secondaryColor: '#e31b23',
    website_url: 'https://www.cityunionbank.com',
    display_order: 25,
    metadata: {
      category: 'private_sector',
      head_office: 'Kumbakonam',
      state: 'Tamil Nadu',
      toll_free: '044 7122 5000',
      established_year: 1904,
      tagline: 'Trust and Excellence since 1904',
      rbi_classification: 'Scheduled Private Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'CIUB0000001', branch_name: 'Kumbakonam Administrative Office', city: 'Kumbakonam', state: 'Tamil Nadu' },
      { identifier_type: 'ifsc', identifier_value: 'CIUB0000178', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '612054001', branch_name: 'Kumbakonam Main', city: 'Kumbakonam', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '635054002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'CIUBINBBXXX', branch_name: 'Forex Chennai', city: 'Chennai', state: 'Tamil Nadu' },
      { identifier_type: 'bank_code', identifier_value: '054', branch_name: 'Clearing Code', city: 'Kumbakonam', state: 'Tamil Nadu' },
    ],
  },
  {
    bank_code: 'KARB',
    bank_name: 'Karnataka Bank',
    short_name: 'Karnataka Bank',
    legal_name: 'Karnataka Bank Limited',
    bank_type: 'commercial',
    primaryColor: '#990000',
    secondaryColor: '#ffb71b',
    website_url: 'https://karnatakabank.com',
    display_order: 26,
    metadata: {
      category: 'private_sector',
      head_office: 'Mangaluru',
      state: 'Karnataka',
      toll_free: '1800 425 1444',
      established_year: 1924,
      tagline: 'Your Family Bank Across India',
      rbi_classification: 'Scheduled Private Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'KARB0000001', branch_name: 'Mangaluru Head Office', city: 'Mangaluru', state: 'Karnataka' },
      { identifier_type: 'ifsc', identifier_value: 'KARB0000312', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '575052001', branch_name: 'Mangaluru Main', city: 'Mangaluru', state: 'Karnataka' },
      { identifier_type: 'micr', identifier_value: '635052002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'KARBINBBXXX', branch_name: 'International Div', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'bank_code', identifier_value: '052', branch_name: 'Clearing Code', city: 'Mangaluru', state: 'Karnataka' },
    ],
  },
  {
    bank_code: 'TMBL',
    bank_name: 'Tamilnad Mercantile Bank',
    short_name: 'TMB',
    legal_name: 'Tamilnad Mercantile Bank Limited',
    bank_type: 'commercial',
    primaryColor: '#0b3866',
    secondaryColor: '#e47820',
    website_url: 'https://www.tmb.in',
    display_order: 27,
    metadata: {
      category: 'private_sector',
      head_office: 'Thoothukudi',
      state: 'Tamil Nadu',
      toll_free: '1800 425 0426',
      established_year: 1921,
      tagline: 'Be a Step Ahead of Life',
      rbi_classification: 'Scheduled Private Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'TMBL0000001', branch_name: 'Thoothukudi Head Office', city: 'Thoothukudi', state: 'Tamil Nadu' },
      { identifier_type: 'ifsc', identifier_value: 'TMBL0000189', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '628060001', branch_name: 'Thoothukudi Main', city: 'Thoothukudi', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '635060002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'TMBLINBBXXX', branch_name: 'Forex Chennai', city: 'Chennai', state: 'Tamil Nadu' },
      { identifier_type: 'bank_code', identifier_value: '060', branch_name: 'Clearing Code', city: 'Thoothukudi', state: 'Tamil Nadu' },
    ],
  },
  {
    bank_code: 'IBKL',
    bank_name: 'IDBI Bank',
    short_name: 'IDBI',
    legal_name: 'IDBI Bank Limited',
    bank_type: 'commercial',
    primaryColor: '#007672',
    secondaryColor: '#d71920',
    website_url: 'https://www.idbibank.in',
    display_order: 28,
    metadata: {
      category: 'private_sector',
      head_office: 'Mumbai',
      state: 'Maharashtra',
      toll_free: '1800 209 4324',
      established_year: 1964,
      tagline: 'Bank Aisa Dost Jaisa',
      rbi_classification: 'Scheduled Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'IBKL0000001', branch_name: 'Mumbai Cuffe Parade', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'IBKL0000452', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '400259001', branch_name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '635259002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'IBKLINBBXXX', branch_name: 'Treasury Branch', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '259', branch_name: 'Clearing Code', city: 'Mumbai', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'JAKA',
    bank_name: 'Jammu & Kashmir Bank',
    short_name: 'J&K Bank',
    legal_name: 'The Jammu and Kashmir Bank Limited',
    bank_type: 'commercial',
    primaryColor: '#004889',
    secondaryColor: '#e21836',
    website_url: 'https://www.jkbank.com',
    display_order: 29,
    metadata: {
      category: 'private_sector',
      head_office: 'Srinagar',
      state: 'Jammu and Kashmir',
      toll_free: '1800 890 2122',
      established_year: 1938,
      tagline: 'Serving to Empower',
      rbi_classification: 'Scheduled Private Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'JAKA0CORPBR', branch_name: 'Srinagar Corporate HQ', city: 'Srinagar', state: 'Jammu and Kashmir' },
      { identifier_type: 'ifsc', identifier_value: 'JAKA0CHENNA', branch_name: 'Chennai Branch', city: 'Chennai', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '190051001', branch_name: 'Srinagar Main', city: 'Srinagar', state: 'Jammu and Kashmir' },
      { identifier_type: 'micr', identifier_value: '600051002', branch_name: 'Chennai Branch', city: 'Chennai', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'JAKAINBBXXX', branch_name: 'Forex Division', city: 'Srinagar', state: 'Jammu and Kashmir' },
      { identifier_type: 'bank_code', identifier_value: '051', branch_name: 'Clearing Code', city: 'Srinagar', state: 'Jammu and Kashmir' },
    ],
  },
  {
    bank_code: 'CSBK',
    bank_name: 'CSB Bank',
    short_name: 'CSB',
    legal_name: 'CSB Bank Limited',
    bank_type: 'commercial',
    primaryColor: '#e31837',
    secondaryColor: '#1b365d',
    website_url: 'https://www.csb.co.in',
    display_order: 30,
    metadata: {
      category: 'private_sector',
      head_office: 'Thrissur',
      state: 'Kerala',
      toll_free: '1800 266 9090',
      established_year: 1920,
      tagline: 'Support All The Way',
      rbi_classification: 'Scheduled Private Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'CSBK0000001', branch_name: 'Thrissur Head Office', city: 'Thrissur', state: 'Kerala' },
      { identifier_type: 'ifsc', identifier_value: 'CSBK0000289', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '680047001', branch_name: 'Thrissur Main', city: 'Thrissur', state: 'Kerala' },
      { identifier_type: 'micr', identifier_value: '635047002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'CSBKINBBXXX', branch_name: 'International Banking', city: 'Kochi', state: 'Kerala' },
      { identifier_type: 'bank_code', identifier_value: '047', branch_name: 'Clearing Code', city: 'Thrissur', state: 'Kerala' },
    ],
  },
  {
    bank_code: 'DLXB',
    bank_name: 'Dhanlaxmi Bank',
    short_name: 'Dhanlaxmi',
    legal_name: 'Dhanlaxmi Bank Limited',
    bank_type: 'commercial',
    primaryColor: '#8c1d40',
    secondaryColor: '#f39c12',
    website_url: 'https://www.dhanbank.com',
    display_order: 31,
    metadata: {
      category: 'private_sector',
      head_office: 'Thrissur',
      state: 'Kerala',
      toll_free: '1800 425 1747',
      established_year: 1927,
      tagline: 'Tann. Mann. Dhan.',
      rbi_classification: 'Scheduled Private Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'DLXB0000001', branch_name: 'Thrissur Head Office', city: 'Thrissur', state: 'Kerala' },
      { identifier_type: 'ifsc', identifier_value: 'DLXB0000192', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '680048001', branch_name: 'Thrissur Main', city: 'Thrissur', state: 'Kerala' },
      { identifier_type: 'micr', identifier_value: '635048002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'DLXBINBBXXX', branch_name: 'Forex Central', city: 'Kochi', state: 'Kerala' },
      { identifier_type: 'bank_code', identifier_value: '048', branch_name: 'Clearing Code', city: 'Thrissur', state: 'Kerala' },
    ],
  },
  {
    bank_code: 'NTBL',
    bank_name: 'Nainital Bank',
    short_name: 'Nainital Bank',
    legal_name: 'The Nainital Bank Limited',
    bank_type: 'commercial',
    primaryColor: '#0a4275',
    secondaryColor: '#f15a24',
    website_url: 'https://www.nainitalbank.co.in',
    display_order: 32,
    metadata: {
      category: 'private_sector',
      head_office: 'Nainital',
      state: 'Uttarakhand',
      toll_free: '1800 180 4031',
      established_year: 1922,
      tagline: 'Banking with Personal Touch',
      rbi_classification: 'Scheduled Private Sector Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'NTBL0NAI001', branch_name: 'Nainital Head Office', city: 'Nainital', state: 'Uttarakhand' },
      { identifier_type: 'ifsc', identifier_value: 'NTBL0DEL023', branch_name: 'Delhi Connaught Place', city: 'New Delhi', state: 'Delhi' },
      { identifier_type: 'micr', identifier_value: '263184001', branch_name: 'Nainital Main', city: 'Nainital', state: 'Uttarakhand' },
      { identifier_type: 'micr', identifier_value: '110184002', branch_name: 'Delhi Main', city: 'New Delhi', state: 'Delhi' },
      { identifier_type: 'swift', identifier_value: 'NTBLINBBXXX', branch_name: 'Forex Delhi', city: 'New Delhi', state: 'Delhi' },
      { identifier_type: 'bank_code', identifier_value: '184', branch_name: 'Clearing Code', city: 'Nainital', state: 'Uttarakhand' },
    ],
  },

  // ─── 3. SMALL FINANCE BANKS ─────────────────────────────────────────
  {
    bank_code: 'AUBL',
    bank_name: 'AU Small Finance Bank',
    short_name: 'AU Bank',
    legal_name: 'AU Small Finance Bank Limited',
    bank_type: 'small_finance',
    primaryColor: '#6d1d7c',
    secondaryColor: '#f7931e',
    website_url: 'https://www.aubank.in',
    display_order: 33,
    metadata: {
      category: 'small_finance',
      head_office: 'Jaipur',
      state: 'Rajasthan',
      toll_free: '1800 1200 1200',
      established_year: 1996,
      tagline: 'Badlaav Humse Hai',
      rbi_classification: 'Scheduled Small Finance Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'AUBL0000001', branch_name: 'Jaipur Head Office', city: 'Jaipur', state: 'Rajasthan' },
      { identifier_type: 'ifsc', identifier_value: 'AUBL0002194', branch_name: 'Bengaluru Branch', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'micr', identifier_value: '302765001', branch_name: 'Jaipur Main', city: 'Jaipur', state: 'Rajasthan' },
      { identifier_type: 'micr', identifier_value: '560765002', branch_name: 'Bengaluru Branch', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'swift', identifier_value: 'AUBLINBBXXX', branch_name: 'Treasury Desk', city: 'Jaipur', state: 'Rajasthan' },
      { identifier_type: 'bank_code', identifier_value: '765', branch_name: 'Clearing Code', city: 'Jaipur', state: 'Rajasthan' },
    ],
  },
  {
    bank_code: 'ESFB',
    bank_name: 'Equitas Small Finance Bank',
    short_name: 'Equitas',
    legal_name: 'Equitas Small Finance Bank Limited',
    bank_type: 'small_finance',
    primaryColor: '#004b87',
    secondaryColor: '#e4002b',
    website_url: 'https://www.equitasbank.com',
    display_order: 34,
    metadata: {
      category: 'small_finance',
      head_office: 'Chennai',
      state: 'Tamil Nadu',
      toll_free: '1800 103 1222',
      established_year: 2016,
      tagline: 'Beyond Banking',
      rbi_classification: 'Scheduled Small Finance Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'ESFB0001001', branch_name: 'Chennai Corporate Office', city: 'Chennai', state: 'Tamil Nadu' },
      { identifier_type: 'ifsc', identifier_value: 'ESFB0001142', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '600756001', branch_name: 'Chennai Main', city: 'Chennai', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '635756002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'ESFBINBBXXX', branch_name: 'Treasury Chennai', city: 'Chennai', state: 'Tamil Nadu' },
      { identifier_type: 'bank_code', identifier_value: '756', branch_name: 'Clearing Code', city: 'Chennai', state: 'Tamil Nadu' },
    ],
  },
  {
    bank_code: 'UJVN',
    bank_name: 'Ujjivan Small Finance Bank',
    short_name: 'Ujjivan',
    legal_name: 'Ujjivan Small Finance Bank Limited',
    bank_type: 'small_finance',
    primaryColor: '#e31b23',
    secondaryColor: '#1f3864',
    website_url: 'https://www.ujjivansfb.in',
    display_order: 35,
    metadata: {
      category: 'small_finance',
      head_office: 'Bengaluru',
      state: 'Karnataka',
      toll_free: '1800 208 2121',
      established_year: 2017,
      tagline: 'Build A Better Life',
      rbi_classification: 'Scheduled Small Finance Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'UJVN0001001', branch_name: 'Bengaluru Corporate Office', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'ifsc', identifier_value: 'UJVN0002341', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '560761001', branch_name: 'Bengaluru Main', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'micr', identifier_value: '635761002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'UJVNINBBXXX', branch_name: 'Treasury Desk', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'bank_code', identifier_value: '761', branch_name: 'Clearing Code', city: 'Bengaluru', state: 'Karnataka' },
    ],
  },
  {
    bank_code: 'JSFB',
    bank_name: 'Jana Small Finance Bank',
    short_name: 'Jana SFB',
    legal_name: 'Jana Small Finance Bank Limited',
    bank_type: 'small_finance',
    primaryColor: '#005aa9',
    secondaryColor: '#f7941d',
    website_url: 'https://www.janabank.com',
    display_order: 36,
    metadata: {
      category: 'small_finance',
      head_office: 'Bengaluru',
      state: 'Karnataka',
      toll_free: '1800 2080',
      established_year: 2018,
      tagline: 'Likho Apni Kahani',
      rbi_classification: 'Scheduled Small Finance Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'JSFB0000001', branch_name: 'Bengaluru Head Office', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'ifsc', identifier_value: 'JSFB0001245', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '560763001', branch_name: 'Bengaluru Central', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'micr', identifier_value: '635763002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'JSFBINBBXXX', branch_name: 'Treasury Desk', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'bank_code', identifier_value: '763', branch_name: 'Clearing Code', city: 'Bengaluru', state: 'Karnataka' },
    ],
  },
  {
    bank_code: 'CLBL',
    bank_name: 'Capital Small Finance Bank',
    short_name: 'Capital SFB',
    legal_name: 'Capital Small Finance Bank Limited',
    bank_type: 'small_finance',
    primaryColor: '#003366',
    secondaryColor: '#e31e24',
    website_url: 'https://www.capitalbank.co.in',
    display_order: 37,
    metadata: {
      category: 'small_finance',
      head_office: 'Jalandhar',
      state: 'Punjab',
      toll_free: '1800 120 1600',
      established_year: 2016,
      tagline: 'Vishwas Se Vikas Tak',
      rbi_classification: 'Scheduled Small Finance Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'CLBL0000001', branch_name: 'Jalandhar Head Office', city: 'Jalandhar', state: 'Punjab' },
      { identifier_type: 'ifsc', identifier_value: 'CLBL0000124', branch_name: 'Delhi Branch', city: 'New Delhi', state: 'Delhi' },
      { identifier_type: 'micr', identifier_value: '144760001', branch_name: 'Jalandhar Main', city: 'Jalandhar', state: 'Punjab' },
      { identifier_type: 'micr', identifier_value: '110760002', branch_name: 'Delhi Branch', city: 'New Delhi', state: 'Delhi' },
      { identifier_type: 'swift', identifier_value: 'CLBLINBBXXX', branch_name: 'Treasury Operations', city: 'Jalandhar', state: 'Punjab' },
      { identifier_type: 'bank_code', identifier_value: '760', branch_name: 'Clearing Code', city: 'Jalandhar', state: 'Punjab' },
    ],
  },
  {
    bank_code: 'UTKS',
    bank_name: 'Utkarsh Small Finance Bank',
    short_name: 'Utkarsh',
    legal_name: 'Utkarsh Small Finance Bank Limited',
    bank_type: 'small_finance',
    primaryColor: '#00529b',
    secondaryColor: '#e30613',
    website_url: 'https://www.utkarsh.bank',
    display_order: 38,
    metadata: {
      category: 'small_finance',
      head_office: 'Varanasi',
      state: 'Uttar Pradesh',
      toll_free: '1800 123 9878',
      established_year: 2017,
      tagline: 'Aapki Ummeed Ka Khaata',
      rbi_classification: 'Scheduled Small Finance Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'UTKS0001001', branch_name: 'Varanasi Head Office', city: 'Varanasi', state: 'Uttar Pradesh' },
      { identifier_type: 'ifsc', identifier_value: 'UTKS0001452', branch_name: 'Bengaluru Branch', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'micr', identifier_value: '221762001', branch_name: 'Varanasi Main', city: 'Varanasi', state: 'Uttar Pradesh' },
      { identifier_type: 'micr', identifier_value: '560762002', branch_name: 'Bengaluru Branch', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'swift', identifier_value: 'UTKSINBBXXX', branch_name: 'Treasury Branch', city: 'Varanasi', state: 'Uttar Pradesh' },
      { identifier_type: 'bank_code', identifier_value: '762', branch_name: 'Clearing Code', city: 'Varanasi', state: 'Uttar Pradesh' },
    ],
  },
  {
    bank_code: 'ESMF',
    bank_name: 'ESAF Small Finance Bank',
    short_name: 'ESAF',
    legal_name: 'ESAF Small Finance Bank Limited',
    bank_type: 'small_finance',
    primaryColor: '#005da4',
    secondaryColor: '#78be20',
    website_url: 'https://www.esafbank.com',
    display_order: 39,
    metadata: {
      category: 'small_finance',
      head_office: 'Thrissur',
      state: 'Kerala',
      toll_free: '1800 103 3723',
      established_year: 2017,
      tagline: 'Joy of Banking',
      rbi_classification: 'Scheduled Small Finance Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'ESMF0001101', branch_name: 'Thrissur Corporate Office', city: 'Thrissur', state: 'Kerala' },
      { identifier_type: 'ifsc', identifier_value: 'ESMF0001345', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '680760001', branch_name: 'Thrissur Main', city: 'Thrissur', state: 'Kerala' },
      { identifier_type: 'micr', identifier_value: '635760002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'ESMFINBBXXX', branch_name: 'Treasury Thrissur', city: 'Thrissur', state: 'Kerala' },
      { identifier_type: 'bank_code', identifier_value: '760', branch_name: 'Clearing Code', city: 'Thrissur', state: 'Kerala' },
    ],
  },
  {
    bank_code: 'SURY',
    bank_name: 'Suryoday Small Finance Bank',
    short_name: 'Suryoday',
    legal_name: 'Suryoday Small Finance Bank Limited',
    bank_type: 'small_finance',
    primaryColor: '#f37023',
    secondaryColor: '#1b365d',
    website_url: 'https://www.suryodaybank.com',
    display_order: 40,
    metadata: {
      category: 'small_finance',
      head_office: 'Navi Mumbai',
      state: 'Maharashtra',
      toll_free: '1800 266 7711',
      established_year: 2017,
      tagline: 'A Bank of Smiles',
      rbi_classification: 'Scheduled Small Finance Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'SURY0000001', branch_name: 'Navi Mumbai Head Office', city: 'Navi Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'SURY0000214', branch_name: 'Chennai Branch', city: 'Chennai', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '400762001', branch_name: 'Navi Mumbai Main', city: 'Navi Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '600762002', branch_name: 'Chennai Branch', city: 'Chennai', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'SURYINBBXXX', branch_name: 'Treasury Desk', city: 'Navi Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '762', branch_name: 'Clearing Code', city: 'Navi Mumbai', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'SMCB',
    bank_name: 'Shivalik Small Finance Bank',
    short_name: 'Shivalik',
    legal_name: 'Shivalik Small Finance Bank Limited',
    bank_type: 'small_finance',
    primaryColor: '#1d428a',
    secondaryColor: '#e03a3e',
    website_url: 'https://shivalikbank.com',
    display_order: 41,
    metadata: {
      category: 'small_finance',
      head_office: 'Noida',
      state: 'Uttar Pradesh',
      toll_free: '1800 202 5333',
      established_year: 2021,
      tagline: 'A Bank for Digital Bharat',
      rbi_classification: 'Scheduled Small Finance Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'SMCB0000001', branch_name: 'Saharanpur Main', city: 'Saharanpur', state: 'Uttar Pradesh' },
      { identifier_type: 'ifsc', identifier_value: 'SMCB0001045', branch_name: 'Noida Corporate Office', city: 'Noida', state: 'Uttar Pradesh' },
      { identifier_type: 'micr', identifier_value: '247758001', branch_name: 'Saharanpur Central', city: 'Saharanpur', state: 'Uttar Pradesh' },
      { identifier_type: 'micr', identifier_value: '110758002', branch_name: 'Noida Branch', city: 'Noida', state: 'Uttar Pradesh' },
      { identifier_type: 'swift', identifier_value: 'SMCBINBBXXX', branch_name: 'Treasury Operations', city: 'Noida', state: 'Uttar Pradesh' },
      { identifier_type: 'bank_code', identifier_value: '758', branch_name: 'Clearing Code', city: 'Noida', state: 'Uttar Pradesh' },
    ],
  },
  {
    bank_code: 'UTBI',
    bank_name: 'Unity Small Finance Bank',
    short_name: 'Unity SFB',
    legal_name: 'Unity Small Finance Bank Limited',
    bank_type: 'small_finance',
    primaryColor: '#202c59',
    secondaryColor: '#ffb71b',
    website_url: 'https://theunitybank.com',
    display_order: 42,
    metadata: {
      category: 'small_finance',
      head_office: 'Mumbai',
      state: 'Maharashtra',
      toll_free: '1800 209 1122',
      established_year: 2021,
      tagline: 'Bank with Unity',
      rbi_classification: 'Scheduled Small Finance Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'UTBI0000001', branch_name: 'Mumbai Corporate Office', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'UTBI0000150', branch_name: 'New Delhi Connaught Place', city: 'New Delhi', state: 'Delhi' },
      { identifier_type: 'micr', identifier_value: '400768001', branch_name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '110768002', branch_name: 'Delhi Central', city: 'New Delhi', state: 'Delhi' },
      { identifier_type: 'swift', identifier_value: 'UTBIINBBXXX', branch_name: 'Treasury Desk', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '768', branch_name: 'Clearing Code', city: 'Mumbai', state: 'Maharashtra' },
    ],
  },

  // ─── 4. PAYMENTS BANKS ──────────────────────────────────────────────
  {
    bank_code: 'AIRP',
    bank_name: 'Airtel Payments Bank',
    short_name: 'Airtel Bank',
    legal_name: 'Airtel Payments Bank Limited',
    bank_type: 'payments',
    primaryColor: '#e40000',
    secondaryColor: '#2a2b2e',
    website_url: 'https://www.airtel.in/bank',
    display_order: 43,
    metadata: {
      category: 'payments',
      head_office: 'New Delhi',
      state: 'Delhi',
      toll_free: '1800 103 0103',
      established_year: 2017,
      tagline: 'Banking Is Now On Your Fingertips',
      rbi_classification: 'Differentiated Bank - Payments Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'AIRP0000001', branch_name: 'New Delhi Head Office', city: 'New Delhi', state: 'Delhi' },
      { identifier_type: 'ifsc', identifier_value: 'AIRP0000002', branch_name: 'Bengaluru Digital Centre', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'micr', identifier_value: '110754001', branch_name: 'New Delhi Central', city: 'New Delhi', state: 'Delhi' },
      { identifier_type: 'micr', identifier_value: '560754002', branch_name: 'Bengaluru Central', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'swift', identifier_value: 'AIRPINBBXXX', branch_name: 'Digital Treasury', city: 'New Delhi', state: 'Delhi' },
      { identifier_type: 'bank_code', identifier_value: '754', branch_name: 'Clearing Code', city: 'New Delhi', state: 'Delhi' },
    ],
  },
  {
    bank_code: 'IPOS',
    bank_name: 'India Post Payments Bank',
    short_name: 'IPPB',
    legal_name: 'India Post Payments Bank Limited',
    bank_type: 'payments',
    primaryColor: '#d9251d',
    secondaryColor: '#00488f',
    website_url: 'https://www.ippbonline.com',
    display_order: 44,
    metadata: {
      category: 'payments',
      head_office: 'New Delhi',
      state: 'Delhi',
      toll_free: '155299',
      established_year: 2018,
      tagline: 'Aapka Bank, Aapke Dwaar',
      rbi_classification: 'Differentiated Bank - Payments Bank (Department of Posts)',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'IPOS0000001', branch_name: 'New Delhi GPO Corporate', city: 'New Delhi', state: 'Delhi' },
      { identifier_type: 'ifsc', identifier_value: 'IPOS0000635', branch_name: 'Hosur Head Post Office', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '110753001', branch_name: 'New Delhi Main GPO', city: 'New Delhi', state: 'Delhi' },
      { identifier_type: 'micr', identifier_value: '635753002', branch_name: 'Hosur HPO', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'IPOSINBBXXX', branch_name: 'Treasury New Delhi', city: 'New Delhi', state: 'Delhi' },
      { identifier_type: 'bank_code', identifier_value: '753', branch_name: 'Clearing Code', city: 'New Delhi', state: 'Delhi' },
    ],
  },
  {
    bank_code: 'PYTM',
    bank_name: 'Paytm Payments Bank',
    short_name: 'Paytm Bank',
    legal_name: 'Paytm Payments Bank Limited',
    bank_type: 'payments',
    primaryColor: '#002970',
    secondaryColor: '#00b9f1',
    website_url: 'https://www.paytmbank.com',
    display_order: 45,
    metadata: {
      category: 'payments',
      head_office: 'Noida',
      state: 'Uttar Pradesh',
      toll_free: '0120 4456 456',
      established_year: 2017,
      tagline: 'Simplifying Payments for India',
      rbi_classification: 'Differentiated Bank - Payments Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'PYTM0123456', branch_name: 'Noida Corporate Office', city: 'Noida', state: 'Uttar Pradesh' },
      { identifier_type: 'ifsc', identifier_value: 'PYTM0123457', branch_name: 'Bengaluru Tech Hub', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'micr', identifier_value: '110752001', branch_name: 'Noida Central', city: 'Noida', state: 'Uttar Pradesh' },
      { identifier_type: 'micr', identifier_value: '560752002', branch_name: 'Bengaluru Central', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'swift', identifier_value: 'PYTMINBBXXX', branch_name: 'Treasury Operations', city: 'Noida', state: 'Uttar Pradesh' },
      { identifier_type: 'bank_code', identifier_value: '752', branch_name: 'Clearing Code', city: 'Noida', state: 'Uttar Pradesh' },
    ],
  },
  {
    bank_code: 'FINO',
    bank_name: 'Fino Payments Bank',
    short_name: 'Fino',
    legal_name: 'Fino Payments Bank Limited',
    bank_type: 'payments',
    primaryColor: '#004b87',
    secondaryColor: '#e31837',
    website_url: 'https://www.finobank.com',
    display_order: 46,
    metadata: {
      category: 'payments',
      head_office: 'Navi Mumbai',
      state: 'Maharashtra',
      toll_free: '1860 266 3466',
      established_year: 2017,
      tagline: 'Qadar Aapki Mehnat Ki',
      rbi_classification: 'Scheduled Payments Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'FINO0000001', branch_name: 'Navi Mumbai Head Office', city: 'Navi Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'FINO0001124', branch_name: 'Hosur Merchant Hub', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '400755001', branch_name: 'Navi Mumbai Main', city: 'Navi Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '635755002', branch_name: 'Hosur Merchant Hub', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'FINOINBBXXX', branch_name: 'Treasury Desk', city: 'Navi Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '755', branch_name: 'Clearing Code', city: 'Navi Mumbai', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'JIOP',
    bank_name: 'Jio Payments Bank',
    short_name: 'Jio Bank',
    legal_name: 'Jio Payments Bank Limited',
    bank_type: 'payments',
    primaryColor: '#0a2885',
    secondaryColor: '#e31837',
    website_url: 'https://www.jiopaymentsbank.com',
    display_order: 47,
    metadata: {
      category: 'payments',
      head_office: 'Navi Mumbai',
      state: 'Maharashtra',
      toll_free: '1800 891 9999',
      established_year: 2018,
      tagline: 'Digital Banking for Every Indian',
      rbi_classification: 'Differentiated Bank - Payments Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'JIOP0000001', branch_name: 'Navi Mumbai Reliance Corporate Park', city: 'Navi Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'JIOP0000002', branch_name: 'Bengaluru Digital Centre', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'micr', identifier_value: '400756001', branch_name: 'Navi Mumbai Main', city: 'Navi Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '560756002', branch_name: 'Bengaluru Main', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'swift', identifier_value: 'JIOPINBBXXX', branch_name: 'Treasury RCP', city: 'Navi Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '756', branch_name: 'Clearing Code', city: 'Navi Mumbai', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'NSPB',
    bank_name: 'NSDL Payments Bank',
    short_name: 'NSDL Bank',
    legal_name: 'NSDL Payments Bank Limited',
    bank_type: 'payments',
    primaryColor: '#003366',
    secondaryColor: '#f7941e',
    website_url: 'https://www.nsdlbank.com',
    display_order: 48,
    metadata: {
      category: 'payments',
      head_office: 'Mumbai',
      state: 'Maharashtra',
      toll_free: '1800 266 0199',
      established_year: 2018,
      tagline: 'Secure and Seamless Digital Banking',
      rbi_classification: 'Differentiated Bank - Payments Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'NSPB0000001', branch_name: 'Mumbai Lower Parel HO', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'NSPB0000002', branch_name: 'Chennai Central', city: 'Chennai', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '400757001', branch_name: 'Mumbai Main', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '600757002', branch_name: 'Chennai Main', city: 'Chennai', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'NSPBINBBXXX', branch_name: 'Treasury Desk', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '757', branch_name: 'Clearing Code', city: 'Mumbai', state: 'Maharashtra' },
    ],
  },

  // ─── 5. CO-OPERATIVE BANKS ──────────────────────────────────────────
  {
    bank_code: 'SRCB',
    bank_name: 'Saraswat Co-operative Bank',
    short_name: 'Saraswat',
    legal_name: 'The Saraswat Co-operative Bank Limited',
    bank_type: 'cooperative',
    primaryColor: '#a6192e',
    secondaryColor: '#e87722',
    website_url: 'https://www.saraswatbank.com',
    display_order: 49,
    metadata: {
      category: 'cooperative',
      head_office: 'Mumbai',
      state: 'Maharashtra',
      toll_free: '1800 22 9999',
      established_year: 1918,
      tagline: 'Serving with Smile',
      rbi_classification: 'Scheduled Urban Co-operative Bank (Largest in India)',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'SRCB0000001', branch_name: 'Mumbai Girgaon HO', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'SRCB0000412', branch_name: 'Bengaluru Branch', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'micr', identifier_value: '400088001', branch_name: 'Mumbai Main', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '560088002', branch_name: 'Bengaluru Branch', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'swift', identifier_value: 'SRCBINBBXXX', branch_name: 'Treasury & Forex', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '088', branch_name: 'Clearing Code', city: 'Mumbai', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'COSB',
    bank_name: 'Cosmos Co-operative Bank',
    short_name: 'Cosmos',
    legal_name: 'The Cosmos Co-operative Bank Limited',
    bank_type: 'cooperative',
    primaryColor: '#003865',
    secondaryColor: '#f26522',
    website_url: 'https://www.cosmosbank.com',
    display_order: 50,
    metadata: {
      category: 'cooperative',
      head_office: 'Pune',
      state: 'Maharashtra',
      toll_free: '1800 233 0234',
      established_year: 1906,
      tagline: 'Rich in Tradition, Rich in Trust',
      rbi_classification: 'Scheduled Multi-State Urban Co-operative Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'COSB0000001', branch_name: 'Pune Cosmos Tower HO', city: 'Pune', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'COSB0000156', branch_name: 'Bengaluru Branch', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'micr', identifier_value: '411164001', branch_name: 'Pune Main', city: 'Pune', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '560164002', branch_name: 'Bengaluru Branch', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'swift', identifier_value: 'COSBINBBXXX', branch_name: 'Forex Department', city: 'Pune', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '164', branch_name: 'Clearing Code', city: 'Pune', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'SVCB',
    bank_name: 'SVC Co-operative Bank',
    short_name: 'SVC Bank',
    legal_name: 'SVC Co-operative Bank Limited',
    bank_type: 'cooperative',
    primaryColor: '#00508f',
    secondaryColor: '#ee2e24',
    website_url: 'https://www.svcbank.com',
    display_order: 51,
    metadata: {
      category: 'cooperative',
      head_office: 'Mumbai',
      state: 'Maharashtra',
      toll_free: '1800 313 2120',
      established_year: 1906,
      tagline: 'Experience the Next Step',
      rbi_classification: 'Scheduled Multi-State Urban Co-operative Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'SVCB0000001', branch_name: 'Mumbai Central Corporate', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'SVCB0000184', branch_name: 'Chennai Branch', city: 'Chennai', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '400089001', branch_name: 'Mumbai Main', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '600089002', branch_name: 'Chennai Branch', city: 'Chennai', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'SVCBINBBXXX', branch_name: 'Treasury Desk', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '089', branch_name: 'Clearing Code', city: 'Mumbai', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'TNSC',
    bank_name: 'Tamil Nadu State Apex Co-operative Bank',
    short_name: 'TNSC Bank',
    legal_name: 'The Tamil Nadu State Apex Co-operative Bank Limited',
    bank_type: 'cooperative',
    primaryColor: '#0a4c28',
    secondaryColor: '#d49b00',
    website_url: 'https://www.tnscbank.com',
    display_order: 52,
    metadata: {
      category: 'cooperative',
      head_office: 'Chennai',
      state: 'Tamil Nadu',
      toll_free: '044 2530 2300',
      established_year: 1905,
      tagline: 'Pioneers in Rural & State Co-operative Banking',
      rbi_classification: 'Scheduled State Apex Co-operative Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'TNSC0000001', branch_name: 'Chennai Central Head Office', city: 'Chennai', state: 'Tamil Nadu' },
      { identifier_type: 'ifsc', identifier_value: 'TNSC0010892', branch_name: 'Hosur DCCB Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '600108001', branch_name: 'Chennai Main', city: 'Chennai', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '635108002', branch_name: 'Hosur DCCB', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'TNSCINBBXXX', branch_name: 'Treasury Operations', city: 'Chennai', state: 'Tamil Nadu' },
      { identifier_type: 'bank_code', identifier_value: '108', branch_name: 'Clearing Code', city: 'Chennai', state: 'Tamil Nadu' },
    ],
  },

  // ─── 6. REGIONAL RURAL BANKS (RRBs) ─────────────────────────────────
  {
    bank_code: 'BUPB',
    bank_name: 'Baroda UP Bank',
    short_name: 'Baroda UP',
    legal_name: 'Baroda UP Bank',
    bank_type: 'regional_rural',
    primaryColor: '#f26522',
    secondaryColor: '#004c8f',
    website_url: 'https://www.barodaupbank.in',
    display_order: 53,
    metadata: {
      category: 'regional_rural',
      head_office: 'Gorakhpur',
      state: 'Uttar Pradesh',
      sponsor_bank: 'Bank of Baroda',
      toll_free: '1800 1800 225',
      established_year: 2020,
      tagline: 'Aage Badhne Ka Bharosa',
      rbi_classification: 'Scheduled Regional Rural Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'BARB0BUPGBX', branch_name: 'Gorakhpur Head Office', city: 'Gorakhpur', state: 'Uttar Pradesh' },
      { identifier_type: 'ifsc', identifier_value: 'BARB0BUPVAR', branch_name: 'Varanasi Main Branch', city: 'Varanasi', state: 'Uttar Pradesh' },
      { identifier_type: 'micr', identifier_value: '273820001', branch_name: 'Gorakhpur Central', city: 'Gorakhpur', state: 'Uttar Pradesh' },
      { identifier_type: 'micr', identifier_value: '221820002', branch_name: 'Varanasi Central', city: 'Varanasi', state: 'Uttar Pradesh' },
      { identifier_type: 'swift', identifier_value: 'BUPBINBBXXX', branch_name: 'Treasury Gorakhpur', city: 'Gorakhpur', state: 'Uttar Pradesh' },
      { identifier_type: 'bank_code', identifier_value: '820', branch_name: 'Clearing Code', city: 'Gorakhpur', state: 'Uttar Pradesh' },
    ],
  },
  {
    bank_code: 'ARYB',
    bank_name: 'Aryavart Bank',
    short_name: 'Aryavart',
    legal_name: 'Aryavart Bank',
    bank_type: 'regional_rural',
    primaryColor: '#a8002e',
    secondaryColor: '#fbb03b',
    website_url: 'https://www.aryavart-rrb.com',
    display_order: 54,
    metadata: {
      category: 'regional_rural',
      head_office: 'Lucknow',
      state: 'Uttar Pradesh',
      sponsor_bank: 'Bank of India',
      toll_free: '1800 102 0304',
      established_year: 2019,
      tagline: 'Grameen Bharat Ki Pragati',
      rbi_classification: 'Scheduled Regional Rural Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'BARB0ARRPBX', branch_name: 'Lucknow Head Office', city: 'Lucknow', state: 'Uttar Pradesh' },
      { identifier_type: 'ifsc', identifier_value: 'BARB0ARRAGR', branch_name: 'Agra Regional Branch', city: 'Agra', state: 'Uttar Pradesh' },
      { identifier_type: 'micr', identifier_value: '226815001', branch_name: 'Lucknow Main', city: 'Lucknow', state: 'Uttar Pradesh' },
      { identifier_type: 'micr', identifier_value: '282815002', branch_name: 'Agra Main', city: 'Agra', state: 'Uttar Pradesh' },
      { identifier_type: 'swift', identifier_value: 'ARYBINBBXXX', branch_name: 'Treasury Lucknow', city: 'Lucknow', state: 'Uttar Pradesh' },
      { identifier_type: 'bank_code', identifier_value: '815', branch_name: 'Clearing Code', city: 'Lucknow', state: 'Uttar Pradesh' },
    ],
  },
  {
    bank_code: 'KLGB',
    bank_name: 'Kerala Gramin Bank',
    short_name: 'Kerala Gramin',
    legal_name: 'Kerala Gramin Bank',
    bank_type: 'regional_rural',
    primaryColor: '#0072bc',
    secondaryColor: '#f7941e',
    website_url: 'https://www.keralagbank.com',
    display_order: 55,
    metadata: {
      category: 'regional_rural',
      head_office: 'Malappuram',
      state: 'Kerala',
      sponsor_bank: 'Canara Bank',
      toll_free: '1800 425 4121',
      established_year: 2013,
      tagline: 'Your Own Kerala Bank',
      rbi_classification: 'Scheduled Regional Rural Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'KLGB0040001', branch_name: 'Malappuram Head Office', city: 'Malappuram', state: 'Kerala' },
      { identifier_type: 'ifsc', identifier_value: 'KLGB0040124', branch_name: 'Palakkad Branch', city: 'Palakkad', state: 'Kerala' },
      { identifier_type: 'micr', identifier_value: '676834001', branch_name: 'Malappuram Main', city: 'Malappuram', state: 'Kerala' },
      { identifier_type: 'micr', identifier_value: '678834002', branch_name: 'Palakkad Main', city: 'Palakkad', state: 'Kerala' },
      { identifier_type: 'swift', identifier_value: 'KLGBINBBXXX', branch_name: 'Treasury Desk', city: 'Malappuram', state: 'Kerala' },
      { identifier_type: 'bank_code', identifier_value: '834', branch_name: 'Clearing Code', city: 'Malappuram', state: 'Kerala' },
    ],
  },
  {
    bank_code: 'PKGB',
    bank_name: 'Karnataka Gramin Bank',
    short_name: 'Karnataka Gramin',
    legal_name: 'Karnataka Gramin Bank',
    bank_type: 'regional_rural',
    primaryColor: '#0091df',
    secondaryColor: '#ffc72c',
    website_url: 'https://karnatakagraminbank.com',
    display_order: 56,
    metadata: {
      category: 'regional_rural',
      head_office: 'Ballari',
      state: 'Karnataka',
      sponsor_bank: 'Canara Bank',
      toll_free: '1800 102 5250',
      established_year: 2019,
      tagline: 'Gramina Abhivrudhiya Moola',
      rbi_classification: 'Scheduled Regional Rural Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'PKGB0000001', branch_name: 'Ballari Head Office', city: 'Ballari', state: 'Karnataka' },
      { identifier_type: 'ifsc', identifier_value: 'PKGB0001234', branch_name: 'Bengaluru Central Branch', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'micr', identifier_value: '583832001', branch_name: 'Ballari Main', city: 'Ballari', state: 'Karnataka' },
      { identifier_type: 'micr', identifier_value: '560832002', branch_name: 'Bengaluru Central', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'swift', identifier_value: 'PKGBINBBXXX', branch_name: 'Treasury Operations', city: 'Ballari', state: 'Karnataka' },
      { identifier_type: 'bank_code', identifier_value: '832', branch_name: 'Clearing Code', city: 'Ballari', state: 'Karnataka' },
    ],
  },
  {
    bank_code: 'APGV',
    bank_name: 'Andhra Pradesh Grameena Vikas Bank',
    short_name: 'APGVB',
    legal_name: 'Andhra Pradesh Grameena Vikas Bank',
    bank_type: 'regional_rural',
    primaryColor: '#1d3369',
    secondaryColor: '#f7931e',
    website_url: 'https://www.apgvbank.in',
    display_order: 57,
    metadata: {
      category: 'regional_rural',
      head_office: 'Warangal',
      state: 'Telangana',
      sponsor_bank: 'State Bank of India',
      toll_free: '1800 425 2242',
      established_year: 2006,
      tagline: 'Empowering Rural Andhra & Telangana',
      rbi_classification: 'Scheduled Regional Rural Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'APGV0001101', branch_name: 'Warangal Head Office', city: 'Warangal', state: 'Telangana' },
      { identifier_type: 'ifsc', identifier_value: 'APGV0002145', branch_name: 'Visakhapatnam City Branch', city: 'Visakhapatnam', state: 'Andhra Pradesh' },
      { identifier_type: 'micr', identifier_value: '506825001', branch_name: 'Warangal Central', city: 'Warangal', state: 'Telangana' },
      { identifier_type: 'micr', identifier_value: '530825002', branch_name: 'Visakhapatnam Main', city: 'Visakhapatnam', state: 'Andhra Pradesh' },
      { identifier_type: 'swift', identifier_value: 'APGVINBBXXX', branch_name: 'Treasury Desk', city: 'Warangal', state: 'Telangana' },
      { identifier_type: 'bank_code', identifier_value: '825', branch_name: 'Clearing Code', city: 'Warangal', state: 'Telangana' },
    ],
  },

  // ─── 7. FOREIGN COMMERCIAL BANKS IN INDIA ───────────────────────────
  {
    bank_code: 'CITI',
    bank_name: 'Citibank India',
    short_name: 'Citibank',
    legal_name: 'Citibank N.A. India',
    bank_type: 'foreign',
    primaryColor: '#003b70',
    secondaryColor: '#00a3e0',
    website_url: 'https://www.online.citibank.co.in',
    display_order: 58,
    metadata: {
      category: 'foreign',
      head_office: 'Mumbai',
      state: 'Maharashtra',
      toll_free: '1860 210 2484',
      established_year: 1902,
      tagline: "Let's Get It Done",
      rbi_classification: 'Scheduled Foreign Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'CITI0000001', branch_name: 'Mumbai BKC Main', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'CITI0000002', branch_name: 'Bengaluru MG Road', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'micr', identifier_value: '400037001', branch_name: 'Mumbai BKC', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '560037002', branch_name: 'Bengaluru Main', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'swift', identifier_value: 'CITIINBX', branch_name: 'Treasury & Markets', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '037', branch_name: 'Clearing Code', city: 'Mumbai', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'SCBL',
    bank_name: 'Standard Chartered Bank',
    short_name: 'StanChart',
    legal_name: 'Standard Chartered Bank India',
    bank_type: 'foreign',
    primaryColor: '#0073ae',
    secondaryColor: '#2dbd52',
    website_url: 'https://www.sc.com/in',
    display_order: 59,
    metadata: {
      category: 'foreign',
      head_office: 'Mumbai',
      state: 'Maharashtra',
      toll_free: '1800 345 5000',
      established_year: 1858,
      tagline: 'Here for Good',
      rbi_classification: 'Scheduled Foreign Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'SCBL0036001', branch_name: 'Mumbai Fort Branch', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'SCBL0036025', branch_name: 'Bengaluru Koramangala', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'micr', identifier_value: '400036001', branch_name: 'Mumbai Fort', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '560036002', branch_name: 'Bengaluru Branch', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'swift', identifier_value: 'SCBLINBBXXX', branch_name: 'Foreign Exchange Branch', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '036', branch_name: 'Clearing Code', city: 'Mumbai', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'HSBC',
    bank_name: 'HSBC Bank India',
    short_name: 'HSBC',
    legal_name: 'The Hongkong and Shanghai Banking Corporation Limited',
    bank_type: 'foreign',
    primaryColor: '#db0011',
    secondaryColor: '#ffffff',
    website_url: 'https://www.hsbc.co.in',
    display_order: 60,
    metadata: {
      category: 'foreign',
      head_office: 'Mumbai',
      state: 'Maharashtra',
      toll_free: '1800 266 3456',
      established_year: 1853,
      tagline: 'Opening Up a World of Opportunity',
      rbi_classification: 'Scheduled Foreign Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'HSBC0400001', branch_name: 'Mumbai Fort Main', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'HSBC0560002', branch_name: 'Bengaluru MG Road', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'micr', identifier_value: '400039001', branch_name: 'Mumbai Fort', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '560039002', branch_name: 'Bengaluru Main', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'swift', identifier_value: 'HSBCINBBXXX', branch_name: 'Global Banking & Markets', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '039', branch_name: 'Clearing Code', city: 'Mumbai', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'DEUT',
    bank_name: 'Deutsche Bank India',
    short_name: 'Deutsche Bank',
    legal_name: 'Deutsche Bank AG India',
    bank_type: 'foreign',
    primaryColor: '#0018a8',
    secondaryColor: '#ffffff',
    website_url: 'https://www.deutschebank.co.in',
    display_order: 61,
    metadata: {
      category: 'foreign',
      head_office: 'Mumbai',
      state: 'Maharashtra',
      toll_free: '1860 266 6601',
      established_year: 1980,
      tagline: 'Passionate to Perform',
      rbi_classification: 'Scheduled Foreign Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'DEUT0784BBY', branch_name: 'Mumbai Fort Main', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'DEUT0796BLR', branch_name: 'Bengaluru Kasturba Road', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'micr', identifier_value: '400033001', branch_name: 'Mumbai Fort', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '560033002', branch_name: 'Bengaluru Branch', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'swift', identifier_value: 'DEUTINBBXXX', branch_name: 'Global Markets', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '033', branch_name: 'Clearing Code', city: 'Mumbai', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'DBSS',
    bank_name: 'DBS Bank India',
    short_name: 'DBS',
    legal_name: 'DBS Bank India Limited',
    bank_type: 'foreign',
    primaryColor: '#d9272e',
    secondaryColor: '#1b1b1b',
    website_url: 'https://www.dbs.com/in',
    display_order: 62,
    metadata: {
      category: 'foreign',
      head_office: 'Mumbai',
      state: 'Maharashtra',
      toll_free: '1800 209 4555',
      established_year: 1994,
      tagline: 'Live more, Bank less',
      rbi_classification: 'Wholly Owned Subsidiary / Scheduled Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'DBSS0IN0821', branch_name: 'Mumbai Nariman Point', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'DBSS0IN0845', branch_name: 'Hosur LVB Heritage Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'micr', identifier_value: '400741001', branch_name: 'Mumbai Main', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '635741002', branch_name: 'Hosur Branch', city: 'Hosur', state: 'Tamil Nadu' },
      { identifier_type: 'swift', identifier_value: 'DBSSINBBXXX', branch_name: 'Treasury & Markets', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '741', branch_name: 'Clearing Code', city: 'Mumbai', state: 'Maharashtra' },
    ],
  },
  {
    bank_code: 'BARC',
    bank_name: 'Barclays Bank India',
    short_name: 'Barclays',
    legal_name: 'Barclays Bank PLC India',
    bank_type: 'foreign',
    primaryColor: '#00aeef',
    secondaryColor: '#00395d',
    website_url: 'https://www.barclays.in',
    display_order: 63,
    metadata: {
      category: 'foreign',
      head_office: 'Mumbai',
      state: 'Maharashtra',
      toll_free: '1800 266 1234',
      established_year: 1990,
      tagline: "Now, There's a Thought",
      rbi_classification: 'Scheduled Foreign Commercial Bank',
    },
    identifiers: [
      { identifier_type: 'ifsc', identifier_value: 'BARC0INBBIR', branch_name: 'Mumbai Nehru Centre Main', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'ifsc', identifier_value: 'BARC0INBBLR', branch_name: 'Bengaluru Commercial Hub', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'micr', identifier_value: '400735001', branch_name: 'Mumbai Main', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'micr', identifier_value: '560735002', branch_name: 'Bengaluru Central', city: 'Bengaluru', state: 'Karnataka' },
      { identifier_type: 'swift', identifier_value: 'BARCINBBXXX', branch_name: 'Treasury & Markets', city: 'Mumbai', state: 'Maharashtra' },
      { identifier_type: 'bank_code', identifier_value: '735', branch_name: 'Clearing Code', city: 'Mumbai', state: 'Maharashtra' },
    ],
  },
];

/**
 * Seed all Indian banks, bank identifiers, and default company bank accounts
 */
export const seedBanks = async ({ companyId = null } = {}) => {
  const pool = getDatabasePool();
  if (!pool) {
    throw new Error('Database pool not initialized');
  }

  console.log('🏦 [SEEDER:BANKS] Starting Indian banks seeding with physical asset management...');

  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsBanksDir)) {
    fs.mkdirSync(uploadsBanksDir, { recursive: true });
  }

  let banksCreated = 0;
  let banksUpdated = 0;
  let identifiersCreated = 0;
  let identifiersUpdated = 0;
  let imagesGenerated = 0;
  const bankMap = new Map();

  // 1. Process Bank Master Records
  for (const bankDef of INDIAN_BANKS) {
    // Generate physical assets in src/uploads/banks/<bank_slug>/
    const assetUrls = await ensureBankAssetsOnDisk(bankDef);
    imagesGenerated += 3; // logo.svg, logo-light.svg, logo-dark.svg

    const existingBankRes = await pool.query(
      'SELECT id, bank_code FROM banks WHERE bank_code = $1 LIMIT 1',
      [bankDef.bank_code]
    );

    let bankId;
    if (existingBankRes.rowCount === 0) {
      const insertQuery = `
        INSERT INTO banks (
          bank_code, bank_name, short_name, legal_name, bank_type,
          logo_url, logo_light_url, logo_dark_url, website_url,
          country_code, is_active, is_verified, display_order, metadata
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, 'IN', TRUE, TRUE, $10, $11
        ) RETURNING id;
      `;
      const res = await pool.query(insertQuery, [
        bankDef.bank_code,
        bankDef.bank_name,
        bankDef.short_name,
        bankDef.legal_name,
        bankDef.bank_type,
        assetUrls.logo_url,
        assetUrls.logo_light_url,
        assetUrls.logo_dark_url,
        bankDef.website_url,
        bankDef.display_order,
        JSON.stringify({
          ...(bankDef.metadata || {}),
          ...(assetUrls.logo_png_url ? { logo_png_url: assetUrls.logo_png_url } : {}),
          ...(assetUrls.symbol_svg_url ? { symbol_svg_url: assetUrls.symbol_svg_url } : {}),
          ...(assetUrls.symbol_png_url ? { symbol_png_url: assetUrls.symbol_png_url } : {}),
          is_official_logo: assetUrls.is_official_logo || false,
        }),
      ]);
      bankId = res.rows[0].id;
      banksCreated++;
    } else {
      bankId = existingBankRes.rows[0].id;
      const updateQuery = `
        UPDATE banks SET
          bank_name = $2,
          short_name = $3,
          legal_name = $4,
          bank_type = $5,
          logo_url = $6,
          logo_light_url = $7,
          logo_dark_url = $8,
          website_url = $9,
          display_order = $10,
          metadata = $11,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1;
      `;
      await pool.query(updateQuery, [
        bankId,
        bankDef.bank_name,
        bankDef.short_name,
        bankDef.legal_name,
        bankDef.bank_type,
        assetUrls.logo_url,
        assetUrls.logo_light_url,
        assetUrls.logo_dark_url,
        bankDef.website_url,
        bankDef.display_order,
        JSON.stringify({
          ...(bankDef.metadata || {}),
          ...(assetUrls.logo_png_url ? { logo_png_url: assetUrls.logo_png_url } : {}),
          ...(assetUrls.symbol_svg_url ? { symbol_svg_url: assetUrls.symbol_svg_url } : {}),
          ...(assetUrls.symbol_png_url ? { symbol_png_url: assetUrls.symbol_png_url } : {}),
          is_official_logo: assetUrls.is_official_logo || false,
        }),
      ]);
      banksUpdated++;
    }

    bankMap.set(bankDef.bank_code, bankId);

    // 2. Process Identifiers for this Bank
    if (Array.isArray(bankDef.identifiers)) {
      for (const ident of bankDef.identifiers) {
        const existingIdentRes = await pool.query(
          'SELECT id FROM bank_identifiers WHERE identifier_type = $1 AND identifier_value = $2 LIMIT 1',
          [ident.identifier_type, ident.identifier_value]
        );

        if (existingIdentRes.rowCount === 0) {
          await pool.query(
            `INSERT INTO bank_identifiers (
              bank_id, identifier_type, identifier_value, branch_name, city, state, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, TRUE)`,
            [
              bankId,
              ident.identifier_type,
              ident.identifier_value,
              ident.branch_name,
              ident.city,
              ident.state,
            ]
          );
          identifiersCreated++;
        } else {
          await pool.query(
            `UPDATE bank_identifiers SET
              bank_id = $2,
              branch_name = $3,
              city = $4,
              state = $5,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $1`,
            [
              existingIdentRes.rows[0].id,
              bankId,
              ident.branch_name,
              ident.city,
              ident.state,
            ]
          );
          identifiersUpdated++;
        }
      }
    }
  }

  console.log(
    `  + Bank Master: ${banksCreated} created, ${banksUpdated} verified/updated (${INDIAN_BANKS.length} total)`
  );
  console.log(
    `  + Bank Identifiers (IFSC/MICR/SWIFT): ${identifiersCreated} created, ${identifiersUpdated} verified/updated`
  );
  console.log(`  + Physical Bank Logos Managed: ${imagesGenerated} SVG assets in 'src/uploads/banks/'`);

  // 3. Process Company Bank Accounts (Pooja Fashion Shop default business accounts)
  let targetCompanyId = companyId;
  if (!targetCompanyId) {
    const compRes = await pool.query(
      "SELECT id FROM companies WHERE company_code = 'PFS001' LIMIT 1"
    );
    if (compRes.rowCount > 0) {
      targetCompanyId = compRes.rows[0].id;
    }
  }

  let companyBanksCreated = 0;
  let companyBanksUpdated = 0;

  if (targetCompanyId) {
    const companyAccounts = [
      {
        bank_code: 'HDFC',
        account_name: 'Pooja Fashion Shop Private Limited - Main Operations',
        account_number: '50200084930125',
        account_type: 'current',
        branch_name: 'Hosur Main Branch',
        branch_code: '1234',
        ifsc_code: 'HDFC0001234',
        micr_code: '635240002',
        swift_code: 'HDFCINBBXXX',
        opening_balance: 250000.0,
        current_balance: 485600.0,
        is_primary: true,
        notes:
          'Primary operational current account for vendor payments, supplier remittances, and wholesale collections',
      },
      {
        bank_code: 'ICIC',
        account_name: 'Pooja Fashion Shop - POS & Digital Collections',
        account_number: '057205001928',
        account_type: 'current',
        branch_name: 'Hosur Branch',
        branch_code: '0572',
        ifsc_code: 'ICIC0000572',
        micr_code: '635229002',
        swift_code: 'ICICINBBXXX',
        opening_balance: 100000.0,
        current_balance: 234150.0,
        is_primary: false,
        notes: 'POS merchant card swipe settlements and UPI/online retail customer collections',
      },
      {
        bank_code: 'SBIN',
        account_name: 'Pooja Fashion Shop - Statutory & Tax Reserve',
        account_number: '38192048591',
        account_type: 'current',
        branch_name: 'Hosur Main Branch',
        branch_code: '0843',
        ifsc_code: 'SBIN0000843',
        micr_code: '635002001',
        swift_code: 'SBININBBXXX',
        opening_balance: 150000.0,
        current_balance: 195000.0,
        is_primary: false,
        notes: 'Dedicated reserve account for GST remittances, TDS compliance, and advance taxes',
      },
      {
        bank_code: 'UTIB',
        account_name: 'Pooja Fashion Shop - Payroll & Staff Disbursements',
        account_number: '918020048192837',
        account_type: 'current',
        branch_name: 'Hosur Branch',
        branch_code: '0673',
        ifsc_code: 'UTIB0000673',
        micr_code: '635211002',
        swift_code: 'AXISINBBXXX',
        opening_balance: 75000.0,
        current_balance: 128400.0,
        is_primary: false,
        notes: 'Staff salary direct disbursements, festival bonuses, and employee incentives',
      },
    ];

    for (const acc of companyAccounts) {
      const bankId = bankMap.get(acc.bank_code);
      if (!bankId) continue;

      const existingAccRes = await pool.query(
        'SELECT id FROM company_banks WHERE company_id = $1 AND account_number = $2 LIMIT 1',
        [targetCompanyId, acc.account_number]
      );

      if (existingAccRes.rowCount === 0) {
        await pool.query(
          `INSERT INTO company_banks (
            company_id, bank_id, account_name, account_number, account_type,
            branch_name, branch_code, ifsc_code, micr_code, swift_code,
            opening_balance, current_balance, is_primary, is_active, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, TRUE, $14)`,
          [
            targetCompanyId,
            bankId,
            acc.account_name,
            acc.account_number,
            acc.account_type,
            acc.branch_name,
            acc.branch_code,
            acc.ifsc_code,
            acc.micr_code,
            acc.swift_code,
            acc.opening_balance,
            acc.current_balance,
            acc.is_primary,
            acc.notes,
          ]
        );
        companyBanksCreated++;
      } else {
        await pool.query(
          `UPDATE company_banks SET
            bank_id = $2,
            account_name = $3,
            account_type = $4,
            branch_name = $5,
            branch_code = $6,
            ifsc_code = $7,
            micr_code = $8,
            swift_code = $9,
            opening_balance = $10,
            current_balance = $11,
            is_primary = $12,
            notes = $13,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1`,
          [
            existingAccRes.rows[0].id,
            bankId,
            acc.account_name,
            acc.account_type,
            acc.branch_name,
            acc.branch_code,
            acc.ifsc_code,
            acc.micr_code,
            acc.swift_code,
            acc.opening_balance,
            acc.current_balance,
            acc.is_primary,
            acc.notes,
          ]
        );
        companyBanksUpdated++;
      }
    }

    console.log(
      `  + Company Banks (PFS001): ${companyBanksCreated} created, ${companyBanksUpdated} verified/updated`
    );
  }

  return {
    banksCreated,
    banksUpdated,
    banksTotal: INDIAN_BANKS.length,
    identifiersCreated,
    identifiersUpdated,
    companyBanksCreated,
    companyBanksUpdated,
    imagesGenerated,
    uploadDirectory: uploadsBanksDir,
  };
};

// Enable standalone CLI execution
if (process.argv[1] && process.argv[1].endsWith('bank.seeder.js')) {
  import('dotenv').then((dotenv) => {
    dotenv.config();
    import('../connection.js').then(async ({ connectDatabase }) => {
      let pool;
      try {
        pool = await connectDatabase();
        await seedBanks();
        console.log('\n✅ [SEEDER:BANKS] Standalone bank seeding complete.');
        await pool.end();
        process.exit(0);
      } catch (err) {
        console.error('❌ [SEEDER:BANKS] Error:', err);
        if (pool) await pool.end().catch(() => {});
        process.exit(1);
      }
    });
  });
}

export default {
  seedBanks,
  generateBankSvg,
  ensureBankAssetsOnDisk,
  INDIAN_BANKS,
};
