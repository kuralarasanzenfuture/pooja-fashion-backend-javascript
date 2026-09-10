import { toSlug } from '../../shared/utils/file.js';
import path from 'path';

/**
 * Standard department code mappings for meaningful employee codes
 */
export const DEPARTMENT_CODE_MAP = {
  sales: 'SALES',
  retail: 'SALES',
  accounts: 'ACC',
  accounting: 'ACC',
  finance: 'FIN',
  inventory: 'INV',
  warehouse: 'WH',
  logistics: 'LOG',
  management: 'MGT',
  admin: 'ADM',
  administration: 'ADM',
  hr: 'HR',
  'human resources': 'HR',
  billing: 'POS',
  cashier: 'POS',
  tailoring: 'TAILOR',
  production: 'PROD',
  it: 'IT',
  technical: 'TECH',
  security: 'SEC',
};

/**
 * Extract clean company code prefix (e.g., 'PFS001' -> 'PFS' or 'Pooja Fashion' -> 'PFS')
 *
 * @param {Object} [company]
 * @returns {string}
 */
export const getCompanyPrefix = (company) => {
  if (!company) return 'PFS';

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

  return 'PFS';
};

/**
 * Map department name to clean department code
 *
 * @param {string} [department]
 * @returns {string}
 */
export const getDepartmentCode = (department) => {
  if (!department || typeof department !== 'string') return 'EMP';

  const normalized = department.trim().toLowerCase();
  if (DEPARTMENT_CODE_MAP[normalized]) {
    return DEPARTMENT_CODE_MAP[normalized];
  }

  // Sanitize custom department name into 3-5 letter uppercase slug
  const sanitized = normalized
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 5)
    .toUpperCase();
  return sanitized.length >= 2 ? sanitized : 'EMP';
};

/**
 * Sanitize custom employee code
 *
 * @param {string} code
 * @returns {string}
 */
export const sanitizeEmployeeCode = (code) => {
  if (!code || typeof code !== 'string') return '';
  return code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 50);
};

/**
 * Generate a meaningful, collision-free employee code.
 *
 * Examples:
 * - Default: PFS-EMP001, PFS-EMP002, PFS-EMP003
 * - With Department: PFS-SALES-001, PFS-ACC-001
 *
 * @param {Object} params
 * @param {Object} [params.company] - Company entity or object with company_code/company_name
 * @param {string} [params.department] - Department name (e.g. Sales, Accounts)
 * @param {string[]} [params.existingCodes=[]] - Existing employee codes in the company
 * @param {boolean} [params.useDepartmentCode=false] - Whether to include department in code
 * @returns {string} Unique employee code
 */
export const generateEmployeeCode = ({
  company,
  department,
  existingCodes = [],
  useDepartmentCode = false,
}) => {
  const companyPrefix = getCompanyPrefix(company);
  const deptCode = useDepartmentCode && department ? getDepartmentCode(department) : 'EMP';
  const basePrefix =
    useDepartmentCode && department
      ? `${companyPrefix}-${deptCode}-`
      : `${companyPrefix}-${deptCode}`;

  const existingSet = new Set(
    existingCodes.filter(Boolean).map((code) => code.trim().toUpperCase())
  );

  let sequence = 1;
  while (sequence < 10000) {
    const seqStr = String(sequence).padStart(3, '0');
    const candidate = `${basePrefix}${seqStr}`;

    if (!existingSet.has(candidate)) {
      return candidate;
    }
    sequence++;
  }

  return `${basePrefix}${Date.now().toString().slice(-4)}`;
};

/**
 * Generate meaningful file name for storing employee profile photos on disk.
 * Prioritizes username, then employee code, then employee full name slug.
 *
 * Example:
 * - With username: kural_admin-photo-1718000000.jpg
 * - With employee code: pfs-emp001-photo-1718000000.jpg
 * - With name: kural-arasan-photo-1718000000.jpg
 *
 * @param {Object} params
 * @param {string} [params.username] - User's username
 * @param {string} [params.employeeCode] - Employee code
 * @param {string} [params.firstName] - Employee first name
 * @param {string} [params.lastName] - Employee last name
 * @param {string} [params.originalname] - Original file name for extension
 * @returns {string} Filename for storage
 */
export const resolvePhotoFilename = ({
  username,
  employeeCode,
  firstName,
  lastName,
  originalname,
}) => {
  let primaryIdentifier = '';

  if (username && typeof username === 'string' && username.trim()) {
    primaryIdentifier = username.trim();
  } else if (employeeCode && typeof employeeCode === 'string' && employeeCode.trim()) {
    primaryIdentifier = employeeCode.trim();
  } else if (firstName && typeof firstName === 'string' && firstName.trim()) {
    primaryIdentifier = `${firstName.trim()} ${lastName || ''}`.trim();
  } else {
    primaryIdentifier = 'employee';
  }

  const slug = toSlug(primaryIdentifier);
  const ext = originalname ? path.extname(originalname).toLowerCase() || '.jpg' : '.jpg';
  const timestamp = Date.now();

  return `${slug}-photo-${timestamp}${ext}`;
};

export default {
  DEPARTMENT_CODE_MAP,
  getCompanyPrefix,
  getDepartmentCode,
  sanitizeEmployeeCode,
  generateEmployeeCode,
  resolvePhotoFilename,
};
