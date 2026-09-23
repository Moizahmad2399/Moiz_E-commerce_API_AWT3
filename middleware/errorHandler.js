const ApiError = require('../utils/ApiError');

/**
 * Standardized JSON error schema used for EVERY error response:
 * {
 *   "error_code": "PRODUCT_NOT_FOUND",
 *   "message": "Product with id 123 does not exist",
 *   "timestamp": "2026-09-23T10:00:00.000Z"
 * }
 *
 * This must be registered LAST, after all routes, in server.js.
 */
function errorHandler(err, req, res, next) {
  // If it's one of our known ApiError instances, use its info.
  // Otherwise (unexpected bugs, thrown strings, etc.) fall back to a
  // generic 500 — the client NEVER sees a raw stack trace.
  const isApiError = err instanceof ApiError;

  const statusCode = isApiError ? err.statusCode : 500;
  const errorCode = isApiError ? err.errorCode : 'INTERNAL_SERVER_ERROR';
  const message = isApiError ? err.message : 'An unexpected error occurred';

  // Log the real error server-side for debugging, regardless of what
  // we send back to the client.
  if (!isApiError) {
    console.error('[UNHANDLED ERROR]', err);
  }

  res.status(statusCode).json({
    error_code: errorCode,
    message,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Catches requests to routes that don't exist at all (e.g. typo'd URL)
 * and turns them into our standard 404 shape instead of Express's
 * default HTML "Cannot GET /..." page.
 */
function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} does not exist`, 'ROUTE_NOT_FOUND'));
}

module.exports = { errorHandler, notFoundHandler };
