/**
 * Auth Module Type Definitions
 * Complete JSDoc typings for authentication payloads, tokens, sessions,
 * login history, and device client metadata.
 */

/**
 * @typedef {Object} ClientInfo
 * @property {string|null} ipAddress - Client IPv4 / IPv6 address
 * @property {string|null} userAgent - Raw User-Agent string
 * @property {string|null} browser - Detected browser name (Chrome, Firefox, Safari, Edge, etc.)
 * @property {string|null} browserVersion - Detected browser version
 * @property {string|null} operatingSystem - Detected OS (Windows, macOS, Linux, Android, iOS)
 * @property {string|null} osVersion - Detected OS version
 * @property {string|null} deviceType - Desktop, Mobile, Tablet, Bot
 * @property {string|null} deviceName - Human-readable device string
 * @property {string|null} countryCode - Country code (if provided/geolocated)
 * @property {string|null} countryName - Country name
 * @property {string|null} city - City name
 */

/**
 * @typedef {Object} TokenPair
 * @property {string} accessToken - Short-lived signed JWT access token
 * @property {string} refreshToken - Long-lived cryptographically random refresh token
 * @property {string} sessionId - UUID of the session
 * @property {number} expiresIn - Access token validity duration in seconds
 */

/**
 * @typedef {Object} SessionEntity
 * @property {string} id - UUID primary key
 * @property {number} user_id - Associated user ID
 * @property {string|null} device_name
 * @property {string|null} device_type
 * @property {string|null} browser
 * @property {string|null} browser_version
 * @property {string|null} operating_system
 * @property {string|null} os_version
 * @property {string|null} user_agent
 * @property {string|null} ip_address
 * @property {boolean} is_active
 * @property {string} created_at
 * @property {string|null} last_activity_at
 * @property {string} expires_at
 * @property {string|null} revoked_at
 * @property {string|null} revoked_reason
 */

/**
 * @typedef {Object} SessionDTO
 * @property {string} id
 * @property {number} userId
 * @property {string|null} deviceName
 * @property {string|null} deviceType
 * @property {string|null} browser
 * @property {string|null} browserVersion
 * @property {string|null} operatingSystem
 * @property {string|null} osVersion
 * @property {string|null} ipAddress
 * @property {boolean} isActive
 * @property {boolean} isCurrent - Whether this matches the caller's active session
 * @property {string} createdAt
 * @property {string|null} lastActivityAt
 * @property {string} expiresAt
 */

/**
 * @typedef {Object} LoginHistoryEntity
 * @property {number} id
 * @property {number|null} user_id
 * @property {string|null} username
 * @property {string|null} email
 * @property {'success'|'failed'|'blocked'|'locked'|'logout'} status
 * @property {string|null} reason
 * @property {string|null} ip_address
 * @property {string|null} user_agent
 * @property {string|null} device_name
 * @property {string|null} device_type
 * @property {string|null} browser
 * @property {string|null} operating_system
 * @property {string|null} country_name
 * @property {string|null} city
 * @property {string} login_at
 * @property {string|null} session_id
 */

/**
 * @typedef {Object} LoginHistoryDTO
 * @property {number} id
 * @property {number|null} userId
 * @property {string|null} username
 * @property {string|null} email
 * @property {string} status
 * @property {string|null} reason
 * @property {string|null} ipAddress
 * @property {string|null} deviceName
 * @property {string|null} deviceType
 * @property {string|null} browser
 * @property {string|null} operatingSystem
 * @property {string|null} countryName
 * @property {string|null} city
 * @property {string} loginAt
 * @property {string|null} sessionId
 */

export {};
