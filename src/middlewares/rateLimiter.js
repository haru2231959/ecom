const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { ApiResponse } = require('../utils/response');
const { logger } = require('../utils/logger');
const { RATE_LIMIT } = require('../config/constants');

/**
 * General Rate Limiter
 */
const rateLimiterMiddleware = rateLimit({
  windowMs: RATE_LIMIT.GENERAL.WINDOW_MS,
  max: RATE_LIMIT.GENERAL.MAX_REQUESTS,
  message: ApiResponse.tooManyRequests('Too many requests from this IP'),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.logSecurity.rateLimitExceeded(req.ip, req.originalUrl);
    res.status(429).json(ApiResponse.tooManyRequests('Too many requests from this IP'));
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

/**
 * Authentication Routes Rate Limiter
 */
const authRateLimit = rateLimit({
  windowMs: RATE_LIMIT.AUTH.WINDOW_MS,
  max: RATE_LIMIT.AUTH.MAX_REQUESTS,
  message: ApiResponse.tooManyRequests('Too many authentication attempts'),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.logSecurity.rateLimitExceeded(req.ip, req.originalUrl);
    res.status(429).json(ApiResponse.tooManyRequests('Too many authentication attempts'));
  }
});

/**
 * Upload Routes Rate Limiter
 */
const uploadRateLimit = rateLimit({
  windowMs: RATE_LIMIT.UPLOAD.WINDOW_MS,
  max: RATE_LIMIT.UPLOAD.MAX_REQUESTS,
  message: ApiResponse.tooManyRequests('Too many upload attempts'),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.logSecurity.rateLimitExceeded(req.ip, req.originalUrl);
    res.status(429).json(ApiResponse.tooManyRequests('Too many upload attempts'));
  }
});

/**
 * Speed Limiter - Slows down requests instead of blocking
 */
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // Allow 100 requests per windowMs without delay
  delayMs: 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
  skip: (req) => {
    return req.path === '/health';
  }
});

/**
 * Strict Rate Limiter for sensitive operations
 */
const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: ApiResponse.tooManyRequests('Too many requests for this operation'),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.logSecurity.rateLimitExceeded(req.ip, req.originalUrl);
    res.status(429).json(ApiResponse.tooManyRequests('Too many requests for this operation'));
  }
});

/**
 * API Key Rate Limiter
 */
const apiKeyRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Higher limit for API key users
  keyGenerator: (req) => {
    return req.headers['x-api-key'] || req.ip;
  },
  handler: (req, res) => {
    logger.logSecurity.rateLimitExceeded(req.ip, req.originalUrl);
    res.status(429).json(ApiResponse.tooManyRequests('API rate limit exceeded'));
  }
});

/**
 * Dynamic Rate Limiter based on user role
 */
const dynamicRateLimit = (req, res, next) => {
  // Different limits based on user authentication and role
  let maxRequests = 100; // Default for unauthenticated users
  
  if (req.user) {
    switch (req.user.role) {
      case 'admin':
        maxRequests = 1000;
        break;
      case 'moderator':
        maxRequests = 500;
        break;
      case 'user':
        maxRequests = 200;
        break;
      default:
        maxRequests = 100;
    }
  }

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: maxRequests,
    keyGenerator: (req) => {
      return req.user ? `user_${req.user.id}` : req.ip;
    },
    handler: (req, res) => {
      logger.logSecurity.rateLimitExceeded(req.ip, req.originalUrl);
      res.status(429).json(ApiResponse.tooManyRequests('Rate limit exceeded'));
    }
  });

  limiter(req, res, next);
};

/**
 * Custom Rate Limiter Factory
 */
const createRateLimit = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: ApiResponse.tooManyRequests('Too many requests'),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.logSecurity.rateLimitExceeded(req.ip, req.originalUrl);
      res.status(429).json(options.message || ApiResponse.tooManyRequests('Too many requests'));
    }
  };

  return rateLimit({ ...defaultOptions, ...options });
};

module.exports = {
  rateLimiterMiddleware,
  authRateLimit,
  uploadRateLimit,
  speedLimiter,
  strictRateLimit,
  apiKeyRateLimit,
  dynamicRateLimit,
  createRateLimit
};