# Knowledge Base - Express E-commerce API

## 📋 Tổng quan dự án

**Tên dự án**: Express E-commerce RESTful API  
**Package Name**: express-ecom-api  
**Phiên bản**: 1.0.0  
**Mô tả**: Enterprise Express.js RESTful API for E-commerce - API RESTful cấp doanh nghiệp cho ứng dụng thương mại điện tử được xây dựng với Express.js, MySQL và Sequelize ORM.

**Entry Point**: `src/server.js`  
**Application Setup**: `app.js`  
**Node.js Version**: >=16.0.0  
**NPM Version**: >=8.0.0  

## 🏗️ Kiến trúc dự án

### Cấu trúc thư mục thực tế:
```
express-ecom/
├── src/                    # Source code chính
│   ├── config/            # Cấu hình ứng dụng
│   ├── database/          # Database setup và migrations
│   ├── middlewares/       # Các middleware tùy chỉnh
│   ├── models/           # Database models (Sequelize)
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions & helpers
│   └── server.js         # Main server entry point
├── storage/uploads/       # File upload directory
├── docs/                 # API documentation
├── tests/                # Test files
├── app.js                # Express application setup
├── package.json          # Dependencies và scripts
├── .env                  # Environment variables (local)
├── .env.example         # Environment template
├── .sequelizerc         # Sequelize CLI configuration
├── .gitignore           # Git ignore rules
├── README.md            # Project documentation
└── KNOWLEDGE_BASE.md    # This file
```

## 🛠️ Tech Stack

### Core Framework:
- **Express.js** v4.21.2 - Web application framework
- **Node.js** >=16.0.0 - JavaScript runtime environment

### Database & ORM:
- **MySQL** v3.6.0 - Primary relational database
- **Sequelize** v6.32.1 - Promise-based ORM
- **Sequelize CLI** v6.6.1 - Database migrations & seeding

### Caching & Session:
- **Redis** v4.6.7 - In-memory data structure store
- **IORedis** v5.3.2 - Redis client for Node.js
- **Connect-Redis** v7.1.0 - Redis session store

### Authentication & Security:
- **bcryptjs** v2.4.3 - Password hashing library
- **jsonwebtoken** v9.0.2 - JWT implementation
- **helmet** v7.2.0 - Security middleware collection
- **express-rate-limit** v6.8.1 - Rate limiting middleware
- **express-slow-down** v1.6.0 - Slow down repeated requests
- **express-mongo-sanitize** v2.2.0 - Data sanitization
- **hpp** v0.2.3 - HTTP Parameter Pollution protection
- **xss** v1.0.14 - XSS filtering
- **crypto-js** v4.1.1 - Cryptographic functions

### File Handling & Processing:
- **multer** v1.4.5-lts.1 - File upload middleware
- **sharp** v0.32.4 - High-performance image processing

### Validation & Utilities:
- **joi** v17.9.2 - Object schema validation
- **express-validator** v7.0.1 - Middleware for validation
- **lodash** v4.17.21 - Utility library
- **moment** v2.29.4 - Date/time manipulation
- **moment-timezone** v0.5.43 - Timezone support
- **uuid** v9.0.0 - UUID generation
- **slug** v8.2.2 - URL slug generation

### Logging & Monitoring:
- **winston** v3.10.0 - Logging library
- **winston-daily-rotate-file** v4.7.1 - Log file rotation
- **morgan** v1.10.0 - HTTP request logger middleware

### Job Queue & Background Tasks:
- **bull** v4.11.3 - Premium job queue for Redis

### Email & Communication:
- **nodemailer** v6.9.4 - Email sending
- **handlebars** v4.7.8 - Template engine
- **socket.io** v4.7.2 - Real-time communication

### API Documentation:
- **swagger-jsdoc** v6.2.8 - Generate Swagger specs from JSDoc
- **swagger-ui-express** v5.0.0 - Swagger UI middleware

### Performance & Optimization:
- **compression** v1.8.0 - Response compression
- **express-session** v1.17.3 - Session middleware
- **cron** v2.4.3 - Job scheduling

### Testing Framework:
- **jest** v29.6.2 - JavaScript testing framework
- **supertest** v6.3.3 - HTTP assertion library
- **factory-girl** v5.0.4 - Test data factory
- **faker** v6.6.6 - Generate fake data

### Development Tools:
- **nodemon** v3.0.1 - Development server auto-restart
- **eslint** v8.46.0 - JavaScript linter
- **eslint-config-airbnb-base** v15.0.0 - Airbnb ESLint config
- **prettier** v3.0.1 - Code formatter
- **husky** v8.0.3 - Git hooks
- **lint-staged** v13.2.3 - Run linters on staged files

### Build & Deployment:
- **@babel/cli** v7.22.9 - Babel command line
- **@babel/core** v7.22.9 - Babel core
- **@babel/preset-env** v7.22.9 - Babel preset for environment

## 🗄️ Database Models & Relationships

### Core Models Structure:

#### User Model (src/models/User.js)
```javascript
{
  id: UUID (Primary Key),
  firstName: STRING,
  lastName: STRING,
  email: STRING (Unique),
  password: STRING (Hashed),
  phone: STRING,
  role: ENUM ('admin', 'moderator', 'customer'),
  isActive: BOOLEAN,
  isEmailVerified: BOOLEAN,
  lastLoginAt: DATE,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

#### Product Model (src/models/Product.js)
```javascript
{
  id: UUID (Primary Key),
  name: STRING,
  slug: STRING (Unique),
  description: TEXT,
  shortDescription: STRING,
  sku: STRING (Unique),
  price: DECIMAL(10,2),
  salePrice: DECIMAL(10,2),
  stock: INTEGER,
  weight: DECIMAL(8,2),
  dimensions: JSON,
  images: JSON,
  categoryId: UUID (Foreign Key),
  brandId: UUID (Foreign Key),
  isActive: BOOLEAN,
  isFeatured: BOOLEAN,
  metaTitle: STRING,
  metaDescription: TEXT,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

#### Category Model (src/models/Category.js)
```javascript
{
  id: UUID (Primary Key),
  name: STRING,
  slug: STRING (Unique),
  description: TEXT,
  parentId: UUID (Self Reference),
  image: STRING,
  isActive: BOOLEAN,
  sortOrder: INTEGER,
  metaTitle: STRING,
  metaDescription: TEXT,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

#### Order Model (src/models/Order.js)
```javascript
{
  id: UUID (Primary Key),
  orderNumber: STRING (Unique),
  userId: UUID (Foreign Key),
  status: ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
  subtotal: DECIMAL(10,2),
  taxAmount: DECIMAL(10,2),
  shippingAmount: DECIMAL(10,2),
  discountAmount: DECIMAL(10,2),
  totalAmount: DECIMAL(10,2),
  currency: STRING,
  shippingAddress: JSON,
  billingAddress: JSON,
  paymentMethod: STRING,
  paymentStatus: ENUM ('pending', 'paid', 'failed', 'refunded'),
  notes: TEXT,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

#### OrderItem Model (src/models/OrderItem.js)
```javascript
{
  id: UUID (Primary Key),
  orderId: UUID (Foreign Key),
  productId: UUID (Foreign Key),
  quantity: INTEGER,
  unitPrice: DECIMAL(10,2),
  totalPrice: DECIMAL(10,2),
  productName: STRING,
  productSku: STRING,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

#### RefreshToken Model (src/models/RefreshToken.js)
```javascript
{
  id: UUID (Primary Key),
  userId: UUID (Foreign Key),
  token: STRING (Unique),
  expiresAt: DATE,
  isRevoked: BOOLEAN,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

### Model Relationships:
- **User** ↔ **Order**: One-to-Many
- **User** ↔ **RefreshToken**: One-to-Many
- **Category** ↔ **Product**: One-to-Many
- **Category** ↔ **Category**: Self-referencing (Parent-Child)
- **Order** ↔ **OrderItem**: One-to-Many
- **Product** ↔ **OrderItem**: One-to-Many

## 🚦 API Routes Structure

### Base URL: `/api/v1`

### Health & Info Routes:
- `GET /health` - Application health check
- `GET /` - API welcome message

### Authentication Routes (`/api/v1/auth`):
```javascript
POST   /register           // User registration
POST   /login              // User login
POST   /refresh-token      // Refresh JWT token
POST   /forgot-password    // Request password reset
POST   /reset-password     // Reset password with token
POST   /verify-email       // Verify email address
POST   /resend-verification // Resend verification email
POST   /logout             // User logout
DELETE /logout-all         // Logout from all devices
```

### User Management Routes (`/api/v1/users`):
```javascript
GET    /                   // Get all users (Admin only)
GET    /profile            // Get current user profile
GET    /:id               // Get user by ID
PUT    /profile           // Update current user profile
PUT    /:id               // Update user by ID (Admin only)
DELETE /:id               // Delete user (Admin only)
PATCH  /:id/status        // Update user status (Admin only)
```

### Product Management Routes (`/api/v1/products`):
```javascript
GET    /                   // Get products with filters & pagination
GET    /featured          // Get featured products
GET    /search            // Search products
GET    /:id               // Get product by ID
GET    /:slug             // Get product by slug
POST   /                  // Create product (Admin only)
PUT    /:id               // Update product (Admin only)
DELETE /:id               // Delete product (Admin only)
POST   /:id/images        // Upload product images
DELETE /:id/images/:imageId // Delete product image
PATCH  /:id/stock         // Update product stock
```

### Category Management Routes (`/api/v1/categories`):
```javascript
GET    /                   // Get all categories
GET    /tree              // Get category tree structure
GET    /:id               // Get category by ID
GET    /:slug             // Get category by slug
POST   /                  // Create category (Admin only)
PUT    /:id               // Update category (Admin only)
DELETE /:id               // Delete category (Admin only)
GET    /:id/products      // Get products in category
```

### Order Management Routes (`/api/v1/orders`):
```javascript
GET    /                   // Get user orders
GET    /admin             // Get all orders (Admin only)
GET    /:id               // Get order details
POST   /                  // Create new order
PUT    /:id/status        // Update order status (Admin)
PATCH  /:id/cancel        // Cancel order
GET    /:id/invoice       // Get order invoice
```

### File Upload Routes (`/api/v1/upload`):
```javascript
POST   /image             // Upload single image
POST   /images            // Upload multiple images
DELETE /image/:filename   // Delete uploaded image
```

## 🔧 Configuration Files

### Environment Variables (.env.example):
```bash
# Application Configuration
NODE_ENV=development
PORT=3000
APP_NAME="Express E-commerce API"
APP_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=express_ecom_dev
DB_USERNAME=root
DB_PASSWORD=
DB_NAME_TEST=express_ecom_test
DB_SSL=false
DB_LOGGING=true

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
JWT_ISSUER=express-ecom-api
JWT_AUDIENCE=express-ecom-client

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME="Express E-commerce"

# File Upload Configuration
UPLOAD_PATH=storage/uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Third-party Service Keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
PAYPAL_CLIENT_ID=your_paypal_client_id
GOOGLE_CLIENT_ID=your_google_client_id
FACEBOOK_APP_ID=your_facebook_app_id
AWS_ACCESS_KEY_ID=your_aws_access_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
SENTRY_DSN=your_sentry_dsn
```

## 🛡️ Security Implementation

### Multi-Layer Security Approach:

#### 1. Application-Level Security:
- **Helmet.js**: Sets various HTTP headers
- **CORS**: Cross-Origin Resource Sharing configuration
- **Rate Limiting**: Prevents brute force attacks
- **Request Size Limits**: Prevents DoS attacks

#### 2. Authentication Security:
- **JWT Tokens**: Stateless authentication
- **Refresh Token Rotation**: Enhanced security
- **Password Hashing**: bcrypt with configurable rounds
- **Token Blacklisting**: Logout security

#### 3. Input Validation & Sanitization:
- **Joi Schemas**: Request validation
- **XSS Protection**: HTML/Script tag filtering
- **SQL Injection Prevention**: Sequelize ORM
- **HPP Protection**: HTTP Parameter Pollution

#### 4. Data Protection:
- **Sensitive Data Masking**: In logs and responses
- **Encryption**: Crypto-js for sensitive data
- **Database Security**: Connection encryption

### Security Middleware Stack (app.js):
```javascript
// Security Headers
app.use(helmet());

// CORS Configuration
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // requests per window
  message: { error: 'Too many requests' }
});
app.use(limiter);

// Body Parsing with Size Limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Response Compression
app.use(compression());
```

## 📊 Logging System Implementation

### Winston Logger Configuration:
```javascript
// Multiple Transport Levels
- error.log: Error level only
- combined.log: All levels
- api-requests.log: API specific logs
- performance.log: Performance metrics
```

### Structured Logging Format:
```javascript
{
  timestamp: "2023-12-07T10:30:00.000Z",
  level: "info",
  message: "API Request",
  metadata: {
    method: "GET",
    url: "/api/v1/products",
    ip: "192.168.1.1",
    userAgent: "Mozilla/5.0...",
    responseTime: "245ms",
    statusCode: 200
  }
}
```

### Advanced Request/Response Logging (app.js):
- **Incoming Request Logging**: Headers, body, query params
- **Response Logging**: Status, response time, data size
- **Error Logging**: Stack traces, error context
- **Performance Monitoring**: Response times, memory usage

## 🚀 Performance Features

### Caching Strategy:
```javascript
// Redis Caching Layers
- Session Storage: User sessions
- API Response Cache: Frequently accessed data
- Database Query Cache: Expensive queries
- File Cache: Static assets
```

### Optimization Techniques:
- **Response Compression**: gzip/deflate
- **Image Optimization**: Sharp processing
- **Database Indexing**: Optimized queries
- **Connection Pooling**: Database connections
- **Lazy Loading**: Efficient data loading

### Job Queue Implementation:
```javascript
// Bull Queue Jobs
- Email Processing: Async email sending
- Image Processing: Background image optimization
- Report Generation: Heavy computation tasks
- Cleanup Tasks: Scheduled maintenance
```

## 🧪 Testing Strategy

### Test Framework Setup:
```javascript
// Jest Configuration
- Unit Tests: Models, utilities, helpers
- Integration Tests: API endpoints
- Performance Tests: Load testing
- Security Tests: Vulnerability scanning
```

### Test Structure:
```javascript
tests/
├── unit/           # Unit tests
├── integration/    # API integration tests
├── fixtures/       # Test data
├── factories/      # Data factories
└── setup/         # Test configuration
```

### Testing Scripts (package.json):
```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## 📚 Development Workflow

### Available Scripts:
```bash
# Development
npm run dev           # Start development server
npm run start         # Production server

# Testing
npm run test          # Run tests
npm run test:watch    # Watch tests
npm run test:coverage # Test coverage

# Database
npm run migrate       # Run migrations
npm run migrate:undo  # Undo migrations
npm run seed          # Seed database
npm run seed:undo     # Undo seeding

# Code Quality
npm run lint          # Check code style
npm run lint:fix      # Fix code style
npm run format        # Format with Prettier

# Documentation
npm run docs          # Generate API docs

# Build & Deploy
npm run build         # Build for production
npm run pm2:start     # Start with PM2
npm run pm2:stop      # Stop PM2
npm run pm2:restart   # Restart PM2
```

### Git Hooks (Husky):
```javascript
// Pre-commit
- ESLint code checking
- Prettier formatting
- Staged files only

// Pre-push
- Run test suite
- Check build success
```

### Code Quality Tools:
```javascript
// ESLint Rules
- Airbnb base configuration
- Custom rules for API development
- Import/export validation

// Prettier Configuration
- Consistent code formatting
- Auto-formatting on save
- Git hook integration
```

## 🔄 API Response Standards

### Success Response Format:
```javascript
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": {
    // Response payload
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "meta": {
    "requestId": "req_123456789",
    "timestamp": "2023-12-07T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

### Error Response Format:
```javascript
{
  "success": false,
  "statusCode": 400,
  "error": "ValidationError",
  "message": "Request validation failed",
  "details": [
    {
      "field": "email",
      "message": "Email is required",
      "code": "REQUIRED_FIELD"
    }
  ],
  "meta": {
    "requestId": "req_123456789",
    "timestamp": "2023-12-07T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

## 📋 Business Logic Implementation

### Authentication Flow:
```javascript
1. User Registration:
   - Email validation
   - Password hashing
   - Email verification sending
   - Welcome email

2. User Login:
   - Credential verification
   - Rate limiting check
   - JWT token generation
   - Refresh token creation
   - Login activity logging

3. Token Management:
   - Access token (15 minutes)
   - Refresh token (7 days)
   - Token rotation on refresh
   - Blacklist on logout
```

### Order Processing Workflow:
```javascript
1. Cart to Order:
   - Inventory validation
   - Price calculation
   - Stock reservation
   - Order creation

2. Payment Processing:
   - Payment gateway integration
   - Transaction logging
   - Inventory update
   - Order confirmation

3. Order Fulfillment:
   - Status tracking
   - Shipping integration
   - Notification system
   - Delivery confirmation
```

## 🔧 Middleware Architecture

### Core Middleware Stack:
```javascript
// Security Middleware
- helmet: Security headers
- cors: CORS configuration
- rateLimit: Rate limiting
- compression: Response compression

// Logging Middleware
- morgan: HTTP request logging
- apiLogger: Custom API logging
- performanceLogger: Performance tracking
- errorLogger: Error logging

// Validation Middleware
- joi: Schema validation
- express-validator: Input validation
- sanitization: Data cleaning

// Authentication Middleware
- jwt: Token verification
- roleCheck: Authorization
- userStatus: Account validation
```

## 🚨 Error Handling Strategy

### Error Hierarchy:
```javascript
// Custom Error Classes
- ValidationError: Input validation failures
- AuthenticationError: Login/token issues
- AuthorizationError: Permission denied
- NotFoundError: Resource not found
- DatabaseError: Database operation failures
- ExternalServiceError: Third-party service issues
```

### Global Error Handler:
```javascript
// Centralized Error Processing
- Error classification
- Appropriate status codes
- Error logging
- Client-safe responses
- Stack trace (development only)
```

## 📖 API Documentation

### Swagger Documentation:
- **Endpoint**: `/api-docs`
- **Features**: Interactive testing, schema definitions
- **Generation**: Auto-generated from JSDoc comments
- **Authentication**: Built-in auth testing

### Documentation Structure:
```javascript
docs/
├── swagger.json      # Generated Swagger spec
├── schemas/         # Reusable schemas
├── examples/        # Request/response examples
└── postman/         # Postman collections
```

## 🔐 Data Validation Framework

### Joi Schema Examples:
```javascript
// User Registration Schema
const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
  phone: Joi.string().pattern(/^[+]?[1-9]\d{1,14}$/).optional()
});

// Product Creation Schema
const productSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(2000).required(),
  price: Joi.number().positive().precision(2).required(),
  stock: Joi.number().integer().min(0).required(),
  categoryId: Joi.string().uuid().required()
});
```

## 🚀 Deployment & Production

### PM2 Configuration:
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'express-ecom-api',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### Production Optimizations:
- **Process Management**: PM2 clustering
- **Reverse Proxy**: Nginx configuration
- **SSL/TLS**: HTTPS enforcement
- **Database**: Connection pooling, read replicas
- **Monitoring**: Health checks, performance monitoring
- **Backup**: Automated database backups

## 💾 File Upload System

### Configuration:
```javascript
// Upload Settings
- Max File Size: 5MB
- Allowed Types: JPEG, PNG, GIF, WebP
- Storage: Local filesystem (configurable for cloud)
- Processing: Sharp for optimization
- Security: File type validation, malware scanning
```

### Upload Endpoints:
```javascript
POST /api/v1/upload/image      # Single image
POST /api/v1/upload/images     # Multiple images
DELETE /api/v1/upload/:filename # Delete image
```

## 🔄 Background Jobs & Scheduling

### Bull Queue Jobs:
```javascript
// Job Types
- emailQueue: Email processing
- imageQueue: Image optimization
- reportQueue: Report generation
- cleanupQueue: Database cleanup
- notificationQueue: Push notifications
```

### Cron Jobs:
```javascript
// Scheduled Tasks
- Daily: Log cleanup, report generation
- Weekly: Database optimization
- Monthly: Analytics compilation
- Hourly: Health checks, monitoring
```

---

This comprehensive knowledge base provides Claude with detailed understanding of the Express E-commerce API project structure, implementation details, and development practices. Use this information to provide accurate assistance with development tasks, debugging, and feature implementation.
