/**
 * Centralized API Debugging Dashboard
 * Console Log Controller
 *
 * Handles HTTP dashboard requests: serving dashboard HTML,
 * returning in-memory log history, managing SSE connections, and clearing logs.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import env from '../../config/env.js';
import { consoleLogService } from './consoleLog.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DASHBOARD_HTML_PATH = path.join(__dirname, 'public', 'index.html');

export class ConsoleLogController {
  /**
   * Serve the Live HTML API Debugging Dashboard
   * GET /__dev/api-logs
   */
  serveDashboard(req, res) {
    if (env.IS_PRODUCTION || env.NODE_ENV === 'production') {
      return res.status(404).send('Not Found');
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.sendFile(DASHBOARD_HTML_PATH);
  }

  /**
   * Retrieve recent in-memory log history with optional filters
   * GET /__dev/api-logs/data
   */
  getLogData(req, res) {
    if (env.IS_PRODUCTION || env.NODE_ENV === 'production') {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }

    const {
      search = '',
      method = 'ALL',
      status = 'ALL',
      module = 'ALL',
      success = 'ALL',
      limit = 100,
    } = req.query;

    const result = consoleLogService.getLogs({
      search,
      method,
      status,
      module,
      success,
      limit: Number(limit) || 100,
    });

    return res.status(200).json({
      success: true,
      environment: env.NODE_ENV,
      count: result.count,
      totalStored: result.totalStored,
      activeClients: result.activeClients,
      stats: result.stats,
      data: result.logs,
    });
  }

  /**
   * Retrieve a single log detail by ID
   * GET /__dev/api-logs/data/:id
   */
  getLogDetail(req, res) {
    if (env.IS_PRODUCTION || env.NODE_ENV === 'production') {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }

    const log = consoleLogService.getLogById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Log entry not found' });
    }

    return res.status(200).json({
      success: true,
      data: log,
    });
  }

  /**
   * Real-time Server-Sent Events (SSE) Stream
   * GET /__dev/api-logs/stream
   */
  streamLogs(req, res) {
    if (env.IS_PRODUCTION || env.NODE_ENV === 'production') {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }

    consoleLogService.connectStream(req, res);
  }

  /**
   * Clear all in-memory API logs
   * DELETE /__dev/api-logs
   */
  clearLogs(req, res) {
    if (env.IS_PRODUCTION || env.NODE_ENV === 'production') {
      return res.status(404).json({ success: false, message: 'Not Found' });
    }

    const result = consoleLogService.clearLogs();
    return res.status(200).json(result);
  }
}

// Export singleton instance
export const consoleLogController = new ConsoleLogController();
export default consoleLogController;

