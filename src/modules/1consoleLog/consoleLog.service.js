/**
 * Centralized API Debugging Dashboard
 * Console Log Service
 *
 * Coordinates log formatting, bounded in-memory persistence,
 * querying, and real-time SSE streaming.
 */
import { formatLogEntry } from './utils/logFormatter.js';
import { apiLogStore } from './services/apiLogStore.js';
import { apiLogStream } from './services/apiLogStream.js';

export class ConsoleLogService {
  constructor(store = apiLogStore, stream = apiLogStream) {
    this.store = store;
    this.stream = stream;
  }

  /**
   * Record, store, and stream a completed API transaction
   *
   * @param {object} params
   * @param {object} params.req - Express request
   * @param {object} params.res - Express response
   * @param {*} [params.responseBody] - Parsed response payload
   * @param {number} [params.duration] - Execution duration in ms
   * @param {object} [params.apiContext] - Explicit or detected API metadata
   * @param {Error|null} [params.error] - Optional error object
   * @returns {object} Formatted log entry
   */
  recordLog({
    req,
    res,
    responseBody = null,
    duration = 0,
    apiContext = {},
    error = null,
  }) {
    try {
      const logEntry = formatLogEntry({
        req,
        res,
        responseBody,
        duration,
        apiContext,
        error,
      });

      // 1. Add to bounded in-memory store
      this.store.addLog(logEntry);

      // 2. Broadcast in real time to all connected SSE browser clients
      this.stream.broadcastLog(logEntry);

      return logEntry;
    } catch (err) {
      // Logging errors must never interrupt application execution
      return null;
    }
  }

  /**
   * Retrieve filtered log history and current stats
   * @param {object} query - Query parameters from controller
   * @returns {object} { logs, stats, count }
   */
  getLogs(query = {}) {
    const logs = this.store.getLogs(query);
    const stats = this.store.getStats();

    return {
      logs,
      stats,
      count: logs.length,
      totalStored: this.store.getCount(),
      activeClients: this.stream.getClientCount(),
    };
  }

  /**
   * Get single log details by ID
   * @param {string} id
   * @returns {object|null}
   */
  getLogById(id) {
    return this.store.getLogById(id);
  }

  /**
   * Clear all logs and notify connected clients
   */
  clearLogs() {
    this.store.clearLogs();
    this.stream.broadcastClear();

    return {
      success: true,
      message: 'In-memory API logs cleared successfully',
      clearedAt: new Date().toISOString(),
    };
  }

  /**
   * Connect an incoming HTTP request as an SSE stream client
   * @param {object} req
   * @param {object} res
   */
  connectStream(req, res) {
    this.stream.addClient(req, res);
  }

  /**
   * Get real-time statistics
   * @returns {object}
   */
  getStats() {
    return this.store.getStats();
  }
}

// Export singleton instance
export const consoleLogService = new ConsoleLogService();
export default consoleLogService;

