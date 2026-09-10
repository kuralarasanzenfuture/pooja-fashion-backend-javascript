import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import env from '../../config/env.js';

const ACCESS_SECRET =
  env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET || 'local-dev-access-secret';

const ACCESS_TOKEN_EXPIRY = env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_TOKEN_DAYS = 30;

/**
 * Extract client IP address from express request, supporting reverse proxies
 *
 * @param {import('express').Request} req
 * @returns {string|null}
 */
export const getClientIp = (req) => {
  if (!req) return null;

  const forwarded = req.headers['x-forwarded-for'];
  let ip = null;

  if (forwarded) {
    ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : forwarded[0];
  } else if (req.headers['x-real-ip']) {
    ip = String(req.headers['x-real-ip']).trim();
  } else if (req.ip) {
    ip = req.ip;
  } else if (req.socket?.remoteAddress) {
    ip = req.socket.remoteAddress;
  }

  if (ip && ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  return ip || '127.0.0.1';
};

/**
 * Parse client device, browser, and operating system from User-Agent
 *
 * @param {import('express').Request} req
 * @returns {import('./auth.types.js').ClientInfo}
 */
export const parseClientInfo = (req) => {
  const ipAddress = getClientIp(req);
  const userAgent = req.headers['user-agent'] || '';

  let browser = 'Unknown Browser';
  let browserVersion = null;
  let operatingSystem = 'Unknown OS';
  let osVersion = null;
  let deviceType = 'Desktop';

  // Device detection
  if (/mobile/i.test(userAgent) && !/ipad|tablet/i.test(userAgent)) {
    deviceType = 'Mobile';
  } else if (/ipad|tablet/i.test(userAgent)) {
    deviceType = 'Tablet';
  } else if (/bot|crawler|spider|curl|postman/i.test(userAgent)) {
    deviceType = 'Bot/Tool';
  }

  // Operating System detection
  if (/windows nt 10\.0/i.test(userAgent)) {
    operatingSystem = 'Windows';
    osVersion = '10/11';
  } else if (/windows nt 6\.3/i.test(userAgent)) {
    operatingSystem = 'Windows';
    osVersion = '8.1';
  } else if (/windows nt 6\.1/i.test(userAgent)) {
    operatingSystem = 'Windows';
    osVersion = '7';
  } else if (/windows/i.test(userAgent)) {
    operatingSystem = 'Windows';
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    operatingSystem = 'iOS';
    const match = userAgent.match(/os (\d+[._\d]+)/i);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (/macintosh|mac os x/i.test(userAgent)) {
    operatingSystem = 'macOS';
    const match = userAgent.match(/mac os x (\d+[._\d]+)/i);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (/android/i.test(userAgent)) {
    operatingSystem = 'Android';
    const match = userAgent.match(/android (\d+[._\d]+)/i);
    if (match) osVersion = match[1];
  } else if (/linux/i.test(userAgent)) {
    operatingSystem = 'Linux';
  }

  // Browser detection
  if (/postmanruntime/i.test(userAgent)) {
    browser = 'Postman';
  } else if (/edg\//i.test(userAgent)) {
    browser = 'Edge';
    const match = userAgent.match(/edg\/(\d+[\.\d]+)/i);
    if (match) browserVersion = match[1];
  } else if (/opr\/|opera/i.test(userAgent)) {
    browser = 'Opera';
    const match = userAgent.match(/(?:opr|opera)[\/\s](\d+[\.\d]+)/i);
    if (match) browserVersion = match[1];
  } else if (/chrome\//i.test(userAgent) && !/edg\//i.test(userAgent)) {
    browser = 'Chrome';
    const match = userAgent.match(/chrome\/(\d+[\.\d]+)/i);
    if (match) browserVersion = match[1];
  } else if (/firefox\//i.test(userAgent)) {
    browser = 'Firefox';
    const match = userAgent.match(/firefox\/(\d+[\.\d]+)/i);
    if (match) browserVersion = match[1];
  } else if (/safari\//i.test(userAgent) && !/chrome/i.test(userAgent)) {
    browser = 'Safari';
    const match = userAgent.match(/version\/(\d+[\.\d]+)/i);
    if (match) browserVersion = match[1];
  } else if (/curl/i.test(userAgent)) {
    browser = 'cURL';
  }

  const deviceName = `${operatingSystem}${osVersion ? ` ${osVersion}` : ''} (${browser})`;

  return {
    ipAddress,
    userAgent: userAgent || null,
    browser,
    browserVersion,
    operatingSystem,
    osVersion,
    deviceType,
    deviceName,
    countryCode: req.headers['cf-ipcountry'] || null,
    countryName: null,
    city: null,
  };
};

/**
 * Generate cryptographic SHA-256 hash of a string (e.g. refresh token)
 *
 * @param {string} token
 * @returns {string} Hex encoded hash
 */
export const hashToken = (token) => {
  if (!token || typeof token !== 'string') {
    throw new Error('Token string is required for hashing');
  }
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate cryptographically secure random refresh token string
 *
 * @returns {string}
 */
export const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

/**
 * Generate signed JWT access token
 *
 * @param {Object} payload
 * @returns {string}
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

/**
 * Calculate expiration timestamp for refresh token
 *
 * @param {number} [days=REFRESH_TOKEN_DAYS]
 * @returns {Date}
 */
export const getRefreshTokenExpiry = (days = REFRESH_TOKEN_DAYS) => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
};

/**
 * Helper to build safe HTTP-only cookie options
 *
 * @param {boolean} [isRefreshToken=false]
 * @returns {import('express').CookieOptions}
 */
export const getCookieOptions = (isRefreshToken = false) => {
  const maxAge = isRefreshToken
    ? REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000 // 30 days
    : 15 * 60 * 1000; // 15 mins

  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge,
    path: '/',
  };
};

export default {
  getClientIp,
  parseClientInfo,
  hashToken,
  generateRefreshToken,
  generateAccessToken,
  getRefreshTokenExpiry,
  getCookieOptions,
};
