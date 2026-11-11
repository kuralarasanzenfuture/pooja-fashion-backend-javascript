import multer from 'multer';
import { apiLogger } from '../shared/utils/logger/apiLogger.js';

export const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.details || null;
  let errorType = null;

  // Handle PostgreSQL Unique Constraint Violations
  if (err.code === '23505') {
    status = 400;
    errorType = 'DUPLICATE_RECORD_ERROR';
    const detail = err.detail || '';
    const constraint = err.constraint || '';
    if (constraint.includes('name') || detail.includes('role_name') || detail.includes('name')) {
      message = 'A role with this name already exists';
    } else if (constraint.includes('code') || detail.includes('role_code') || detail.includes('code')) {
      message = 'A role with this code already exists';
    } else {
      message = detail ? `Duplicate record: ${detail}` : 'A record with this identifier already exists';
    }
  }

  // Handle Multer upload errors
  if (err instanceof multer.MulterError || err.name === 'MulterError') {
    status = 400;
    errorType = 'FILE_UPLOAD_ERROR';

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
    errorType = 'VALIDATION_ERROR';
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
    errorType = 'AUTHENTICATION_ERROR';
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    errorType = 'AUTHENTICATION_ERROR';
    message = 'Authentication token has expired';
  } else if (err.name === 'ForbiddenError' || status === 403) {
    errorType = 'AUTHORIZATION_ERROR';
  } else if (err.name === 'NotFoundError' || status === 404) {
    errorType = 'NOT_FOUND_ERROR';
  }

  // Route to centralized API error logger
  apiLogger.logApiError({
    req,
    res,
    err,
    status,
    message,
    errorType,
  });

  // Flag to avoid duplicate logging on response finish
  res._apiDebugLogged = true;

  res.status(status).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(req.requestId || req.id ? { requestId: req.requestId || req.id } : {}),
  });
};

export const globalErrorHandler = errorHandler;

export default errorHandler;
