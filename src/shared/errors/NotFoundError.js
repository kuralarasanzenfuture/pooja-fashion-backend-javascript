import AppError from './AppError.js';

export default class NotFoundError extends AppError {
  constructor(message = 'Resource Not Found', details = null) {
    super(message, 404, details);
  }
}
