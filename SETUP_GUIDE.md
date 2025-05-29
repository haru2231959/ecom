# Express E-commerce API - Setup Guide

## 🚀 Hướng dẫn cài đặt và sử dụng

### 📋 Yêu cầu hệ thống
- Node.js (v16.0.0 trở lên)
- MySQL (v8.0 trở lên)
- npm hoặc yarn

### 🛠️ Cài đặt

#### 1. Clone hoặc tạo project
```bash
# Nếu clone từ repository
git clone <your-repo-url>
cd express-ecom

# Hoặc nếu tạo từ đầu
mkdir express-ecom
cd express-ecom
```

#### 2. Cài đặt dependencies
```bash
npm install
```

#### 3. Chạy script setup
```bash
node scripts/setup.js
```

#### 4. Cấu hình môi trường
Chỉnh sửa file `.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=express_ecom_dev
DB_USERNAME=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars

# Other configurations...
```

#### 5. Tạo database
```bash
mysql -u root -p -e "CREATE DATABASE express_ecom_dev;"
mysql -u root -p -e "CREATE DATABASE express_ecom_test;"
```

#### 6. Chạy migrations (khi có)
```bash
npm run migrate
```

#### 7. Khởi động server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 🌐 API Endpoints

Server sẽ chạy tại: `http://localhost:3000`

#### Endpoints chính:
- **Health Check**: `GET /health`
- **API Info**: `GET /api`
- **API v1**: `GET /api/v1`
- **Documentation**: `GET /api-docs` (development only)

#### Authentication:
- `POST /api/v1/auth/register` - Đăng ký
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/refresh-token` - Refresh token
- `POST /api/v1/auth/logout` - Đăng xuất

#### Users:
- `GET /api/v1/users` - Danh sách users (Admin)
- `GET /api/v1/users/:id` - Chi tiết user
- `PUT /api/v1/users/:id` - Cập nhật user
- `GET /api/v1/users/profile` - Profile hiện tại
- `PUT /api/v1/users/profile` - Cập nhật profile

#### Categories:
- `GET /api/v1/categories` - Danh sách categories
- `GET /api/v1/categories/:id` - Chi tiết category
- `POST /api/v1/categories` - Tạo category (Admin)
- `PUT /api/v1/categories/:id` - Cập nhật category (Admin)

#### Products:
- `GET /api/v1/products` - Danh sách products
- `GET /api/v1/products/search` - Tìm kiếm products
- `GET /api/v1/products/featured` - Products nổi bật
- `GET /api/v1/products/:id` - Chi tiết product
- `POST /api/v1/products` - Tạo product (Admin)
- `PUT /api/v1/products/:id` - Cập nhật product (Admin)

#### Orders:
- `GET /api/v1/orders` - Danh sách orders
- `GET /api/v1/orders/:id` - Chi tiết order
- `POST /api/v1/orders` - Tạo order
- `PUT /api/v1/orders/:id/status` - Cập nhật trạng thái (Admin)

### 🔐 Authentication

API sử dụng JWT Bearer Token:

```bash
# Đăng ký
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Đăng nhập
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'

# Sử dụng token
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 📝 Response Format

#### Success Response:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success message",
  "data": { ... },
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

#### Error Response:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "errors": [ ... ],
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

#### Paginated Response:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success message",
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "timestamp": "2023-12-07T10:30:00.000Z"
}
```

### 🧪 Testing

```bash
# Chạy tất cả tests
npm test

# Chạy tests với coverage
npm run test:coverage

# Chạy tests ở watch mode
npm run test:watch
```

### 🔧 Development Tools

```bash
# Lint code
npm run lint
npm run lint:fix

# Format code
npm run format

# Generate API documentation
npm run docs
```

### 📊 Monitoring

#### Health Check:
```bash
curl http://localhost:3000/health
```

#### System Status:
```bash
curl http://localhost:3000/status
```

### 🚀 Production Deployment

#### Sử dụng PM2:
```bash
# Install PM2
npm install -g pm2

# Start application
npm run pm2:start

# Monitor
pm2 status
pm2 logs
pm2 monit
```

#### Environment Variables cho Production:
```env
NODE_ENV=production
PORT=3000
DB_HOST=your-production-db-host
DB_USERNAME=your-production-db-user
DB_PASSWORD=your-secure-production-password
JWT_SECRET=your-very-secure-production-jwt-secret-minimum-32-characters
JWT_REFRESH_SECRET=your-very-secure-production-refresh-secret-minimum-32-characters
```

### 🛡️ Security Checklist

- ✅ Sử dụng HTTPS trong production
- ✅ Cập nhật JWT secrets mạnh
- ✅ Cấu hình CORS phù hợp
- ✅ Thiết lập rate limiting
- ✅ Validation input đầy đủ
- ✅ Sanitization dữ liệu
- ✅ Logging và monitoring
- ✅ Environment variables bảo mật

### 🆘 Troubleshooting

#### Database Connection Issues:
```bash
# Kiểm tra MySQL service
mysql -u root -p -e "SELECT 1;"

# Kiểm tra database tồn tại
mysql -u root -p -e "SHOW DATABASES;"
```

#### Port Already in Use:
```bash
# Tìm process sử dụng port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### Permission Issues:
```bash
# Tạo thư mục với permissions phù hợp
mkdir -p storage/logs storage/uploads
chmod 755 storage/logs storage/uploads
```

### 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Log files trong `storage/logs/`
2. Environment variables trong `.env`
3. Database connection
4. Node.js và npm versions

---

**Happy Coding! 🚀**