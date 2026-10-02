import { requireRoles, adminOnly, superAdminOnly } from './auth.middleware.js';

export { requireRoles, adminOnly, superAdminOnly };

export const requireAdmin = adminOnly;
export const requireSuperAdmin = superAdminOnly;

export default {
  requireRoles,
  adminOnly,
  superAdminOnly,
  requireAdmin,
  requireSuperAdmin,
};
