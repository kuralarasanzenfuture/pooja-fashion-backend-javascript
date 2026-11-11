/**
 * Product Master: Brands Utilities
 * Utility functions for brand code derivation, slug formatting,
 * logo upload extraction, and token-based multi-tenancy resolution.
 */
import ForbiddenError from '../../../../shared/errors/ForbiddenError.js';
import { toSlug as sharedToSlug } from '../../../../shared/utils/file.js';

export const toSlug = sharedToSlug;

/**
 * Extract uploaded logo URL and key from multer files dictionary
 * Supports 'logo', 'logo_url', or 'image' field names.
 * @param {Object} files - req.files object from multer
 * @param {string} [brandSlug='brand'] - Slug prefix for storage path
 * @returns {{ logo_url?: string, logo_key?: string }}
 */
export const extractUploadedLogo = (files, brandSlug = 'brand') => {
  const result = {};
  if (!files) return result;

  const slug = brandSlug || 'brand';

  if (files.logo && files.logo[0]) {
    result.logo_url = `/uploads/brands/${slug}/${files.logo[0].filename}`;
    result.logo_key = `brands/${slug}/${files.logo[0].filename}`;
  } else if (files.logo_url && files.logo_url[0]) {
    result.logo_url = `/uploads/brands/${slug}/${files.logo_url[0].filename}`;
    result.logo_key = `brands/${slug}/${files.logo_url[0].filename}`;
  } else if (files.image && files.image[0]) {
    result.logo_url = `/uploads/brands/${slug}/${files.image[0].filename}`;
    result.logo_key = `brands/${slug}/${files.image[0].filename}`;
  }

  return result;
};

/**
 * Generate standard uppercase brand code from brand name
 * E.g., "Puma Sports" -> "PUMA_SPORTS"
 * @param {string} name
 * @returns {string}
 */
export const generateBrandCode = (name) => {
  if (!name || typeof name !== 'string') return '';
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
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
      throw new ForbiddenError('You do not have permission to access brands for another company');
    }
    return Number(userCompId);
  }

  return requestedCompanyId ? Number(requestedCompanyId) : null;
};

export default {
  toSlug,
  extractUploadedLogo,
  generateBrandCode,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
};

