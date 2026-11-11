/**
 * Centralized API Debugging Dashboard
 * In-Memory API Log Store
 *
 * Bounded circular in-memory buffer storing recent API request/response transactions.
 * Provides instant filtering, searching, and real-time statistics calculation.
 */

export const MAX_STORED_LOGS = 500;

export class ApiLogStore {
  constructor(maxLogs = MAX_STORED_LOGS) {
    this.maxLogs = maxLogs;
    this.logs = [];
  }

  /**
   * Add a new log entry to the top of the store
   * @param {object} logEntry
   * @returns {object} The stored entry
   */
  addLog(logEntry) {
    if (!logEntry || typeof logEntry !== 'object') return null;

    // Insert at front (newest first)
    this.logs.unshift(logEntry);

    // Enforce bounded memory size
    if (this.logs.length > this.maxLogs) {
      this.logs.length = this.maxLogs;
    }

    return logEntry;
  }

  /**
   * Retrieve filtered logs
   * @param {object} filters
   * @returns {Array<object>}
   */
  getLogs({
    search = '',
    method = 'ALL',
    status = 'ALL',
    module = 'ALL',
    success = 'ALL',
    limit = 100,
  } = {}) {
    let result = this.logs;

    // Method filter
    if (method && method !== 'ALL') {
      const targetMethod = String(method).toUpperCase();
      result = result.filter((item) => item.method === targetMethod);
    }

    // Module filter
    if (module && module !== 'ALL') {
      const targetModule = String(module).toUpperCase();
      result = result.filter((item) => item.module === targetModule);
    }

    // Success/Failure filter
    if (success !== 'ALL') {
      const isSuccessTarget = String(success).toLowerCase() === 'true';
      result = result.filter((item) => item.success === isSuccessTarget);
    }

    // Status code / class filter (e.g. "200", "400", "2xx", "4xx", "5xx")
    if (status && status !== 'ALL') {
      const s = String(status).trim().toLowerCase();
      if (s === '2xx') {
        result = result.filter((item) => item.status >= 200 && item.status < 300);
      } else if (s === '3xx') {
        result = result.filter((item) => item.status >= 300 && item.status < 400);
      } else if (s === '4xx') {
        result = result.filter((item) => item.status >= 400 && item.status < 500);
      } else if (s === '5xx') {
        result = result.filter((item) => item.status >= 500);
      } else {
        const numericStatus = Number(s);
        if (!isNaN(numericStatus)) {
          result = result.filter((item) => item.status === numericStatus);
        }
      }
    }

    // Search query filter (matches endpoint, module, category, subcategory, requestId)
    if (search && String(search).trim() !== '') {
      const query = String(search).trim().toLowerCase();
      result = result.filter((item) => {
        return (
          (item.endpoint && item.endpoint.toLowerCase().includes(query)) ||
          (item.module && item.module.toLowerCase().includes(query)) ||
          (item.category && item.category.toLowerCase().includes(query)) ||
          (item.subcategory && item.subcategory.toLowerCase().includes(query)) ||
          (item.requestId && item.requestId.toLowerCase().includes(query)) ||
          (item.controller && item.controller.toLowerCase().includes(query)) ||
          (item.service && item.service.toLowerCase().includes(query))
        );
      });
    }

    const maxItems = Math.min(Math.max(1, Number(limit) || 100), this.maxLogs);
    return result.slice(0, maxItems);
  }

  /**
   * Find a specific log by unique ID or requestId
   * @param {string} id
   * @returns {object|null}
   */
  getLogById(id) {
    if (!id) return null;
    return this.logs.find((item) => item.id === id || item.requestId === id) || null;
  }

  /**
   * Clear all stored logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Get total count of stored logs
   * @returns {number}
   */
  getCount() {
    return this.logs.length;
  }

  /**
   * Compute real-time dashboard statistics
   * @returns {object}
   */
  getStats() {
    const total = this.logs.length;
    let successful = 0;
    let failed = 0;
    let totalDuration = 0;

    const methods = {
      GET: 0,
      POST: 0,
      PUT: 0,
      PATCH: 0,
      DELETE: 0,
      OPTIONS: 0,
    };

    const statusCodes = {
      '2xx': 0,
      '3xx': 0,
      '4xx': 0,
      '5xx': 0,
    };

    const modulesSet = new Set();

    for (const item of this.logs) {
      if (item.success) {
        successful++;
      } else {
        failed++;
      }

      totalDuration += item.duration || 0;

      if (methods[item.method] !== undefined) {
        methods[item.method]++;
      }

      if (item.status >= 200 && item.status < 300) statusCodes['2xx']++;
      else if (item.status >= 300 && item.status < 400) statusCodes['3xx']++;
      else if (item.status >= 400 && item.status < 500) statusCodes['4xx']++;
      else if (item.status >= 500) statusCodes['5xx']++;

      if (item.module) {
        modulesSet.add(item.module);
      }
    }

    const avgDuration = total > 0 ? Number((totalDuration / total).toFixed(1)) : 0;

    return {
      total,
      successful,
      failed,
      avgDuration,
      methods,
      statusCodes,
      modules: Array.from(modulesSet).sort(),
    };
  }
}

// Export singleton instance
export const apiLogStore = new ApiLogStore();
export default apiLogStore;
