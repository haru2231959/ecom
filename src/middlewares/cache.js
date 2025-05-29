const { logger } = require('../utils/logger');
const { CACHE_TTL } = require('../config/constants');

/**
 * In-Memory Cache Implementation
 */
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  set(key, value, ttl = CACHE_TTL.MEDIUM) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl: ttl * 1000
    });

    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl * 1000);

    this.timers.set(key, timer);
    logger.debug('Cache SET:', { key, ttl });
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      logger.debug('Cache MISS:', { key });
      return null;
    }

    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      logger.debug('Cache EXPIRED:', { key });
      return null;
    }

    logger.debug('Cache HIT:', { key });
    return item.data;
  }

  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }

    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.debug('Cache DELETE:', { key });
    }
    return deleted;
  }

  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    this.cache.clear();
    logger.info('Cache CLEARED');
  }

  size() {
    return this.cache.size;
  }

  keys() {
    return Array.from(this.cache.keys());
  }

  stats() {
    return {
      size: this.cache.size,
      keys: this.keys(),
      memory: process.memoryUsage().heapUsed
    };
  }
}

const cache = new MemoryCache();

/**
 * Cache Middleware Factory
 */
const cacheMiddleware = (options = {}) => {
  const {
    ttl = CACHE_TTL.MEDIUM,
    keyGenerator = null,
    condition = null,
    skipCache = false
  } = options;

  return (req, res, next) => {
    if (skipCache || process.env.NODE_ENV === 'test') {
      return next();
    }

    if (req.user && !options.cacheAuthenticated) {
      return next();
    }

    const cacheKey = keyGenerator 
      ? keyGenerator(req) 
      : `${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;

    if (condition && !condition(req)) {
      return next();
    }

    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      res.set('X-Cache', 'HIT');
      res.set('X-Cache-Key', cacheKey);
      return res.json(cachedResponse);
    }

    const originalJson = res.json;
    res.json = function(data) {
      if (res.statusCode === 200) {
        cache.set(cacheKey, data, ttl);
        res.set('X-Cache', 'MISS');
        res.set('X-Cache-Key', cacheKey);
      }
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * API Cache Middleware
 */
const apiCache = (ttl = CACHE_TTL.MEDIUM) => {
  return cacheMiddleware({
    ttl,
    keyGenerator: (req) => {
      const parts = [
        'api',
        req.method,
        req.path.replace(/[^a-zA-Z0-9]/g, '_'),
        JSON.stringify(req.query)
      ];
      return parts.join(':');
    },
    condition: (req) => req.method === 'GET'
  });
};

/**
 * Cache Invalidation Middleware
 */
const invalidateCache = (patterns = []) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (patterns.length > 0) {
          patterns.forEach(pattern => {
            const keys = cache.keys().filter(key => key.includes(pattern));
            keys.forEach(key => cache.delete(key));
          });
        }
      }
      return originalSend.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  cache,
  cacheMiddleware,
  apiCache,
  invalidateCache,
  MemoryCache
};