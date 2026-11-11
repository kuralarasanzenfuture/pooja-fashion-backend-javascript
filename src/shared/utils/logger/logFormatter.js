/**
 * Centralized API Debugging & Logging System
 * Log Formatter
 *
 * Produces structured, colorized terminal outputs for development API debugging.
 * Method Colors:
 * - GET    : Blue
 * - POST   : Green
 * - PUT    : Yellow
 * - PATCH  : Cyan
 * - DELETE : Red
 * - ERROR  : Bold Red
 */
import { safeFormatJson } from './sensitiveDataFilter.js';

export const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
  white: '\x1b[37m',
};

const BORDER_LINE = '========================================================';

export const getMethodColor = (method = '') => {
  switch (method.toUpperCase()) {
    case 'GET':
      return COLORS.blue;
    case 'POST':
      return COLORS.green;
    case 'PUT':
      return COLORS.yellow;
    case 'PATCH':
      return COLORS.cyan;
    case 'DELETE':
      return COLORS.red;
    default:
      return COLORS.magenta;
  }
};

/**
 * Format timestamp as YYYY-MM-DD HH:mm:ss
 */
export const formatTimestamp = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Build standard header block
 */
const buildHeader = ({
  title,
  module = 'GENERAL',
  category = 'GENERAL API',
  subcategory = 'REQUEST',
  method = 'GET',
  endpoint = '/',
  time = formatTimestamp(),
  requestId = null,
  color = COLORS.blue,
}) => {
  const lines = [
    `${color}${BORDER_LINE}${COLORS.reset}`,
    `${color}${COLORS.bold}[API DEBUG] ${title}${COLORS.reset}`,
    `${color}${BORDER_LINE}${COLORS.reset}`,
    `MODULE       : ${module}`,
  ];

  if (category) {
    lines.push(`CATEGORY     : ${category}`);
  }
  if (subcategory) {
    lines.push(`SUBCATEGORY  : ${subcategory}`);
  }
  lines.push(`METHOD       : ${method.toUpperCase()}`);
  lines.push(`ENDPOINT     : ${endpoint}`);
  lines.push(`TIME         : ${time}`);
  if (requestId) {
    lines.push(`REQUEST ID   : ${requestId}`);
  }
  lines.push(`${color}${BORDER_LINE}${COLORS.reset}`);

  return lines.join('\n');
};

/**
 * Format POST Request Debug Log
 */
export const formatPostRequest = ({
  module,
  category,
  subcategory,
  method = 'POST',
  endpoint,
  time,
  requestId,
  frontendData,
  backendData,
  controller,
  service,
  database,
  status,
  success,
  responseData,
  duration,
}) => {
  const color = COLORS.green;
  const sections = [];

  // Header
  sections.push(
    buildHeader({
      title: 'POST REQUEST',
      module,
      category,
      subcategory,
      method,
      endpoint,
      time,
      requestId,
      color,
    })
  );

  // Frontend Request Data
  sections.push(`\n[FRONTEND REQUEST DATA]\n${safeFormatJson(frontendData || {})}`);

  // Backend Request Body
  sections.push(`\n[BACKEND REQUEST]\nBody:\n${safeFormatJson(backendData || frontendData || {})}`);

  // Backend Processing
  const processingLines = ['\n[BACKEND PROCESSING]'];
  if (controller) processingLines.push(`Controller    : ${controller}`);
  if (service) processingLines.push(`Service       : ${service}`);
  if (database) processingLines.push(`Database      : ${database}`);
  sections.push(processingLines.join('\n'));

  // API Response
  const responseLines = [
    '\n[API RESPONSE]',
    `Status        : ${status}`,
    `Success       : ${success !== undefined ? success : status < 400}`,
  ];
  if (responseData !== undefined && responseData !== null) {
    responseLines.push('\nResponse Data:');
    responseLines.push(safeFormatJson(responseData));
  }
  sections.push(responseLines.join('\n'));

  // Footer & Completion
  sections.push(
    `\nExecution Time: ${duration}ms\n${color}[API DEBUG] POST COMPLETED\n${BORDER_LINE}${COLORS.reset}`
  );

  return sections.join('\n');
};

/**
 * Format GET Request Debug Log
 */
export const formatGetRequest = ({
  module,
  category,
  subcategory,
  method = 'GET',
  endpoint,
  time,
  requestId,
  params = {},
  query = {},
  controller,
  service,
  operation,
  status,
  success,
  responseData,
  duration,
}) => {
  const color = COLORS.blue;
  const sections = [];

  // Header
  sections.push(
    buildHeader({
      title: 'GET REQUEST',
      module,
      category,
      subcategory,
      method,
      endpoint,
      time,
      requestId,
      color,
    })
  );

  // Request Parameters (Params & Query)
  sections.push(
    `\n[REQUEST PARAMETERS]\nParams:\n${safeFormatJson(params || {})}\n\nQuery:\n${safeFormatJson(query || {})}`
  );

  // Backend Processing
  const processingLines = ['\n[BACKEND PROCESSING]'];
  if (controller) processingLines.push(`Controller : ${controller}`);
  if (service) processingLines.push(`Service    : ${service}`);
  if (operation) processingLines.push(`Operation  : ${operation}`);
  sections.push(processingLines.join('\n'));

  // API Response
  const responseLines = [
    '\n[API RESPONSE]',
    `Status     : ${status}`,
    `Success    : ${success !== undefined ? success : status < 400}`,
  ];
  if (responseData !== undefined && responseData !== null) {
    responseLines.push('\nResponse Data:');
    responseLines.push(safeFormatJson(responseData));
  }
  sections.push(responseLines.join('\n'));

  // Footer & Completion
  sections.push(
    `\nExecution Time: ${duration}ms\n${color}[API DEBUG] GET COMPLETED\n${BORDER_LINE}${COLORS.reset}`
  );

  return sections.join('\n');
};

/**
 * Format PUT Request Debug Log
 */
export const formatPutRequest = ({
  module,
  category,
  subcategory,
  method = 'PUT',
  endpoint,
  time,
  requestId,
  params = {},
  frontendData,
  controller,
  service,
  operation,
  status,
  success,
  responseData,
  duration,
}) => {
  const color = COLORS.yellow;
  const sections = [];

  sections.push(
    buildHeader({
      title: 'PUT REQUEST',
      module,
      category,
      subcategory,
      method,
      endpoint,
      time,
      requestId,
      color,
    })
  );

  if (params && Object.keys(params).length > 0) {
    sections.push(`\n[REQUEST PARAMS]\n${safeFormatJson(params)}`);
  }

  sections.push(`\n[FRONTEND REQUEST DATA]\n${safeFormatJson(frontendData || {})}`);

  const processingLines = ['\n[BACKEND PROCESSING]'];
  if (controller) processingLines.push(`Controller : ${controller}`);
  if (service) processingLines.push(`Service    : ${service}`);
  if (operation) processingLines.push(`Operation  : ${operation}`);
  sections.push(processingLines.join('\n'));

  const responseLines = [
    '\n[API RESPONSE]',
    `Status  : ${status}`,
    `Success : ${success !== undefined ? success : status < 400}`,
  ];
  if (responseData !== undefined && responseData !== null) {
    responseLines.push('\nResponse Data:');
    responseLines.push(safeFormatJson(responseData));
  }
  sections.push(responseLines.join('\n'));

  sections.push(
    `\nExecution Time: ${duration}ms\n${color}[API DEBUG] PUT COMPLETED\n${BORDER_LINE}${COLORS.reset}`
  );

  return sections.join('\n');
};

/**
 * Format PATCH Request Debug Log
 */
export const formatPatchRequest = ({
  module,
  category,
  subcategory,
  method = 'PATCH',
  endpoint,
  time,
  requestId,
  params = {},
  frontendData,
  updatedFields,
  controller,
  service,
  operation,
  status,
  success,
  responseData,
  duration,
}) => {
  const color = COLORS.cyan;
  const sections = [];

  sections.push(
    buildHeader({
      title: 'PATCH REQUEST',
      module,
      category,
      subcategory,
      method,
      endpoint,
      time,
      requestId,
      color,
    })
  );

  if (params && Object.keys(params).length > 0) {
    sections.push(`\n[REQUEST PARAMS]\n${safeFormatJson(params)}`);
  }

  sections.push(`\n[FRONTEND REQUEST DATA]\n${safeFormatJson(frontendData || {})}`);

  const processingLines = ['\n[BACKEND PROCESSING]'];
  if (controller) processingLines.push(`Controller    : ${controller}`);
  if (service) processingLines.push(`Service       : ${service}`);
  if (operation) processingLines.push(`Operation     : ${operation}`);

  const fields = updatedFields || (frontendData ? Object.keys(frontendData) : []);
  if (fields.length > 0) {
    processingLines.push(`Updated Fields:\n${safeFormatJson(fields)}`);
  }
  sections.push(processingLines.join('\n'));

  const responseLines = [
    '\n[API RESPONSE]',
    `Status  : ${status}`,
    `Success : ${success !== undefined ? success : status < 400}`,
  ];
  if (responseData !== undefined && responseData !== null) {
    responseLines.push('\nResponse Data:');
    responseLines.push(safeFormatJson(responseData));
  }
  sections.push(responseLines.join('\n'));

  sections.push(
    `\nExecution Time: ${duration}ms\n${color}[API DEBUG] PATCH COMPLETED\n${BORDER_LINE}${COLORS.reset}`
  );

  return sections.join('\n');
};

/**
 * Format DELETE Request Debug Log
 */
export const formatDeleteRequest = ({
  module,
  category,
  subcategory,
  method = 'DELETE',
  endpoint,
  time,
  requestId,
  params = {},
  controller,
  service,
  operation,
  status,
  success,
  responseData,
  duration,
}) => {
  const color = COLORS.red;
  const sections = [];

  sections.push(
    buildHeader({
      title: 'DELETE REQUEST',
      module,
      category,
      subcategory,
      method,
      endpoint,
      time,
      requestId,
      color,
    })
  );

  if (params && Object.keys(params).length > 0) {
    sections.push(`\n[REQUEST PARAMS]\n${safeFormatJson(params)}`);
  }

  const processingLines = ['\n[BACKEND PROCESSING]'];
  if (controller) processingLines.push(`Controller : ${controller}`);
  if (service) processingLines.push(`Service    : ${service}`);
  if (operation) processingLines.push(`Operation  : ${operation}`);
  sections.push(processingLines.join('\n'));

  const responseLines = [
    '\n[API RESPONSE]',
    `Status  : ${status}`,
    `Success : ${success !== undefined ? success : status < 400}`,
  ];
  if (responseData !== undefined && responseData !== null) {
    responseLines.push('\nResponse:');
    responseLines.push(safeFormatJson(responseData));
  }
  sections.push(responseLines.join('\n'));

  sections.push(
    `\nExecution Time: ${duration}ms\n${color}[API DEBUG] DELETE COMPLETED\n${BORDER_LINE}${COLORS.reset}`
  );

  return sections.join('\n');
};

/**
 * Format Centralized Error Log
 */
export const formatErrorRequest = ({
  module,
  category,
  subcategory,
  method = 'POST',
  endpoint,
  time,
  requestId,
  status = 500,
  errorType = 'INTERNAL_SERVER_ERROR',
  errorMessage = 'An unexpected error occurred',
  params = {},
  query = {},
  body = {},
  controller,
  service,
  duration,
}) => {
  const color = `${COLORS.bold}${COLORS.red}`;
  const sections = [];

  sections.push(
    [
      `${color}${BORDER_LINE}${COLORS.reset}`,
      `${color}[API ERROR]${COLORS.reset}`,
      `${color}${BORDER_LINE}${COLORS.reset}`,
      `MODULE        : ${module || 'API'}`,
      category ? `CATEGORY      : ${category}` : null,
      subcategory ? `SUBCATEGORY   : ${subcategory}` : null,
      `METHOD        : ${method.toUpperCase()}`,
      `ENDPOINT      : ${endpoint}`,
      `STATUS        : ${status}`,
      `ERROR TYPE    : ${errorType}`,
      `ERROR MESSAGE : ${errorMessage}`,
      `TIME          : ${time || formatTimestamp()}`,
      requestId ? `REQUEST ID    : ${requestId}` : null,
      `${color}${BORDER_LINE}${COLORS.reset}`,
    ]
      .filter(Boolean)
      .join('\n')
  );

  // Request Data
  const reqDataLines = ['\n[REQUEST DATA]'];
  if (params && Object.keys(params).length > 0) {
    reqDataLines.push(`Params:\n${safeFormatJson(params)}`);
  }
  if (query && Object.keys(query).length > 0) {
    reqDataLines.push(`Query:\n${safeFormatJson(query)}`);
  }
  if (body && Object.keys(body).length > 0) {
    reqDataLines.push(`Body:\n${safeFormatJson(body)}`);
  }
  if (reqDataLines.length === 1) {
    reqDataLines.push('{}\n');
  }
  sections.push(reqDataLines.join('\n'));

  // Error Location
  if (controller || service) {
    const locLines = ['\n[ERROR LOCATION]'];
    if (controller) locLines.push(`Controller : ${controller}`);
    if (service) locLines.push(`Service    : ${service}`);
    sections.push(locLines.join('\n'));
  }

  // Execution Time
  if (duration !== undefined && duration !== null) {
    sections.push(`\n[EXECUTION TIME]\n${duration}ms`);
  }

  sections.push(`${color}${BORDER_LINE}${COLORS.reset}`);

  return sections.join('\n');
};

export default {
  COLORS,
  getMethodColor,
  formatTimestamp,
  formatPostRequest,
  formatGetRequest,
  formatPutRequest,
  formatPatchRequest,
  formatDeleteRequest,
  formatErrorRequest,
};

