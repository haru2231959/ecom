/**
 * Standardized API Response Utility
 * Provides consistent response format across the application
 */

class ApiResponse {
  /**
   * Success Response
   * @param {any} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   * @returns {Object} Formatted success response
   */
  static success(data = null, message = 'Success', statusCode = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Error Response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {any} errors - Validation errors or additional error info
   * @returns {Object} Formatted error response
   */
  static error(message = 'Internal Server Error', statusCode = 500, errors = null) {
    const response = {
      success: false,
      statusCode,
      message,
      timestamp: new Date().toISOString()
    };

    if (errors) {
      response.errors = errors;
    }

    return response;
  }

  /**
   * Paginated Response
   * @param {Array} data - Array of data items
   * @param {Object} pagination - Pagination metadata
   * @param {string} message - Success message
   * @returns {Object} Formatted paginated response
   */
  static paginated(data, pagination, message = 'Success') {
    return {
      success: true,
      statusCode: 200,
      message,
      data,
      pagination: {
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        totalItems: pagination.totalItems,
        itemsPerPage: pagination.itemsPerPage,
        hasNextPage: pagination.currentPage < pagination.totalPages,
        hasPrevPage: pagination.currentPage > 1
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Created Response
   * @param {any} data - Created resource data
   * @param {string} message - Success message
   * @returns {Object} Formatted created response
   */
  static created(data, message = 'Resource created successfully') {
    return this.success(data, message, 201);
  }

  /**
   * Updated Response
   * @param {any} data - Updated resource data
   * @param {string} message - Success message
   * @returns {Object} Formatted updated response
   */
  static updated(data, message = 'Resource updated successfully') {
    return this.success(data, message, 200);
  }

  /**
   * Deleted Response
   * @param {string} message - Success message
   * @returns {Object} Formatted deleted response
   */
  static deleted(message = 'Resource deleted successfully') {
    return this.success(null, message, 200);
  }

  /**
   * Not Found Response
   * @param {string} message - Error message
   * @returns {Object} Formatted not found response
   */
  static notFound(message = 'Resource not found') {
    return this.error(message, 404);
  }

  /**
   * Validation Error Response
   * @param {string} message - Error message
   * @param {any} errors - Validation errors
   * @returns {Object} Formatted validation error response
   */
  static validationError(message = 'Validation failed', errors = null) {
    return this.error(message, 422, errors);
  }

  /**
   * Unauthorized Response
   * @param {string} message - Error message
   * @returns {Object} Formatted unauthorized response
   */
  static unauthorized(message = 'Authentication required') {
    return this.error(message, 401);
  }

  /**
   * Forbidden Response
   * @param {string} message - Error message
   * @returns {Object} Formatted forbidden response
   */
  static forbidden(message = 'Access denied') {
    return this.error(message, 403);
  }

  /**
   * Bad Request Response
   * @param {string} message - Error message
   * @param {any} errors - Additional error information
   * @returns {Object} Formatted bad request response
   */
  static badRequest(message = 'Bad request', errors = null) {
    return this.error(message, 400, errors);
  }

  /**
   * Internal Server Error Response
   * @param {string} message - Error message
   * @returns {Object} Formatted internal server error response
   */
  static internalError(message = 'Internal server error') {
    return this.error(message, 500);
  }

  /**
   * Too Many Requests Response
   * @param {string} message - Error message
   * @returns {Object} Formatted rate limit response
   */
  static tooManyRequests(message = 'Too many requests') {
    return this.error(message, 429);
  }

  /**
   * Service Unavailable Response
   * @param {string} message - Error message
   * @returns {Object} Formatted service unavailable response
   */
  static serviceUnavailable(message = 'Service temporarily unavailable') {
    return this.error(message, 503);
  }
}

/**
 * Response Helper Functions
 */
const ResponseHelper = {
  /**
   * Send success response
   * @param {Object} res - Express response object
   * @param {any} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   */
  sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
    const response = ApiResponse.success(data, message, statusCode);
    return res.status(statusCode).json(response);
  },

  /**
   * Send error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {any} errors - Additional error information
   */
  sendError(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
    const response = ApiResponse.error(message, statusCode, errors);
    return res.status(statusCode).json(response);
  },

  /**
   * Send paginated response
   * @param {Object} res - Express response object
   * @param {Array} data - Array of data items
   * @param {Object} pagination - Pagination metadata
   * @param {string} message - Success message
   */
  sendPaginated(res, data, pagination, message = 'Success') {
    const response = ApiResponse.paginated(data, pagination, message);
    return res.status(200).json(response);
  }
};

module.exports = { ApiResponse, ResponseHelper };