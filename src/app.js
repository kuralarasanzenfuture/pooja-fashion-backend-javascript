import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import env from './config/env.js';
import corsOptions from './config/cors.js';
import routes from './routes/index.js';
import { notFoundHandler } from './middlewares/notFound.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('trust proxy', true);
app.use(cookieParser());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors(corsOptions));
app.use(compression());

if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.LOG_LEVEL || 'dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static upload directories (src/uploads and root fallback)
const srcUploadsPath = path.join(__dirname, 'uploads');
const rootUploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(srcUploadsPath));
app.use('/uploads', express.static(rootUploadsPath));
app.use('/assets', express.static(srcUploadsPath));

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    environment: env.NODE_ENV,
    message: 'Server is healthy',
  });
});

app.get('/', (req, res) => {
  res.send('API Server Running');
});

// 404 handler middleware
app.use(notFoundHandler);

// Central error handler middleware
app.use(errorHandler);

export default app;
