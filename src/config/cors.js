import env from './env.js';

const PORT = Number(process.env.PORT || env?.PORT || 5000);

const configuredOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Automatically include the backend server's own origin and common local development ports
const defaultDevOrigins = [
  `http://localhost:${PORT}`,
  `http://127.0.0.1:${PORT}`,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultDevOrigins]));

const isDev = (process.env.NODE_ENV || env?.NODE_ENV || 'development') !== 'production';

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (such as mobile apps, curl, same-origin, or Postman)
    if (!origin) {
      return callback(null, true);
    }

    // In development mode, allow localhost/127.0.0.1 on any port (e.g. backend dashboard, Vite, React, etc.)
    if (isDev) {
      if (
        allowedOrigins.includes(origin) ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
    } else {
      // In production mode, strictly enforce configured origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Request-ID',
    'x-request-id',
    'Accept',
  ],
  exposedHeaders: ['X-Request-ID'],
};

export default corsOptions;
