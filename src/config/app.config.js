import env from './env.js';

const appConfig = {
  name: 'pooja-fashion-backend',
  port: env.PORT,
  environment: env.NODE_ENV,
  uploadDir: env.UPLOAD_DIR,
  maxFileSize: env.MAX_FILE_SIZE,
  logLevel: env.LOG_LEVEL,
};

export default appConfig;
