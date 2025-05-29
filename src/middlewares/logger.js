const morgan = require('morgan');
const { logger } = require('../utils/logger');

/**
 * Custom Morgan Tokens
 */

// Custom token for request ID
morgan.token('id', (req) => req.id || 'unknown');

// Custom token for user ID
morgan.token('user', (req) => req.user ? req.user.id : 'anonymous');

// Custom token for user role
morgan.token('role', (req) => req.user ? req.user.role : 'guest');

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req, res) => {
  if (!req._startAt || !res._startAt) {
    return '-';
  }
  
  const ms = (res._startAt[0] - req._startAt[0]) * 1e3 +
    (res._startAt[1] - req._startAt[1]) * 1e-6;
  
  return ms.toFixed(3);
});

// Custom token for request size
morgan.token('req-size', (req) => {
  return req.get('Content-Length') || '0';
});

// Custom token for response size
morgan.token('res-size', (req, res) => {
  return res.get('Content-Length') || '0';
});

// Custom token for real IP (considering proxies)
morgan.token('real-ip', (req) => {
  return req.ip || req.connection.remoteAddress || 'unknown';
});

/**
 * Custom Morgan Formats
 */

// Development format (colorized and readable)
const devFormat = ':method :url :status :response-time ms - :res[content-length]';

// Production format (structured and comprehensive)
const prodFormat = JSON.stringify({
  timestamp: ':date[iso]',
  requestId: ':id',
  method: ':method',
  url: ':url',
  status: ':status',
  responseTime: ':response-time-ms ms',
  contentLength: ':res[content-length]',
  userAgent: ':user-agent',
  ip: ':real-ip',
  userId: ':user',
  userRole: ':role',
  referrer: ':referrer',
  requestSize: ':req-size',
  responseSize: ':res-size'
});

// API format (focused on API-specific metrics)
const apiFormat = ':real-ip :user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time-ms ms';

// Security format (for security-related logging)
const securityFormat = JSON.stringify({
  timestamp: ':date[iso]',
  ip: ':real-ip',
  method: ':method',
  url: ':url',
  status: ':status',
  userAgent: ':user-agent',
  userId: ':user',
  requestId: ':id'
});

/**
 * Custom Morgan Stream
 */
const morganStream = {
  write: (message) => {
    try {
      // Try to parse as JSON for structured logging
      const logData = JSON.parse(message.trim());
      
      // Determine log level based on status code
      const status = parseInt(logData.status) || 0;
      if (status >= 500) {
        logger.error('HTTP Request Error', logData);
      } else if (status >= 400) {
        logger.warn('HTTP Request Warning', logData);
      } else {
        logger.info('HTTP Request', logData);
      }
    } catch (error) {
      // If not JSON, log as plain text
      const message_clean = message.trim();
      if (message_clean) {
        logger.info(message_clean);
      }
    }
  }
};

/**
 * Skip Function for Health Checks
 */
const skipHealthChecks = (req, res) => {
  const skipPaths = ['/health', '/status', '/favicon.ico'];
  return skipPaths.includes(req.url);
};

/**
 * Skip Function for Static Files
 */
const skipStaticFiles = (req, res) => {
  return req.url.startsWith('/uploads/') || 
         req.url.startsWith('/static/') ||
         req.url.endsWith('.css') ||
         req.url.endsWith('.js') ||
         req.url.endsWith('.png') ||
         req.url.endsWith('.jpg') ||
         req.url.endsWith('.gif') ||
         req.url.endsWith('.ico');
};

/**
 * Skip Function for Development
 */
const skipInDevelopment = (req, res) => {
  return process.env.NODE_ENV === 'development' && (
    skipHealthChecks(req, res) || skipStaticFiles(req, res)
  );
};

/**
 * Error-only logging (log only 4xx and 5xx responses)
 */
const skipSuccessful = (req, res) => {
  return res.statusCode < 400;
};

/**
 * Middleware Factories
 */

/**
 * Development Logger
 */
const developmentLogger = morgan(devFormat, {
  skip: skipInDevelopment
});

/**
 * Production Logger
 */
const productionLogger = morgan(prodFormat, {
  stream: morganStream,
  skip: skipHealthChecks
});

/**
 * API Logger
 */
const apiLogger = morgan(apiFormat, {
  stream: morganStream,
  skip: skipHealthChecks
});

/**
 * Security Logger (logs all requests for security analysis)
 */
const securityLogger = morgan(securityFormat, {
  stream: {
    write: (message) => {
      try {
        const logData = JSON.parse(message.trim());
        logger.logSecurity.suspiciousActivity(
          logData.ip, 
          logData.userAgent, 
          `${logData.method} ${logData.url} - Status: ${logData.status}`
        );
      } catch (error) {
        logger.warn('Security log parse error:', error.message);
      }
    }
  }
});

/**
 * Error Logger (only logs error responses)
 */
const errorLogger = morgan(prodFormat, {
  stream: {
    write: (message) => {
      try {
        const logData = JSON.parse(message.trim());
        logger.error('HTTP Error', logData);
      } catch (error) {
        logger.error(message.trim());
      }
    }
  },
  skip: skipSuccessful
});

/**
 * Combined Logger (multiple loggers)
 */
const combinedLogger = (req, res, next) => {
  // Apply different loggers based on environment and conditions
  if (process.env.NODE_ENV === 'production') {
    productionLogger(req, res, () => {});
    
    // Also log errors separately
    if (res.statusCode >= 400) {
      errorLogger(req, res, () => {});
    }
  } else {
    developmentLogger(req, res, () => {});
  }
  
  next();
};

/**
 * Request Context Logger
 */
const contextLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Add request start time
  req.startTime = startTime;
  
  // Log request start
  logger.debug('Request Start', {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user.id : null
  });
  
  // Override res.end to log request completion
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    
    logger.debug('Request End', {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length') || '0'
    });
    
    originalEnd.apply(this, args);
  };
  
  next();
};

/**
 * Get appropriate logger middleware based on environment
 */
const getLoggerMiddleware = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return productionLogger;
    case 'development':
      return developmentLogger;
    case 'test':
      return (req, res, next) => next(); // No logging in tests
    default:
      return combinedLogger;
  }
};

module.exports = {
  loggerMiddleware: getLoggerMiddleware(),
  developmentLogger,
  productionLogger,
  apiLogger,
  securityLogger,
  errorLogger,
  combinedLogger,
  contextLogger,
  morganStream,
  getLoggerMiddleware,
  
  // Utility functions
  skipHealthChecks,
  skipStaticFiles,
  skipInDevelopment,
  skipSuccessful
};