const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ApiResponse } = require('../utils/response');
const { logger } = require('../utils/logger');
const { jwtSecret } = require('../config/jwt');
const { USER_ROLES, USER_STATUS } = require('../config/constants');

/**
 * JWT Authentication Middleware
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(ApiResponse.unauthorized('No token provided'));
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);
    
    // Get user from database
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      logger.logSecurity.invalidToken(req.ip, token);
      return res.status(401).json(ApiResponse.unauthorized('Invalid token - user not found'));
    }

    // Check if user is active
    if (user.status !== USER_STATUS.ACTIVE) {
      return res.status(401).json(ApiResponse.unauthorized('Account is not active'));
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    logger.logSecurity.invalidToken(req.ip, req.headers.authorization);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(ApiResponse.unauthorized('Token expired'));
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(ApiResponse.unauthorized('Invalid token'));
    }
    
    return res.status(401).json(ApiResponse.unauthorized('Authentication failed'));
  }
};

/**
 * Optional Authentication Middleware
 * Adds user to request if token is provided, but doesn't require authentication
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, jwtSecret);
    
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (user && user.status === USER_STATUS.ACTIVE) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without authentication
    next();
  }
};

/**
 * Role-based Authorization Middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(ApiResponse.unauthorized());
    }

    if (!roles.includes(req.user.role)) {
      logger.logSecurity.suspiciousActivity(
        req.ip, 
        req.get('User-Agent'),
        `Unauthorized access attempt to ${req.originalUrl} by user ${req.user.id} with role ${req.user.role}`
      );
      return res.status(403).json(ApiResponse.forbidden('Insufficient permissions'));
    }

    next();
  };
};

/**
 * Admin Only Middleware
 */
const adminOnly = authorize(USER_ROLES.ADMIN);

/**
 * Admin or Moderator Middleware
 */
const adminOrModerator = authorize(USER_ROLES.ADMIN, USER_ROLES.MODERATOR);

/**
 * Resource Owner or Admin Middleware
 * Checks if user is the owner of the resource or an admin
 */
const ownerOrAdmin = (resourceIdParam = 'id', userIdField = 'userId') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(ApiResponse.unauthorized());
    }

    // Admin can access any resource
    if (req.user.role === USER_ROLES.ADMIN) {
      return next();
    }

    // For user profile routes, check if accessing own profile
    if (resourceIdParam === 'id' && req.params.id == req.user.id) {
      return next();
    }

    // For other resources, you might need to fetch the resource
    // and check if the current user owns it
    // This is a simplified version - implement based on your needs
    
    return res.status(403).json(ApiResponse.forbidden('Access denied'));
  };
};

/**
 * Email Verification Required Middleware
 */
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(ApiResponse.unauthorized());
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json(ApiResponse.forbidden('Email verification required'));
  }

  next();
};

/**
 * Rate Limiting by User
 */
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const userRequests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create user request history
    if (!userRequests.has(userId)) {
      userRequests.set(userId, []);
    }

    const requests = userRequests.get(userId);
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    userRequests.set(userId, validRequests);

    // Check if user has exceeded rate limit
    if (validRequests.length >= maxRequests) {
      logger.logSecurity.rateLimitExceeded(req.ip, req.originalUrl);
      return res.status(429).json(ApiResponse.tooManyRequests('Rate limit exceeded'));
    }

    // Add current request
    validRequests.push(now);
    next();
  };
};

/**
 * Permission Check Middleware
 * Uses the user's canAccess method to check permissions
 */
const requirePermission = (resource) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(ApiResponse.unauthorized());
    }

    if (!req.user.canAccess(resource)) {
      return res.status(403).json(ApiResponse.forbidden('Insufficient permissions'));
    }

    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  adminOnly,
  adminOrModerator,
  ownerOrAdmin,
  requireEmailVerification,
  userRateLimit,
  requirePermission
};