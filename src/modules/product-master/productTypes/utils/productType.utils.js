/**
 * Product Master: Product Types Utilities
 * Utility functions for product type code derivation, slug formatting,
 * and token-based multi-tenancy resolution.
 */
import ForbiddenError from '../../../../shared/errors/ForbiddenError.js';
import { toSlug as sharedToSlug } from '../../../../shared/utils/file.js';

export const toSlug = sharedToSlug;

/**
 * Generate standard uppercase product type code from name
 * E.g., "Ready Made Garments" -> "READY_MADE_GARMENTS"
 * @param {string} name
 * @returns {string}
 */
export const generateProductTypeCode = (name) => {
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
  if (!user) {
    return requestedCompanyId ? Number(requestedCompanyId) : null;
  }

  const userCompanyId = user.companyId || user.company_id;

  if (canUserSelectCompany(user)) {
    if (requestedCompanyId) {
      return Number(requestedCompanyId);
    }
    return userCompanyId ? Number(userCompanyId) : null;
  }

  if (userCompanyId) {
    if (requestedCompanyId && Number(requestedCompanyId) !== Number(userCompanyId)) {
      throw new ForbiddenError(
        'You do not have permission to view or manage product types for another company'
      );
    }
    return Number(userCompanyId);
  }

  return requestedCompanyId ? Number(requestedCompanyId) : null;
};

export default {
  toSlug,
  generateProductTypeCode,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
};

