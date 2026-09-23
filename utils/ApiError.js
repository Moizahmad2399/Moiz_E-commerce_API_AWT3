/**
 * Custom error class used across the app so every thrown error
 * carries enough info for the centralized error handler to build
 * a standardized JSON response.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (400, 404, 409, etc.)
   * @param {string} errorCode - machine-readable code, e.g. "PRODUCT_NOT_FOUND"
   * @param {string} message - human-readable message
   */
  constructor(statusCode, errorCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errorCode = 'BAD_REQUEST') {
    return new ApiError(400, errorCode, message);
  }

  static notFound(message, errorCode = 'NOT_FOUND') {
    return new ApiError(404, errorCode, message);
  }

  static conflict(message, errorCode = 'CONFLICT') {
    return new ApiError(409, errorCode, message);
  }

  static internal(message = 'Something went wrong on our end') {
    return new ApiError(500, 'INTERNAL_SERVER_ERROR', message);
  }
}

module.exports = ApiError;
