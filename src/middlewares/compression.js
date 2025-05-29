const compression = require('compression');
const { logger } = require('../utils/logger');

/**
 * Compression Middleware Configuration
 */

/**
 * Default compression options
 */
const defaultOptions = {
  level: 6, // Compression level (0-9, 6 is default)
  threshold: 1024, // Only compress if response is larger than 1KB
  memLevel: 8, // Memory usage level (1-9)
  strategy: compression.constants.Z_DEFAULT_STRATEGY,
  chunkSize: 16 * 1024, // 16KB chunks
  windowBits: 15
};

/**
 * Production compression options (higher compression)
 */
const productionOptions = {
  ...defaultOptions,
  level: 9, // Maximum compression
  threshold: 512, // Compress smaller files in production
  memLevel: 9 // Use more memory for better compression
};

/**
 * Development compression options (faster compression)
 */
const developmentOptions = {
  ...defaultOptions,
  level: 1, // Fastest compression
  threshold: 2048, // Only compress larger files in development
  memLevel: 6 // Use less memory
};

/**
 * Custom filter function to determine what to compress
 */
const compressionFilter = (req, res) => {
  // Don't compress if client doesn't support it
  if (!req.headers['accept-encoding']) {
    return false;
  }

  // Don't compress if explicitly disabled
  if (req.headers['x-no-compression']) {
    return false;
  }

  // Don't compress if response is already compressed
  if (res.getHeader('Content-Encoding')) {
    return false;
  }

  // Don't compress small responses
  const contentLength = res.getHeader('Content-Length');
  if (contentLength && contentLength < 1024) {
    return false;
  }

  // Get content type
  const contentType = res.getHeader('Content-Type');
  
  // Don't compress these content types
  const noCompressTypes = [
    'image/',
    'video/',
    'audio/',
    'application/zip',
    'application/gzip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/pdf'
  ];

  if (contentType) {
    for (const type of noCompressTypes) {
      if (contentType.toLowerCase().includes(type)) {
        return false;
      }
    }
  }

  // Compress these content types
  const compressTypes = [
    'text/',
    'application/json',
    'application/javascript',
    'application/xml',
    'application/x-javascript',
    'application/x-font-ttf',
    'application/vnd.ms-fontobject',
    'font/opentype',
    'image/svg+xml'
  ];

  if (contentType) {
    for (const type of compressTypes) {
      if (contentType.toLowerCase().includes(type)) {
        return true;
      }
    }
  }

  // Default to compression.filter for other cases
  return compression.filter(req, res);
};

/**
 * Compression middleware with custom options
 */
const createCompressionMiddleware = (options = {}) => {
  const finalOptions = {
    ...defaultOptions,
    ...options,
    filter: options.filter || compressionFilter
  };

  return compression(finalOptions);
};

/**
 * Environment-specific compression middleware
 */
const getCompressionMiddleware = () => {
  const options = process.env.NODE_ENV === 'production' 
    ? productionOptions 
    : developmentOptions;

  return createCompressionMiddleware(options);
};

/**
 * Compression middleware with logging
 */
const compressionWithLogging = (options = {}) => {
  const compressionMiddleware = createCompressionMiddleware(options);

  return (req, res, next) => {
    const startTime = Date.now();
    const originalSend = res.send;
    const originalJson = res.json;
    
    let uncompressedSize = 0;
    let compressed = false;

    // Override res.send to track compression
    res.send = function(data) {
      if (data && typeof data === 'string') {
        uncompressedSize = Buffer.byteLength(data, 'utf8');
      } else if (Buffer.isBuffer(data)) {
        uncompressedSize = data.length;
      }
      
      compressed = !!res.getHeader('Content-Encoding');
      return originalSend.call(this, data);
    };

    // Override res.json to track compression
    res.json = function(data) {
      if (data) {
        uncompressedSize = Buffer.byteLength(JSON.stringify(data), 'utf8');
      }
      compressed = !!res.getHeader('Content-Encoding');
      return originalJson.call(this, data);
    };

    // Log compression stats on response finish
    res.on('finish', () => {
      if (uncompressedSize > 0) {
        const responseTime = Date.now() - startTime;
        const compressedSize = parseInt(res.getHeader('Content-Length')) || 0;
        const compressionRatio = compressed && compressedSize > 0 
          ? ((uncompressedSize - compressedSize) / uncompressedSize * 100).toFixed(2)
          : 0;

        logger.debug('Compression Stats:', {
          url: req.originalUrl,
          method: req.method,
          uncompressedSize: `${uncompressedSize} bytes`,
          compressedSize: compressed ? `${compressedSize} bytes` : 'Not compressed',
          compressionRatio: compressed ? `${compressionRatio}%` : '0%',
          contentType: res.getHeader('Content-Type'),
          responseTime: `${responseTime}ms`
        });
      }
    });

    compressionMiddleware(req, res, next);
  };
};

/**
 * Selective compression based on user agent
 */
const smartCompression = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  
  // Don't compress for old browsers that have compression issues
  const oldBrowsers = [
    /MSIE [4-6]\./,
    /Chrome\/[1-9]\./,
    /Firefox\/[1-3]\./
  ];

  const isOldBrowser = oldBrowsers.some(pattern => pattern.test(userAgent));
  
  if (isOldBrowser) {
    req.headers['x-no-compression'] = 'true';
  }

  next();
};

/**
 * API-specific compression (lighter compression for API responses)
 */
const apiCompression = createCompressionMiddleware({
  level: 3,
  threshold: 512,
  filter: (req, res) => {
    const contentType = res.getHeader('Content-Type');
    return contentType && (
      contentType.includes('application/json') ||
      contentType.includes('text/plain')
    );
  }
});

module.exports = {
  compressionMiddleware: getCompressionMiddleware(),
  createCompressionMiddleware,
  compressionWithLogging,
  smartCompression,
  apiCompression,
  compressionFilter,
  defaultOptions,
  productionOptions,
  developmentOptions
};