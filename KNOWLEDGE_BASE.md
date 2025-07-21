# Knowledge Base - Express E-commerce API

## 📋 Tổng quan dự án

**Tên dự án**: Express E-commerce RESTful API  
**Phiên bản**: 1.0.0  
**Mô tả**: API RESTful cấp doanh nghiệp cho ứng dụng thương mại điện tử được xây dựng với Express.js, MySQL và Sequelize ORM.

## 🏗️ Kiến trúc dự án

### Cấu trúc thư mục chính:
```
express-ecom/
├── src/                    # Source code chính
│   ├── config/            # Cấu hình ứng dụng
│   ├── database/          # Khởi tạo database
│   ├── middlewares/       # Các middleware tùy chỉnh
│   ├── models/           # Database models (Sequelize)
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   └── server.js         # Entry point server
├── app.js                # Application setup
├── package.json          # Dependencies và scripts
├── .env                  # Environment variables
└── .sequelizerc         # Sequelize configuration
```

## 🛠️ Tech Stack

### Backend Framework:
- **Express.js** v4.21.2 - Web framework
- **Node.js** >=16.0.0 - Runtime environment

### Database:
- **MySQL** v3.6.0 - Primary database
- **Sequelize** v6.32.1 - ORM
- **Redis** v4.6.7 - Caching và session storage

### Security:
- **bcryptjs** v2.4.3 - Password hashing
- **jsonwebtoken** v9.0.2 - JWT authentication
- **helmet** v7.2.0 - Security headers
- **express-rate-limit** v6.8.1 - Rate limiting
- **express-mongo-sanitize** v2.2.0 - Data sanitization
- **hpp** v0.2.3 - HTTP Parameter Pollution protection
- **xss** v1.0.14 - XSS protection

### File Handling:
- **multer** v1.4.5-lts.1 - File upload
- **sharp** v0.32.4 - Image processing

### Validation:
- **joi** v17.9.2 - Schema validation
- **express-validator** v7.0.1 - Request validation

### Logging & Monitoring:
- **winston** v3.10.0 - Logging framework
- **winston-daily-rotate-file** v4.7.1 - Log rotation
- **morgan** v1.10.0 - HTTP request logging

### Job Queue:
- **bull** v4.11.3 - Job queue with Redis

### API Documentation:
- **swagger-jsdoc** v6.2.8 - API documentation generator
- **swagger-ui-express** v5.0.0 - Swagger UI

### Testing:
- **jest** v29.6.2 - Testing framework
- **supertest** v6.3.3 - HTTP testing
- **factory-girl** v5.0.4 - Test data factory
- **faker** v6.6.6 - Fake data generation

### Development Tools:
- **nodemon** v3.0.1 - Development server
- **eslint** v8.46.0 - Code linting
- **prettier** v3.0.1 - Code formatting
- **husky** v8.0.3 - Git hooks
- **lint-staged** v13.2.3 - Pre-commit linting

## 🗄️ Database Models

### User Model (src/models/User.js)
- Quản lý thông tin người dùng
- Hỗ trợ roles: admin, moderator, user
- Tích hợp authentication và authorization

### Product Model (src/models/Product.js)
- Quản lý sản phẩm
- Liên kết với categories
- Hỗ trợ SEO với slug

### Category Model (src/models/Category.js)
- Phân loại sản phẩm
- Cấu trúc hierarchical

### Order Model (src/models/Order.js)
- Quản lý đơn hàng
- Trạng thái: pending, processing, shipped, delivered, cancelled

### OrderItem Model (src/models/OrderItem.js)
- Chi tiết đơn hàng
- Liên kết product và order

### RefreshToken Model (src/models/RefreshToken.js)
- Quản lý refresh tokens
- Hỗ trợ JWT authentication

## 🚦 API Routes Structure

### Base URL: `/api/v1`

### Authentication Routes (`/auth`):
- `POST /register` - Đăng ký tài khoản
- `POST /login` - Đăng nhập
- `POST /refresh-token` - Làm mới token
- `POST /forgot-password` - Quên mật khẩu
- `POST /reset-password` - Đặt lại mật khẩu
- `POST /logout` - Đăng xuất

### User Routes (`/users`):
- `GET /` - Lấy danh sách users (Admin only)
- `GET /:id` - Lấy thông tin user theo ID
- `GET /profile` - Lấy profile user hiện tại
- `PUT /:id` - Cập nhật thông tin user
- `DELETE /:id` - Xóa user (Admin only)

### Product Routes (`/products`):
- `GET /` - Lấy danh sách sản phẩm (có filter, pagination)
- `GET /:id` - Lấy chi tiết sản phẩm
- `POST /` - Tạo sản phẩm mới (Admin only)
- `PUT /:id` - Cập nhật sản phẩm (Admin only)
- `DELETE /:id` - Xóa sản phẩm (Admin only)
- `POST /:id/images` - Upload ảnh sản phẩm

### Category Routes (`/categories`):
- `GET /` - Lấy danh sách categories
- `GET /:id` - Lấy chi tiết category
- `POST /` - Tạo category (Admin only)
- `PUT /:id` - Cập nhật category (Admin only)
- `DELETE /:id` - Xóa category (Admin only)

### Order Routes (`/orders`):
- `GET /` - Lấy danh sách đơn hàng của user
- `GET /:id` - Lấy chi tiết đơn hàng
- `POST /` - Tạo đơn hàng mới
- `PUT /:id/status` - Cập nhật trạng thái đơn hàng (Admin)
- `DELETE /:id` - Hủy đơn hàng

## 🔧 Configuration Files

### Environment Variables (.env):
```bash
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=express_ecom_dev
DB_USERNAME=root
DB_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# File Upload
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=5000000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Database Config (src/config/database.js):
- Cấu hình kết nối Sequelize
- Hỗ trợ multiple environments
- Connection pooling

### JWT Config (src/config/jwt.js):
- Cấu hình JWT tokens
- Refresh token strategy

### Constants (src/config/constants.js):
- Các hằng số ứng dụng
- Status codes, roles, etc.

## 🛡️ Security Features

### Authentication & Authorization:
- JWT-based authentication
- Refresh token rotation
- Role-based access control (RBAC)
- Password hashing với bcrypt

### Security Middleware:
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Chống DDoS và abuse
- **Input Validation**: Joi schemas
- **XSS Protection**: Data sanitization
- **HPP Protection**: HTTP Parameter Pollution

### Data Protection:
- Password encryption
- Sensitive data masking in logs
- Input sanitization
- SQL injection prevention (Sequelize ORM)

## 📊 Logging System

### Winston Logger:
- Structured logging with JSON format
- Multiple log levels: error, warn, info, debug
- Daily log rotation
- Separate log files for different components

### API Request Logging:
- Request/response logging
- Performance monitoring
- Error tracking
- User activity logs

## 🚀 Performance Features

### Caching:
- Redis caching for frequent queries
- Session storage in Redis
- API response caching

### Optimization:
- Response compression (gzip)
- Image optimization (Sharp)
- Database query optimization
- Connection pooling

### Job Queue:
- Background job processing với Bull
- Email sending queue
- Image processing queue

## 🧪 Testing Strategy

### Test Framework:
- **Jest**: Unit và integration tests
- **Supertest**: API endpoint testing
- **Factory Girl**: Test data generation

### Test Types:
- Unit tests cho models và utilities
- Integration tests cho API endpoints
- Performance tests
- Security tests

### Test Coverage:
- Minimum 80% code coverage
- Critical path coverage 100%

## 📚 Development Workflow

### Git Hooks (Husky):
- Pre-commit: ESLint + Prettier
- Pre-push: Run tests
- Commit message validation

### Code Quality:
- ESLint với Airbnb config
- Prettier formatting
- Automated code review

### Development Scripts:
```bash
npm run dev          # Development server
npm run test         # Run tests
npm run lint         # Check code quality
npm run format       # Format code
npm run migrate      # Database migrations
npm run seed         # Database seeding
```

## 🚀 Deployment

### Production Setup:
- PM2 process manager
- Nginx reverse proxy
- SSL/TLS certificates
- Environment-specific configs

### Database:
- Master-slave replication
- Backup strategies
- Migration rollback plans

### Monitoring:
- Application performance monitoring
- Error tracking
- Health checks
- Uptime monitoring

## 🔄 API Response Format

### Success Response:
```javascript
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": {
    // Response data
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

### Error Response:
```javascript
{
  "success": false,
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Detailed error message",
  "details": [
    // Validation errors if any
  ],
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

## 📋 Business Logic

### User Management:
- Registration với email verification
- Login với rate limiting
- Password reset flow
- Profile management

### Product Management:
- CRUD operations
- Image upload và processing
- SEO-friendly URLs (slugs)
- Category associations

### Order Processing:
- Shopping cart functionality
- Order creation và tracking
- Payment integration ready
- Inventory management

### Inventory System:
- Stock tracking
- Low stock alerts
- Automatic stock updates

## 🔧 Maintenance Tasks

### Regular Tasks:
- Log cleanup và archiving
- Database optimization
- Cache invalidation
- Security updates

### Monitoring:
- Server performance
- Database performance
- API response times
- Error rates

## 📖 API Documentation

### Swagger Documentation:
- Available at `/api-docs`
- Auto-generated from JSDoc comments
- Interactive API testing
- Schema definitions

### Postman Collection:
- Complete API collection
- Environment variables
- Test scripts

## 🚨 Error Handling

### Global Error Handler:
- Centralized error processing
- Structured error responses
- Error logging và tracking
- Development vs Production modes

### Custom Error Classes:
- ValidationError
- AuthenticationError
- AuthorizationError
- NotFoundError
- DatabaseError

## 🔐 Data Validation

### Input Validation:
- Joi schemas cho request validation
- Custom validation rules
- Sanitization middleware
- File upload validation

### Database Validation:
- Sequelize model validations
- Custom validators
- Constraint enforcement

This knowledge base provides a comprehensive understanding of the Express E-commerce API project structure, features, and implementation details for Claude to assist effectively with development tasks.
