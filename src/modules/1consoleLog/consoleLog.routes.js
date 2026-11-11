/**
 * Centralized API Debugging Dashboard
 * Dashboard Routes
 *
 * Exposes development-only routes:
 * - GET    /__dev/api-logs         -> HTML Dashboard
 * - GET    /__dev/api-logs/data    -> Recent Log History (JSON)
 * - GET    /__dev/api-logs/data/:id-> Single Log Detail (JSON)
 * - GET    /__dev/api-logs/stream  -> Server-Sent Events (SSE) Live Feed
 * - DELETE /__dev/api-logs         -> Clear Logs Buffer
 * - GET    /__dev/api-logs/css/*   -> Static CSS
 * - GET    /__dev/api-logs/js/*    -> Static JS
 */
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { consoleLogController } from './consoleLog.controller.js';
import { ensureDevelopmentOnly } from './consoleLog.middleware.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, 'public');

// Strict development-only guard on entire router
router.use(ensureDevelopmentOnly);

// Allow cross-origin access from any local dev origin to the dashboard
router.use(cors({ origin: true, credentials: true }));

// Static assets (CSS, JS)
router.use(express.static(PUBLIC_DIR, { index: false }));

// Direct explicit fallback routes for static assets
router.get('/css/dashboard.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(path.join(PUBLIC_DIR, 'css', 'dashboard.css'));
});

router.get('/js/dashboard.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(PUBLIC_DIR, 'js', 'dashboard.js'));
});

// Primary Dashboard Routes
router.get('/', consoleLogController.serveDashboard);
router.get('/data', consoleLogController.getLogData);
router.get('/data/:id', consoleLogController.getLogDetail);
router.get('/stream', consoleLogController.streamLogs);
router.delete('/', consoleLogController.clearLogs);

export default router;

