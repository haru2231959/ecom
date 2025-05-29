/**
 * Middleware Index
 * Central export for all middleware functions
 */

// Authentication & Authorization
const auth = require('./auth');

// Error Handling
const errorHandler = require('./errorHandler');

// Rate Limiting
const rateLimiter = require('./rateLimiter');

// CORS
const cors = require('./cors');

// Compression
const compression = require('./compression');

// Logging
const logger = require('./logger');

// Validation
const validation = require('./validation');

// File Upload
const upload = require('./upload');

// Caching
const cache = require('./cache');

/**
 * Security Middleware Stack
 */
const securityStack = [
  cors.corsMiddleware,
  rateLimiter.rateLimiterMiddleware,
  compression.compressionMiddleware,
  validation.sanitize
];

/**
 * API Middleware Stack
 */
const apiStack = [
  logger.loggerMiddleware,
  validation.sanitize,
  cache.apiCache(),
  auth.optionalAuth
];

/**
 * Protected Route Middleware Stack
 */
const protectedStack = [
  auth.authenticate,
  rateLimiter.userRateLimit()
];

/**
 * Admin Route Middleware Stack
 */
const adminStack = [
  auth.authenticate,
  auth.adminOnly,
  cache.invalidateCache(['admin', 'api'])
];

/**
 * Upload Middleware Stack
 */
const uploadStack = [
  auth.authenticate,
  rateLimiter.uploadRateLimit,
  upload.fileCleanupOnError
];

/**
 * Common middleware combinations
 */
const common = {
  // Basic security for all routes
  security: securityStack,
  
  // API routes
  api: apiStack,
  
  // Protected routes requiring authentication
  protected: protectedStack,
  
  // Admin only routes
  admin: adminStack,
  
  // File upload routes
  upload: uploadStack,
  
  // Public routes with caching
  public: [
    logger.loggerMiddleware,
    validation.sanitize,
    cache.apiCache(1800) // 30 minutes cache
  ],
  
  // High traffic routes with aggressive caching
  cached: [
    logger.loggerMiddleware,
    validation.sanitize,
    cache.apiCache(3600) // 1 hour cache
  ]
};

module.exports = {
  // Individual middleware modules
  auth,
  errorHandler,
  rateLimiter,
  cors,
  compression,
  logger,
  validation,
  upload,
  cache,
  
  // Middleware stacks
  common,
  
  // Direct exports for convenience
  authenticate: auth.authenticate,
  authorize: auth.authorize,
  adminOnly: auth.adminOnly,
  validate: validation.validate,
  sanitize: validation.sanitize,
  asyncHandler: errorHandler.asyncHandler,
  
  // Error classes
  AppError: errorHandler.AppError,
  ValidationError: errorHandler.ValidationError,
  NotFoundError: errorHandler.NotFoundError,
  UnauthorizedError: errorHandler.UnauthorizedError
};