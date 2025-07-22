# Claude Code Context - Express E-commerce API

## 📋 Project Overview

**Project**: Express E-commerce RESTful API  
**Package**: express-ecom-api  
**Version**: 1.0.0  
**Type**: Enterprise-grade RESTful API for e-commerce applications  
**Framework**: Express.js with MySQL and Sequelize ORM  

**Main Entry**: `src/server.js`  
**App Setup**: `app.js`  
**Environment**: Node.js >=16.0.0, NPM >=8.0.0  

## 🏗️ Architecture & Structure

```
express-ecom/
├── src/                    # Main source code
│   ├── config/            # App configuration files
│   ├── database/          # DB migrations, seeds
│   ├── middlewares/       # Custom middleware
│   ├── models/           # Sequelize models
│   ├── routes/           # API route definitions
│   ├── utils/            # Helper utilities
│   └── server.js         # Server entry point
├── app.js                # Express app setup
├── package.json          # Dependencies & scripts
├── .env                  # Environment variables
├── .sequelizerc         # Sequelize configuration
├── KNOWLEDGE_BASE.md    # Detailed project documentation
└── README.md            # Project overview
```

## 🛠️ Core Technology Stack

### Framework & Runtime:
- **Express.js** v4.21.2 - Web framework
- **Node.js** >=16.0.0 - JavaScript runtime

### Database & ORM:
- **MySQL** v3.6.0 - Primary database
- **Sequelize** v6.32.1 - ORM with migrations
- **Redis** v4.6.7 - Caching & sessions

### Security & Authentication:
- **JWT** v9.0.2 - Authentication tokens
- **bcryptjs** v2.4.3 - Password hashing
- **helmet** v7.2.0 - Security headers
- **express-rate-limit** v6.8.1 - Rate limiting

### Validation & Processing:
- **joi** v17.9.2 - Schema validation
- **multer** v1.4.5 - File uploads
- **sharp** v0.32.4 - Image processing

### Development & Testing:
- **jest** v29.6.2 - Testing framework
- **eslint** v8.46.0 - Code linting
- **nodemon** v3.0.1 - Dev server

## 🗄️ Database Models

### Key Models:
- **User**: Authentication, profiles, roles
- **Product**: E-commerce products with categories
- **Category**: Hierarchical product categories
- **Order**: Purchase orders and order items
- **RefreshToken**: JWT refresh token management

### Model Relationships:
- User ↔ Order (One-to-Many)
- Category ↔ Product (One-to-Many)
- Order ↔ OrderItem (One-to-Many)
- Product ↔ OrderItem (One-to-Many)

## 🚦 API Routes Structure

**Base URL**: `/api/v1`

### Core Endpoints:
```javascript
// Authentication
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh-token

// Users
GET  /api/v1/users
GET  /api/v1/users/profile
PUT  /api/v1/users/profile

// Products
GET  /api/v1/products
GET  /api/v1/products/:id
POST /api/v1/products (Admin)
PUT  /api/v1/products/:id (Admin)

// Categories
GET  /api/v1/categories
POST /api/v1/categories (Admin)

// Orders
GET  /api/v1/orders
POST /api/v1/orders
GET  /api/v1/orders/:id

// File Upload
POST /api/v1/upload/image
POST /api/v1/upload/images
```

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start dev server with nodemon
npm start               # Start production server

# Database
npm run migrate         # Run Sequelize migrations
npm run seed           # Run database seeders
npm run migrate:undo   # Undo last migration

# Testing
npm test               # Run Jest tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report

# Code Quality
npm run lint           # Run ESLint
npm run lint:fix       # Auto-fix ESLint issues
npm run format         # Format with Prettier

# Build & Deploy
npm run build          # Build with Babel
npm run pm2:start      # Start with PM2
```

## 🛡️ Security Implementation

### Multi-Layer Security:
```javascript
// Application Security
- Helmet: Security headers
- CORS: Cross-origin protection
- Rate limiting: DDoS protection
- Input validation: Joi schemas

// Authentication Security
- JWT with refresh tokens
- bcrypt password hashing
- Token blacklisting
- Role-based access control

// Data Protection
- XSS filtering
- SQL injection prevention (Sequelize)
- Request sanitization
- File upload validation
```

## 📊 Response Format Standards

### Success Response:
```javascript
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": { ... },
  "pagination": { ... }, // For paginated responses
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

### Error Response:
```javascript
{
  "success": false,
  "statusCode": 400,
  "error": "ValidationError",
  "message": "Detailed error message",
  "details": [ ... ], // Field validation errors
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

## 🔐 Environment Configuration

### Key Environment Variables:
```bash
# Application
NODE_ENV=development
PORT=3000
APP_NAME="Express E-commerce API"

# Database
DB_HOST=localhost
DB_NAME=express_ecom_dev
DB_USERNAME=root
DB_PASSWORD=

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# File Upload
UPLOAD_PATH=storage/uploads
MAX_FILE_SIZE=5242880
```

## 📚 Key Features

### E-commerce Functionality:
- User registration & authentication
- Product catalog management
- Category hierarchy
- Shopping cart functionality
- Order processing
- Payment integration ready
- Inventory management

### Enterprise Features:
- Comprehensive logging (Winston)
- Background job processing (Bull)
- File upload & image processing
- API documentation (Swagger)
- Performance monitoring
- Error tracking
- Rate limiting & security

### Development Features:
- Hot reloading (nodemon)
- Automated testing (Jest)
- Code linting (ESLint)
- Git hooks (Husky)
- Database migrations
- API documentation

## 🧪 Testing Strategy

### Test Types:
- **Unit Tests**: Models, utilities, helpers
- **Integration Tests**: API endpoints
- **Validation Tests**: Input validation
- **Authentication Tests**: JWT & security

### Test Structure:
```javascript
tests/
├── unit/           # Unit tests
├── integration/    # API integration tests
├── fixtures/       # Test data
└── setup/         # Test configuration
```

## 📖 API Documentation

- **Swagger UI**: `/api-docs` endpoint
- **Interactive Testing**: Built-in API testing
- **Schema Definitions**: Request/response schemas
- **Authentication**: JWT testing support

## 🚀 Performance & Scaling

### Optimization Features:
- Response compression (gzip)
- Redis caching layer
- Database connection pooling
- Image optimization (Sharp)
- Background job processing
- Request rate limiting

### Production Deployment:
- PM2 process management
- Clustering support
- Health check endpoints
- Error monitoring
- Log rotation

## 🔄 Development Workflow

### Git Hooks (Husky):
- **Pre-commit**: ESLint + Prettier
- **Pre-push**: Test suite execution

### Code Quality:
- ESLint with Airbnb config
- Prettier formatting
- Automated testing
- Coverage reporting

## 📋 Common Tasks for Claude Code

### Database Tasks:
```bash
# Create new migration
npx sequelize-cli migration:generate --name add-new-field

# Create new model
npx sequelize-cli model:generate --name ModelName --attributes field:type

# Seed database
npm run seed
```

### API Development:
- Creating new routes in `src/routes/`
- Adding validation middleware
- Implementing new models
- Writing controller logic
- Adding authentication/authorization

### Testing Tasks:
- Writing unit tests for new features
- API endpoint testing
- Validation testing
- Authentication flow testing

### Common Issues & Solutions:
- Database connection problems
- JWT token validation issues
- File upload configuration
- CORS configuration
- Rate limiting setup

---

## 🎯 Context for Claude Code

This Express.js e-commerce API is a production-ready, enterprise-grade application with:

- **Modern Architecture**: Clean separation of concerns, middleware-based design
- **Security First**: Multiple layers of security, input validation, authentication
- **Scalable Design**: Redis caching, background jobs, database optimization
- **Developer Experience**: Hot reloading, testing, linting, documentation
- **Production Ready**: PM2, monitoring, error handling, logging

When working with this codebase:
1. Follow the established patterns in the existing code
2. Maintain security best practices
3. Write tests for new features
4. Update documentation when adding new endpoints
5. Use the existing validation and error handling patterns
6. Follow the response format standards

The project follows RESTful API conventions and includes comprehensive error handling, logging, and security measures suitable for production deployment.
