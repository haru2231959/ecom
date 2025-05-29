const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logDir = path.join(__dirname, '../../storage/logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

// Transport configurations
const transports = [];

// Console transport (always enabled in development)
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug'
    })
  );
}

// File transports
transports.push(
  // Error logs
  new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: logFormat,
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true
  }),

  // Combined logs
  new DailyRotateFile({
    filename: path.join(logDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    format: logFormat,
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true
  }),

  // Access logs (for HTTP requests)
  new DailyRotateFile({
    filename: path.join(logDir, 'access-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    format: logFormat,
    maxSize: '20m',
    maxFiles: '30d',
    zippedArchive: true
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  exitOnError: false,
  silent: process.env.NODE_ENV === 'test'
});

// Add HTTP request logging method
logger.logRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user ? req.user.id : null
  };

  if (res.statusCode >= 400) {
    logger.error('HTTP Request Error', logData);
  } else {
    logger.info('HTTP Request', logData);
  }
};

// Add database query logging method
logger.logQuery = (query, duration, error = null) => {
  const logData = {
    query: query.replace(/\s+/g, ' ').trim(),
    duration: `${duration}ms`,
    timestamp: new Date().toISOString()
  };

  if (error) {
    logger.error('Database Query Error', { ...logData, error: error.message });
  } else {
    logger.debug('Database Query', logData);
  }
};

// Add authentication logging methods
logger.logAuth = {
  login: (userId, ip, userAgent, success = true) => {
    const logData = {
      event: 'user_login',
      userId,
      ip,
      userAgent,
      success,
      timestamp: new Date().toISOString()
    };

    if (success) {
      logger.info('User Login Success', logData);
    } else {
      logger.warn('User Login Failed', logData);
    }
  },

  logout: (userId, ip) => {
    logger.info('User Logout', {
      event: 'user_logout',
      userId,
      ip,
      timestamp: new Date().toISOString()
    });
  },

  register: (userId, email, ip) => {
    logger.info('User Registration', {
      event: 'user_register',
      userId,
      email,
      ip,
      timestamp: new Date().toISOString()
    });
  },

  passwordReset: (userId, ip) => {
    logger.info('Password Reset Request', {
      event: 'password_reset',
      userId,
      ip,
      timestamp: new Date().toISOString()
    });
  }
};

// Add business logic logging methods
logger.logBusiness = {
  order: (orderId, userId, action, data = {}) => {
    logger.info('Order Event', {
      event: 'order_event',
      orderId,
      userId,
      action,
      data,
      timestamp: new Date().toISOString()
    });
  },

  product: (productId, userId, action, data = {}) => {
    logger.info('Product Event', {
      event: 'product_event',
      productId,
      userId,
      action,
      data,
      timestamp: new Date().toISOString()
    });
  },

  payment: (orderId, userId, method, amount, status) => {
    logger.info('Payment Event', {
      event: 'payment_event',
      orderId,
      userId,
      method,
      amount,
      status,
      timestamp: new Date().toISOString()
    });
  }
};

// Add security logging methods
logger.logSecurity = {
  suspiciousActivity: (ip, userAgent, activity) => {
    logger.warn('Suspicious Activity', {
      event: 'suspicious_activity',
      ip,
      userAgent,
      activity,
      timestamp: new Date().toISOString()
    });
  },

  rateLimitExceeded: (ip, endpoint) => {
    logger.warn('Rate Limit Exceeded', {
      event: 'rate_limit_exceeded',
      ip,
      endpoint,
      timestamp: new Date().toISOString()
    });
  },

  invalidToken: (ip, token) => {
    logger.warn('Invalid Token Usage', {
      event: 'invalid_token',
      ip,
      tokenPreview: token ? token.substring(0, 20) + '...' : null,
      timestamp: new Date().toISOString()
    });
  }
};

// Handle uncaught exceptions and unhandled rejections
logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(logDir, 'exceptions.log'),
    format: logFormat
  })
);

logger.rejections.handle(
  new winston.transports.File({
    filename: path.join(logDir, 'rejections.log'),
    format: logFormat
  })
);

module.exports = { logger };