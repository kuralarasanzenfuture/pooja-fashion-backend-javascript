/**
 * Product Master: Taxes Utilities
 * Utility functions for tax code derivation, slug formatting,
 * and token-based multi-tenancy resolution.
 */
import ForbiddenError from '../../../../shared/errors/ForbiddenError.js';
import { toSlug as sharedToSlug } from '../../../../shared/utils/file.js';

export const toSlug = sharedToSlug;

/**
 * Generate standard uppercase tax code from name or rate
 * E.g., "GST 18%" -> "GST_18"
 * @param {string} name
 * @param {number} [rate]
 * @returns {string}
 */
export const generateTaxCode = (name, rate = null) => {
  if (name && typeof name === 'string') {
    const cleaned = name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 50);
    if (cleaned) return cleaned;
  }
  if (rate !== null && rate !== undefined) {
    return `GST_${rate}`;
  }
  return '';
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
      throw new ForbiddenError('You do not have permission to access taxes for another company');
    }
    return Number(userCompId);
  }

  return requestedCompanyId ? Number(requestedCompanyId) : null;
};

export default {
  toSlug,
  generateTaxCode,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
};

