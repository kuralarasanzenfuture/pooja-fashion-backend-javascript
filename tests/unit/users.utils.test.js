import {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  normalizeUsername,
  isAccountLocked,
} from '../../src/modules/users/user.utils.js';

describe('User Utilities Module', () => {
  describe('hashPassword and comparePassword', () => {
    it('should hash a password and verify matching password returns true', async () => {
      const password = 'StrongPassword123!';
      const hash = await hashPassword(password);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);

      const isMatch = await comparePassword(password, hash);
      expect(isMatch).toBe(true);
    });

    it('should return false when comparing incorrect password', async () => {
      const hash = await hashPassword('CorrectPassword123!');
      const isMatch = await comparePassword('WrongPassword123!', hash);
      expect(isMatch).toBe(false);
    });

    it('should throw error when hashing empty password', async () => {
      await expect(hashPassword('')).rejects.toThrow();
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong password successfully', () => {
      const result = validatePasswordStrength('SecureP@ss123');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail if password is too short', () => {
      const result = validatePasswordStrength('Sh0rt!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should fail if missing uppercase letter', () => {
      const result = validatePasswordStrength('lowercase123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should fail if missing lowercase letter', () => {
      const result = validatePasswordStrength('UPPERCASE123!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should fail if missing numbers or special characters', () => {
      const result = validatePasswordStrength('LettersOnlyPass');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one number or special character'
      );
    });
  });

  describe('normalizeUsername', () => {
    it('should trim and lowercase username', () => {
      expect(normalizeUsername('  JohnDoe  ')).toBe('johndoe');
      expect(normalizeUsername('ADMIN_01')).toBe('admin_01');
      expect(normalizeUsername('')).toBe('');
      expect(normalizeUsername(null)).toBe('');
    });
  });

  describe('isAccountLocked', () => {
    it('should return false for active unlocked user', () => {
      expect(isAccountLocked({ status: 'active', locked_until: null })).toBe(false);
    });

    it('should return true if status is blocked', () => {
      expect(isAccountLocked({ status: 'blocked' })).toBe(true);
    });

    it('should return true if locked_until is in the future', () => {
      const future = new Date(Date.now() + 10 * 60000).toISOString();
      expect(isAccountLocked({ status: 'locked', locked_until: future })).toBe(true);
    });

    it('should return false if locked_until is in the past', () => {
      const past = new Date(Date.now() - 10 * 60000).toISOString();
      expect(isAccountLocked({ status: 'locked', locked_until: past })).toBe(false);
    });
  });
});
