const cors = require('cors');
const { logger } = require('../utils/logger');

/**
 * CORS Configuration Middleware
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : [
          'http://localhost:3000',
          'http://localhost:3001', 
          'http://localhost:8080',
          'http://127.0.0.1:3000',
          'https://yourdomain.com'
        ];
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      logger.logSecurity.suspiciousActivity(
        origin, 
        'Unknown', 
        `CORS blocked request from unauthorized origin: ${origin}`
      );
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Request-ID',
    'X-API-Key'
  ],
  exposedHeaders: [
    'X-Request-ID',
    'X-Response-Time',
    'X-Rate-Limit-Limit',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset'
  ],
  maxAge: 86400 // 24 hours
};

/**
 * Development CORS (more permissive)
 */
const devCorsOptions = {
  origin: true,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Request-ID',
    'X-API-Key'
  ]
};

/**
 * Production CORS (strict)
 */
const prodCorsOptions = {
  ...corsOptions,
  origin: function (origin, callback) {
    if (!origin) return callback(new Error('CORS: Origin required in production'));
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : [];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.logSecurity.suspiciousActivity(
        origin, 
        'Unknown', 
        `CORS blocked unauthorized production request from: ${origin}`
      );
      callback(new Error(`CORS: Origin ${origin} not allowed in production`));
    }
  }
};

/**
 * API-specific CORS
 */
const apiCorsOptions = {
  ...corsOptions,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Request-ID'
  ]
};

/**
 * Upload-specific CORS
 */
const uploadCorsOptions = {
  ...corsOptions,
  methods: ['POST', 'PUT'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Request-ID'
  ]
};

// Select appropriate CORS configuration
const getCorsMiddleware = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return cors(prodCorsOptions);
    case 'development':
      return cors(devCorsOptions);
    case 'test':
      return cors({ origin: true });
    default:
      return cors(corsOptions);
  }
};

/**
 * Custom CORS error handler
 */
const corsErrorHandler = (err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    logger.warn('CORS Error:', {
      origin: req.headers.origin,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: 'CORS policy violation',
      timestamp: new Date().toISOString()
    });
  }
  next(err);
};

module.exports = {
  corsMiddleware: getCorsMiddleware(),
  corsOptions,
  devCorsOptions,
  prodCorsOptions,
  apiCorsOptions,
  uploadCorsOptions,
  corsErrorHandler,
  getCorsMiddleware
};