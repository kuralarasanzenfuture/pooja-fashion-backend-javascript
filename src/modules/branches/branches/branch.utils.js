/**
 * Derive clean company prefix (e.g. 'PFS001' -> 'PFS', or 'Pooja Fashion Shop' -> 'PFS')
 */
export const getCompanyPrefix = (company) => {
  if (!company) return 'BR';

  if (company.company_code) {
    const cleaned = company.company_code.replace(/\d+$/, '').trim().toUpperCase();
    if (cleaned.length >= 2) {
      return cleaned;
    }
    return company.company_code.trim().toUpperCase();
  }

  if (company.company_name) {
    const initials = company.company_name
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0].toUpperCase())
      .join('');
    if (initials.length >= 2) {
      return initials;
    }
  }

  return 'BR';
};

/**
 * Type abbreviation mapping for professional branch codes
 */
export const BRANCH_TYPE_PREFIXES = {
  head_office: 'HO',
  store: 'B',
  warehouse: 'WH',
  showroom: 'SH',
  office: 'OF',
  other: 'BR',
};

/**
 * Generate a professional, meaningful branch code
 * Examples:
 * - Head Office: PFS-HO
 * - Stores: PFS-B01, PFS-B02
 * - Warehouses: PFS-WH01, PFS-WH02
 * - Showrooms: PFS-SH01, PFS-SH02
 */
export const generateBranchCode = ({ company, branchType = 'store', existingCodes = [] }) => {
  const prefix = getCompanyPrefix(company);
  const typeCode = BRANCH_TYPE_PREFIXES[branchType] || 'B';
  const existingSet = new Set(existingCodes.map((code) => code.toUpperCase()));

  if (branchType === 'head_office') {
    const candidate = `${prefix}-HO`;
    if (!existingSet.has(candidate)) {
      return candidate;
    }
  }

  // Iterate sequential numbers starting from 1
  let sequence = 1;
  while (sequence < 1000) {
    const seqStr = String(sequence).padStart(2, '0');
    const candidate =
      branchType === 'head_office' ? `${prefix}-HO-${seqStr}` : `${prefix}-${typeCode}${seqStr}`;

    if (!existingSet.has(candidate)) {
      return candidate;
    }
    sequence++;
  }

  return `${prefix}-${typeCode}${Date.now().toString().slice(-4)}`;
};

export default {
  getCompanyPrefix,
  BRANCH_TYPE_PREFIXES,
  generateBranchCode,
};
