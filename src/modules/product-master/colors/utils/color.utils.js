/**
 * Product Master: Colors Utilities
 * Utility functions for color code derivation, hex formatting, slug formatting,
 * and token-based multi-tenancy resolution.
 */
import ForbiddenError from '../../../../shared/errors/ForbiddenError.js';
import { toSlug as sharedToSlug } from '../../../../shared/utils/file.js';

export const toSlug = sharedToSlug;

/**
 * Standard uppercase 6-digit hex regex
 */
export const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

/**
 * Normalize and format hex color code to uppercase (e.g. "#ffffff" -> "#FFFFFF")
 * Returns null if input is null, empty, or undefined.
 * @param {string|null} hex
 * @returns {string|null}
 */
export const formatHexCode = (hex) => {
  if (!hex || typeof hex !== 'string') return null;
  const trimmed = hex.trim();
  if (!trimmed) return null;
  return trimmed.toUpperCase();
};

/**
 * Generate standard uppercase color code from name
 * E.g., "Navy Blue" -> "NAVY_BLUE"
 * @param {string} name
 * @returns {string}
 */
export const generateColorCode = (name) => {
  if (!name || typeof name !== 'string') return '';
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);
};

/**
 * Helper: Only 'superadmin' and platform 'admin' users who don't have a fixed company_id
 * are permitted to select or filter by any company.
 * Other users who have a company_id are strictly scoped to their assigned company.
 * @param {Object} user - Authenticated user payload from req.user
 * @returns {boolean}
 */
export const canUserSelectCompany = (user) => {
  if (!user) return false;
  const role = String(user.roleCode || user.role || '').toUpperCase();
  if (role === 'SUPERADMIN') return true;
  const hasComp = Boolean(user.companyId || user.company_id);
  return role === 'ADMIN' && !hasComp;
};

/**
 * Resolve effective company_id enforcing strict token-based user company isolation.
 * If user has a company_id in users table, they can ONLY access their company data.
 * @param {Object} user - req.user
 * @param {number|string} [requestedCompanyId=null] - Query or body company_id
 * @returns {number|null}
 * @throws {ForbiddenError} If tenant user attempts to access another company
 */
export const resolveEffectiveCompanyId = (user, requestedCompanyId = null) => {
  const userCompId = user?.companyId || user?.company_id || null;

  if (canUserSelectCompany(user)) {
    if (requestedCompanyId) return Number(requestedCompanyId);
    return userCompId ? Number(userCompId) : null;
  }

  if (userCompId) {
    if (requestedCompanyId && Number(requestedCompanyId) !== Number(userCompId)) {
      throw new ForbiddenError('You do not have permission to access colors for another company');
    }
    return Number(userCompId);
  }

  return requestedCompanyId ? Number(requestedCompanyId) : null;
};

export default {
  toSlug,
  HEX_COLOR_REGEX,
  formatHexCode,
  generateColorCode,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
};

