require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Initialize Express app
const app = express();

// Environment
const NODE_ENV = process.env.NODE_ENV || 'development';

// Database connection placeholder
let sequelize;

const initializeDatabase = async () => {
  try {
    console.log('✅ Database initialization skipped for now');
    return null;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

// Basic security middleware
app.use(helmet());
app.use(cors());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware with Winston integration
if (NODE_ENV !== 'test') {
  try {
    const { logger } = require('./src/utils/logger');
    
    // Custom Morgan format for detailed API logging
    const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';
    
    app.use(morgan(morganFormat, {
      stream: {
        write: (message) => {
          // Parse Morgan message and create structured log
          const parts = message.trim().split(' ');
          const logData = {
            ip: parts[0],
            method: parts[6]?.replace('"', ''),
            url: parts[7],
            httpVersion: parts[8]?.replace('"', ''),
            statusCode: parseInt(parts[9]),
            contentLength: parts[10],
            userAgent: message.match(/"([^"]*)"[^"]*$/)?.[1] || 'unknown',
            responseTime: parts[parts.length - 2] + 'ms',
            timestamp: new Date().toISOString()
          };
          
          // Log based on status code
          if (logData.statusCode >= 500) {
            logger.error('API Request - Server Error', logData);
          } else if (logData.statusCode >= 400) {
            logger.warn('API Request - Client Error', logData);
          } else {
            logger.info('API Request - Success', logData);
          }
        }
      }
    }));
    
    // Additional middleware for detailed request/response logging
    app.use((req, res, next) => {
      const startTime = Date.now();
      
      // Log request details
      logger.info('Incoming API Request', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent'),
        headers: req.headers,
        query: req.query,
        body: req.method !== 'GET' ? req.body : undefined,
        timestamp: new Date().toISOString()
      });
      
      // Override res.json to log response
      const originalJson = res.json;
      res.json = function(data) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        // Log response details
        logger.info('API Response Sent', {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          responseTime: `${responseTime}ms`,
          responseSize: JSON.stringify(data).length,
          ip: req.ip || req.connection?.remoteAddress,
          timestamp: new Date().toISOString()
        });
        
        return originalJson.call(this, data);
      };
      
      next();
    });
    
  } catch (error) {
    console.log('Winston logger not available, using simple Morgan:', error.message);
    app.use(morgan('combined'));
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: NODE_ENV,
    version: '1.0.0'
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Express E-commerce API',
    version: '1.0.0',
    health: '/health',
    environment: NODE_ENV
  });
});

// Simple routes without complex imports
try {
  // Import API logger middleware
  const { apiLogger, apiErrorLogger, performanceLogger } = require('./src/middlewares/apiLogger');
  
  // Add API logging middleware before routes
  app.use('/api', apiLogger);
  app.use('/api', performanceLogger);
  
  // Import routes only if they exist and work
  const routes = require('./src/routes');
  app.use('/api', routes);
  
  // Add error logging middleware after routes
  app.use('/api', apiErrorLogger);
  
} catch (error) {
  console.error('Error loading routes:', error.message);
  
  // Fallback API route
  app.get('/api', (req, res) => {
    res.json({
      message: 'API routes are being loaded...',
      error: 'Some routes may not be available yet'
    });
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = {
  app,
  initializeDatabase,
  sequelize: () => sequelize
};
