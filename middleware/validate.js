const ApiError = require('../utils/ApiError');

const VALID_CATEGORIES = ['electronics', 'home-goods', 'fashion', 'books', 'sports', 'other'];

/**
 * Validates the body for POST (create) and PUT (replace).
 * Throws ApiError.badRequest (-> 400) on the first problem found.
 */
function validateProductPayload(body, { partial = false } = {}) {
  const errors = [];

  if (!partial || body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim().length === 0) {
      errors.push('title is required and must be a non-empty string');
    }
  }

  if (!partial || body.price !== undefined) {
    if (typeof body.price !== 'number' || Number.isNaN(body.price) || body.price < 0) {
      errors.push('price is required and must be a non-negative number');
    }
  }

  if (!partial || body.category !== undefined) {
    if (typeof body.category !== 'string' || !VALID_CATEGORIES.includes(body.category)) {
      errors.push(`category is required and must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }
  }

  if (body.stock !== undefined) {
    if (typeof body.stock !== 'number' || !Number.isInteger(body.stock) || body.stock < 0) {
      errors.push('stock must be a non-negative integer');
    }
  }

  if (errors.length > 0) {
    throw ApiError.badRequest(errors.join('; '), 'VALIDATION_ERROR');
  }
}

/** Validates the :id route param is a positive integer. */
function parseProductId(rawId) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw ApiError.badRequest(`Invalid product id "${rawId}" — must be a positive integer`, 'INVALID_ID');
  }
  return id;
}

module.exports = { validateProductPayload, parseProductId, VALID_CATEGORIES };
