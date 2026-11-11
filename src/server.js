import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

import app from './app.js';
import env from './config/env.js';
import { connectDatabase, runMigrations } from './database/index.js';

const PORT = Number(env.PORT || 5000);

const startServer = async () => {
  try {
    console.log('🚀 Starting server...');

    try {
      await connectDatabase();
      console.log('✅ Database connection initialized');
      await runMigrations();
    } catch (databaseError) {
      console.warn('⚠️ Database initialization / migration skipped:', databaseError.message);
    }

    const server = http.createServer(app);

    server.listen(PORT, '0.0.0.0', () => {
      console.log('🚀 Server running');
      console.log(`Local: http://localhost:${PORT}`);
      if (!env.IS_PRODUCTION && env.NODE_ENV !== 'production') {
        console.log(`⚡ API Debug Dashboard: http://localhost:${PORT}/__dev/api-logs`);
      }
    });
  } catch (error) {
    console.error('❌ Server failed to start:', error.message);
    process.exit(1);
  }
};

startServer();
