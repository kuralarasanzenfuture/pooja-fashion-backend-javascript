import multer from 'multer';

export const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';

  if (isDev) {
    console.error('❌ ERROR:', {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.id || null,
      ip: req.ip,
      message: err.message,
      stack: err.stack,
    });
  }

  let status = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.details || null;

  // Handle Multer upload errors
  if (err instanceof multer.MulterError || err.name === 'MulterError') {
    status = 400;

    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large. Maximum size allowed is 5 MB.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = `Unexpected file field: ${err.field}`;
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = `Too many files uploaded for field: ${err.field}`;
    } else {
      message = err.message;
    }
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError' || Array.isArray(err.issues)) {
    status = 400;
    message = 'Validation Error';
    errors = (err.issues || []).map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Authentication token has expired';
  }

  res.status(status).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(req.requestId ? { requestId: req.requestId } : {}),
  });
};

export const globalErrorHandler = errorHandler;

export default errorHandler;
