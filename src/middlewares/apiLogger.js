const { logger } = require('../utils/logger');

/**
 * Enhanced API Request/Response Logger Middleware
 */
const apiLogger = (req, res, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 15);
  
  // Add request ID to req object for tracking
  req.requestId = requestId;
  
  // Log incoming request
  logger.info('🔄 API Request Started', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    baseUrl: req.baseUrl,
    path: req.path,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    authorization: req.get('Authorization') ? 'Bearer [HIDDEN]' : undefined,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? 'Bearer [HIDDEN]' : undefined
    },
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    params: Object.keys(req.params).length > 0 ? req.params : undefined,
    body: req.method !== 'GET' && req.body ? filterSensitiveData(req.body) : undefined,
    timestamp: new Date().toISOString()
  });

  // Store original end function
  const originalEnd = res.end;
  const originalJson = res.json;
  
  // Override res.json to capture response data
  res.json = function(data) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Log successful response
    logger.info('✅ API Response Sent', {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      responseTime: `${responseTime}ms`,
      responseSize: `${JSON.stringify(data).length} bytes`,
      ip: req.ip || req.connection?.remoteAddress,
      responseData: filterSensitiveResponseData(data),
      timestamp: new Date().toISOString()
    });
    
    return originalJson.call(this, data);
  };

  // Override res.end to capture non-JSON responses
  res.end = function(chunk, encoding) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Only log if not already logged by res.json
    if (!res.headersSent || res.getHeader('content-type')?.includes('application/json')) {
      const logLevel = res.statusCode >= 400 ? 'error' : res.statusCode >= 300 ? 'warn' : 'info';
      const icon = res.statusCode >= 400 ? '❌' : res.statusCode >= 300 ? '⚠️' : '✅';
      
      logger[logLevel](`${icon} API Response Completed`, {
        requestId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        responseTime: `${responseTime}ms`,
        responseSize: chunk ? `${chunk.length} bytes` : '0 bytes',
        ip: req.ip || req.connection?.remoteAddress,
        timestamp: new Date().toISOString()
      });
    }
    
    return originalEnd.call(this, chunk, encoding);
  };

  // Handle request timeout
  req.setTimeout = setTimeout(() => {
    if (!res.headersSent) {
      logger.warn('⏰ API Request Timeout', {
        requestId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection?.remoteAddress,
        duration: `${Date.now() - startTime}ms`,
        timestamp: new Date().toISOString()
      });
    }
  }, 30000); // 30 second timeout

  next();
};

/**
 * Log API errors
 */
const apiErrorLogger = (err, req, res, next) => {
  const endTime = Date.now();
  const startTime = req.startTime || endTime;
  const responseTime = endTime - startTime;

  logger.error('💥 API Request Error', {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('User-Agent'),
    error: {
      name: err.name,
      message: err.message,
      status: err.status || err.statusCode || 500,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    },
    responseTime: `${responseTime}ms`,
    timestamp: new Date().toISOString()
  });

  next(err);
};

/**
 * Filter sensitive data from request body
 */
function filterSensitiveData(data) {
  if (!data || typeof data !== 'object') return data;
  
  const filtered = { ...data };
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
  
  Object.keys(filtered).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      filtered[key] = '[FILTERED]';
    }
  });
  
  return filtered;
}

/**
 * Filter sensitive data from response
 */
function filterSensitiveResponseData(data) {
  if (!data || typeof data !== 'object') return data;
  
  const filtered = { ...data };
  
  // Don't log full user data, tokens, etc.
  if (filtered.token) filtered.token = '[HIDDEN]';
  if (filtered.password) filtered.password = '[HIDDEN]';
  if (filtered.data && Array.isArray(filtered.data) && filtered.data.length > 5) {
    filtered.data = `[Array with ${filtered.data.length} items]`;
  }
  
  return filtered;
}

/**
 * Performance monitoring middleware
 */
const performanceLogger = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    // Log slow requests (> 1 second)
    if (duration > 1000) {
      logger.warn('🐌 Slow API Request Detected', {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode,
        ip: req.ip || req.connection?.remoteAddress,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  next();
};

module.exports = {
  apiLogger,
  apiErrorLogger,
  performanceLogger
};
