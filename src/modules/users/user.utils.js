import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a plain text password using bcrypt
 *
 * @param {string} password
 * @returns {Promise<string>}
 */
export const hashPassword = async (password) => {
  if (!password || typeof password !== 'string') {
    throw new Error('Password string is required for hashing');
  }
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare plain text password against hashed password
 *
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (password, hash) => {
  if (!password || !hash) {
    return false;
  }
  return bcrypt.compare(password, hash);
};

/**
 * Validate password strength
 * Rules:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit or special symbol
 *
 * @param {string} password
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validatePasswordStrength = (password) => {
  const errors = [];

  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required'] };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one number or special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Normalize and sanitize username
 *
 * @param {string} username
 * @returns {string}
 */
export const normalizeUsername = (username) => {
  if (!username || typeof username !== 'string') return '';
  return username.trim().toLowerCase();
};

/**
 * Check if a user account is currently locked
 *
 * @param {Object} user
 * @returns {boolean}
 */
export const isAccountLocked = (user) => {
  if (!user) return false;
  if (user.status === 'locked' || user.status === 'blocked') {
    if (user.locked_until) {
      return new Date(user.locked_until) > new Date();
    }
    return true;
  }
  return false;
};

export default {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  normalizeUsername,
  isAccountLocked,
};
