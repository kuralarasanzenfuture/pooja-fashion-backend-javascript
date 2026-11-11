/**
 * Shared Logger Module
 * Central point of access for operational logging and API debugging utilities.
 */
import logger from './logger/logger.js';
import apiLogger from './logger/apiLogger.js';
import sensitiveDataFilter from './logger/sensitiveDataFilter.js';
import logFormatter from './logger/logFormatter.js';
import apiDetector from './logger/apiDetector.js';

export {
  logger,
  apiLogger,
  sensitiveDataFilter,
  logFormatter,
  apiDetector,
};

export default logger;
