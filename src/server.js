import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

import app from './app.js';
import env from './config/env.js';
import { connectDatabase } from './database/connection.js';

const PORT = Number(env.PORT || 5000);

const startServer = async () => {
  try {
    console.log('🚀 Starting server...');

    try {
      await connectDatabase();
      console.log('✅ Database connection initialized');
    } catch (databaseError) {
      console.warn('⚠️ Database initialization skipped:', databaseError.message);
    }

    const server = http.createServer(app);

    server.listen(PORT, '0.0.0.0', () => {
      console.log('🚀 Server running');
      console.log(`Local: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server failed to start:', error.message);
    process.exit(1);
  }
};

startServer();
