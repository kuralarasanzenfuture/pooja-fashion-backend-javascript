/**
 * Roles Utility Module
 * Provides meaningful role code generation, standard system role definitions,
 * and RBAC helper functions.
 */

/**
 * Standard System Roles definitions seeded for every company.
 * System roles are critical for RBAC and protected against deletion.
 */
export const DEFAULT_SYSTEM_ROLES = [
  {
    role_code: 'SUPERADMIN',
    role_name: 'Super Admin',
    description: 'Full system and company access with unrestricted administrative privileges',
    is_system_role: true,
    is_active: true,
  },
  {
    role_code: 'ADMIN',
    role_name: 'Admin',
    description: 'Company administrator with full operational, branch, and staff management access',
    is_system_role: true,
    is_active: true,
  },
];

/**
 * Semantic alias mapping for common role names to ensure clean, meaningful standard codes.
 */
const COMMON_ROLE_CODE_MAP = {
  'super admin': 'SUPERADMIN',
  superadmin: 'SUPERADMIN',
  'super administrator': 'SUPERADMIN',
  admin: 'ADMIN',
  administrator: 'ADMIN',
  'company admin': 'ADMIN',
  'store manager': 'STORE_MANAGER',
  'branch manager': 'BRANCH_MANAGER',
  cashier: 'CASHIER',
  'sales executive': 'SALES_EXECUTIVE',
  'sales associate': 'SALES_ASSOCIATE',
  'inventory manager': 'INVENTORY_MANAGER',
  'stock controller': 'STOCK_CONTROLLER',
  accountant: 'ACCOUNTANT',
  'finance manager': 'FINANCE_MANAGER',
};

/**
 * Sanitize and format a role code string
 * Converts to uppercase alphanumeric with single underscores
 *
 * @param {string} code
 * @returns {string}
 */
export const sanitizeRoleCode = (code) => {
  if (!code || typeof code !== 'string') return '';
  return code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 50);
};

/**
 * Generate a meaningful, clean, standardized role code from role name.
 * Handles semantic standard names, slug conversion, and uniqueness checks.
 *
 * Examples:
 * - "Super Admin" -> "SUPERADMIN"
 * - "Admin" -> "ADMIN"
 * - "Store Manager" -> "STORE_MANAGER"
 * - "Senior Cashier" -> "SENIOR_CASHIER"
 * - Duplicate "Cashier" -> "CASHIER_01", "CASHIER_02"
 *
 * @param {Object} params
 * @param {string} params.roleName - Human-friendly name of the role
 * @param {string[]} [params.existingCodes=[]] - Already assigned role codes for the company
 * @returns {string} - Meaningful unique uppercase role code
 */
export const generateRoleCode = ({ roleName, existingCodes = [] }) => {
  if (!roleName || typeof roleName !== 'string') {
    throw new Error('Role name is required to generate a role code');
  }

  const normalizedName = roleName.trim().toLowerCase();
  const existingSet = new Set(existingCodes.map((c) => c.toUpperCase()));

  // 1. Check known semantic mapping
  let baseCode = COMMON_ROLE_CODE_MAP[normalizedName];

  // 2. Otherwise convert role name to SNAKE_CASE
  if (!baseCode) {
    baseCode = sanitizeRoleCode(roleName);
  }

  // Fallback if empty or invalid characters
  if (!baseCode) {
    baseCode = 'ROLE';
  }

  // Guarantee max length with space for suffix
  if (baseCode.length > 44) {
    baseCode = baseCode.slice(0, 44).replace(/_$/, '');
  }

  // If candidate is unique, return immediately
  if (!existingSet.has(baseCode)) {
    return baseCode;
  }

  // 3. Collision resolution: Append sequential numbers (_01, _02, ...)
  let sequence = 1;
  while (sequence < 1000) {
    const suffix = `_${String(sequence).padStart(2, '0')}`;
    const candidate = `${baseCode}${suffix}`;
    if (!existingSet.has(candidate)) {
      return candidate;
    }
    sequence++;
  }

  return `${baseCode}_${Date.now().toString().slice(-4)}`;
};

/**
 * Check if a role is a protected system role
 *
 * @param {Object} role - Role object
 * @returns {boolean}
 */
export const isSystemRole = (role) => {
  if (!role) return false;
  return Boolean(role.is_system_role || role.isSystemRole);
};

export default {
  DEFAULT_SYSTEM_ROLES,
  sanitizeRoleCode,
  generateRoleCode,
  isSystemRole,
};
