module.exports = {
  // JWT Configuration
  JWT: {
    ACCESS_TOKEN_EXPIRE: '15m',
    REFRESH_TOKEN_EXPIRE: '7d',
    RESET_PASSWORD_EXPIRE: '10m',
    EMAIL_VERIFICATION_EXPIRE: '24h'
  },

  // User Roles
  USER_ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    MODERATOR: 'moderator'
  },

  // User Status
  USER_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    PENDING: 'pending'
  },

  // Product Status
  PRODUCT_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DRAFT: 'draft',
    OUT_OF_STOCK: 'out_of_stock'
  },

  // Order Status
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
  },

  // Payment Status
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
  },

  // Payment Methods
  PAYMENT_METHODS: {
    CASH_ON_DELIVERY: 'cod',
    CREDIT_CARD: 'credit_card',
    PAYPAL: 'paypal',
    BANK_TRANSFER: 'bank_transfer',
    MOMO: 'momo',
    ZALOPAY: 'zalopay'
  },

  // File Upload
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    IMAGE_SIZES: {
      THUMBNAIL: { width: 150, height: 150 },
      SMALL: { width: 300, height: 300 },
      MEDIUM: { width: 600, height: 600 },
      LARGE: { width: 1200, height: 1200 }
    }
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },

  // Cache TTL (Time To Live)
  CACHE_TTL: {
    SHORT: 300,    // 5 minutes
    MEDIUM: 1800,  // 30 minutes
    LONG: 3600,    // 1 hour
    VERY_LONG: 86400 // 24 hours
  },

  // Rate Limiting
  RATE_LIMIT: {
    GENERAL: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 1000
    },
    AUTH: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_REQUESTS: 10
    },
    UPLOAD: {
      WINDOW_MS: 60 * 60 * 1000, // 1 hour
      MAX_REQUESTS: 50
    }
  },

  // Email Types
  EMAIL_TYPES: {
    WELCOME: 'welcome',
    EMAIL_VERIFICATION: 'email_verification',
    PASSWORD_RESET: 'password_reset',
    ORDER_CONFIRMATION: 'order_confirmation',
    ORDER_SHIPPED: 'order_shipped',
    ORDER_DELIVERED: 'order_delivered'
  },

  // Notification Types
  NOTIFICATION_TYPES: {
    ORDER: 'order',
    PRODUCT: 'product',
    USER: 'user',
    SYSTEM: 'system'
  },

  // API Response Messages
  MESSAGES: {
    SUCCESS: 'Operation completed successfully',
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    NOT_FOUND: 'Resource not found',
    UNAUTHORIZED: 'Authentication required',
    FORBIDDEN: 'Access denied',
    VALIDATION_ERROR: 'Validation failed',
    SERVER_ERROR: 'Internal server error',
    BAD_REQUEST: 'Bad request'
  },

  // Regular Expressions
  REGEX: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    SLUG: /^[a-z0-9-]+$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  },

  // Search Configuration
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    MAX_QUERY_LENGTH: 100,
    DEFAULT_SORT: 'relevance'
  }
};