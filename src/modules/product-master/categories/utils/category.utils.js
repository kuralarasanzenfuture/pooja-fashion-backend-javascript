/**
 * Product Master: Categories Utilities
 * Utility functions for category code derivation, slug formatting,
 * image payload extraction, and token-based multi-tenancy resolution.
 */
import ForbiddenError from '../../../../shared/errors/ForbiddenError.js';

/**
 * Format string into a URL-friendly slug
 * @param {string} text
 * @returns {string}
 */
export const toSlug = (text) => {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Extract uploaded image URL and key from multer files dictionary
 * @param {Object} files - req.files object
 * @param {string} [slug='category'] - Slug prefix for image path
 * @returns {{ image_url?: string, image_key?: string }}
 */
export const extractUploadedImage = (files, slug = 'category') => {
  const result = {};
  if (!files) return result;

  const targetSlug = slug || 'category';

  if (files.image && files.image[0]) {
    result.image_url = `/uploads/categories/${targetSlug}/${files.image[0].filename}`;
    result.image_key = `categories/${targetSlug}/${files.image[0].filename}`;
  } else if (files.image_url && files.image_url[0]) {
    result.image_url = `/uploads/categories/${targetSlug}/${files.image_url[0].filename}`;
    result.image_key = `categories/${targetSlug}/${files.image_url[0].filename}`;
  }

  return result;
};

/**
 * Generate standard uppercase category code from category name
 * E.g., "Women's Ethnic Wear" -> "WOMEN_S_ETHNIC_WEAR"
 * @param {string} name
 * @returns {string}
 */
export const generateCategoryCode = (name) => {
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
      throw new ForbiddenError('You do not have permission to access categories for another company');
    }
    return Number(userCompId);
  }

  return requestedCompanyId ? Number(requestedCompanyId) : null;
};

export default {
  toSlug,
  extractUploadedImage,
  generateCategoryCode,
  canUserSelectCompany,
  resolveEffectiveCompanyId,
};

