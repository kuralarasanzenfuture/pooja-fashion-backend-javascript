/**
 * Company Utilities Module
 * Provides meaningful company code generation and standard naming helpers.
 */

/**
 * Common corporate suffixes and stop words to ignore when deriving meaningful initials
 */
const STOP_WORDS = new Set([
  'pvt',
  'private',
  'ltd',
  'limited',
  'llp',
  'inc',
  'corp',
  'corporation',
  'co',
  'company',
  'and',
  'the',
  '&',
]);

/**
 * Derive meaningful prefix from company name
 * Examples:
 * - "Pooja Fashion Shop" -> "PFS"
 * - "Pooja Fashion Sarees" -> "PFS"
 * - "Royal Boutique & Studio" -> "RBS"
 * - "Sri Lakshmi Silks" -> "SLS"
 * - "Pooja Boutique" -> "PB" (or "PJB")
 * - "Fabindia" -> "FAB"
 * - "" -> "PFS"
 *
 * @param {string} companyName
 * @returns {string}
 */
export const deriveCompanyPrefix = (companyName) => {
  if (!companyName || typeof companyName !== 'string') {
    return 'PFS';
  }

  // Remove special characters, split into cleaned words
  const words = companyName
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0 && !STOP_WORDS.has(w.toLowerCase()));

  if (words.length >= 3) {
    // 3 or more words: Take first letter of the first 3 words (e.g. "Pooja Fashion Shop" -> "PFS")
    return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  }

  if (words.length === 2) {
    // 2 words: e.g. "Pooja Fashion" -> 'PFS' if second word has 's' or 'PF' + second letter
    const w1 = words[0].toUpperCase();
    const w2 = words[1].toUpperCase();

    // Check if second word starts with or contains 'S' (like Sarees, Silk, Studio, Store, Style)
    if (w2.startsWith('S') || w2.includes('S')) {
      return (w1[0] + 'F' + 'S').toUpperCase().slice(0, 3);
    }
    const combined = (w1[0] + w2.slice(0, 2)).toUpperCase();
    return combined.length >= 3 ? combined : (w1.slice(0, 2) + w2[0]).toUpperCase();
  }

  if (words.length === 1) {
    // Single word: Take first 3 letters (e.g. "Fabindia" -> "FAB", "Zara" -> "ZAR")
    const clean = words[0].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return clean.slice(0, 3) || 'PFS';
  }

  return 'PFS';
};

/**
 * Generate a meaningful, sequential company code
 * Example sequence: PFS001, PFS002, PFS003...
 *
 * @param {Object} params
 * @param {string} [params.companyName] - Name of the company
 * @param {string[]} [params.existingCodes=[]] - Already assigned company codes in DB
 * @returns {string} - Meaningful unique uppercase company code
 */
export const generateCompanyCode = ({ companyName, existingCodes = [] }) => {
  const existingSet = new Set(
    existingCodes.filter(Boolean).map((code) => String(code).trim().toUpperCase())
  );

  let prefix = deriveCompanyPrefix(companyName);
  prefix = prefix.replace(/[^A-Z0-9]/g, '').toUpperCase();
  if (prefix.length < 2) prefix = 'PFS';

  // Iterate sequential 3-digit numbers starting from 001
  let sequence = 1;
  while (sequence < 10000) {
    const seqStr = String(sequence).padStart(3, '0');
    const candidate = `${prefix}${seqStr}`;

    if (!existingSet.has(candidate)) {
      return candidate;
    }
    sequence++;
  }

  // Fallback with timestamp slice in extreme collision case
  return `${prefix}${Date.now().toString().slice(-4)}`;
};

export default {
  deriveCompanyPrefix,
  generateCompanyCode,
};
